import type { NodeType } from "@prisma/client";
import { composioDefinition } from "../definitions/composio/definition";
import { httpRequestDefinition } from "../definitions/http-request/definition";
import { openAiDefinition } from "../definitions/openai/definition";
import type { NodeDefinition } from "./types";

// Registry storage
const registry: Record<string, NodeDefinition> = {};

/**
 * Register a node definition in the central registry
 */
export const registerNode = (definition: NodeDefinition) => {
  const key = `${definition.type}_v${definition.version}`;
  registry[key] = definition;
};

/**
 * Retrieve a node definition from the registry
 */
export const getNodeDefinition = (type: NodeType, version = 1) => {
  const key = `${type}_v${version}`;
  const definition = registry[key];

  if (!definition) {
    return null;
  }

  return definition;
};

/**
 * Get all registered node definitions
 */
export const getAllNodeDefinitions = () => Object.values(registry);

/**
 * Check if a node type is supported by the new system
 */
export const isNodeSupported = (type: NodeType, version = 1) => {
  return !!registry[`${type}_v${version}`];
};

// Register initial nodes after function definitions to avoid hoisting issues
registerNode(openAiDefinition);
registerNode(httpRequestDefinition);
registerNode(composioDefinition);
