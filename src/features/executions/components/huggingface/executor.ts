import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { huggingFaceChannel } from "@/inngest/channels/huggingface";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type HuggingFaceData = {
  variableName?: string;
  credentialId?: string;
  model?: string;
  systemPrompt?: string;
  userPrompt?: string;
};

export const huggingFaceExecutor: NodeExecutor<HuggingFaceData> = async ({
  data,
  nodeId,
  organizationId,
  context,
  step,
  publish,
}) => {
  await publish(
    huggingFaceChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      huggingFaceChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Hugging Face node: Variable name is missing");
  }

  if (!data.credentialId) {
    await publish(
      huggingFaceChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Hugging Face node: Credential is required");
  }

  if (!data.model) {
    await publish(
      huggingFaceChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Hugging Face node: Model is required");
  }

  if (!data.userPrompt) {
    await publish(
      huggingFaceChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Hugging Face node: User prompt is missing");
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
      huggingFaceChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Hugging Face node: Credential not found");
  }

  const credentialValue = credential.valueEncrypted;
  if (!credentialValue) {
    await publish(
      huggingFaceChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Hugging Face node: Credential value is empty");
  }

  const huggingFace = createOpenAI({
    apiKey: decrypt(credentialValue),
    baseURL: "https://router.huggingface.co/v1",
  });

  try {
    const result = await step.ai.wrap(
      "huggingface-generate-text",
      generateText,
      {
        model: huggingFace(data.model),
        system: systemPrompt,
        prompt: userPrompt,
        experimental_telemetry: {
          isEnabled: true,
          recordInputs: true,
          recordOutputs: true,
        },
      },
    );

    await publish(
      huggingFaceChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        text: result.text,
        model: data.model,
        provider: "huggingface",
      },
    };
  } catch (error) {
    await publish(
      huggingFaceChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
