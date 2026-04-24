import { NodeType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  getWebhookSecretHeaderName,
  verifyWebhookSecret,
} from "@/lib/webhook-security";

let stripeClient: Stripe | null = null;

const getStripeConfig = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!secretKey || !webhookSecret) {
    return null;
  }

  if (!stripeClient) {
    stripeClient = new Stripe(secretKey);
  }

  return {
    stripe: stripeClient,
    endpointSecret: webhookSecret,
  };
};

export async function POST(request: NextRequest) {
  try {
    const stripeConfig = getStripeConfig();

    if (!stripeConfig) {
      return NextResponse.json(
        { success: false, error: "Stripe webhook is not configured" },
        { status: 503 },
      );
    }

    const body = await request.text();
    const signature = request.headers.get("stripe-signature");
    const { stripe, endpointSecret } = stripeConfig;

    if (!signature) {
      return NextResponse.json(
        { success: false, error: "Missing Stripe signature" },
        { status: 400 },
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      logger.warn("stripe.webhook.signature_invalid", { error: err });
      return NextResponse.json(
        { success: false, error: "Webhook signature verification failed" },
        { status: 400 },
      );
    }

    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    const secret =
      request.headers.get(getWebhookSecretHeaderName()) ??
      url.searchParams.get("secret");

    if (!workflowId) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required query parameter: workflowId",
        },
        { status: 400 },
      );
    }

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        webhookSecretHash: true,
        nodes: {
          where: { type: NodeType.STRIPE_TRIGGER },
          select: { id: true },
          take: 1,
        },
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: "Workflow not found" },
        { status: 404 },
      );
    }

    const hasValidWorkflowSecret = Boolean(
      workflow.webhookSecretHash &&
        verifyWebhookSecret(workflow.webhookSecretHash, secret),
    );

    if (!hasValidWorkflowSecret) {
      logger.warn("stripe.webhook.workflow_secret_invalid", { workflowId });
      return NextResponse.json(
        { success: false, error: "Invalid webhook secret" },
        { status: 401 },
      );
    }

    const triggerNode = workflow.nodes[0];

    if (!triggerNode) {
      return NextResponse.json(
        { success: false, error: "Stripe trigger not found" },
        { status: 404 },
      );
    }

    const stripeData = {
      // Event metadata
      eventId: event.id,
      eventType: event.type,
      timestamp: event.created,
      livemode: event.livemode,
      raw: event.data.object,
    };

    // Trigger an Inngest job
    await sendWorkflowExecution({
      workflowId,
      triggerNodeId: triggerNode.id,
      idempotencyKey: `webhook:stripe:${event.id}`,
      initialData: {
        stripe: stripeData,
      },
    });

    logger.info("stripe.webhook.enqueued", {
      workflowId,
      triggerNodeId: triggerNode.id,
      eventId: event.id,
      eventType: event.type,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("stripe.webhook.failed", { error });
    return NextResponse.json(
      { success: false, error: "Failed to process Stripe event" },
      { status: 500 },
    );
  }
}
