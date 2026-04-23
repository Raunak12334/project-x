import crypto from "node:crypto";
import { NodeType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { sendWorkflowExecution } from "@/inngest/utils";
import prisma from "@/lib/db";
import { logger } from "@/lib/logger";
import { verifyWebhookSecret } from "@/lib/webhook-security";

const parseBody = async (request: NextRequest) => {
  if (request.method === "GET") {
    return {
      rawBody: "",
      body: null,
    };
  }

  const rawBody = await request.text();
  const contentType = request.headers.get("content-type") || "";

  if (!rawBody) {
    return {
      rawBody,
      body: null,
    };
  }

  if (contentType.includes("application/json")) {
    try {
      return {
        rawBody,
        body: JSON.parse(rawBody) as unknown,
      };
    } catch {
      return {
        rawBody,
        body: rawBody,
      };
    }
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return {
      rawBody,
      body: Object.fromEntries(new URLSearchParams(rawBody).entries()),
    };
  }

  return {
    rawBody,
    body: rawBody,
  };
};

const createWebhookResponse = (status: number, body: Record<string, unknown>) =>
  NextResponse.json(body, { status });

const createIdempotencyKey = ({
  workflowId,
  nodeId,
  method,
  rawBody,
  query,
}: {
  workflowId: string;
  nodeId: string;
  method: string;
  rawBody: string;
  query: Record<string, string>;
}) => {
  const providedKey = query.idempotencyKey;

  if (providedKey) {
    return `webhook:generic:${workflowId}:${nodeId}:${providedKey}`;
  }

  const sortedQuery = Object.entries(query)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const fingerprint = crypto
    .createHash("sha256")
    .update(`${method}\n${workflowId}\n${nodeId}\n${sortedQuery}\n${rawBody}`)
    .digest("hex");

  return `webhook:generic:${workflowId}:${nodeId}:${fingerprint}`;
};

const handleWebhookRequest = async (request: NextRequest) => {
  try {
    const url = new URL(request.url);
    const workflowId = url.searchParams.get("workflowId");
    const nodeId = url.searchParams.get("nodeId");
    const secret = url.searchParams.get("secret");

    if (!workflowId || !nodeId) {
      return createWebhookResponse(400, {
        success: false,
        error: "Missing workflowId or nodeId",
      });
    }

    // Get the workflow and check if it exists and has the correct secret
    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
      select: {
        id: true,
        organizationId: true,
        webhookSecret: true,
      },
    });

    if (!workflow) {
      return createWebhookResponse(404, {
        success: false,
        error: "Workflow not found",
      });
    }

    const hasValidSecret = Boolean(
      workflow.webhookSecret &&
        verifyWebhookSecret(workflow.webhookSecret, secret),
    );

    if (!hasValidSecret) {
      logger.warn("webhook.generic.invalid_secret", { workflowId, nodeId });
      return createWebhookResponse(401, {
        success: false,
        error: "Invalid webhook secret",
      });
    }

    const triggerNode = await prisma.node.findFirst({
      where: {
        id: nodeId,
        workflowId,
        type: NodeType.WEBHOOK_TRIGGER,
      },
      select: {
        id: true,
      },
    });

    if (!triggerNode) {
      return createWebhookResponse(404, {
        success: false,
        error: "Webhook trigger not found",
      });
    }

    const { rawBody, body } = await parseBody(request);
    const queryEntries = Object.fromEntries(url.searchParams.entries());
    const {
      workflowId: _workflowId,
      nodeId: _nodeId,
      secret: _secret,
      ...query
    } = queryEntries;
    const idempotencyKey = createIdempotencyKey({
      workflowId,
      nodeId,
      method: request.method,
      rawBody,
      query,
    });

    await sendWorkflowExecution({
      workflowId,
      triggerNodeId: nodeId,
      idempotencyKey,
      initialData: {
        webhook: {
          nodeId,
          method: request.method,
          url: `${url.origin}${url.pathname}`,
          query,
          headers: Object.fromEntries(request.headers.entries()),
          body,
          rawBody,
        },
      },
    });

    logger.info("webhook.generic.enqueued", { workflowId, nodeId });

    return createWebhookResponse(200, { success: true });
  } catch (error) {
    logger.error("webhook.generic.failed", { error });

    return createWebhookResponse(500, {
      success: false,
      error: "Failed to process webhook request",
    });
  }
};

export const GET = handleWebhookRequest;
export const POST = handleWebhookRequest;
export const PUT = handleWebhookRequest;
export const PATCH = handleWebhookRequest;
export const DELETE = handleWebhookRequest;
