import { NodeType, CredentialType } from "@prisma/client";
import { NodeDefinition } from "../../core/types";
import { executeOpenAi } from "./executor";
import { openAiFields, openAiSchema } from "./schema";
import { OPENAI_CHANNEL_NAME } from "@/inngest/channels/openai";
import { fetchOpenAiRealtimeToken } from "./actions";

export const openAiDefinition: NodeDefinition<typeof openAiSchema> = {
  type: NodeType.OPENAI,
  version: 1,
  label: "OpenAI",
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
  getSummary: (data) =>
    data.userPrompt
      ? `GPT-4: ${data.userPrompt.slice(0, 30)}...`
      : "Not configured",
  realtimeStatus: {
    channel: OPENAI_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchOpenAiRealtimeToken,
  },
  execute: executeOpenAi,
};
