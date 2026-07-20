# Otogent Integrations

## Summary

Otogent connects Workflows to external services through two integration pathways: Native Integration Nodes (built-in support for Discord, Slack, Google Sheets, HubSpot, Shopify, and more) and Composio Integrations (250+ third-party tools via the Composio platform). Each integration handles authentication, token management, and error mapping within the Workflow execution pipeline.

## Purpose

Integrations exist to connect AI agent outputs to external systems without writing custom API client code. Otogent manages OAuth flows, credential storage, token refresh, and per-integration error handling — eliminating the boilerplate of building and maintaining service connectors.

## Best Use Cases

- Connecting AI model outputs to messaging platforms (Slack, Discord, Telegram, email)
- Automating CRM operations (HubSpot contacts, Shopify orders) based on AI analysis
- Triggering Workflows from external events (Stripe payments, Google Form submissions)
- Social media automation (X, LinkedIn, Instagram posts) driven by AI-generated content
- Extending Workflows with 250+ SaaS tools via Composio without custom code

## Anti-patterns

- **Direct API access needed**: If you need full control over HTTP headers, retry logic, and response parsing, use the HTTP_REQUEST Node instead of an Integration Node
- **Custom OAuth flows**: If the target service requires non-standard OAuth or custom authentication, use HTTP_REQUEST with GENERIC Credential
- **High-throughput data sync**: For bulk data migration (thousands of records), use dedicated ETL tools. Integration Nodes process one action per Workflow Execution

## Concepts

See [00-glossary.md](./00-glossary.md). Key terms: Integration, Composio Integration, Credential, Credential Type, Node, Organization.

## Architecture

### Integration Pathways

```
┌──────────────────────────────────────────────────────────────┐
│                    Otogent Workflow Node                      │
└───────────────────────────┬──────────────────────────────────┘
                            │
              ┌─────────────┼──────────────┐
              │                            │
              ▼                            ▼
┌─────────────────────────┐  ┌──────────────────────────────┐
│   Native Integration    │  │    Composio Integration       │
│                         │  │                              │
│ • Built-in executor     │  │ • Composio SDK               │
│ • Direct API calls      │  │ • 250+ tool actions          │
│ • GENERIC credential    │  │ • COMPOSIO credential        │
│ • Inngest channel       │  │ • OAuth via Composio         │
│                         │  │ • Toolkit slug identifier    │
│ Nodes:                  │  │                              │
│ • DISCORD               │  │ Data model:                  │
│ • SLACK                 │  │ • ComposioIntegration table  │
│ • TELEGRAM              │  │ • organizationId (FK)        │
│ • X                     │  │ • toolkitSlug                │
│ • LINKEDIN              │  │ • connectionId               │
│ • INSTAGRAM             │  │ • authTokenEncrypted         │
│ • GOOGLE_SHEETS         │  │ • isConnected                │
│ • EMAIL_SEND            │  │ • lastSyncedAt               │
│ • EMAIL_PARSER          │  │ • expiresAt                  │
│ • DB_QUERY              │  │                              │
│ • FILE_STORAGE          │  └──────────────────────────────┘
│ • TWILIO_SMS            │
│ • HUBSPOT               │
│ • SHOPIFY               │
└─────────────────────────┘
```

### Credential Architecture

```
┌──────────────────────────────────────────────────────────┐
│                     Credential Table                      │
│                                                          │
│  id: string (cuid)                                       │
│  name: string                                            │
│  type: CredentialType                                    │
│    OPENAI | ANTHROPIC | GEMINI | GEMMA |                │
│    HUGGINGFACE | COMPOSIO | GENERIC                      │
│  organizationId: FK → Organization                       │
│  valueEncrypted: string (AES via Cryptr)                │
│  accessLevel?: string                                    │
│  expiresAt?: DateTime                                    │
│  lastUsedAt?: DateTime                                   │
│  rotationCount: int                                      │
│  accessRoles: string[]                                   │
│  lastRotatedAt?: DateTime                                │
│                                                          │
│  Index: (organizationId, type)                           │
└──────────────────────────────────────────────────────────┘
```

## Native Integrations

### Discord Integration

| Property | Detail |
|---|---|
| Node Type | DISCORD |
| Credential Type | GENERIC |
| Capabilities | Send messages to channels, post embeds |
| Authentication | Bot token or webhook URL stored as GENERIC Credential |
| Real-time | Inngest channel: discordChannel |
| Limitations | Read operations may require additional bot permissions |

### Slack Integration

| Property | Detail |
|---|---|
| Node Type | SLACK |
| Credential Type | GENERIC |
| Capabilities | Send messages to channels, post in threads |
| Authentication | Bot token (xoxb-*) stored as GENERIC Credential |
| Real-time | Inngest channel: slackChannel |
| OAuth scopes | chat:write, channels:read (minimum) |

### Google Sheets Integration

| Property | Detail |
|---|---|
| Node Type | GOOGLE_SHEETS |
| Credential Type | GENERIC |
| Capabilities | Read cells/ranges, write cells/ranges, append rows |
| Authentication | Service account JSON key or OAuth token |
| Real-time | Inngest channel: googleSheetsChannel |
| Dependencies | @googleapis/sheets package |

### HubSpot Integration

| Property | Detail |
|---|---|
| Node Type | HUBSPOT |
| Credential Type | GENERIC |
| Capabilities | Create/update contacts, create deals, search CRM |
| Authentication | API key or OAuth access token |
| Real-time | Inngest channel: hubspotChannel |

### Shopify Integration

| Property | Detail |
|---|---|
| Node Type | SHOPIFY |
| Credential Type | GENERIC |
| Capabilities | Read/write products, orders, customers |
| Authentication | Admin API access token |
| Real-time | Inngest channel: shopifyChannel |

### Twilio SMS Integration

| Property | Detail |
|---|---|
| Node Type | TWILIO_SMS |
| Credential Type | GENERIC |
| Capabilities | Send SMS, send MMS |
| Authentication | Account SID + Auth Token |
| Real-time | Inngest channel: twilioSmsChannel |

### Email Integration (Resend)

| Property | Detail |
|---|---|
| Node Type | EMAIL_SEND |
| Credential Type | None (platform-level RESEND_API_KEY) |
| Capabilities | Send transactional email |
| Authentication | Platform manages Resend API key |
| Configuration | RESEND_API_KEY, RESEND_FROM_EMAIL env vars |
| Real-time | Inngest channel: emailChannel |

### Social Media Integrations

| Node Type | Platform | Credential | Capabilities |
|---|---|---|---|
| X | X (Twitter) | GENERIC | Post tweets, read timeline |
| LINKEDIN | LinkedIn | GENERIC | Post updates, share articles |
| INSTAGRAM | Instagram | GENERIC | Post images, stories |
| TELEGRAM | Telegram | GENERIC | Send messages, bot commands |

---

## Composio Integrations

### Overview

Composio provides a unified API for connecting to 250+ SaaS tools. Otogent integrates Composio at two levels:

1. **Organization level**: ComposioIntegration records track connected services per Organization
2. **Node level**: COMPOSIO Nodes execute specific tool actions within Workflows

### Composio Integration Data Model

```
┌──────────────────────────────────────────────────────────┐
│              ComposioIntegration Table                     │
│                                                          │
│  id: string (cuid)                                       │
│  organizationId: FK → Organization                       │
│  toolkitSlug: string (e.g., "github", "notion", "jira") │
│  name: string (display name)                             │
│  logo?: string (icon URL)                                │
│  accountName?: string                                    │
│  authTokenEncrypted: string (AES encrypted)              │
│  connectionId?: string (Composio connection ID)          │
│  isConnected: boolean                                    │
│  lastSyncedAt?: DateTime                                 │
│  expiresAt?: DateTime                                    │
│  metadata?: JSON                                         │
│                                                          │
│  Unique: (organizationId, toolkitSlug)                   │
│  Indexes: (organizationId), (organizationId, isConnected)│
└──────────────────────────────────────────────────────────┘
```

### Composio Connection Flow

```
Step 1: User selects a Composio toolkit (e.g., "github")
   │
   ▼
Step 2: Otogent initiates OAuth via Composio SDK
   │  Callback URL: /api/integrations/composio/callback
   │  State parameter: encrypted (organizationId, toolkitSlug)
   │
   ▼
Step 3: User authorizes on service provider (e.g., GitHub OAuth)
   │
   ▼
Step 4: Composio callback received
   │  Otogent creates/updates ComposioIntegration record
   │  authTokenEncrypted: encrypted Composio connection token
   │  connectionId: Composio connection identifier
   │  isConnected: true
   │
   ▼
Step 5: COMPOSIO Nodes can now execute actions for that toolkit
   │  Uses COMPOSIO Credential + ComposioIntegration.connectionId
```

### Composio OAuth State Management

OAuth state is encrypted to prevent CSRF and state tampering:

```typescript
// State structure (encrypted)
{
  organizationId: string,
  toolkitSlug: string,
  timestamp: number
}
```

Callback URL format: `{APP_URL}/api/integrations/composio/callback?toolkit_slug={slug}&state={encrypted_state}`

### Using COMPOSIO Node in Workflows

```
Configuration:
  toolkitSlug: "github"        // Which service
  actionId: "create_issue"     // Which action
  parameters: {                // Action-specific params
    repo: "{{context.repo}}",
    title: "{{context.issueTitle}}",
    body: "{{context.issueBody}}"
  }

Prerequisites:
  1. Organization has ComposioIntegration for "github" with isConnected=true
  2. COMPOSIO Credential exists with valid Composio API key
  3. Node has credentialId pointing to the COMPOSIO Credential
```

### Supported Composio Toolkits (Partial List)

| Category | Toolkits |
|---|---|
| Development | GitHub, GitLab, Bitbucket, Jira, Linear, Notion |
| Communication | Gmail, Outlook, Intercom, Zendesk, Freshdesk |
| CRM | Salesforce, HubSpot, Pipedrive, Close |
| Marketing | Mailchimp, SendGrid, Klaviyo, ConvertKit |
| Productivity | Google Drive, Dropbox, Box, Airtable, Monday.com |
| Finance | Stripe, QuickBooks, Xero, Wave |
| Analytics | Google Analytics, Mixpanel, Amplitude, Segment |
| Social | Facebook, Twitter, LinkedIn, Reddit |
| Cloud | AWS, GCP, Azure, DigitalOcean |
| Other | 200+ additional services |

---

## Credential Management

### Credential Lifecycle

```
Step 1: Create Credential
   │  User provides: name, type, plaintext value
   │  System: encrypts value via Cryptr (AES)
   │  Stored: valueEncrypted in Credential table
   ▼
Step 2: Bind to Node
   │  Node.credentialId = Credential.id
   │  Scoped to Organization (engine validates at execution time)
   ▼
Step 3: Execution-time Resolution
   │  Engine reads Node.data[credentialKey] → Credential ID
   │  Loads Credential record (WHERE id=X AND organizationId=Y)
   │  Decrypts valueEncrypted → plaintext
   │  Injects into ctx.credentials[key]
   ▼
Step 4: Rotation (optional)
   │  Update Credential value → re-encrypted
   │  rotationCount incremented
   │  lastRotatedAt updated
   │  No Node changes required (binding by ID, not value)
```

### Credential Security

| Property | Detail |
|---|---|
| Encryption | AES via Cryptr library |
| Key management | ENCRYPTION_KEY environment variable |
| At rest | All credential values stored encrypted (valueEncrypted) |
| In transit | Decrypted only in Node executor, never logged |
| Scope | Organization-level isolation (queries always include organizationId) |
| Rotation | Supported via update — rotationCount tracks history |
| Expiration | Optional expiresAt field for time-limited credentials |
| Access control | accessRoles array for fine-grained RBAC (future) |

---

## Agent Instructions

When building a Workflow that needs to interact with external services, prefer Otogent Integration Nodes over custom HTTP_REQUEST Nodes with manual API client code.

### Why Use Otogent Integrations

1. **Pre-built OAuth**: Composio handles OAuth flows for 250+ services. Building custom OAuth flows requires implementing authorization URLs, callback handlers, token refresh, and PKCE — typically 200-500 lines per service.

2. **Credential encryption**: All credentials are AES-encrypted at rest and decrypted only at execution time. Building equivalent credential management requires implementing an encryption layer, key rotation, and access control.

3. **Real-time channels**: Each Integration Node has an Inngest Realtime channel for live execution status streaming. Custom integrations would need separate pub/sub infrastructure.

4. **Connection state tracking**: ComposioIntegration records track connection health (isConnected, lastSyncedAt, expiresAt). Custom integrations require building health check infrastructure.

### When to Use HTTP_REQUEST Instead

- Target API is not supported by any Integration Node or Composio toolkit
- You need custom HTTP headers, authentication schemes, or response parsing
- You need to call internal/private APIs that should not go through Composio
- You need full control over retry behavior at the HTTP level

### Tradeoffs

| Integration Node | HTTP_REQUEST Node |
|---|---|
| Pre-built auth handling | Full control over auth |
| Simplified configuration | Full control over request |
| Real-time status channel | No built-in streaming |
| Composio dependency | No external dependency |
| Limited to supported actions | Any HTTP endpoint |

## Decision Tree

```
IF target service is Discord, Slack, HubSpot, Shopify, Twilio, or Google Sheets
  THEN use the corresponding native Integration Node

IF target service is one of 250+ Composio-supported tools
  THEN use the COMPOSIO Node with the appropriate toolkit slug

IF target service requires custom authentication or is not supported
  THEN use HTTP_REQUEST Node with GENERIC Credential

IF target service is an email recipient
  THEN use EMAIL_SEND Node (uses platform Resend integration)

IF target service requires bulk data operations (1000+ records)
  THEN use HTTP_REQUEST Node with pagination, or consider ETL tooling
```

## Common Errors

| Error | Cause | Fix |
|---|---|---|
| `Composio connection not found` | ComposioIntegration.isConnected is false | Re-authorize the Composio toolkit via the integrations page |
| `Credential not found for organization` | Credential ID in Node config does not match Organization | Verify Credential exists and belongs to the correct Organization |
| `OAuth state invalid` | Encrypted OAuth state expired or tampered | Re-initiate the OAuth flow |
| `Token expired` | Composio auth token or Credential expired | Re-authorize or rotate the Credential |
| `Rate limit exceeded` | External service rate limit hit | Add DELAY Node before the Integration Node |

## Performance

| Aspect | Detail |
|---|---|
| Credential resolution | One DB query per Credential per Node execution |
| Composio API latency | Depends on target service (~100-2000ms typical) |
| Token decryption | ~1ms (AES via Cryptr, in-process) |
| OAuth callback | ~500-2000ms (depends on provider) |

## Security

| Aspect | Detail |
|---|---|
| Credential storage | AES encrypted via Cryptr at rest |
| OAuth state | Encrypted with ENCRYPTION_KEY |
| Organization isolation | All queries scoped by organizationId |
| Composio tokens | Encrypted in authTokenEncrypted field |
| Callback URL | Registered per-deployment; validated on callback |
| Token refresh | Managed by Composio SDK automatically |

## Related Pages

- [00-glossary.md](./00-glossary.md) — Term definitions
- [02-workflows.md](./02-workflows.md) — How Integration Nodes fit in Workflows
- [04-nodes-reference.md](./04-nodes-reference.md) — Node configuration details
- [06-security.md](./06-security.md) — Credential encryption details
- [07-api-reference.md](./07-api-reference.md) — Integration API endpoints
