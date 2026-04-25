import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import prisma from "./db";
import { logger } from "./logger";

function hasUsableSubscription(
  subscription:
    | {
        plan: "FREE" | "PRO" | "CUSTOM" | "ENTERPRISE";
        status: string;
        expiresAt: Date | null;
      }
    | null
    | undefined,
) {
  if (!subscription || subscription.status !== "ACTIVE") {
    return false;
  }

  if (subscription.plan !== "FREE") {
    return true;
  }

  return Boolean(subscription.expiresAt && subscription.expiresAt > new Date());
}

export const requireAuth = async () => {
  try {
    const authData = await auth.api.getSession({
      headers: await headers(),
    });

    if (!authData) {
      redirect("/login");
    }

    return authData;
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    
    logger.error("auth.requireAuth.failed", { error });
    throw error;
  }
};

/**
 * Enforces that a user belongs to an organization.
 * CRITICAL for multi-tenant isolation.
 */
export const requireOrganization = async () => {
  const { session, user: authUser } = await requireAuth();

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        organizationId: true,
        role: true,
      },
    });

    if (!user || !user.organizationId) {
      redirect("/onboarding");
    }

    return {
      session,
      user: {
        ...authUser,
        organizationId: user.organizationId,
        role: user.role,
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }
    logger.error("auth.requireOrganization.failed", { error });
    throw error;
  }
};

/**
 * Security helper to ensure a resource belongs to the user's organization.
 * Use this in every server action/API that fetches by ID.
 */
export function assertSameOrganization(
  resourceOrgId: string,
  userOrgId: string,
) {
  if (resourceOrgId !== userOrgId) {
    logger.error("security.cross_organization_access_attempt", {
      userOrganizationId: userOrgId,
      resourceOrganizationId: resourceOrgId,
    });
    throw new Error("Unauthorized: Access Denied");
  }
}

/**
 * Enforces that a user is a super-admin.
 * For platform-level admin access.
 */
export const requireSuperAdmin = async () => {
  const { session, user: authUser } = await requireAuth();

  try {
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        role: true,
      },
    });

    if (!user || user.role !== "SUPER_ADMIN") {
      throw new Error("Unauthorized: Super Admin access required");
    }

    return {
      session,
      user: {
        ...authUser,
        role: user.role,
      },
    };
  } catch (error) {
    logger.error("auth.requireSuperAdmin.failed", { error });
    throw error;
  }
};

export const enforceAppRouting = async (currentPath?: string) => {
  try {
    const { session, user: authUser } = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      include: {
        organization: {
          include: { subscription: true },
        },
      },
    });

    if (!user) {
      redirect("/login");
    }

    // Super-admins bypass organization requirements
    if (user.role === "SUPER_ADMIN") {
      if (currentPath === "/onboarding" || currentPath === "/pricing") {
        redirect("/workflows");
      }
      return { session, user };
    }

    const { organizationId, onboardingCompleted, organization } = user;

    if (!organizationId || !onboardingCompleted) {
      if (currentPath !== "/onboarding") {
        redirect("/onboarding");
      }
      return { session, user };
    }

    if (!hasUsableSubscription(organization?.subscription)) {
      if (currentPath !== "/pricing") {
        redirect("/pricing");
      }
      return { session, user };
    }

    if (currentPath === "/onboarding" || currentPath === "/pricing") {
      redirect("/workflows");
    }

    return { session, user };
  } catch (error) {
    // Re-throw Next.js redirects so they work correctly
    if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
      throw error;
    }

    logger.error("auth.enforceAppRouting.failed", { error, currentPath });
    
    // If we are in production and something crashed, try to at least not 
    // kill the whole render if it's a minor error, but for auth we must be strict.
    throw error;
  }
};

export const requireUnauth = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/workflows");
  }
};
