import { CredentialType, NodeType } from "@prisma/client";
import { COMPOSIO_CHANNEL_NAME } from "@/inngest/channels/composio";
import type { NodeDefinition } from "../../core/types";
import { composioFields, composioSchema } from "./schema";

export const composioDefinition: NodeDefinition<typeof composioSchema> = {
  type: NodeType.COMPOSIO,
  version: 1,
  label: "Composio Integration",
  description: "Perform actions across 11,000+ apps via Composio.",
  category: "action",
  icon: "/logos/composio.svg",
  fields: composioFields,
  configSchema: composioSchema,
  ports: [
    { id: "main", label: "Success", direction: "out", isDefault: true },
    { id: "error", label: "Error", direction: "out" },
    { id: "input", label: "Trigger", direction: "in", isDefault: true },
  ],
  credentials: [
    {
      key: "integrationId",
      type: CredentialType.COMPOSIO, // We use the connected integration
      required: true,
    },
  ],
  getSummary: (config) =>
    config.toolSlug
      ? `${config.toolSlug}${config.actionSlug ? `: ${config.actionSlug}` : ""}`
      : "No integration selected",
};
