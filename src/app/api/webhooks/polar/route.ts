import { validateEvent } from "@polar-sh/sdk/webhooks";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";

const WEBHOOK_SECRET = process.env.POLAR_WEBHOOK_SECRET;
const PRO_PRODUCT_ID = process.env.POLAR_PRO_PRODUCT_ID;

type PolarMetadata = Record<string, string | number | boolean>;

type ProSubscriptionInput = {
  customerId: string | null;
  metadata: PolarMetadata;
  productId?: string | null;
  subscriptionId: string | null;
};

function getStringMetadata(metadata: PolarMetadata, key: string) {
  const value = metadata[key];
  return typeof value === "string" ? value : null;
}

async function findOrganizationId(metadata: PolarMetadata) {
  const organizationId = getStringMetadata(metadata, "organizationId");

  if (organizationId) {
    return organizationId;
  }

  const userId = getStringMetadata(metadata, "userId");

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  return user?.organizationId || null;
}

async function activateProSubscription({
  customerId,
  metadata,
  productId,
  subscriptionId,
}: ProSubscriptionInput) {
  if (!PRO_PRODUCT_ID) {
    throw new Error("POLAR_PRO_PRODUCT_ID is not configured.");
  }

  if (productId && productId !== PRO_PRODUCT_ID) {
    logger.info("polar.webhook.product_ignored", { productId });
    return;
  }

  const organizationId = await findOrganizationId(metadata);

  if (!organizationId) {
    logger.error("polar.webhook.organization_missing", { productId });
    return;
  }

  await prisma.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      plan: "PRO",
      status: "ACTIVE",
      polarCustomerId: customerId,
      polarSubscriptionId: subscriptionId,
      productId,
      workflowLimit: -1,
    },
    update: {
      plan: "PRO",
      status: "ACTIVE",
      polarCustomerId: customerId,
      polarSubscriptionId: subscriptionId,
      productId,
      canceledAt: null,
      workflowLimit: -1,
    },
  });

  logger.info("polar.subscription.activated", {
    organizationId,
    subscriptionId,
    productId,
  });
}

async function updateSubscriptionStatus(
  subscriptionId: string,
  status: "ACTIVE" | "CANCELED" | "PAST_DUE" | "UNPAID",
  canceledAt?: Date | null,
) {
  await prisma.subscription.updateMany({
    where: { polarSubscriptionId: subscriptionId },
    data: {
      status,
      ...(canceledAt !== undefined ? { canceledAt } : {}),
    },
  });
}

function mapSubscriptionStatus(
  status: string,
): "ACTIVE" | "CANCELED" | "PAST_DUE" | "UNPAID" {
  switch (status) {
    case "active":
      return "ACTIVE";
    case "canceled":
      return "CANCELED";
    case "past_due":
      return "PAST_DUE";
    default:
      return "UNPAID";
  }
}

export async function POST(request: NextRequest) {
  if (!WEBHOOK_SECRET) {
    logger.error("polar.webhook.secret_missing");
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 },
    );
  }

  const body = await request.text();

  try {
    const event = validateEvent(
      body,
      Object.fromEntries(request.headers.entries()),
      WEBHOOK_SECRET,
    );

    switch (event.type) {
      case "order.paid":
        await activateProSubscription({
          customerId: event.data.customerId,
          metadata: event.data.metadata,
          productId: event.data.productId,
          subscriptionId: event.data.subscriptionId,
        });
        break;
      case "subscription.active":
      case "subscription.created":
      case "subscription.uncanceled":
        await activateProSubscription({
          customerId: event.data.customerId,
          metadata: event.data.metadata,
          productId: event.data.productId,
          subscriptionId: event.data.id,
        });
        break;
      case "subscription.updated":
        if (event.data.status === "active") {
          await activateProSubscription({
            customerId: event.data.customerId,
            metadata: event.data.metadata,
            productId: event.data.productId,
            subscriptionId: event.data.id,
          });
        } else {
          await updateSubscriptionStatus(
            event.data.id,
            mapSubscriptionStatus(event.data.status),
            event.data.canceledAt,
          );
        }
        break;
      case "subscription.canceled":
      case "subscription.revoked":
        await updateSubscriptionStatus(
          event.data.id,
          "CANCELED",
          event.data.canceledAt || new Date(),
        );
        break;
      default:
        logger.info("polar.webhook.unhandled_event", { eventType: event.type });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("polar.webhook.processing_failed", { error });
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }
}
