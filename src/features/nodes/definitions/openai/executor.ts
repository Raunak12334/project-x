import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { openAiChannel } from "@/inngest/channels/openai";
import { decrypt } from "@/lib/encryption";
import type { NodeExecutionContext, NodeExecutionResult } from "../../core/types";

export const executeOpenAi = async ({
  config,
  context,
  organizationId,
  step,
  publish,
  credentials,
}: NodeExecutionContext): Promise<NodeExecutionResult> => {
  const { variableName, credentialId, systemPrompt: sysPromptRaw, userPrompt: userPromptRaw } = config;

  // Realtime updates (preserving existing behavior)
  const nodeId = (config as any).nodeId; // Engine will inject this or we get from config
  const scopedStep = (id: string) => (nodeId ? `${nodeId}-${id}` : id);

  if (nodeId) {
    await publish(openAiChannel().status({ nodeId, status: "loading" }));
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
      const credential = await step.run(scopedStep("get-openai-credential"), async () => {
        // We'll import prisma from @lib/db if needed, but assuming engine provides it or we use it here.
        const { default: prisma } = await import("@/lib/db");
        return prisma.credential.findFirst({
          where: { id: credentialId, organizationId },
        });
      });

      if (credential) {
        apiKey = decrypt(credential.valueEncrypted || credential.value || "");
      }
    }

    if (!apiKey) {
      throw new Error("OpenAI API Key not found");
    }

    const openai = createOpenAI({ apiKey });

    const text = await step.run(scopedStep("openai-generate-text"), async () => {
      const result = await generateText({
        model: openai("gpt-4o-mini"),
        system: systemPrompt,
        prompt: userPrompt,
      });
      return result.text;
    });

    if (nodeId) {
      await publish(openAiChannel().status({ nodeId, status: "success" }));
    }

    return {
      status: "SUCCESS",
      data: { [variableName]: { text } },
      routeId: "main",
    };
  } catch (error: any) {
    if (nodeId) {
      await publish(openAiChannel().status({ nodeId, status: "error" }));
    }
    return {
      status: "FAILURE",
      data: null,
      routeId: "error",
      error: {
        message: error.message,
        code: "OPENAI_ERROR",
        isRetriable: true,
      },
    };
  }
};
