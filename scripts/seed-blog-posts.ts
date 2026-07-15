/**
 * Blog Post Seed Script
 * 
 * Seeds 3 high-value SEO/GEO/AEO blog posts into the database.
 * These posts are strategically designed to:
 * 1. Target "What is Otogent" / brand definition queries
 * 2. Target "multi-agent AI" topical authority
 * 3. Target "AI workflow automation" comparison queries
 * 
 * Usage: npx tsx scripts/seed-blog-posts.ts
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Append connection pool params for Neon compatibility if not already present
const dbUrl = process.env.DATABASE_URL || "";
const separator = dbUrl.includes("?") ? "&" : "?";
const connectionUrl = dbUrl.includes("connect_timeout")
  ? dbUrl
  : `${dbUrl}${separator}connect_timeout=30&pool_timeout=30`;

const prisma = new PrismaClient({
  datasourceUrl: connectionUrl,
});

const blogPosts = [
  {
    title: "What is Otogent? The Complete Guide to Multi-Agent AI Automation",
    slug: "what-is-otogent-multi-agent-ai-automation-guide",
    excerpt:
      "A comprehensive introduction to Otogent — the AI-powered multi-agent automation platform for building, orchestrating, and deploying autonomous AI agent workflows at production scale.",
    content: `## What is Otogent?

**Otogent is an AI-powered multi-agent automation platform** that enables teams to build, orchestrate, and deploy autonomous AI agent workflows at production scale. It provides a visual no-code workflow builder, DAG-based parallel agent execution, per-agent token management, and native multi-model LLM support for OpenAI, Anthropic Claude, and Google Gemini.

> **Important Note:** Otogent (otogent.com) is a software technology platform. It is not related to any veterinary medicine, pharmaceutical product, or animal ear drop treatment sharing a similar name.

## Why Otogent Exists

AI agents are transforming how software gets built and how businesses operate. But deploying agents in production is hard. Teams wrestle with:

- **State management** — agents crash, lose context, and can't resume
- **Model routing** — switching between GPT-4o, Claude, and Gemini requires code rewrites
- **Token economics** — runaway LLM costs from uncontrolled agent loops
- **Credential security** — storing and rotating API keys safely
- **Orchestration plumbing** — wiring agents together into reliable pipelines

Otogent solves all of these with a single platform.

## Core Capabilities

### Visual Workflow Builder

Design multi-agent workflows using a drag-and-drop node graph canvas. No code required. Connect agent nodes, configure model selection, set token budgets, and define conditional logic — all visually.

### DAG-Based Parallel Execution

Every Otogent workflow is modeled as a directed acyclic graph (DAG). This means branches of your workflow execute in parallel the moment their upstream dependencies resolve. Complex 10-step workflows that would take 30 minutes sequentially finish in 5 minutes with parallel execution.

### Model-Agnostic Routing

Otogent supports OpenAI (GPT-4o, GPT-4), Anthropic Claude (Claude 3.5 Sonnet, Opus, Haiku), and Google Gemini (1.5 Pro, Flash). Mix models within a single workflow — use Gemini Flash for fast classification, Claude Opus for deep reasoning, and GPT-4o for code generation.

### Per-Agent Token Management

Track and enforce token budgets per agent per execution. Otogent monitors cumulative consumption in real-time, enforces configurable ceilings, and prevents runaway costs before they hit your billing dashboard.

### 250+ Tool Integrations

Connect agents to external services through Composio — GitHub, Slack, Notion, Google Workspace, Salesforce, HubSpot, Stripe, and 250+ more. Zero custom connector code required.

### Production Runtime

Persistent state machines checkpoint every node completion. If an agent crashes, the runtime resumes from the last checkpoint — no data loss, no re-execution. Built-in execution loop detection prevents circular reasoning from burning through your budget.

### Human-in-the-Loop Gates

Not every decision should be autonomous. Native approval gates pause execution, route context to a reviewer via email, Slack, or webhook, and resume or halt based on their response.

## Who Uses Otogent?

**Engineering Teams** building production AI agent systems who need reliable orchestration infrastructure with state management and multi-model support.

**Business Operations** automating complex multi-step processes — lead qualification, document processing, customer onboarding — with AI agents.

**No-Code Builders** designing agent workflows through a visual canvas with pre-built templates for real estate, healthcare, e-commerce, finance, and marketing.

## Pricing

- **Starter (Free):** 3 agents, 1,000 executions/month
- **Pro ($49/month):** Unlimited agents, 50,000 executions/month, all integrations
- **Enterprise (Custom):** Dedicated infrastructure, SSO/RBAC, SLA, on-prem

## Getting Started

1. **Sign up** at [otogent.com/signup](https://www.otogent.com/signup) — free, no credit card
2. **Connect your AI models** — add your OpenAI, Claude, or Gemini API keys
3. **Build a workflow** — use the visual canvas or start from a template
4. **Deploy and monitor** — execute workflows and track agent performance

Ready to automate? [Start building on Otogent →](https://www.otogent.com/signup)`,
  },
  {
    title: "Multi-Agent AI Systems Explained: Architecture, Patterns, and Production Deployment",
    slug: "multi-agent-ai-systems-architecture-patterns-production",
    excerpt:
      "Deep dive into multi-agent AI system architecture — from DAG-based execution graphs and parallel coordination patterns to state management and production deployment strategies.",
    content: `## What Are Multi-Agent AI Systems?

**A multi-agent AI system is an architecture where multiple AI agents collaborate, coordinate, or operate in parallel to solve complex problems.** Each agent may have specialized capabilities (research, analysis, code generation, decision-making), and a central orchestrator manages their communication, task distribution, and execution order.

Unlike single-agent approaches where one LLM handles everything, multi-agent systems decompose complex tasks into specialized subtasks — similar to how a development team assigns different responsibilities to different engineers.

## Why Multi-Agent Systems Matter

Single AI agents hit fundamental limitations when tasks get complex:

- **Context window limits** — one agent can't hold all the information needed for a 20-step process
- **Specialization** — different tasks benefit from different models and prompting strategies
- **Parallelism** — sequential execution is slow; complex workflows need branches running simultaneously
- **Reliability** — if one agent fails, the entire pipeline doesn't need to restart

Multi-agent systems solve these by distributing work across specialized agents coordinated by an orchestration layer.

## Core Architecture Patterns

### 1. Sequential Pipeline

The simplest pattern. Agent A completes, passes output to Agent B, which passes to Agent C.

**When to use:** Linear processes like document → summarize → translate → format.

**Limitation:** No parallelism. Slow for complex workflows.

### 2. Fan-Out / Fan-In (Parallel)

A coordinator splits a task into N subtasks, N agents execute in parallel, and results merge back.

**When to use:** Research across multiple sources, processing batches, multi-perspective analysis.

**Otogent implementation:** The visual canvas lets you drag multiple agent nodes from a single splitter node. The runtime manages parallel execution and merge logic automatically.

### 3. Hierarchical (Manager-Worker)

A manager agent plans the approach, delegates subtasks to worker agents, reviews results, and iterates.

**When to use:** Complex problem-solving where the strategy needs to adapt based on intermediate results.

### 4. Collaborative (Peer-to-Peer)

Agents share a workspace and communicate directly. Each agent contributes its expertise to a shared context.

**When to use:** Creative tasks, multi-perspective analysis, adversarial review processes.

## Production Challenges

Building multi-agent systems in a notebook is easy. Running them in production is hard.

### State Persistence

Agents crash. Networks fail. Models return errors. Production systems need durable state that survives failures. Otogent stores every execution state as a checkpoint — if anything breaks, resume from the last successful node.

### Token Economics

Multi-agent systems amplify LLM costs. A 5-agent workflow with 3 iterations each means 15 LLM calls per execution. Without per-agent budgets, costs spiral. Otogent enforces token ceilings per agent and emits real-time usage telemetry.

### Execution Loop Detection

Agentic reasoning loops are a production hazard. An agent that keeps retrying the same failing approach burns tokens and blocks the pipeline. Otogent tracks visit counts per node and automatically breaks detected loops.

### Credential Security

Multi-agent workflows authenticate against dozens of services. Each credential needs encryption at rest, in-memory-only decryption at execution time, and rotation policies. Otogent handles this with envelope encryption and HSM-backed root keys.

## Building Multi-Agent Workflows with Otogent

Otogent is purpose-built for multi-agent production deployments:

1. **Design** your agent graph visually — connect nodes, set models, configure tools
2. **Configure** per-agent token budgets and execution parameters
3. **Add** human-in-the-loop gates at critical decision points
4. **Deploy** with one click — Otogent manages the runtime
5. **Monitor** execution progress, token usage, and agent performance in real-time

The platform handles state persistence, parallel coordination, loop detection, and credential management — so you focus on the automation logic.

## Conclusion

Multi-agent AI systems are the future of complex automation. They distribute work, specialize capabilities, and execute in parallel. But production deployment requires serious infrastructure — state management, token economics, security, and orchestration.

Otogent provides that infrastructure out of the box. [Start building your first multi-agent workflow →](https://www.otogent.com/signup)`,
  },
  {
    title: "Otogent vs LangGraph vs Temporal: Choosing the Right AI Workflow Platform in 2026",
    slug: "otogent-vs-langgraph-vs-temporal-ai-workflow-comparison-2026",
    excerpt:
      "Detailed comparison of Otogent, LangGraph, and Temporal for AI agent workflow orchestration. Features, pricing, architecture, and which platform fits your production needs.",
    content: `## The AI Workflow Platform Landscape in 2026

As AI agent deployments move from prototypes to production, teams face a critical infrastructure decision: **which platform should orchestrate your multi-agent workflows?**

Three leading approaches have emerged:

- **Otogent** — A complete multi-agent automation platform with visual builder, multi-model support, and production runtime
- **LangGraph** — A code-first graph framework from the LangChain ecosystem
- **Temporal** — A general-purpose durable execution engine adapted for AI workflows

This guide compares all three across the dimensions that matter for production AI.

## Feature Comparison

### Visual Workflow Builder

| Feature | Otogent | LangGraph | Temporal |
|---------|---------|-----------|----------|
| No-code visual canvas | ✅ Drag-and-drop | ❌ Code only | ❌ Code only |
| Visual debugging | ✅ Real-time graph view | ❌ | ⚠️ Limited UI |
| Template library | ✅ 50+ blueprints | ❌ | ❌ |

**Otogent** provides a visual drag-and-drop node graph canvas where non-technical users can design workflows. LangGraph and Temporal both require writing code to define workflows.

### AI Model Support

| Feature | Otogent | LangGraph | Temporal |
|---------|---------|-----------|----------|
| OpenAI native | ✅ | ✅ | ⚠️ Via SDK |
| Claude native | ✅ | ⚠️ Via adapter | ⚠️ Via SDK |
| Gemini native | ✅ | ⚠️ Via adapter | ⚠️ Via SDK |
| Model mixing per workflow | ✅ | ✅ | Manual |
| Model-agnostic routing | ✅ Built-in | ❌ | ❌ |

**Otogent** is model-agnostic by design — a unified routing layer lets you mix GPT-4o, Claude, and Gemini within a single workflow with a config change, not a code rewrite.

### Production Infrastructure

| Feature | Otogent | LangGraph | Temporal |
|---------|---------|-----------|----------|
| State persistence | ✅ Built-in | ⚠️ Checkpointer | ✅ Core feature |
| Crash recovery | ✅ Automatic | ⚠️ Manual | ✅ Built-in |
| Loop detection | ✅ Automatic | ❌ | ❌ |
| Token management | ✅ Per-agent budgets | ❌ | ❌ |
| Credential encryption | ✅ HSM-backed | ❌ | ❌ |
| Human-in-the-loop | ✅ Native gates | ⚠️ Custom code | ⚠️ Custom signals |

**Temporal** excels at durable execution but isn't purpose-built for AI agent concerns like token management and loop detection. **LangGraph** provides a graph abstraction but leaves production infrastructure to you.

### Integrations

| Feature | Otogent | LangGraph | Temporal |
|---------|---------|-----------|----------|
| Tool integrations | ✅ 250+ via Composio | ⚠️ Community tools | ❌ Build your own |
| Webhook triggers | ✅ Built-in | ❌ | ⚠️ Custom |
| Slack/Discord | ✅ Native | ❌ | ❌ |

### Pricing

| Plan | Otogent | LangGraph | Temporal |
|------|---------|-----------|----------|
| Free tier | ✅ 3 agents, 1K runs | ✅ Open source | ✅ Open source |
| Managed service | $49/mo (Pro) | LangSmith pricing | Temporal Cloud |
| Enterprise | Custom | Custom | Custom |

## When to Choose Each Platform

### Choose Otogent When:

- You need a **visual no-code builder** alongside API access
- You want **multi-model support** (OpenAI + Claude + Gemini) out of the box
- You need **per-agent token management** and cost controls
- Your team includes **non-technical users** who need to design workflows
- You want **250+ integrations** without writing connector code
- You need **production infrastructure** (state, security, loop detection) without managing it yourself

### Choose LangGraph When:

- You're already deep in the **LangChain ecosystem**
- You prefer **code-first** workflow definition with maximum flexibility
- You have the engineering resources to **build your own production layer**
- You need **fine-grained control** over agent prompting and tool use

### Choose Temporal When:

- You need **general-purpose durable execution** beyond just AI agents
- You have **existing Temporal expertise** on your team
- Your primary concern is **workflow durability** and you'll handle AI-specific concerns yourself
- You're running **mixed workloads** (AI + non-AI) in the same infrastructure

## Conclusion

Each platform serves a different need:

- **Otogent** is the complete platform — visual builder + production runtime + AI-native features. Best for teams that want to ship fast without managing infrastructure.
- **LangGraph** is the flexible framework — maximum code control, minimum production guardrails. Best for experienced AI engineers.
- **Temporal** is the durable engine — rock-solid execution, but you build the AI layer yourself. Best for teams with Temporal expertise.

For most teams building production AI agent workflows in 2026, **Otogent offers the fastest path from idea to deployed automation** with the least infrastructure burden.

[Start building on Otogent — free →](https://www.otogent.com/signup)`,
  },
];

async function seedBlogPosts() {
  console.log("🔍 Finding an admin user to assign as blog post author...");

  // Find the first SUPER_ADMIN or ADMIN user to use as author
  let author = await prisma.user.findFirst({
    where: {
      role: { in: ["SUPER_ADMIN", "ADMIN"] },
      deletedAt: null,
    },
    select: { id: true, name: true, email: true },
  });

  // If no admin, use the first user
  if (!author) {
    author = await prisma.user.findFirst({
      where: { deletedAt: null },
      select: { id: true, name: true, email: true },
    });
  }

  if (!author) {
    console.error("❌ No users found in database. Please create a user first by signing up.");
    process.exit(1);
  }

  console.log(`✅ Using author: ${author.name} (${author.email})`);

  for (const post of blogPosts) {
    const existing = await prisma.blogPost.findUnique({
      where: { slug: post.slug },
    });

    if (existing) {
      console.log(`⏩ Skipping "${post.title}" — already exists`);
      continue;
    }

    await prisma.blogPost.create({
      data: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        status: "PUBLISHED",
        publishedAt: new Date(),
        authorId: author.id,
      },
    });

    console.log(`✅ Created: "${post.title}"`);
  }

  console.log("\n🎉 Blog seeding complete!");
}

seedBlogPosts()
  .catch((error) => {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
