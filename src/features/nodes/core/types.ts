import type { NodeType, CredentialType } from "@prisma/client";
import type { z } from "zod";

// --- EXECUTION CONTRACT ---
export type ExecutionStatus = "SUCCESS" | "FAILURE" | "RETRY";

export interface NodeExecutionError {
  message: string;
  code: string;
  stack?: string;
  isRetriable: boolean;
}

export interface NodeExecutionResult<TOutput = any> {
  status: ExecutionStatus;
  data: TOutput;
  routeId: string; // Must match one of the output port IDs
  error?: NodeExecutionError;
}

export interface NodeExecutionContext<TConfig = any> {
  config: TConfig;
  memory: Record<string, any>; // Persistent data across the whole workflow run
  organizationId: string;
  credentials: Record<string, string>; // Plaintext secrets injected by engine
  step: any; // Inngest StepTools
  publish: any; // Realtime publish function
}

// --- PORTS & ROUTING ---
export interface PortDefinition {
  id: string; // The "handle" name (e.g., 'main', 'true', 'error')
  label: string;
  direction: "in" | "out";
  isDefault?: boolean;
}

// --- CREDENTIALS ---
export interface CredentialRequirement {
  key: string; // How it's accessed in executor (ctx.credentials[key])
  type: CredentialType;
  required: boolean;
}

// --- CONFIG FIELDS ---
export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "select"
  | "switch"
  | "json"
  | "code"
  | "credential";

export interface NodeFieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[]; // For selects
  defaultValue?: any;
  visibleIf?: {
    field: string;
    operator: "eq" | "neq" | "includes" | "exists";
    value?: any;
  };
}

// --- NODE DEFINITION ---
export interface NodeDefinition<TSchema extends z.ZodObject<any> = any> {
  type: NodeType;
  version: number;
  label: string;
  category: "trigger" | "action" | "logic" | "transformation";
  icon?: string;

  // Model
  fields: NodeFieldDefinition[];
  configSchema: TSchema;
  ports: PortDefinition[];
  credentials: CredentialRequirement[];

  // Methods
  execute: (
    ctx: NodeExecutionContext<z.infer<TSchema>>,
  ) => Promise<NodeExecutionResult>;
  getSummary?: (data: z.infer<TSchema>) => string;
  realtimeStatus?: {
    channel: string;
    topic: string;
    refreshToken: () => Promise<any>;
  };
  migrate?: (oldData: any, fromVersion: number) => any;
}
