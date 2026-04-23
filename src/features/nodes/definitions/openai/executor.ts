import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import type { z } from "zod";
import { openAiChannel } from "@/inngest/channels/openai";
import { decrypt } from "@/lib/encryption";
import type {
  NodeExecutionContext,
  NodeExecutionResult,
} from "../../core/types";
import type { openAiSchema } from "./schema";

type OpenAiConfig = z.infer<typeof openAiSchema> & {
  nodeId?: string;
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "OpenAI request failed";

const asStepRunner = (step: unknown) =>
  step as {
    run<T>(id: string, handler: () => Promise<T> | T): Promise<T>;
  };

const asPublisher = (publish: unknown) =>
  publish as (event: unknown) => Promise<unknown>;

export const executeOpenAi = async ({
  config,
  context,
  organizationId,
  step,
  publish,
  credentials,
}: NodeExecutionContext<OpenAiConfig>): Promise<NodeExecutionResult> => {
  const {
    variableName,
    credentialId,
    systemPrompt: sysPromptRaw,
    userPrompt: userPromptRaw,
  } = config;

  // Realtime updates (preserving existing behavior)
  const nodeId = config.nodeId;
  const scopedStep = (id: string) => (nodeId ? `${nodeId}-${id}` : id);
  const runStep = asStepRunner(step);
  const publishEvent = asPublisher(publish);

  if (nodeId) {
    await publishEvent(openAiChannel().status({ nodeId, status: "loading" }));
  }

  try {
    const systemPrompt = sysPromptRaw
      ? Handlebars.compile(sysPromptRaw)(context)
      : "You are a helpful assistant.";
    const userPrompt = Handlebars.compile(userPromptRaw)(context);

    // In a fully hardened system, credentials would be injected.
    // For the migration phase, we still fetch them here if not provided.
    let apiKey = credentials?.credentialId;

    if (!apiKey && credentialId) {
      const credential = await runStep.run(
        scopedStep("get-openai-credential"),
        async () => {
          // We'll import prisma from @lib/db if needed, but assuming engine provides it or we use it here.
          const { default: prisma } = await import("@/lib/db");
          return prisma.credential.findFirst({
            where: { id: credentialId, organizationId },
          });
        },
      );

      if (credential?.valueEncrypted) {
        apiKey = decrypt(credential.valueEncrypted);
      }
    }

    if (!apiKey) {
      throw new Error("OpenAI API Key not found");
    }

    const openai = createOpenAI({ apiKey });

    const text = await runStep.run(
      scopedStep("openai-generate-text"),
      async () => {
        const result = await generateText({
          model: openai("gpt-4o-mini"),
          system: systemPrompt,
          prompt: userPrompt,
        });
        return result.text;
      },
    );

    if (nodeId) {
      await publishEvent(openAiChannel().status({ nodeId, status: "success" }));
    }

    return {
      status: "SUCCESS",
      data: { [variableName]: { text } },
      routeId: "main",
    };
  } catch (error: unknown) {
    if (nodeId) {
      await publishEvent(openAiChannel().status({ nodeId, status: "error" }));
    }
    return {
      status: "FAILURE",
      data: null,
      routeId: "error",
      error: {
        message: getErrorMessage(error),
        code: "OPENAI_ERROR",
        isRetriable: true,
      },
    };
  }
};
