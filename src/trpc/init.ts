import { initTRPC, TRPCError } from "@trpc/server";
import { headers } from "next/headers";
import { cache } from "react";
import superjson from "superjson";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { getPolarClient } from "@/lib/polar";

export const createTRPCContext = cache(async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return { auth: session };
});
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});
// Base router and procedure helpers
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;

function hasUsableLocalSubscription(
  subscription: {
    plan: "FREE" | "PRO" | "CUSTOM" | "ENTERPRISE";
    status: string;
    expiresAt: Date | null;
  } | null,
) {
  if (!subscription || subscription.status !== "ACTIVE") {
    return false;
  }

  if (subscription.plan !== "FREE") {
    return true;
  }

  return Boolean(subscription.expiresAt && subscription.expiresAt > new Date());
}

export const protectedProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { organizationId: true },
  });

  if (!user?.organizationId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Organization not found. Please complete onboarding.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: {
        ...session,
        organizationId: user.organizationId,
      },
    },
  });
});
export const premiumProcedure = protectedProcedure.use(
  async ({ ctx, next }) => {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: ctx.auth.organizationId },
      include: {
        organization: { select: { _count: { select: { workflows: true } } } },
      },
    });

    if (subscription && hasUsableLocalSubscription(subscription)) {
      if (subscription.plan === "FREE") {
        const workflowCount = subscription.organization._count.workflows;
        if (workflowCount >= (subscription.workflowLimit || 2)) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `Free plan limited to ${subscription.workflowLimit || 2} workflows. Upgrade to PRO for unlimited workflows.`,
          });
        }
      }
      return next({ ctx: { ...ctx, subscription } });
    }

    const polar = getPolarClient();
    try {
      customer = await polar.customers.getStateExternal({
        externalId: ctx.auth.user.id,
      });
    } catch (polarError) {
      logger.error("subscription.polar_lookup_failed", {
        userId: ctx.auth.user.id,
        organizationId: ctx.auth.organizationId,
        error: polarError,
      });
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Unable to verify subscription status. Please contact support.",
      });
    }

    const activeSubscription = customer.activeSubscriptions?.[0];

    if (!activeSubscription) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message:
          "Active subscription required. Your free trial may have expired.",
      });
    }

    await prisma.subscription.upsert({
      where: { organizationId: ctx.auth.organizationId },
      create: {
        organizationId: ctx.auth.organizationId,
        plan: "PRO",
        status: "ACTIVE",
        polarCustomerId: customer.id,
        polarSubscriptionId: activeSubscription.id,
        productId: activeSubscription.productId,
        workflowLimit: -1,
      },
      update: {
        plan: "PRO",
        status: "ACTIVE",
        polarCustomerId: customer.id,
        polarSubscriptionId: activeSubscription.id,
        productId: activeSubscription.productId,
        canceledAt: null,
        workflowLimit: -1,
      },
    });

    return next({
      ctx: { ...ctx, customer, subscription: activeSubscription },
    });
  },
);

export const superAdminProcedure = baseProcedure.use(async ({ ctx, next }) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unauthorized",
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "SUPER_ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Super Admin access required",
    });
  }

  return next({
    ctx: {
      ...ctx,
      auth: session,
    },
  });
});
