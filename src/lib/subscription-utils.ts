import prisma from "@/lib/db";

/**
 * Handles subscription cleanup for expired or canceled subscriptions
 * This should be run periodically (e.g., daily cron job)
 */
export async function cleanupExpiredSubscriptions() {
  const now = new Date();

  // Find expired free trials
  const expiredFreeTrials = await prisma.subscription.findMany({
    where: {
      plan: "FREE",
      expiresAt: { lt: now },
      status: "ACTIVE",
    },
    include: { organization: true },
  });

  // Mark as expired
  for (const subscription of expiredFreeTrials) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: "CANCELED" },
    });

    console.log(
      `Expired free trial for organization ${subscription.organizationId}`,
    );
  }

  // Handle canceled PRO subscriptions that have passed their grace period
  // For now, we'll keep them active until the billing period ends
  // In a real implementation, you'd check Polar for the actual end date

  return {
    expiredFreeTrials: expiredFreeTrials.length,
  };
}

/**
 * Syncs subscription status with Polar for all organizations
 */
export async function syncSubscriptionStatus() {
  // This would iterate through all subscriptions with polarSubscriptionId
  // and sync their status with Polar
  // For now, this is handled by webhooks
}
