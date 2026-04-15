import Handlebars from "handlebars";
import ky, { type Options as KyOptions } from "ky";
import type { z } from "zod";
import { httpRequestChannel } from "@/inngest/channels/http-request";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../../core/types";
import type { httpRequestSchema } from "./schema";

type HttpRequestConfig = z.infer<typeof httpRequestSchema> & {
  nodeId?: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "HTTP request failed";

const asStepRunner = (step: unknown) =>
  step as {
    run<T>(id: string, handler: () => Promise<T> | T): Promise<T>;
  };

const asPublisher = (publish: unknown) =>
  publish as (event: unknown) => Promise<unknown>;

export const executeHttpRequest = async ({
  config,
  context,
  step,
  publish,
  credentials,
}: NodeExecutionContext<HttpRequestConfig>): Promise<NodeExecutionResult> => {
  const {
    variableName,
    method,
    url: urlRaw,
    authMode,
    bearerToken: bTokenRaw,
    username: userRaw,
    password: passRaw,
    bodyMode,
    body: bodyRaw,
    headers: headersRaw,
  } = config;

  const nodeId = config.nodeId;
  const scopedStep = (id: string) => (nodeId ? `${nodeId}-${id}` : id);
  const runStep = asStepRunner(step);
  const publishEvent = asPublisher(publish);

  if (nodeId) {
    await publishEvent(
      httpRequestChannel().status({ nodeId, status: "loading" }),
    );
  }

  try {
    const url = Handlebars.compile(urlRaw)(context);
    const options: KyOptions = {
      method,
      throwHttpErrors: false, // We handle errors in the result contract
    };

    const headers: Record<string, string> = JSON.parse(
      Handlebars.compile(headersRaw || "{}")(context),
    );

    // Apply Auth
    if (authMode === "bearer") {
      const token = Handlebars.compile(bTokenRaw || "")(context);
      headers.Authorization = `Bearer ${token}`;
    } else if (authMode === "basic") {
      const user = Handlebars.compile(userRaw || "")(context);
      const pass = Handlebars.compile(passRaw || "")(context);
      const auth = Buffer.from(`${user}:${pass}`).toString("base64");
      headers.Authorization = `Basic ${auth}`;
    } else if (authMode === "credential") {
      // Credential resolution is handled by the engine-adapter,
      // and injected into ctx.credentials
      const credValue = credentials?.credentialId;
      if (credValue) {
        headers.Authorization = `Bearer ${credValue}`;
      }
    }

    // Apply Body
    if (method !== "GET" && bodyMode !== "none") {
      const resolvedBody = Handlebars.compile(bodyRaw || "")(context);
      if (bodyMode === "json") {
        options.json = JSON.parse(resolvedBody);
      } else if (bodyMode === "urlencoded") {
        options.body = new URLSearchParams(JSON.parse(resolvedBody));
      } else {
        options.body = resolvedBody;
      }
    }

    options.headers = headers;

    const response = await runStep.run(
      scopedStep("http-request-call"),
      async () => {
        const res = await ky(url, options);
        const contentType = res.headers.get("content-type");
        const data = contentType?.includes("application/json")
          ? await res.json()
          : await res.text();

        return {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          data,
        };
      },
    );

    if (nodeId) {
      await publishEvent(
        httpRequestChannel().status({ nodeId, status: "success" }),
      );
    }

    return {
      status: "SUCCESS",
      data: {
        [variableName]: {
          httpResponse: response,
        },
      },
      routeId: "main",
    };
  } catch (error: unknown) {
    if (nodeId) {
      await publishEvent(
        httpRequestChannel().status({ nodeId, status: "error" }),
      );
    }

    return {
      status: "FAILURE",
      data: null,
      routeId: "error",
      error: {
        message: getErrorMessage(error),
        code: "HTTP_REQUEST_FAILED",
        isRetriable: true,
      },
    };
  }
};
