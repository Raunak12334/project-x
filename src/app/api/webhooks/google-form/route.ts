import crypto from "node:crypto";
import { NodeType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import {
  getWebhookSecretHeaderName,
  verifyWebhookSecret,
} from "@/lib/webhook-security";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    const nodeId = url.searchParams.get("nodeId");
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

    // Verify workflow exists and secret matches
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        webhookSecretHash: true,
      },
    });

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: "Workflow not found" },
        { status: 404 },
      );
    }

    const hasValidSecret = Boolean(
      workflow.webhookSecretHash &&
        verifyWebhookSecret(workflow.webhookSecretHash, secret),
    );

    if (!hasValidSecret) {
      logger.warn("webhook.google_form.invalid_secret", { workflowId, nodeId });
      return NextResponse.json(
        { success: false, error: "Invalid webhook secret" },
        { status: 401 },
      );
    }

    const triggerNodes = await prisma.node.findMany({
      where: {
        workflowId,
        type: NodeType.GOOGLE_FORM_TRIGGER,
        ...(nodeId ? { id: nodeId } : {}),
      },
      select: {
        id: true,
      },
    });

    if (triggerNodes.length === 0) {
      return NextResponse.json(
        { success: false, error: "Google Form trigger not found" },
        { status: 404 },
      );
    }

    if (!nodeId && triggerNodes.length > 1) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Multiple Google Form triggers found. Add nodeId to the webhook URL.",
        },
        { status: 400 },
      );
    }

    const triggerNodeId = triggerNodes[0].id;
    const body = await request.json();
    const idempotencyKey =
      typeof body.responseId === "string" && body.responseId
        ? `webhook:google-form:${workflowId}:${triggerNodeId}:${body.responseId}`
        : `webhook:google-form:${workflowId}:${triggerNodeId}:${crypto.randomUUID()}`;

    const formData = {
      nodeId: triggerNodeId,
      formId: body.formId,
      formTitle: body.formTitle,
      responseId: body.responseId,
      timestamp: body.timestamp,
      respondentEmail: body.respondentEmail,
      responses: body.responses,
      raw: body,
    };

    // Trigger an Inngest job
    await sendWorkflowExecution({
      workflowId,
      triggerNodeId,
      idempotencyKey,
      initialData: {
        googleForm: formData,
      },
    });

    logger.info("webhook.google_form.enqueued", {
      workflowId,
      nodeId: triggerNodeId,
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    logger.error("webhook.google_form.failed", { error });
    return NextResponse.json(
      { success: false, error: "Failed to process Google Form submission" },
      { status: 500 },
    );
  }
}
