import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";

export const subscriptionsRouter = createTRPCRouter({
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await prisma.subscription.findUnique({
      where: { organizationId: ctx.auth.organizationId },
      select: {
        id: true,
        plan: true,
        status: true,
        expiresAt: true,
        canceledAt: true,
        workflowLimit: true,
        featureFlags: true,
        updatedAt: true,
        organization: {
          select: {
            _count: {
              select: { workflows: true },
            },
          },
        },
      },
    });

    if (!subscription) {
      return null;
    }

    const { organization, ...currentSubscription } = subscription;

    return {
      ...currentSubscription,
      usage: {
        workflows: organization._count.workflows,
      },
    };
  }),
});
