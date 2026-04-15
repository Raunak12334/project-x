import crypto from "node:crypto";
import { enforceAppRouting } from "@/lib/auth-utils";
import prisma from "@/lib/db";
import { OnboardingWizard } from "./wizard";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const { user } = await enforceAppRouting("/onboarding");

  let pendingInvite = null;
  const userEmail = user.email.toLowerCase().trim();

  if (token) {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    pendingInvite = await prisma.teamInvite.findUnique({
      where: {
        tokenHash,
        email: userEmail,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
      include: { organization: true },
    });
  } else {
    pendingInvite = await prisma.teamInvite.findFirst({
      where: {
        email: userEmail,
        status: "PENDING",
        expiresAt: { gt: new Date() },
      },
    });
  }

  return <OnboardingWizard hasInvite={!!pendingInvite} token={token} />;
}
