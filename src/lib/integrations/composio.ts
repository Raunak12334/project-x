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

/**
 * Lazy-load Composio to prevent Node.js built-in dependencies (fs, os, etc.)
 * from breaking the client-side bundle.
 */
async function getComposioSDK() {
  if (typeof window !== "undefined") {
    throw new Error("Composio SDK cannot be used in the browser");
  }
  const { Composio } = await import("@composio/core");
  return Composio;
}

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
  try {
    const Composio = await getComposioSDK();
    const composio = new Composio({ apiKey: getApiKey() });
    
    // Tier 1: Try the standard toolkits.get() method (recommended for v0.6+)
    try {
        const response = await (composio as any).toolkits?.get?.({ limit: 100 });
        if (response && Array.isArray(response.items) && response.items.length > 0) {
            return response;
        }
        // If items is not array but the response itself is an array
        if (Array.isArray(response) && response.length > 0) {
            return { items: response };
        }
    } catch (e) {
        logger.warn("composio.listApps.tier1.failed", { error: e });
    }

    // Tier 2: Try calling toolkits directly as a function
    try {
        const directList = await (composio as any).toolkits?.({ limit: 100 });
        if (directList && directList.items && directList.items.length > 0) {
            return directList;
        }
        if (Array.isArray(directList) && directList.length > 0) {
            return { items: directList };
        }
    } catch (e) {
        logger.warn("composio.listApps.tier2.failed", { error: e });
    }

    // Tier 3: Try to get toolkits via session (entity-specific)
    try {
        const session = await composio.create(organizationId || "default-org");
        const response = await session.toolkits({ limit: 100 });
        
        if (response && response.items && response.items.length > 0) {
            return response;
        }
    } catch (e) {
        logger.warn("composio.listApps.tier3.failed", { error: e });
    }

    // Tier 4: Fallback to tools surface
    try {
        const globalResponse = await (composio as any).tools?.getToolkits?.({ limit: 100 });
        if (globalResponse && globalResponse.items) {
          return globalResponse;
        }
    } catch (e) {
        logger.warn("composio.listApps.tier4.failed", { error: e });
    }

    // Tier 5: Final desperate fallback to tools.list
    try {
        const toolsList = await (composio as any).tools?.list?.({ limit: 100 });
        if (toolsList && Array.isArray(toolsList.items)) {
            return toolsList;
        }
    } catch (e) {
        logger.warn("composio.listApps.tier5.failed", { error: e });
    }

    logger.error("composio.listApps.all_tiers_failed", { organizationId });
    return { items: [] };
  } catch (error) {
    logger.error("composio.listApps.outer_catch", { organizationId, error });
    return { items: [] };
  }
}

export async function createComposioConnection(input: CreateConnectionInput) {
  const Composio = await getComposioSDK();
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
  const Composio = await getComposioSDK();
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
  const Composio = await getComposioSDK();
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
