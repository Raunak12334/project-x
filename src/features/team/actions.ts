"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { assertSameOrganization, requireOrganization } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { getInviteLink, sendInviteEmail } from "@/lib/email";
import { logAudit } from "@/lib/log-audit";
import { rateLimit } from "@/lib/rate-limit";

export async function inviteTeamMember(email: string, organizationId: string) {
  const { user } = await requireOrganization();
  assertSameOrganization(organizationId, user.organizationId);

  const normalizedEmail = email.toLowerCase().trim();

  const isWithinInviteLimit = await rateLimit({
    organizationId,
    key: `invite_team_member:${user.id}`,
    limit: 5,
    windowMs: 60 * 1000,
    subjectType: "USER",
    subjectId: user.id,
    route: "team.invite",
  });

  if (!isWithinInviteLimit) {
    throw new Error("Too many invite requests. Please try again later.");
  }

  if (user.role !== "ADMIN") {
    throw new Error("Only admins can invite team members.");
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: { organization: true },
  });

  // Check if user is already in the organization
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser && existingUser.organizationId === organizationId) {
    throw new Error("User is already a member of this organization.");
  }

  // Check if there's already an invite for this address in this organization.
  const existingInvite = await prisma.teamInvite.findUnique({
    where: {
      email_organizationId: {
        email: normalizedEmail,
        organizationId,
      },
    },
  });

  if (existingInvite) {
    if (
      existingInvite.status === "PENDING" &&
      existingInvite.expiresAt > new Date()
    ) {
      throw new Error("A pending invite already exists for this email.");
    }
  }

  // Generate secure random token (production-grade)
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const inviteExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite = existingInvite
    ? await prisma.teamInvite.update({
        where: { id: existingInvite.id },
        data: {
          tokenHash,
          invitedById: user.id,
          expiresAt: inviteExpiry,
          role: "USER",
          status: "PENDING",
          used: false,
          deletedAt: null,
        },
      })
    : await prisma.teamInvite.create({
        data: {
          email: normalizedEmail,
          tokenHash,
          organizationId,
          invitedById: user.id,
          expiresAt: inviteExpiry,
          role: "USER",
        },
      });

  try {
    await sendInviteEmail({
      to: normalizedEmail,
      organizationName: currentUser?.organization?.name || "Our Team",
      invitedBy: currentUser?.name || "A team member",
      token,
    });
  } catch (error) {
    await prisma.teamInvite.update({
      where: { id: invite.id },
      data: { status: "REVOKED", deletedAt: new Date() },
    });
    throw error;
  }

  revalidatePath("/team");

  await logAudit({
    organizationId,
    userId: user.id,
    action: "team.invite_sent",
    metadata: { invitedEmail: email, inviteId: invite.id },
  });

  const inviteLink = getInviteLink(token);

  return { success: true, inviteId: invite.id, inviteLink };
}

export async function revokeInvite(inviteId: string) {
  const { user } = await requireOrganization();

  if (user.role !== "ADMIN") {
    throw new Error("Only admins can revoke invites.");
  }

  const invite = await prisma.teamInvite.findUnique({
    where: { id: inviteId },
  });

  if (!invite) throw new Error("Invite not found");
  assertSameOrganization(invite.organizationId, user.organizationId);

  await prisma.teamInvite.update({
    where: { id: inviteId },
    data: { status: "REVOKED", deletedAt: new Date() },
  });

  await logAudit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "team.invite_revoked",
    metadata: { inviteId },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function changeUserRole(
  targetUserId: string,
  newRole: "ADMIN" | "USER",
) {
  const { user } = await requireOrganization();

  if (user.role !== "ADMIN") {
    throw new Error("Only admins can change roles.");
  }

  if (targetUserId === user.id) {
    throw new Error("You cannot change your own role.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) throw new Error("User not found");
  if (!targetUser.organizationId) {
    throw new Error("User does not belong to an organization.");
  }
  assertSameOrganization(targetUser.organizationId, user.organizationId);

  await prisma.user.update({
    where: { id: targetUserId },
    data: { role: newRole },
  });

  await logAudit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "team.user_role_changed",
    metadata: { targetUserId, newRole },
  });

  revalidatePath("/team");
  return { success: true };
}

export async function removeUserFromWorkspace(targetUserId: string) {
  const { user } = await requireOrganization();

  if (user.role !== "ADMIN") {
    throw new Error("Only admins can remove users.");
  }

  if (targetUserId === user.id) {
    throw new Error("You cannot remove yourself from the workspace.");
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
  });

  if (!targetUser) throw new Error("User not found");
  if (!targetUser.organizationId) {
    throw new Error("User does not belong to an organization.");
  }
  assertSameOrganization(targetUser.organizationId, user.organizationId);

  await prisma.user.update({
    where: { id: targetUserId },
    data: {
      organizationId: null,
      role: "USER",
    },
  });

  await logAudit({
    organizationId: user.organizationId,
    userId: user.id,
    action: "team.user_removed",
    metadata: { targetUserId },
  });

  revalidatePath("/team");
  return { success: true };
}
