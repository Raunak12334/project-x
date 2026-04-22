import { z } from "zod";
import type { NodeField } from "../../core/types";

export const composioSchema = z.object({
  variableName: z.string().min(1, "Variable name is required"),
  integrationId: z.string().optional(),
  toolSlug: z.string().min(1, "Tool slug is required"),
  actionSlug: z.string().optional(),
  argumentsJson: z.string().optional(),
});

export const composioFields: NodeField[] = [
  {
    name: "variableName",
    label: "Save Result As",
    type: "text",
    placeholder: "e.g., githubResult",
    description: "The variable name to store the output of this action.",
    required: true,
  },
  {
    name: "integrationId",
    label: "Connected Account",
    type: "credential",
    description: "Select the connected account to use for this integration.",
    required: true,
  },
  {
    name: "toolSlug",
    label: "App / Toolkit",
    type: "text",
    description: "The Composio toolkit slug (e.g., GITHUB).",
    required: true,
  },
  {
    name: "actionSlug",
    label: "Action",
    type: "text",
    placeholder: "e.g., CREATE_ISSUE",
    description: "The specific action to perform within the toolkit.",
    required: false,
  },
  {
    name: "argumentsJson",
    label: "Arguments (JSON)",
    type: "textarea",
    placeholder:
      '{\n  "owner": "owner-name",\n  "repo": "repo-name",\n  "title": "Issue Title"\n}',
    description:
      "JSON payload for the action. Supports {{handlebar}} variables.",
    required: false,
  },
];
