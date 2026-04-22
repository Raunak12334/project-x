import type { Realtime } from "@inngest/realtime";
import type { CredentialType, NodeType } from "@prisma/client";
import type { z } from "zod";
import type { StepTools } from "@/features/executions/types";

export type WorkflowContext = Record<string, unknown>;
export type StepRunner = StepTools;
export type PublishFn = Realtime.PublishFn;

// --- EXECUTION CONTRACT ---
export type ExecutionStatus = "SUCCESS" | "FAILURE" | "RETRY";

export interface NodeExecutionError {
  message: string;
  code: string;
  stack?: string;
  isRetriable: boolean;
}

export interface NodeExecutionResult<TOutput = unknown> {
  status: ExecutionStatus;
  data: TOutput;
  routeId: string; // Must match one of the output port IDs
  error?: NodeExecutionError;
}

export interface NodeExecutionContext<TConfig = Record<string, unknown>> {
  config: TConfig;
  context: WorkflowContext;
  organizationId: string;
  credentials: Record<string, string>; // Plaintext secrets injected by engine
  step: StepRunner;
  publish: PublishFn;
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

export interface NodeField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  description?: string;
  options?: { label: string; value: string }[]; // For selects
  defaultValue?: unknown;
  required?: boolean;
  visibleIf?: {
    field: string;
    operator: "eq" | "neq" | "includes" | "exists";
    value?: unknown;
  };
}

export type NodeFieldDefinition = NodeField;

// --- NODE DEFINITION ---
export interface NodeDefinition<
  TSchema extends z.ZodObject<z.ZodRawShape> = z.ZodObject<z.ZodRawShape>,
> {
  type: NodeType;
  version: number;
  label: string;
  category: "trigger" | "action" | "logic" | "transformation";
  description?: string;
  icon?: string;

  // Model
  fields: NodeFieldDefinition[];
  configSchema: TSchema;
  ports: PortDefinition[];
  credentials: CredentialRequirement[];

  // Methods
  execute?: (
    ctx: NodeExecutionContext<z.infer<TSchema>>,
  ) => Promise<NodeExecutionResult>;
  getSummary?: (data: z.infer<TSchema>) => string;
  realtimeStatus?: {
    channel: string;
    topic: string;
    refreshToken: () => Promise<Realtime.Subscribe.Token>;
  };
  migrate?: (oldData: unknown, fromVersion: number) => unknown;
}
