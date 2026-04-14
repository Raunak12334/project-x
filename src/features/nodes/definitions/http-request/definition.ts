import { NodeType, CredentialType } from "@prisma/client";
import { NodeDefinition } from "../../core/types";
import { httpRequestFields, httpRequestSchema } from "./schema";

export const httpRequestDefinition: NodeDefinition<typeof httpRequestSchema> = {
  type: NodeType.HTTP_REQUEST,
  version: 1,
  label: "HTTP Request",
  description: "Send a customizeable HTTP request to any URL.",
  category: "action",
  icon: "http",
  fields: httpRequestFields,
  configSchema: httpRequestSchema,
  ports: [
    { id: "main", label: "Success", direction: "out", isDefault: true },
    { id: "error", label: "Error", direction: "out" },
    { id: "input", label: "Trigger", direction: "in", isDefault: true },
  ],
  credentials: [
    {
      key: "credentialId",
      type: CredentialType.GENERIC,
      required: false,
    },
  ],
  getSummary: (config) => `${config.method} ${config.url}`,
  execute: (ctx) => import("./executor").then((m) => m.executeHttpRequest(ctx)),
};
