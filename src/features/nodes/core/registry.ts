import type { NodeType } from "@prisma/client";
import type { NodeDefinition } from "./types";

import { openAiDefinition } from "../definitions/openai/definition";
import { httpRequestDefinition } from "../definitions/http-request/definition";

// Registry storage
const registry: Record<string, NodeDefinition<any>> = {};

// Register initial nodes
registerNode(openAiDefinition);
registerNode(httpRequestDefinition);

/**
 * Register a node definition in the central registry
 */
export const registerNode = (definition: NodeDefinition<any>) => {
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
    // If not found in registry, it might be a legacy node or not yet registered
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
