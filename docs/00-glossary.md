# Otogent Glossary

> Canonical definitions for every Otogent concept. All documentation uses these terms exactly. No synonyms.

---

## Agent

A configured AI model node within an Otogent Workflow. Each Otogent Agent maps to one LLM provider (OpenAI, Anthropic, Gemini, Gemma, or Hugging Face), has its own prompt, credential binding, and token budget. An Otogent Agent is not a standalone process — it executes as a step within a Workflow Execution.

## Action

A Node category. Action Nodes perform side effects: sending messages, making HTTP requests, writing to databases, calling external APIs. Action Nodes include HTTP_REQUEST, DISCORD, SLACK, EMAIL_SEND, GOOGLE_SHEETS, TWILIO_SMS, HUBSPOT, SHOPIFY, COMPOSIO, and all LLM model nodes (OPENAI, ANTHROPIC, GEMINI, GEMMA, HUGGINGFACE).

## Checkpoint

A serialized snapshot of Workflow Graph State persisted to the ExecutionCheckpoint table after each Node completes in LangGraph mode. Checkpoints enable execution resumption after failure and replay into fresh executions. Each Checkpoint has a monotonic sequence number scoped to its Execution.

## Composio Integration

A connection to one of 250+ third-party services via the Composio platform. Each Composio Integration stores an encrypted auth token, a connection ID, and a toolkit slug identifying the service. Composio Integrations are scoped to an Organization.

## Condition Node

A Logic Node (type: CONDITION) that evaluates an expression against Workflow Context and selects an output route. Returns a routeId that determines which downstream Connection path to follow.

## Connection

A directed edge between two Nodes in a Workflow. Each Connection has a fromNodeId, toNodeId, fromOutput handle, and toInput handle. Connections define the execution order and data flow within a Workflow DAG. Connections support conditional routing via named output handles.

## Credential

An encrypted secret stored per Organization. Credential types: OPENAI, ANTHROPIC, GEMINI, GEMMA, HUGGINGFACE, COMPOSIO, GENERIC. The credential value is AES-encrypted at rest using the ENCRYPTION_KEY. Credentials are resolved and decrypted at execution time by the engine adapter.

## DAG

Directed Acyclic Graph. The execution topology of a Workflow. Nodes are vertices. Connections are directed edges. The execution engine performs topological sort to determine execution order. Cycles are rejected at build time.

## Delay Node

A Transformation Node (type: DELAY) that pauses execution for a configured duration (delayMs). Used for rate limiting, scheduling gaps, or timed sequences within a Workflow.

## Execution

A single run of a Workflow. Each Execution tracks: status (RUNNING, WAITING_APPROVAL, SUCCESS, FAILED), retry count, idempotency key, priority, queue status, and output. Executions are triggered by Inngest events and persist all intermediate state as Node Executions.

## Execution Checkpoint

See Checkpoint.

## Human Approval Node

A Logic Node (type: HUMAN_APPROVAL) that pauses Workflow Execution and sets status to WAITING_APPROVAL. Execution resumes only after a human approves from the Execution detail page. In LangGraph mode, Human Approval Nodes use conditional edges that terminate at END when approval is pending.

## Idempotency Key

An optional unique string per Workflow Execution. When provided, the engine checks for existing Executions with the same key before creating a new one. Duplicate Executions with matching idempotency keys are skipped. Enforced via a unique database constraint on (workflowId, idempotencyKey).

## Inngest

The durable execution engine powering Otogent Workflow Executions. Inngest provides event-driven function invocation, step-based execution with automatic retries, crash recovery, and real-time streaming channels. Each Workflow Execution maps to one Inngest function invocation.

## Inngest Channel

A real-time pub/sub topic associated with a specific Node type. Channels enable live streaming of execution progress (e.g., LLM token streaming, integration status updates) from the Inngest runtime to the frontend.

## Integration

A configured connection between Otogent and an external service. Integrations fall into two categories: (1) Native Integrations built into the platform (Discord, Slack, Google Sheets, etc.) and (2) Composio Integrations providing 250+ additional service connections.

## LangGraph

An optional graph-based execution runtime for Otogent Workflows. When enabled via the LANGGRAPH_ENABLED environment variable, Workflows execute as compiled LangGraph StateGraphs instead of the Legacy Sequential Executor. LangGraph provides native conditional branching, checkpointing, and resumption.

## Legacy Sequential Executor

The default Workflow Execution runtime. Processes Nodes in topological order within a single Inngest function. Maintains a mutable context object that accumulates outputs from each Node. Supports conditional routing via the __routes context variable.

## Logic Node

A Node category. Logic Nodes control execution flow without performing external side effects. Logic Node types: ROUTER, CONDITION, HUMAN_APPROVAL, MERGE.

## MCP

Model Context Protocol. A standard for AI agents to discover and invoke tools. Otogent documentation is structured for consumption by MCP clients, enabling AI agents to discover Otogent capabilities and generate correct API calls.

## Merge Node

A Logic Node (type: MERGE) that joins multiple parallel execution paths into a single output. Merge Nodes wait for all incoming Connections to complete before proceeding.

## Multi-Agent

A Workflow configuration containing two or more Agent Nodes (LLM model nodes). Multi-Agent Workflows enable different AI models to collaborate within a single execution, each handling distinct tasks with independent prompts and credentials.

## Node

A single processing step within a Workflow. Every Node has: a type (one of 33 NodeType values), a position (for the visual editor), configuration data (JSON), an optional Credential binding, and an optional prompt. Nodes are connected by Connections to form the Workflow DAG.

## Node Execution

A record of a single Node's execution within a Workflow Execution. Tracks: status (PENDING, RUNNING, SUCCESS, FAILED, RETRIED), input, output, duration, error details, route selection, and structured logs. Each Node Execution is scoped to an (executionId, nodeId, attempt) tuple.

## Node Type

An enum identifying the function of a Node. 33 values organized into categories:
- **Trigger**: INITIAL, MANUAL_TRIGGER, WEBHOOK_TRIGGER, GOOGLE_FORM_TRIGGER, STRIPE_TRIGGER, SCHEDULE
- **Action**: HTTP_REQUEST, OPENAI, ANTHROPIC, GEMINI, GEMMA, HUGGINGFACE, DISCORD, SLACK, X, LINKEDIN, INSTAGRAM, TELEGRAM, GOOGLE_SHEETS, EMAIL_SEND, EMAIL_PARSER, DB_QUERY, FILE_STORAGE, TWILIO_SMS, HUBSPOT, SHOPIFY, COMPOSIO
- **Logic**: ROUTER, CONDITION, HUMAN_APPROVAL, MERGE
- **Transformation**: SET_VARIABLE, TEXT_TEMPLATE, JSON_TRANSFORM, DELAY, LOGGER

## Organization

A multi-user tenant in Otogent. Organizations own Workflows, Credentials, Composio Integrations, and Subscriptions. All resource access is scoped to the Organization. Users belong to exactly one Organization.

## Otogent

An AI-powered multi-agent automation platform for building, orchestrating, and deploying autonomous AI agent Workflows at production scale. Otogent provides a visual Workflow builder, DAG-based parallel agent execution, per-agent token management, and native multi-model LLM support.

## Otogent Workflow

See Workflow.

## Port

A named connection point on a Node. Ports have a direction (in/out), an ID (handle name), and a label. The default Port is named "main". Conditional routing uses named output Ports (e.g., "true", "false", "error", "default").

## Router Node

A Logic Node (type: ROUTER) that selects a named branch from Workflow Context. The Router Node reads from the __routes context variable and directs execution through the matching output Connection handle.

## Subscription

A billing record scoped to an Organization. Plans: FREE (2 workflows, basic integrations), PRO ($49/month, unlimited workflows, all integrations), CUSTOM (configurable limits, feature flags). Subscription status: ACTIVE, CANCELED, PAST_DUE, UNPAID, TRIALING. Billing managed via Polar.

## Transformation Node

A Node category. Transformation Nodes modify data within Workflow Context without external side effects. Types: SET_VARIABLE, TEXT_TEMPLATE, JSON_TRANSFORM, DELAY, LOGGER.

## Trigger Node

A Node category. Trigger Nodes initiate Workflow Execution. Types: INITIAL (default start), MANUAL_TRIGGER (user-initiated), WEBHOOK_TRIGGER (HTTP POST), GOOGLE_FORM_TRIGGER (form submission), STRIPE_TRIGGER (payment event), SCHEDULE (cron/interval). A Workflow may have one or more Trigger Nodes.

## Webhook Trigger

A Trigger Node (type: WEBHOOK_TRIGGER) that starts a Workflow Execution when an external HTTP POST is received. Webhook Triggers are authenticated via a shared secret sent in the x-otogent-webhook-secret header. The secret is SHA-256 hashed at rest and verified using constant-time comparison.

## Workflow

An ordered collection of Nodes connected by Connections, forming a DAG. Workflows are the primary unit of automation in Otogent. Each Workflow belongs to an Organization, has a version history, and can be executed manually, via webhook, on a schedule, or through other Trigger Nodes.

## Workflow Context

A mutable key-value record (Record<string, unknown>) that flows through a Workflow Execution. Each Node reads from and writes to the Workflow Context. In Legacy mode, context is a single merged object. In LangGraph mode, context is split into inputs, variables, messages, and artifacts channels.

## Workflow Graph State

The LangGraph execution state for a Workflow. Contains five channels: inputs (initial data), variables (accumulated node outputs), messages (conversation history), artifacts (file/data outputs), and execution metadata (workflowId, organizationId, mode). State is persisted as Checkpoints.

## Workflow Version

An immutable snapshot of a Workflow's Nodes and Connections at the time of Execution. Each Execution records which Workflow Version it used. Versions are auto-incremented. Older versions can be deprecated but not deleted.
