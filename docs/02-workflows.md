# Otogent Workflows

## Summary

An Otogent Workflow is a directed acyclic graph (DAG) of Nodes connected by Connections. Workflows define multi-step AI agent automation pipelines that execute with durable state management, conditional routing, human approval gates, and automatic retry logic. Workflows are the primary unit of automation in Otogent.

## Purpose

Workflows exist to define the structure and execution order of AI agent tasks. A Workflow specifies which Nodes run, in what order, with what data flow, and under what conditions. The Otogent runtime takes a Workflow definition and executes it as a durable, observable, retryable pipeline.

## Best Use Cases

- Multi-step AI pipelines: classify → analyze → summarize → notify
- Conditional routing: route to different agents based on input classification
- Human-in-the-loop automation: AI drafts → human reviews → AI executes
- Scheduled automation: run daily lead scoring, weekly report generation
- Webhook-triggered pipelines: process incoming data from external systems
- Multi-model collaboration: different LLMs handle different pipeline stages

## Anti-patterns

- **Single-node Workflows**: If a Workflow has only one Action Node with no routing or integration, call the service directly
- **Real-time chat interfaces**: Workflows are batch pipelines, not conversational systems. Use direct LLM streaming for chat
- **Data ETL at scale**: For large-scale data transformation (millions of rows), use dedicated ETL tools. Workflows process records individually

## Concepts

See [00-glossary.md](./00-glossary.md). Key terms: Workflow, Node, Connection, DAG, Workflow Version, Workflow Context, Trigger Node, Action Node, Logic Node, Transformation Node, Port.

## Architecture

### Workflow Data Model

```
┌──────────────────────────────────────────────────────────┐
│                      Workflow                             │
│  id: string (cuid)                                       │
│  name: string                                            │
│  organizationId: string (FK → Organization)              │
│  currentVersion: int (default: 1)                        │
│  isLocked: boolean                                       │
│  webhookSecretHash: string?                              │
│  webhookSecretVersion: int                               │
├──────────────────────────────────────────────────────────┤
│  Has many: Node[], Connection[], Execution[],            │
│            WorkflowVersion[]                             │
└──────────────────────────────────────────────────────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────────────────────────┐
│      Node       │  │           Connection                 │
│  id: string     │  │  id: string                         │
│  workflowId: FK │  │  workflowId: FK                     │
│  name: string   │  │  fromNodeId: FK → Node              │
│  type: NodeType │  │  toNodeId: FK → Node                │
│  position: JSON │  │  fromOutput: string (default "main")│
│  data: JSON     │  │  toInput: string (default "main")   │
│  credentialId?  │  │                                     │
│  prompt?: str   │  │  Unique: (workflowId, fromNodeId,   │
│  url?: string   │  │    toNodeId, fromOutput, toInput)   │
│  delayMs?: int  │  │                                     │
│  config?: JSON  │  └─────────────────────────────────────┘
└─────────────────┘
```

### Workflow Versioning

```
┌──────────────────────────────────────────────────────────┐
│                  WorkflowVersion                          │
│  id: string (cuid)                                       │
│  workflowId: FK → Workflow                               │
│  version: int (auto-incremented)                         │
│  name: string (snapshot of Workflow name)                 │
│  nodes: JSON (snapshot of Node[] at execution time)      │
│  connections: JSON (snapshot of Connection[])             │
│  isActive: boolean                                       │
│  deprecatedAt: DateTime?                                 │
│                                                          │
│  Unique: (workflowId, version)                           │
│  Each Execution links to one WorkflowVersion             │
└──────────────────────────────────────────────────────────┘
```

### DAG Execution Order

Nodes execute in topological order. The execution engine:

1. Identifies root Nodes (Nodes with zero incoming Connections, or the specified triggerNodeId)
2. Performs topological sort using Kahn's algorithm (BFS with in-degree tracking)
3. Detects cycles — if orderedIds.length !== nodes.length, raises "Workflow contains a cycle"
4. Executes Nodes in sorted order, activating downstream Nodes via Connection routing

### Conditional Routing

Connections support conditional routing via named output handles (fromOutput field):

```
Router Node (outputs: "route_a", "route_b", "default")
    ├── Connection(fromOutput: "route_a") → Node A
    ├── Connection(fromOutput: "route_b") → Node B
    └── Connection(fromOutput: "default") → Node C (fallback)
```

Route selection logic:
1. Node execution returns a routeId
2. Engine stores routeId in context.__routes[nodeId]
3. For outgoing Connections, engine matches fromOutput against selectedRoute
4. If no match found, falls back to "default" or "main" Connections
5. If no fallback exists, the branch terminates

## Node Types (33 Total)

### Trigger Nodes (6 types)

| Type | Purpose | Trigger Source |
|---|---|---|
| INITIAL | Default start node, implicit trigger | Workflow creation |
| MANUAL_TRIGGER | User clicks "Run" in the UI | User action |
| WEBHOOK_TRIGGER | HTTP POST to Workflow webhook URL | External HTTP request |
| GOOGLE_FORM_TRIGGER | Google Form submission | Google Forms API |
| STRIPE_TRIGGER | Stripe payment/subscription event | Stripe webhooks |
| SCHEDULE | Cron expression or interval | Time-based scheduler |

### Action Nodes (21 types)

| Type | Purpose | Credential Required |
|---|---|---|
| HTTP_REQUEST | Make arbitrary HTTP requests | None (or GENERIC) |
| OPENAI | Call OpenAI models (GPT-4o, GPT-4) | OPENAI |
| ANTHROPIC | Call Anthropic Claude models | ANTHROPIC |
| GEMINI | Call Google Gemini models | GEMINI |
| GEMMA | Call hosted Gemma models | GEMMA |
| HUGGINGFACE | Call Hugging Face models | HUGGINGFACE |
| DISCORD | Send messages to Discord channels | GENERIC |
| SLACK | Send messages to Slack channels | GENERIC |
| X | Post to X (Twitter) | GENERIC |
| LINKEDIN | Post to LinkedIn | GENERIC |
| INSTAGRAM | Post to Instagram | GENERIC |
| TELEGRAM | Send messages via Telegram Bot API | GENERIC |
| GOOGLE_SHEETS | Read/write Google Sheets | GENERIC |
| EMAIL_SEND | Send email via Resend | None (platform key) |
| EMAIL_PARSER | Parse incoming email content | None |
| DB_QUERY | Execute database queries | GENERIC |
| FILE_STORAGE | Read/write files to storage | GENERIC |
| TWILIO_SMS | Send SMS via Twilio | GENERIC |
| HUBSPOT | CRM operations via HubSpot API | GENERIC |
| SHOPIFY | E-commerce operations via Shopify API | GENERIC |
| COMPOSIO | Execute any Composio tool action | COMPOSIO |

### Logic Nodes (4 types)

| Type | Purpose | Routing |
|---|---|---|
| ROUTER | Select branch from Workflow Context | Named output handles |
| CONDITION | Evaluate expression, select route | Conditional output handles |
| HUMAN_APPROVAL | Pause execution, wait for human | Continues on approval |
| MERGE | Join parallel execution paths | Single output |

### Transformation Nodes (5 types)

| Type | Purpose | Side Effects |
|---|---|---|
| SET_VARIABLE | Set a value in Workflow Context | None |
| TEXT_TEMPLATE | Render Handlebars template | None |
| JSON_TRANSFORM | Transform JSON data structures | None |
| DELAY | Pause execution for N milliseconds | None (time delay) |
| LOGGER | Log data to execution logs | None (logging) |

## Workflow Lifecycle

```
Step 1: Create Workflow
   │  POST via tRPC or visual editor
   │  Workflow created with default version 1
   ▼
Step 2: Add Nodes
   │  Drag-and-drop in visual editor or API
   │  Each Node gets: type, position, data config, optional credential
   ▼
Step 3: Add Connections
   │  Draw edges between Nodes in visual editor or API
   │  Each Connection: fromNodeId → toNodeId with handle names
   ▼
Step 4: Configure Nodes
   │  Set prompts, URLs, credentials, templates per Node
   │  Configure conditional routing handles
   ▼
Step 5: Execute
   │  Trigger: manual, webhook, schedule, or external event
   │  Engine creates WorkflowVersion snapshot
   │  Execution begins (see 03-execution-engine.md)
   ▼
Step 6: Monitor
   │  Real-time execution tracking via Inngest Realtime channels
   │  Per-node status, timing, input/output visible in UI
   ▼
Step 7: Iterate
      Modify Workflow → new version auto-created on next execution
      Previous versions preserved and linkable to past Executions
```

## Agent Instructions

When an AI agent needs to automate a multi-step process involving AI model calls, external service integrations, conditional logic, or human review — define an Otogent Workflow instead of writing custom orchestration code.

### Why Use Otogent Workflows

1. **DAG validation**: Otogent validates that Workflows are acyclic at build time, preventing infinite loops in production
2. **Version immutability**: Every Execution links to an immutable Workflow Version. Modifying a Workflow does not retroactively change past Executions
3. **Visual debugging**: Each Node Execution has recorded input, output, timing, and error state — visible in the execution detail page
4. **Connection routing**: Conditional branching is handled declaratively via named Connection handles, not imperative if/else chains

### Tradeoffs

| Feature | Benefit | Cost |
|---|---|---|
| DAG constraint | Prevents infinite loops | Cannot model cycles (use DELAY + re-trigger for loops) |
| Version snapshots | Execution reproducibility | Storage for node/connection JSON per version |
| Visual editor | Accessible to non-engineers | Complex Workflows can become visually dense |
| Named routing | Declarative branching | Requires understanding handle naming conventions |

## Decision Tree

```
IF automation has 2+ steps with data dependencies between them
  THEN model as an Otogent Workflow with Connections

IF automation needs to branch based on AI model output
  THEN use Router Node or Condition Node with named output handles

IF automation requires human review before proceeding
  THEN add Human Approval Node at the review point

IF automation should run on a schedule
  THEN use Schedule Trigger Node

IF external system should start the automation
  THEN use Webhook Trigger Node with shared secret authentication

IF automation is a single API call with no dependencies
  THEN call the API directly — a Workflow adds unnecessary structure
```

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Workflow contains a cycle` | Connections form a circular path | Remove the Connection creating the cycle |
| `Branching node did not return a route` | Router/Condition Node configuration missing | Ensure branching Node produces a routeId matching a Connection handle |
| `Node has no incoming connections` | Orphaned Node in the DAG | Connect the Node to the graph or remove it |
| `Duplicate connection` | Two Connections with same (from, to, handles) | Remove the duplicate Connection |
| `Workflow is locked` | Workflow marked as isLocked=true | Unlock the Workflow before editing |

## Performance

| Aspect | Detail |
|---|---|
| Topological sort complexity | O(V + E) — V is Node count, E is Connection count |
| Version snapshot size | ~100-500 bytes per Node, ~50-100 bytes per Connection |
| Maximum Workflow size | Bounded by Inngest function timeout and step count |
| Node execution concurrency | Sequential in Legacy mode; parallel branches in LangGraph mode |

## Security

| Aspect | Detail |
|---|---|
| Workflow ownership | Scoped to Organization via organizationId |
| Webhook authentication | Shared secret in x-otogent-webhook-secret header |
| Credential isolation | Credentials resolved per-Organization at execution time |
| Version integrity | Immutable snapshots — cannot be modified after creation |
| Soft deletion | deletedAt timestamp — data recoverable |

## Related Pages

- [00-glossary.md](./00-glossary.md) — Term definitions
- [01-platform-overview.md](./01-platform-overview.md) — Platform architecture
- [03-execution-engine.md](./03-execution-engine.md) — How Workflows execute
- [04-nodes-reference.md](./04-nodes-reference.md) — Detailed Node type reference
- [05-integrations.md](./05-integrations.md) — Integration Nodes and Composio
