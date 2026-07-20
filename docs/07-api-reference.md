# Otogent API Reference

## Summary

Otogent exposes three API surfaces: (1) tRPC routers for frontend-to-server communication, (2) Next.js API routes for webhooks and external integrations, and (3) Inngest event schemas for Workflow Execution triggers. Authentication is session-based via better-auth. All API operations are scoped to the authenticated user's Organization.

## Purpose

This reference documents every API surface that AI agents, developers, or external systems can use to interact with Otogent programmatically: triggering Workflow Executions, managing integrations, and receiving webhook events from external services.

## Best Use Cases

- Triggering Workflow Executions programmatically from external systems
- Receiving webhook events from Stripe, Google Forms, or custom services
- Managing Composio integrations via the tRPC API
- Querying Workflow and Execution state for monitoring dashboards

## Anti-patterns

- **Calling tRPC routes from external services**: tRPC routes are designed for the Next.js frontend. External integrations should use webhook triggers or direct Inngest events
- **Polling for execution status**: Use Inngest Realtime channels for live execution progress instead of polling the Execution record

## Concepts

See [00-glossary.md](./00-glossary.md). Key terms: Workflow, Execution, Node, Credential, Composio Integration, Webhook Trigger, Inngest, Organization.

---

## Authentication

### Session-Based Authentication (tRPC Routes)

All tRPC routes require an authenticated session:

```
Request:
  Cookie: better-auth session cookie

Server validation:
  1. Extract session token from cookie
  2. Hash token with SHA-256
  3. Lookup Session by tokenHash
  4. Verify expiresAt > now
  5. Load User and Organization
  6. All subsequent queries scoped by organizationId
```

### Webhook Authentication (API Routes)

Webhook endpoints use service-specific authentication:

| Endpoint | Auth Method |
|---|---|
| Generic webhook trigger | x-otogent-webhook-secret header |
| Stripe webhook | Stripe-Signature header |
| Google Form webhook | OAuth + state validation |
| Polar webhook | POLAR_WEBHOOK_SECRET |

---

## Inngest Event Schema

### Workflow Execution Event

The primary event for triggering Workflow Executions:

```typescript
Event name: "workflows/execute.workflow"

Payload: {
  data: {
    workflowId: string;           // Required. ID of the Workflow to execute
    executionId?: string;         // Optional. Resume existing Execution
    checkpointId?: string;        // Optional. Resume from specific Checkpoint
    triggerNodeId?: string;       // Optional. Start from specific Trigger Node
    idempotencyKey?: string;      // Optional. Prevent duplicate Executions
    workflowVersionId?: string;   // Optional. Use specific Workflow Version
    initialData?: Record<string, unknown>;  // Optional. Initial Workflow Context
  }
}
```

#### Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| workflowId | string | Yes | CUID of the target Workflow |
| executionId | string | No | CUID of an existing Execution to resume |
| checkpointId | string | No | CUID of a specific Checkpoint to resume from |
| triggerNodeId | string | No | CUID of the Trigger Node that initiated this Execution |
| idempotencyKey | string | No | Unique string to prevent duplicate Executions |
| workflowVersionId | string | No | CUID of a specific Workflow Version to execute |
| initialData | object | No | Key-value data injected into Workflow Context at start |

#### Response

```typescript
// Success
{
  workflowId: string;
  result: Record<string, unknown>;  // Final Workflow Context
}

// Waiting for approval
{
  workflowId: string;
  result: Record<string, unknown>;
  waitingForApproval: true;
}
```

#### Errors

| Error | Condition | Retriable |
|---|---|---|
| `NonRetriableError("Event ID or workflow ID is missing")` | Missing workflowId or event ID | No |
| `P2002 unique constraint` | Duplicate idempotencyKey | No (expected, duplicate skipped) |
| `Workflow not found` | Invalid workflowId | No |
| Node execution failure | Node-specific error | Yes (up to 3 retries in production) |

#### Retry Configuration

```typescript
{
  retries: process.env.NODE_ENV === "production" ? 3 : 0
}
```

#### Idempotency

```
IF idempotencyKey provided AND no resumeExecutionId:
  1. Query: Execution WHERE workflowId=X AND idempotencyKey=Y
  2. IF found → return cached output (no new execution)
  3. IF not found → create new Execution
  4. IF P2002 (concurrent race) → find existing, return cached output
```

### User Signup Event

```typescript
Event name: "auth/user.created"

Payload: {
  data: {
    userId: string;
    name?: string;
  }
}

Behavior: Creates a welcome Notification for the new user
```

---

## Webhook Endpoints

### Generic Webhook Trigger

```
POST /api/webhooks/generic/{workflowId}

Headers:
  x-otogent-webhook-secret: string (required)
  Content-Type: application/json

Body:
  Any valid JSON → becomes initialData for the Workflow Execution

Authentication:
  1. Load Workflow by workflowId
  2. Verify x-otogent-webhook-secret against Workflow.webhookSecretHash
  3. SHA-256 hash comparison with crypto.timingSafeEqual

Response:
  200: { executionId: string, status: "RUNNING" }
  401: { error: "Invalid webhook secret" }
  404: { error: "Workflow not found" }

Rate Limiting:
  Per-Organization, configurable via RateLimitBucket
```

### Stripe Webhook

```
POST /api/webhooks/stripe

Headers:
  Stripe-Signature: string (Stripe webhook signature)

Body:
  Stripe event JSON payload

Authentication:
  Stripe webhook signature verification

Behavior:
  Routes to Stripe Trigger Nodes in connected Workflows
```

### Google Form Webhook

```
POST /api/webhooks/google-form

Body:
  Google Form submission data

Authentication:
  OAuth state validation

Behavior:
  Routes to Google Form Trigger Nodes in connected Workflows
```

### Polar Webhook

```
POST /api/webhooks/polar

Headers:
  Polar webhook signature headers

Authentication:
  POLAR_WEBHOOK_SECRET verification

Behavior:
  Handles subscription lifecycle events (create, update, cancel)
```

### Composio OAuth Callback

```
GET /api/integrations/composio/callback

Query Parameters:
  toolkit_slug: string (e.g., "github")
  state: string (encrypted OAuth state)

Authentication:
  Encrypted state validation (contains organizationId, toolkitSlug)

Behavior:
  1. Decrypt state → extract organizationId, toolkitSlug
  2. Create/update ComposioIntegration record
  3. Set isConnected=true
  4. Redirect to integrations page
```

---

## tRPC Routers

### App Router

```
Location: src/trpc/routers/_app.ts
Transport: HTTP (Next.js API route)
Authentication: Session-based (all routes require auth)
Serialization: SuperJSON
```

### Composio Router

```
Location: src/trpc/routers/composio.ts

Procedures:
  (Composio integration management — OAuth initiation, connection status,
   toolkit listing, action execution)

Authentication: Session-based, Organization-scoped
```

### Notifications Router

```
Location: src/trpc/routers/notifications.ts

Procedures:
  (Notification CRUD — list, mark as read, count unread)

Authentication: Session-based, User or Organization-scoped
```

### Super Admin Router

```
Location: src/trpc/routers/super-admin.ts

Procedures:
  (Platform administration — user management, organization management,
   system metrics, audit log queries)

Authentication: Session-based, SUPER_ADMIN role required
```

---

## Inngest Realtime Channels

Each Node type has an associated real-time channel for execution progress streaming:

| Channel Function | Node Type | Topic |
|---|---|---|
| httpRequestChannel | HTTP_REQUEST | status |
| manualTriggerChannel | MANUAL_TRIGGER | status |
| webhookTriggerChannel | WEBHOOK_TRIGGER | status |
| googleFormTriggerChannel | GOOGLE_FORM_TRIGGER | status |
| stripeTriggerChannel | STRIPE_TRIGGER | status |
| openAiChannel | OPENAI | status |
| anthropicChannel | ANTHROPIC | status |
| geminiChannel | GEMINI | status |
| gemmaChannel | GEMMA | status |
| huggingFaceChannel | HUGGINGFACE | status |
| discordChannel | DISCORD | status |
| slackChannel | SLACK | status |
| instagramChannel | INSTAGRAM | status |
| linkedinChannel | LINKEDIN | status |
| telegramChannel | TELEGRAM | status |
| xChannel | X | status |
| googleSheetsChannel | GOOGLE_SHEETS | status |
| emailChannel | EMAIL_SEND | status |
| emailParserChannel | EMAIL_PARSER | status |
| scheduleChannel | SCHEDULE | status |
| fileStorageChannel | FILE_STORAGE | status |
| dbQueryChannel | DB_QUERY | status |
| twilioSmsChannel | TWILIO_SMS | status |
| hubspotChannel | HUBSPOT | status |
| shopifyChannel | SHOPIFY | status |

### Subscribing to Real-time Updates

```typescript
import { getSubscriptionToken } from "@inngest/realtime";

const token = await getSubscriptionToken(inngest, {
  channel: slackChannel(),
  topics: ["status"],
});

// Use token to subscribe to real-time execution updates
// Token provides scoped, time-limited access to the channel
```

---

## Environment Variables

### Required for Production

| Variable | Purpose |
|---|---|
| DATABASE_URL | PostgreSQL connection string (Neon) |
| BETTER_AUTH_URL | Application URL for auth callbacks |
| BETTER_AUTH_SECRET | Secret for session token signing |
| ENCRYPTION_KEY | AES encryption key for sensitive data |
| NEXT_PUBLIC_APP_URL | Public application URL |
| POLAR_ACCESS_TOKEN | Polar billing API token |
| POLAR_WEBHOOK_SECRET | Polar webhook signature secret |
| POLAR_PRO_PRODUCT_ID | Polar product ID for Pro plan |
| POLAR_SERVER | Polar API server URL |
| RESEND_API_KEY | Resend email service API key |
| RESEND_FROM_EMAIL | Sender email address for transactional email |
| COMPOSIO_API_KEY | Composio platform API key |

### Optional

| Variable | Purpose | Default |
|---|---|---|
| LANGGRAPH_ENABLED | Enable LangGraph execution runtime | false |
| NODE_ENV | Environment mode | development |
| SENTRY_DSN | Sentry error tracking | (disabled) |
| NGROK_URL | Development tunnel URL | (none) |

---

## Agent Instructions

When integrating with Otogent programmatically, prefer webhook triggers for external event-driven execution and Inngest events for internal orchestration. Do not call tRPC routes from external systems — tRPC routes are designed for the Next.js frontend.

### Integration Patterns

```
External system → Otogent:
  Use: POST /api/webhooks/generic/{workflowId}
  Auth: x-otogent-webhook-secret header
  Data: JSON body → becomes initialData

Otogent → External system:
  Use: Integration Nodes (SLACK, DISCORD, HTTP_REQUEST, COMPOSIO, etc.)
  Auth: Managed via Credential table (encrypted)

Internal service → Otogent:
  Use: Inngest event "workflows/execute.workflow"
  Auth: Inngest event key
  Data: event.data payload
```

### Tradeoffs

| Approach | Pros | Cons |
|---|---|---|
| Webhook trigger | Simple HTTP POST, language-agnostic | Requires webhook secret management |
| Inngest event | Full control, idempotency, resumption | Requires Inngest SDK |
| tRPC (frontend only) | Type-safe, React Query integration | Not for external use |

## Decision Tree

```
IF triggering a Workflow from an external system
  THEN use POST /api/webhooks/generic/{workflowId} with webhook secret

IF triggering a Workflow from internal service
  THEN send Inngest event "workflows/execute.workflow"

IF preventing duplicate Workflow Executions
  THEN include idempotencyKey in the event payload

IF monitoring Execution progress in real-time
  THEN subscribe to the appropriate Inngest Realtime channel

IF managing Composio integrations
  THEN use the tRPC composio router from the frontend

IF you need super-admin operations
  THEN use the tRPC super-admin router (requires SUPER_ADMIN role)
```

## Common Errors

| Error | Endpoint | Cause | Fix |
|---|---|---|---|
| 401 Unauthorized | Webhook endpoints | Invalid or missing webhook secret | Verify x-otogent-webhook-secret header |
| 404 Not Found | /api/webhooks/generic/{id} | Invalid workflowId | Verify the Workflow ID exists |
| 429 Too Many Requests | Any rate-limited endpoint | Rate limit exceeded | Wait for window reset |
| Session expired | tRPC routes | Auth session past expiration | Re-authenticate |
| SUPER_ADMIN required | Super admin routes | User role is not SUPER_ADMIN | Use an account with SUPER_ADMIN role |

## Performance

| Metric | Detail |
|---|---|
| Webhook response time | <100ms (event sent to Inngest, immediate response) |
| tRPC request overhead | ~10-50ms (serialization + auth validation) |
| Real-time channel subscription | ~50-100ms (token generation) |
| Inngest event delivery | <500ms (event to function start) |

## Security

| Aspect | Detail |
|---|---|
| tRPC authentication | Session cookie, validated on every request |
| Webhook authentication | Per-Workflow shared secret, constant-time comparison |
| Rate limiting | Database-backed, per-Organization |
| CORS | Managed by Next.js middleware |
| Input validation | Zod schemas on tRPC procedures |
| CSRF | better-auth built-in CSRF protection |

## Related Pages

- [00-glossary.md](./00-glossary.md) — Term definitions
- [01-platform-overview.md](./01-platform-overview.md) — Platform architecture
- [03-execution-engine.md](./03-execution-engine.md) — Execution details
- [05-integrations.md](./05-integrations.md) — Integration setup
- [06-security.md](./06-security.md) — Authentication and encryption details
