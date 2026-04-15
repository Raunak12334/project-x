import { CredentialType, NodeType } from "@prisma/client";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";
import type { NodeDefinition } from "../../core/types";
import { fetchOpenAiRealtimeToken } from "./actions";
import { openAiFields, openAiSchema } from "./schema";

export const openAiDefinition: NodeDefinition<typeof openAiSchema> = {
  type: NodeType.OPENAI,
  version: 1,
  label: "OpenAI",
  description: "Generate text using OpenAI's powerful language models.",
  category: "action",
  icon: "openai", // Custom icon name for UI
  fields: openAiFields,
  configSchema: openAiSchema,
  ports: [
    { id: "main", label: "Success", direction: "out", isDefault: true },
    { id: "error", label: "Error", direction: "out" },
    { id: "input", label: "Trigger", direction: "in", isDefault: true },
  ],
  credentials: [
    {
      key: "credentialId",
      type: CredentialType.OPENAI,
      required: true,
    },
  ],
  getSummary: (config) =>
    config.userPrompt.substring(0, 50) +
    (config.userPrompt.length > 50 ? "..." : ""),
  realtimeStatus: {
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenAiRealtimeToken,
  },
  execute: (ctx) => import("./executor").then((m) => m.executeOpenAi(ctx)),
};
