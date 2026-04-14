import { z } from "zod";
import type { NodeFieldDefinition } from "../../core/types";

export const openAiSchema = z.object({
  variableName: z
    .string()
    .min(1, { message: "Variable name is required" })
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
      message:
        "Variable name must start with a letter or underscore and contain only letters, numbers, and underscores",
    }),
  credentialId: z.string().min(1, "Credential is required"),
  systemPrompt: z.string().optional(),
  userPrompt: z.string().min(1, "User prompt is required"),
});

export const openAiFields: NodeFieldDefinition[] = [
  {
    name: "variableName",
    label: "Variable Name",
    type: "text",
    placeholder: "myOpenAi",
    description: "Access result via {{variableName.text}}",
  },
  {
    name: "credentialId",
    label: "OpenAI Credential",
    type: "credential",
    description: "Select your OpenAI API key",
  },
  {
    name: "systemPrompt",
    label: "System Prompt",
    type: "textarea",
    placeholder: "You are a helpful assistant.",
    description: "Sets the behavior of the assistant",
  },
  {
    name: "userPrompt",
    label: "User Prompt",
    type: "textarea",
    placeholder: "Summarize: {{payload}}",
    description: "The prompt to send to the AI",
  },
];
