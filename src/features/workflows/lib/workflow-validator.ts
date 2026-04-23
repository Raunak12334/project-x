import { NodeType } from "@prisma/client";
import {
  buildAdjacency,
  type EditorEdge,
  type EditorNode,
  findDisconnectedNodes,
  findReachableNodes,
  getIncomingEdges,
  getOutgoingEdges,
  getTriggerNodes,
} from "./graph-utils";
import { validateNodeConfig } from "./node-config-validator";

export type WorkflowValidationInput = {
  nodes: EditorNode[];
  edges: EditorEdge[];
  workflowId?: string;
  validCredentialIds?: Set<string>;
  validIntegrationIds?: Set<string>;
};

export type WorkflowValidationIssue = {
  code:
    | "NO_TRIGGER"
    | "MULTIPLE_TRIGGERS"
    | "PLACEHOLDER_NODE"
    | "MISSING_REQUIRED_CONFIG"
    | "INVALID_JSON"
    | "MISSING_INTEGRATION"
    | "DISCONNECTED_NODE"
    | "UNREACHABLE_NODE"
    | "INVALID_VARIABLE_REFERENCE"
    | "INVALID_BRANCH_CONFIGURATION";
  severity: "error" | "warning";
  nodeId?: string;
  field?: string;
  message: string;
};

export type WorkflowValidationResult = {
  isValid: boolean;
  issues: WorkflowValidationIssue[];
};

type ValidationRule = (
  input: WorkflowValidationInput,
) => WorkflowValidationIssue[];

const validateTriggers: ValidationRule = ({ nodes }) => {
  const triggerNodes = getTriggerNodes(nodes);

  if (triggerNodes.length === 0) {
    return [
      {
        code: "NO_TRIGGER",
        severity: "error",
        message: "Workflow needs exactly one trigger node.",
      },
    ];
  }

  if (triggerNodes.length > 1) {
    return triggerNodes.map((node) => ({
      code: "MULTIPLE_TRIGGERS",
      severity: "error",
      nodeId: node.id,
      message: "Only one trigger node is supported per workflow.",
    }));
  }

  return [];
};

const validatePlaceholders: ValidationRule = ({ nodes }) =>
  nodes
    .filter((node) => node.type === NodeType.INITIAL)
    .map((node) => ({
      code: "PLACEHOLDER_NODE",
      severity: "error",
      nodeId: node.id,
      message: "Replace the placeholder node with a real trigger.",
    }));

const validateConnectivity: ValidationRule = ({ nodes, edges }) => {
  const trigger = getTriggerNodes(nodes)[0];

  if (!trigger) {
    return [];
  }

  const adjacency = buildAdjacency(nodes, edges);
  const reachable = findReachableNodes(trigger.id, adjacency);
  const unreachable = findDisconnectedNodes(nodes, reachable).filter(
    (node) => node.type !== NodeType.INITIAL,
  );

  const issues: WorkflowValidationIssue[] = unreachable.map((node) => ({
    code: "UNREACHABLE_NODE",
    severity: "error",
    nodeId: node.id,
    message: "Node is not reachable from the workflow trigger.",
  }));

  for (const node of nodes) {
    if (node.id === trigger.id || node.type === NodeType.INITIAL) {
      continue;
    }

    if (getIncomingEdges(node.id, edges).length === 0) {
      issues.push({
        code: "DISCONNECTED_NODE",
        severity: "error",
        nodeId: node.id,
        message: "Node has no incoming connection.",
      });
    }
  }

  return issues;
};

const validateNodeConfigs: ValidationRule = (input) =>
  input.nodes
    .filter((node) => node.type !== NodeType.INITIAL)
    .flatMap((node) =>
      validateNodeConfig(node, {
        validCredentialIds: input.validCredentialIds,
        validIntegrationIds: input.validIntegrationIds,
      }),
    );

const validateBranchNodes: ValidationRule = ({ nodes, edges }) => {
  const issues: WorkflowValidationIssue[] = [];

  for (const node of nodes) {
    if (node.type !== NodeType.CONDITION && node.type !== NodeType.ROUTER) {
      continue;
    }

    const outgoing = getOutgoingEdges(node.id, edges);
    const data =
      node.data && typeof node.data === "object" && !Array.isArray(node.data)
        ? (node.data as Record<string, unknown>)
        : {};
    const requiredRoutes =
      node.type === NodeType.CONDITION
        ? [
            typeof data.trueRoute === "string" ? data.trueRoute : "true",
            typeof data.falseRoute === "string" ? data.falseRoute : "false",
          ]
        : Array.isArray(data.routes)
          ? data.routes.filter(
              (route): route is string => typeof route === "string",
            )
          : [];

    const outgoingHandles = new Set(
      outgoing.map((edge) => edge.sourceHandle || "main"),
    );
    const missingRoutes = requiredRoutes.filter(
      (route) => !outgoingHandles.has(route),
    );

    if (missingRoutes.length > 0) {
      issues.push({
        code: "INVALID_BRANCH_CONFIGURATION",
        severity: "warning",
        nodeId: node.id,
        message: `Branch has no outgoing connection for: ${missingRoutes.join(", ")}.`,
      });
    }
  }

  return issues;
};

const rules: ValidationRule[] = [
  validateTriggers,
  validatePlaceholders,
  validateConnectivity,
  validateNodeConfigs,
  validateBranchNodes,
];

export const validateWorkflow = (
  input: WorkflowValidationInput,
): WorkflowValidationResult => {
  const issues = rules.flatMap((rule) => rule(input));

  return {
    isValid: !issues.some((issue) => issue.severity === "error"),
    issues,
  };
};
