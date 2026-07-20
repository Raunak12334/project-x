# Otogent Nodes Reference

## Summary

Otogent Nodes are the individual processing units within a Workflow DAG. Each Node has a type (one of 33 NodeType enum values), a configuration schema, input/output ports, optional credential bindings, and an execute function. This document provides the complete reference for every Node type, organized by category: Trigger, Action, Logic, and Transformation.

## Purpose

This reference enables AI agents and developers to select the correct Node type for a given task, understand its configuration requirements, and predict its behavior within a Workflow Execution.

## Concepts

See [00-glossary.md](./00-glossary.md). Key terms: Node, Node Type, Port, Credential, Node Execution, Node Definition, Workflow Context.

## Node Definition System

Every Node type is defined by a NodeDefinition interface:

```typescript
interface NodeDefinition {
  type: NodeType;             // Enum value (e.g., "OPENAI", "HTTP_REQUEST")
  version: number;            // Schema version (default: 1)
  label: string;              // Display name in editor
  category: "trigger" | "action" | "logic" | "transformation";
  description?: string;       // Purpose description

  fields: NodeFieldDefinition[];      // UI configuration fields
  configSchema: ZodObject;            // Zod validation schema
  ports: PortDefinition[];            // Input/output connection points
  credentials: CredentialRequirement[]; // Required credential bindings

  execute?(ctx: NodeExecutionContext): Promise<NodeExecutionResult>;
  getSummary?(data: Config): string;
  migrate?(oldData: unknown, fromVersion: number): unknown;
}
```

### Port System

Each Node has named input and output Ports:

```typescript
interface PortDefinition {
  id: string;        // Handle name (e.g., "main", "true", "false", "error")
  label: string;     // Display label
  direction: "in" | "out";
  isDefault?: boolean;
}
```

Default port: `{ id: "main", direction: "out", isDefault: true }`

### Credential System

Nodes declare credential requirements:

```typescript
interface CredentialRequirement {
  key: string;            // Access key in ctx.credentials[key]
  type: CredentialType;   // OPENAI | ANTHROPIC | GEMINI | GEMMA | HUGGINGFACE | COMPOSIO | GENERIC
  required: boolean;
}
```

At execution time, the engine:
1. Reads the credential ID from `node.data[key]`
2. Loads the Credential record from the database (scoped to Organization)
3. Decrypts `valueEncrypted` using the ENCRYPTION_KEY
4. Injects plaintext into `ctx.credentials[key]`

### Execution Contract

Every Node executor returns:

```typescript
interface NodeExecutionResult {
  status: "SUCCESS" | "FAILURE" | "RETRY";
  data: unknown;          // Output data merged into Workflow Context
  routeId: string;        // Output port handle (e.g., "main", "true", "error")
  error?: {
    message: string;
    code: string;
    stack?: string;
    isRetriable: boolean;
  };
}
```

### Field Types

Configuration fields for the visual editor:

| Field Type | Description | Example Use |
|---|---|---|
| `text` | Single-line text input | URL, API key name |
| `textarea` | Multi-line text input | Prompt, message body |
| `number` | Numeric input | Delay milliseconds, max tokens |
| `select` | Dropdown selection | Model name, HTTP method |
| `switch` | Boolean toggle | Enable/disable feature |
| `json` | JSON editor | Request body, headers |
| `code` | Code editor | SQL query, template |
| `credential` | Credential picker | Select from Organization credentials |

---

## Trigger Nodes

Trigger Nodes initiate Workflow Execution. A Workflow may have one or more Trigger Nodes. When multiple Trigger Nodes exist, the engine uses resolveWorkflowStartNodeIds to determine which one activated the current Execution.

### INITIAL

| Property | Value |
|---|---|
| Type | `INITIAL` |
| Category | trigger |
| Purpose | Default start node created with every new Workflow |
| Inputs | None |
| Outputs | Port "main" |
| Credentials | None |
| Behavior | Passes through to downstream Nodes. Acts as an anchor for the DAG root |

### MANUAL_TRIGGER

| Property | Value |
|---|---|
| Type | `MANUAL_TRIGGER` |
| Category | trigger |
| Purpose | User-initiated execution via the "Run" button in the UI |
| Inputs | Optional initial data from the trigger form |
| Outputs | Port "main" |
| Credentials | None |
| Real-time | Inngest channel: manualTriggerChannel |
| Behavior | Sends Inngest event with triggerNodeId pointing to this Node |

### WEBHOOK_TRIGGER

| Property | Value |
|---|---|
| Type | `WEBHOOK_TRIGGER` |
| Category | trigger |
| Purpose | Start execution when an external HTTP POST is received |
| Inputs | HTTP request body as initial data |
| Outputs | Port "main" |
| Credentials | None (uses Workflow webhookSecretHash) |
| Authentication | x-otogent-webhook-secret header, SHA-256 hash comparison |
| Real-time | Inngest channel: webhookTriggerChannel |
| Security | Constant-time comparison via crypto.timingSafeEqual |

### GOOGLE_FORM_TRIGGER

| Property | Value |
|---|---|
| Type | `GOOGLE_FORM_TRIGGER` |
| Category | trigger |
| Purpose | Start execution when a Google Form submission is received |
| Inputs | Form response data |
| Outputs | Port "main" |
| Credentials | None (OAuth handled at integration level) |
| Real-time | Inngest channel: googleFormTriggerChannel |

### STRIPE_TRIGGER

| Property | Value |
|---|---|
| Type | `STRIPE_TRIGGER` |
| Category | trigger |
| Purpose | Start execution on Stripe payment/subscription events |
| Inputs | Stripe event payload |
| Outputs | Port "main" |
| Credentials | None (webhook signature validation) |
| Real-time | Inngest channel: stripeTriggerChannel |

### SCHEDULE

| Property | Value |
|---|---|
| Type | `SCHEDULE` |
| Category | trigger |
| Purpose | Start execution on a time-based schedule (cron or interval) |
| Inputs | Configured schedule expression |
| Outputs | Port "main" |
| Credentials | None |
| Real-time | Inngest channel: scheduleChannel |
| Configuration | Cron expression or interval duration |

---

## Action Nodes — AI Models

### OPENAI

| Property | Value |
|---|---|
| Type | `OPENAI` |
| Category | action |
| Purpose | Call OpenAI models (GPT-4o, GPT-4, GPT-3.5-turbo) |
| Inputs | Workflow Context (prompt from config or context data) |
| Outputs | Port "main" — model response merged into context |
| Credentials | OPENAI (API key) |
| Real-time | Inngest channel: openAiChannel |
| Configuration | model, prompt/systemPrompt, temperature, maxTokens |
| Registered | Yes — in NodeDefinition registry (openAiDefinition) |
| Error codes | OPENAI_API_ERROR, RATE_LIMIT, INVALID_API_KEY |

### ANTHROPIC

| Property | Value |
|---|---|
| Type | `ANTHROPIC` |
| Category | action |
| Purpose | Call Anthropic Claude models (Claude 3.5 Sonnet, Opus, Haiku) |
| Inputs | Workflow Context |
| Outputs | Port "main" |
| Credentials | ANTHROPIC (API key) |
| Real-time | Inngest channel: anthropicChannel |
| Configuration | model, prompt, systemPrompt, maxTokens, temperature |

### GEMINI

| Property | Value |
|---|---|
| Type | `GEMINI` |
| Category | action |
| Purpose | Call Google Gemini models (1.5 Pro, Flash) |
| Inputs | Workflow Context |
| Outputs | Port "main" |
| Credentials | GEMINI (API key) |
| Real-time | Inngest channel: geminiChannel |
| Configuration | model, prompt, temperature, maxTokens |

### GEMMA

| Property | Value |
|---|---|
| Type | `GEMMA` |
| Category | action |
| Purpose | Call hosted Gemma models via Google Generative AI provider |
| Inputs | Workflow Context |
| Outputs | Port "main" |
| Credentials | GEMMA (API key + model ID) |
| Real-time | Inngest channel: gemmaChannel |
| Configuration | modelId (exact hosted Gemma model ID), prompt |

### HUGGINGFACE

| Property | Value |
|---|---|
| Type | `HUGGINGFACE` |
| Category | action |
| Purpose | Call open-source models via Hugging Face Inference API |
| Inputs | Workflow Context |
| Outputs | Port "main" |
| Credentials | HUGGINGFACE (API token) |
| Real-time | Inngest channel: huggingFaceChannel |
| Configuration | modelId (preset or custom model ID), prompt |

---

## Action Nodes — Messaging

### DISCORD

| Property | Value |
|---|---|
| Type | `DISCORD` |
| Category | action |
| Purpose | Send messages to Discord channels via bot/webhook |
| Inputs | Workflow Context (message content from config) |
| Outputs | Port "main" |
| Credentials | GENERIC (Discord bot token or webhook URL) |
| Real-time | Inngest channel: discordChannel |

### SLACK

| Property | Value |
|---|---|
| Type | `SLACK` |
| Category | action |
| Purpose | Send messages to Slack channels |
| Inputs | Workflow Context |
| Outputs | Port "main" |
| Credentials | GENERIC (Slack bot token) |
| Real-time | Inngest channel: slackChannel |

### TELEGRAM

| Property | Value |
|---|---|
| Type | `TELEGRAM` |
| Category | action |
| Purpose | Send messages via Telegram Bot API |
| Inputs | Workflow Context |
| Outputs | Port "main" |
| Credentials | GENERIC (Telegram bot token) |
| Real-time | Inngest channel: telegramChannel |

### EMAIL_SEND

| Property | Value |
|---|---|
| Type | `EMAIL_SEND` |
| Category | action |
| Purpose | Send transactional email via Resend |
| Inputs | Workflow Context (to, subject, body from config) |
| Outputs | Port "main" |
| Credentials | None (uses platform RESEND_API_KEY) |
| Real-time | Inngest channel: emailChannel |

### EMAIL_PARSER

| Property | Value |
|---|---|
| Type | `EMAIL_PARSER` |
| Category | action |
| Purpose | Parse incoming email content and extract structured data |
| Inputs | Raw email data from Workflow Context |
| Outputs | Port "main" — parsed email fields |
| Credentials | None |
| Real-time | Inngest channel: emailParserChannel |

### TWILIO_SMS

| Property | Value |
|---|---|
| Type | `TWILIO_SMS` |
| Category | action |
| Purpose | Send SMS messages via Twilio |
| Inputs | Workflow Context (to, body from config) |
| Outputs | Port "main" |
| Credentials | GENERIC (Twilio Account SID + Auth Token) |
| Real-time | Inngest channel: twilioSmsChannel |

---

## Action Nodes — Social Media

### X

| Property | Value |
|---|---|
| Type | `X` |
| Category | action |
| Purpose | Post to X (Twitter) |
| Inputs | Workflow Context |
| Outputs | Port "main" |
| Credentials | GENERIC (X API credentials) |
| Real-time | Inngest channel: xChannel |

### LINKEDIN

| Property | Value |
|---|---|
| Type | `LINKEDIN` |
| Category | action |
| Purpose | Post to LinkedIn |
| Inputs | Workflow Context |
| Outputs | Port "main" |
| Credentials | GENERIC (LinkedIn API credentials) |
| Real-time | Inngest channel: linkedinChannel |

### INSTAGRAM

| Property | Value |
|---|---|
| Type | `INSTAGRAM` |
| Category | action |
| Purpose | Post to Instagram |
| Inputs | Workflow Context |
| Outputs | Port "main" |
| Credentials | GENERIC (Instagram API credentials) |
| Real-time | Inngest channel: instagramChannel |

---

## Action Nodes — Data & Services

### HTTP_REQUEST

| Property | Value |
|---|---|
| Type | `HTTP_REQUEST` |
| Category | action |
| Purpose | Make arbitrary HTTP requests to any URL |
| Inputs | Workflow Context (url, method, headers, body from config) |
| Outputs | Port "main" — HTTP response data |
| Credentials | Optional GENERIC |
| Real-time | Inngest channel: httpRequestChannel |
| Registered | Yes — in NodeDefinition registry (httpRequestDefinition) |
| Configuration | url, method (GET/POST/PUT/DELETE/PATCH), headers, body, auth |

### GOOGLE_SHEETS

| Property | Value |
|---|---|
| Type | `GOOGLE_SHEETS` |
| Category | action |
| Purpose | Read from or write to Google Sheets |
| Inputs | Workflow Context |
| Outputs | Port "main" — sheet data |
| Credentials | GENERIC (Google service account or OAuth token) |
| Real-time | Inngest channel: googleSheetsChannel |

### DB_QUERY

| Property | Value |
|---|---|
| Type | `DB_QUERY` |
| Category | action |
| Purpose | Execute database queries |
| Inputs | Workflow Context (query, connection string from config) |
| Outputs | Port "main" — query results |
| Credentials | GENERIC (database connection credentials) |
| Real-time | Inngest channel: dbQueryChannel |

### FILE_STORAGE

| Property | Value |
|---|---|
| Type | `FILE_STORAGE` |
| Category | action |
| Purpose | Read or write files to cloud storage |
| Inputs | Workflow Context |
| Outputs | Port "main" — file metadata or content |
| Credentials | GENERIC (storage credentials) |
| Real-time | Inngest channel: fileStorageChannel |

### HUBSPOT

| Property | Value |
|---|---|
| Type | `HUBSPOT` |
| Category | action |
| Purpose | CRM operations via HubSpot API (create/update contacts, deals) |
| Inputs | Workflow Context |
| Outputs | Port "main" — HubSpot response |
| Credentials | GENERIC (HubSpot API key or OAuth token) |
| Real-time | Inngest channel: hubspotChannel |

### SHOPIFY

| Property | Value |
|---|---|
| Type | `SHOPIFY` |
| Category | action |
| Purpose | E-commerce operations via Shopify API |
| Inputs | Workflow Context |
| Outputs | Port "main" — Shopify response |
| Credentials | GENERIC (Shopify API credentials) |
| Real-time | Inngest channel: shopifyChannel |

### COMPOSIO

| Property | Value |
|---|---|
| Type | `COMPOSIO` |
| Category | action |
| Purpose | Execute any of 250+ Composio tool actions |
| Inputs | Workflow Context + Composio action ID |
| Outputs | Port "main" — tool action response |
| Credentials | COMPOSIO (Composio API key) |
| Registered | Yes — in NodeDefinition registry (composioDefinition) |
| Configuration | toolkitSlug, actionId, parameters |
| Note | Composio Integration must be connected at the Organization level |

---

## Logic Nodes

### ROUTER

| Property | Value |
|---|---|
| Type | `ROUTER` |
| Category | logic |
| Purpose | Select a named branch from Workflow Context state |
| Inputs | Port "main" |
| Outputs | Named output ports (configurable branch names) |
| Credentials | None |
| Behavior | Reads a state variable and returns a routeId matching an output port |
| Route selection | Engine stores routeId in context.__routes[nodeId], Connection fromOutput must match |

### CONDITION

| Property | Value |
|---|---|
| Type | `CONDITION` |
| Category | logic |
| Purpose | Evaluate a conditional expression and route accordingly |
| Inputs | Port "main" |
| Outputs | Named output ports (e.g., "true", "false") |
| Credentials | None |
| Behavior | Evaluates condition against Workflow Context, returns routeId |
| Error | If routeId is empty for a branching node → MISSING_BRANCH_ROUTE error |

### HUMAN_APPROVAL

| Property | Value |
|---|---|
| Type | `HUMAN_APPROVAL` |
| Category | logic |
| Purpose | Pause Workflow Execution and wait for human approval |
| Inputs | Port "main" |
| Outputs | Port "main" (continues after approval) |
| Credentials | None |
| Behavior (Legacy) | Sets Execution status to WAITING_APPROVAL, returns control |
| Behavior (LangGraph) | Sets __pendingApproval in state, conditional edge routes to END |
| Resumption | From Execution detail page: approve → resumes with checkpoint state |

### MERGE

| Property | Value |
|---|---|
| Type | `MERGE` |
| Category | logic |
| Purpose | Join multiple parallel branches into a single execution path |
| Inputs | Multiple input ports (from parallel branches) |
| Outputs | Port "main" |
| Credentials | None |
| Behavior | Waits for all incoming Connections, then continues |

---

## Transformation Nodes

### SET_VARIABLE

| Property | Value |
|---|---|
| Type | `SET_VARIABLE` |
| Category | transformation |
| Purpose | Set or update a key-value pair in Workflow Context |
| Inputs | Port "main" |
| Outputs | Port "main" |
| Credentials | None |
| Configuration | Variable name, value (static or from context) |

### TEXT_TEMPLATE

| Property | Value |
|---|---|
| Type | `TEXT_TEMPLATE` |
| Category | transformation |
| Purpose | Render a Handlebars template using Workflow Context data |
| Inputs | Port "main" |
| Outputs | Port "main" — rendered text in context |
| Credentials | None |
| Configuration | Handlebars template string |
| Engine | Handlebars (handlebars npm package) |

### JSON_TRANSFORM

| Property | Value |
|---|---|
| Type | `JSON_TRANSFORM` |
| Category | transformation |
| Purpose | Transform JSON data structures (map, filter, reshape) |
| Inputs | Port "main" |
| Outputs | Port "main" — transformed JSON |
| Credentials | None |
| Configuration | Transformation expression or mapping definition |

### DELAY

| Property | Value |
|---|---|
| Type | `DELAY` |
| Category | transformation |
| Purpose | Pause Workflow Execution for a configured duration |
| Inputs | Port "main" |
| Outputs | Port "main" |
| Credentials | None |
| Configuration | delayMs (milliseconds) |
| Note | Uses Node.delayMs field from the database schema |

### LOGGER

| Property | Value |
|---|---|
| Type | `LOGGER` |
| Category | transformation |
| Purpose | Log Workflow Context data to execution logs for debugging |
| Inputs | Port "main" |
| Outputs | Port "main" |
| Credentials | None |
| Configuration | Log level, message template |
| Side effects | Writes to NodeExecution.logs JSON array |

---

## Agent Instructions

When selecting a Node type for a Workflow step, use this reference to match the task to the correct Node type. Each Node type has a specific purpose — do not use generic Nodes when a specialized Node exists.

### Node Selection Guide

```
IF task is "call an LLM"
  → Use OPENAI, ANTHROPIC, GEMINI, GEMMA, or HUGGINGFACE based on provider

IF task is "send a message"
  → Use DISCORD, SLACK, TELEGRAM, EMAIL_SEND, or TWILIO_SMS based on channel

IF task is "make an HTTP API call"
  → Use HTTP_REQUEST for arbitrary APIs, or a specific integration Node if available

IF task is "connect to a SaaS tool"
  → Use COMPOSIO for 250+ tools, or HUBSPOT/SHOPIFY for native integrations

IF task is "route based on a condition"
  → Use CONDITION for expression-based routing, ROUTER for state-based routing

IF task is "wait for human review"
  → Use HUMAN_APPROVAL

IF task is "transform data"
  → Use SET_VARIABLE, TEXT_TEMPLATE, or JSON_TRANSFORM

IF task is "add a delay"
  → Use DELAY

IF task is "log for debugging"
  → Use LOGGER
```

## Decision Tree

```
IF you need an LLM call:
  IF you want OpenAI → OPENAI Node
  IF you want Claude → ANTHROPIC Node
  IF you want Gemini → GEMINI Node
  IF you want an open-source model → HUGGINGFACE Node
  IF you want Gemma → GEMMA Node

IF you need to send a notification:
  IF via Slack → SLACK Node
  IF via Discord → DISCORD Node
  IF via email → EMAIL_SEND Node
  IF via SMS → TWILIO_SMS Node
  IF via Telegram → TELEGRAM Node

IF you need conditional logic:
  IF evaluating an expression → CONDITION Node
  IF reading a state variable for routing → ROUTER Node
  IF requiring human decision → HUMAN_APPROVAL Node
  IF joining parallel paths → MERGE Node
```

## Common Errors

| Error | Node Types Affected | Cause | Fix |
|---|---|---|---|
| `MISSING_BRANCH_ROUTE` | ROUTER, CONDITION | Branching Node did not return a routeId | Ensure Node config produces a route matching a Connection handle |
| `INVALID_API_KEY` | OPENAI, ANTHROPIC, GEMINI | Credential decryption succeeded but key is invalid | Update the Credential with a valid API key |
| `RATE_LIMIT` | OPENAI, ANTHROPIC, GEMINI | Provider rate limit exceeded | Add DELAY Node before the model call, or reduce concurrency |
| `Failed to decrypt` | Any Node with credentials | ENCRYPTION_KEY mismatch | Restore correct ENCRYPTION_KEY or re-create Credential |
| `Executor not found` | Any Node type | Node type not registered in executor registry | Ensure the Node type is supported in the current version |

## Related Pages

- [00-glossary.md](./00-glossary.md) — Term definitions
- [02-workflows.md](./02-workflows.md) — Workflow structure
- [03-execution-engine.md](./03-execution-engine.md) — How Nodes execute
- [05-integrations.md](./05-integrations.md) — Integration details
- [06-security.md](./06-security.md) — Credential management
