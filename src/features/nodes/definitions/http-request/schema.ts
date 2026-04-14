import { z } from "zod";
import type { NodeFieldDefinition } from "../../core/types";

export const httpRequestSchema = z.object({
  variableName: z
    .string()
    .min(1, "Variable name is required")
    .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, "Invalid variable name"),
  method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
  url: z.string().min(1, "URL is required"),
  authMode: z.enum(["none", "bearer", "basic", "credential"]).default("none"),
  bearerToken: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  credentialId: z.string().optional(),
  bodyMode: z.enum(["none", "json", "text", "urlencoded"]).default("none"),
  body: z.string().optional(),
  headers: z.string().optional().default("{}"),
});

export const httpRequestFields: NodeFieldDefinition[] = [
  {
    name: "variableName",
    label: "Variable Name",
    type: "text",
    placeholder: "httpResponse",
    description: "Store response in {{variableName}}",
  },
  {
    name: "method",
    label: "Method",
    type: "select",
    defaultValue: "GET",
    options: [
      { label: "GET", value: "GET" },
      { label: "POST", value: "POST" },
      { label: "PUT", value: "PUT" },
      { label: "PATCH", value: "PATCH" },
      { label: "DELETE", value: "DELETE" },
    ],
  },
  {
    name: "url",
    label: "URL",
    type: "text",
    placeholder: "https://api.example.com/v1/resource",
    description: "Supports {{variables}}",
  },
  {
    name: "authMode",
    label: "Authentication",
    type: "select",
    defaultValue: "none",
    options: [
      { label: "None", value: "none" },
      { label: "Bearer Token", value: "bearer" },
      { label: "Basic Auth", value: "basic" },
      { label: "Organization Credential", value: "credential" },
    ],
  },
  {
    name: "bearerToken",
    label: "Token",
    type: "text",
    placeholder: "sk-...",
    visibleIf: { field: "authMode", operator: "eq", value: "bearer" },
  },
  {
    name: "username",
    label: "Username",
    type: "text",
    visibleIf: { field: "authMode", operator: "eq", value: "basic" },
  },
  {
    name: "password",
    label: "Password",
    type: "text",
    visibleIf: { field: "authMode", operator: "eq", value: "basic" },
  },
  {
    name: "credentialId",
    label: "Credential",
    type: "credential",
    visibleIf: { field: "authMode", operator: "eq", value: "credential" },
  },
  {
    name: "bodyMode",
    label: "Body Mode",
    type: "select",
    defaultValue: "none",
    visibleIf: { field: "method", operator: "neq", value: "GET" },
    options: [
      { label: "None", value: "none" },
      { label: "JSON", value: "json" },
      { label: "Raw Text", value: "text" },
      { label: "Form URL Encoded", value: "urlencoded" },
    ],
  },
  {
    name: "body",
    label: "Body",
    type: "textarea",
    placeholder: '{"key": "value"}',
    visibleIf: { field: "bodyMode", operator: "neq", value: "none" },
  },
  {
    name: "headers",
    label: "Headers (JSON)",
    type: "textarea",
    placeholder: '{"X-Custom-Header": "value"}',
    defaultValue: "{}",
  },
];
