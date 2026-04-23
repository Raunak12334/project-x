import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { gemmaChannel } from "@/inngest/channels/gemma";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type GemmaData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const gemmaExecutor: NodeExecutor<GemmaData> = async ({
  data,
  nodeId,
  organizationId,
  context,
  step,
  publish,
}) => {
  await publish(
    gemmaChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      gemmaChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemma node: Variable name is missing");
  }

  if (!data.credentialId) {
    await publish(
      gemmaChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemma node: Credential is required");
  }

  if (!data.userPrompt) {
    await publish(
      gemmaChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemma node: User prompt is missing");
  }

  if (!data.model) {
    await publish(
      gemmaChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemma node: Model is required");
  }

  const systemPrompt = data.systemPrompt
    ? Handlebars.compile(data.systemPrompt)(context)
    : "You are a helpful assistant.";
  const userPrompt = Handlebars.compile(data.userPrompt)(context);

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findFirst({
      where: {
        id: data.credentialId,
        organizationId,
      },
    });
  });

  if (!credential) {
    await publish(
      gemmaChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemma node: Credential not found");
  }

  const credentialValue = credential.valueEncrypted;
  if (!credentialValue) {
    await publish(
      gemmaChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Gemma node: Credential value is empty");
  }

  const google = createGoogleGenerativeAI({
    apiKey: decrypt(credentialValue),
  });

  try {
    const text = await step.run("gemma-generate-text", async () => {
      const result = await generateText({
        model: google(data.model || "gemma-2-27b-it"),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      });

      return result.text;
    });

    await publish(
      gemmaChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        text,
        model: data.model,
        provider: "gemma",
      },
    };
  } catch (error) {
    await publish(
      gemmaChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
