import { CredentialType, NodeType } from "@prisma/client";
import { getNodeDefinition } from "@/features/nodes/core/registry";
import type { EditorNode } from "./graph-utils";
import type { WorkflowValidationIssue } from "./workflow-validator";

type NodeConfigValidationContext = {
  validCredentialIds?: Set<string>;
  validIntegrationIds?: Set<string>;
};

type LegacyConfigValidator = (
  node: EditorNode,
  context: NodeConfigValidationContext,
) => WorkflowValidationIssue[];

const asData = (node: EditorNode) =>
  node.data && typeof node.data === "object" && !Array.isArray(node.data)
    ? (node.data as Record<string, unknown>)
    : {};

const isPresent = (value: unknown) =>
  typeof value === "string" ? value.trim().length > 0 : value !== undefined;

const required = (
  node: EditorNode,
  data: Record<string, unknown>,
  field: string,
  message: string,
): WorkflowValidationIssue[] =>
  isPresent(data[field])
    ? []
    : [
        {
          code: "MISSING_REQUIRED_CONFIG",
          severity: "error",
          nodeId: node.id,
          field,
          message,
        },
      ];

const validateJsonField = (
  node: EditorNode,
  data: Record<string, unknown>,
  field: string,
) => {
  const value = data[field];

  if (typeof value !== "string" || value.trim() === "") {
    return [];
  }

  try {
    JSON.parse(value);
    return [];
  } catch {
    // If the value contains handlebars, it might be valid after interpolation
    if (value.includes("{{") && value.includes("}}")) {
      return [];
    }

    return [
      {
        code: "INVALID_JSON",
        severity: "error",
        nodeId: node.id,
        field,
        message: `${field} must contain valid JSON.`,
      } satisfies WorkflowValidationIssue,
    ];
  }
};

const validateCredential = (
  node: EditorNode,
  data: Record<string, unknown>,
  field: string,
  type: CredentialType,
  context: NodeConfigValidationContext,
) => {
  const value = data[field];

  if (!isPresent(value)) {
    return [
      {
        code: "MISSING_REQUIRED_CONFIG",
        severity: "error",
        nodeId: node.id,
        field,
        message:
          type === CredentialType.COMPOSIO
            ? "Select a connected integration or Composio credential."
            : `${field} is required.`,
      } satisfies WorkflowValidationIssue,
    ];
  }

  if (typeof value !== "string") return [];

  const isValid =
    type === CredentialType.COMPOSIO
      ? context.validIntegrationIds?.has(value)
      : context.validCredentialIds?.has(value);

  const checkSet =
    type === CredentialType.COMPOSIO
      ? context.validIntegrationIds
      : context.validCredentialIds;

  if (checkSet && !isValid) {
    return [
      {
        code: "MISSING_REQUIRED_CONFIG",
        severity: "error",
        nodeId: node.id,
        field,
        message:
          type === CredentialType.COMPOSIO
            ? "Selected Composio integration is not connected."
            : "Selected credential is missing or unavailable.",
      } satisfies WorkflowValidationIssue,
    ];
  }

  return [];
};




const validateCondition: LegacyConfigValidator = (node) => {
  const data = asData(node);
  const trueRoute =
    typeof data.trueRoute === "string" ? data.trueRoute : "true";
  const falseRoute =
    typeof data.falseRoute === "string" ? data.falseRoute : "false";
  const issues = [
    ...required(node, data, "expression", "Condition expression is required."),
  ];

  if (trueRoute.trim() === falseRoute.trim()) {
    issues.push({
      code: "INVALID_BRANCH_CONFIGURATION",
      severity: "error",
      nodeId: node.id,
      field: "falseRoute",
      message: "Condition true and false route handles must be different.",
    });
  }

  return issues;
};

const validateRouter: LegacyConfigValidator = (node) => {
  const data = asData(node);
  const routes = Array.isArray(data.routes)
    ? data.routes.filter((route): route is string => typeof route === "string")
    : [];
  const issues = [
    ...required(
      node,
      data,
      "routeExpression",
      "Router route expression is required.",
    ),
  ];

  if (routes.length === 0) {
    issues.push({
      code: "INVALID_BRANCH_CONFIGURATION",
      severity: "error",
      nodeId: node.id,
      field: "routes",
      message: "Router requires at least one route.",
    });
  }

  if (new Set(routes).size !== routes.length) {
    issues.push({
      code: "INVALID_BRANCH_CONFIGURATION",
      severity: "error",
      nodeId: node.id,
      field: "routes",
      message: "Router route names must be unique.",
    });
  }

  if (
    typeof data.fallbackRoute === "string" &&
    data.fallbackRoute &&
    !routes.includes(data.fallbackRoute)
  ) {
    issues.push({
      code: "INVALID_BRANCH_CONFIGURATION",
      severity: "error",
      nodeId: node.id,
      field: "fallbackRoute",
      message: "Router fallback route must match an available route.",
    });
  }

  return issues;
};

const legacyValidators: Partial<Record<NodeType, LegacyConfigValidator>> = {
  [NodeType.CONDITION]: validateCondition,
  [NodeType.ROUTER]: validateRouter,
};

export const validateNodeConfig = (
  node: EditorNode,
  context: NodeConfigValidationContext = {},
): WorkflowValidationIssue[] => {
  if (!node.type || !(node.type in NodeType)) {
    return [
      {
        code: "MISSING_REQUIRED_CONFIG",
        severity: "error",
        nodeId: node.id,
        message: "Node type is not registered.",
      },
    ];
  }

  const type = node.type as NodeType;
  const definition = getNodeDefinition(type);
  const data = asData(node);

  if (definition) {
    const parsed = definition.configSchema.safeParse(data);
    const schemaIssues: WorkflowValidationIssue[] = parsed.success
      ? []
      : parsed.error.issues.map((issue) => ({
          code: "MISSING_REQUIRED_CONFIG",
          severity: "error",
          nodeId: node.id,
          field: issue.path.join(".") || undefined,
          message: issue.message,
        }));

    const credentialIssues = definition.credentials.flatMap((credential) =>
      credential.required
        ? validateCredential(
            node,
            data,
            credential.key,
            credential.type,
            context,
          )
        : [],
    );
    const jsonFieldIssues = definition.fields.flatMap((field) =>
      field.type === "json" || field.name.endsWith("Json")
        ? validateJsonField(node, data, field.name)
        : [],
    );

    return [...schemaIssues, ...credentialIssues, ...jsonFieldIssues];
  }

  return legacyValidators[type]?.(node, context) ?? [];
};
