import { Composio } from "@composio/core";
import { logger } from "@/lib/logger";

type JsonObject = Record<string, unknown>;

type CreateConnectionInput = {
  organizationId: string;
  toolkitSlug: string;
  callbackUrl: string;
};

type ExecuteActionInput = {
  organizationId: string;
  action: string;
  input: JsonObject;
  connectionId?: string | null;
  timeoutMs?: number;
};

type ToolkitWithActionsFetcher = {
  tools?: (args: { toolkitSlugs: string[]; limit: number }) => Promise<{
    items?: unknown[];
  }>;
};

type ExecuteToolFn = (action: string, payload: unknown) => Promise<unknown>;

const DEFAULT_TIMEOUT_MS = 20_000;
const DEFAULT_RETRY_ATTEMPTS = 2;

function getApiKey() {
  const apiKey = process.env.COMPOSIO_API_KEY;
  if (!apiKey) {
    throw new Error("COMPOSIO_API_KEY environment variable is required");
  }

  return apiKey;
}

async function withRetry<T>(operation: () => Promise<T>, attempts: number) {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= attempts) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
      attempt += 1;
    }
  }

  throw lastError;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Composio action timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

function sanitizePayload(payload: JsonObject) {
  const redactedKeys = [
    "token",
    "accessToken",
    "refreshToken",
    "authorization",
    "apiKey",
    "password",
    "secret",
  ];

  const clone = { ...payload };
  for (const key of Object.keys(clone)) {
    if (redactedKeys.some((item) => key.toLowerCase().includes(item.toLowerCase()))) {
      clone[key] = "[REDACTED]";
    }
  }

  return clone;
}

export async function listComposioApps(organizationId: string) {
  const composio = new Composio({ apiKey: getApiKey() });
  const session = await composio.create(organizationId);
  return session.toolkits({ limit: 100 });
}

export async function createComposioConnection(input: CreateConnectionInput) {
  const composio = new Composio({ apiKey: getApiKey() });
  const session = await composio.create(input.organizationId);

  return session.authorize(input.toolkitSlug, {
    callbackUrl: input.callbackUrl,
  });
}

export async function listComposioActions(
  organizationId: string,
  toolkitSlug: string,
) {
  const composio = new Composio({ apiKey: getApiKey() });
  const session = await composio.create(organizationId);
  const sessionWithTools = session as unknown as ToolkitWithActionsFetcher;

  // SDK surface differs by version; fall back safely.
  if (typeof sessionWithTools.tools === "function") {
    const response = await sessionWithTools.tools({
      toolkitSlugs: [toolkitSlug],
      limit: 200,
    });
    return response?.items ?? [];
  }

  return [];
}

export async function executeComposioAction(input: ExecuteActionInput) {
  const composio = new Composio({ apiKey: getApiKey() });
  const startTime = Date.now();

  logger.info("composio.action.start", {
    organizationId: input.organizationId,
    action: input.action,
    connectionId: input.connectionId ?? null,
    input: sanitizePayload(input.input),
  });

  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const retries = DEFAULT_RETRY_ATTEMPTS;

  const execute = async () => {
    const executeTool = composio.tools.execute as unknown as ExecuteToolFn;
    const payloadBase = {
      user: input.organizationId,
      userId: input.organizationId,
      arguments: input.input,
      input: input.input,
      connectedAccountId: input.connectionId ?? undefined,
      connectedAccountIds: input.connectionId ? [input.connectionId] : undefined,
    };

    try {
      return await executeTool(input.action, payloadBase);
    } catch {
      return await executeTool(input.action, input.input);
    }
  };

  try {
    const result = await withRetry(
      () => withTimeout(execute(), timeoutMs),
      retries,
    );

    logger.info("composio.action.success", {
      organizationId: input.organizationId,
      action: input.action,
      connectionId: input.connectionId ?? null,
      latencyMs: Date.now() - startTime,
    });

    return result;
  } catch (error) {
    logger.error("composio.action.error", {
      organizationId: input.organizationId,
      action: input.action,
      connectionId: input.connectionId ?? null,
      latencyMs: Date.now() - startTime,
      error,
    });
    throw error;
  }
}
