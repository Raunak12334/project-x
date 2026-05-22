import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { SeoCtaSection } from "@/components/seo/cta-section";
import { RelatedContent } from "@/components/seo/related-content";
import { TechArticleSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "Production-Grade LangGraph Alternative for Multi-Agent Loops | Otogent",
  description:
    "Deploy multi-agent system graphs without complex python infrastructure management. Otogent delivers built-in model routing, secure credentials encryption, and edge execution.",
  alternates: {
    canonical: "https://otogent.com/docs/langgraph-alternative",
  },
  openGraph: {
    title: "Production-Grade LangGraph Alternative for Multi-Agent Loops | Otogent",
    description:
      "Deploy multi-agent system graphs without complex python infrastructure management. Otogent delivers built-in model routing, secure credentials encryption, and edge execution.",
    url: "https://otogent.com/docs/langgraph-alternative",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "Production-Grade LangGraph Alternative for Multi-Agent Loops | Otogent",
    description:
      "Deploy multi-agent system graphs without complex python infrastructure management. Otogent delivers built-in model routing, secure credentials encryption, and edge execution.",
  },
};

const comparisonFeatures = [
  {
    name: "Runtime Environment",
    otogent: "Hosted edge runtime — zero Python env",
    competitor: "Local Python process — venv + deps",
  },
  {
    name: "Graph Definition",
    otogent: "Visual canvas with typed node configs",
    competitor: "Python StateGraph + manual edge wiring",
  },
  {
    name: "Model Routing",
    otogent: "Built-in — Gemini, Claude, OpenAI, HuggingFace",
    competitor: "Manual LangChain model binding per node",
  },
  {
    name: "Human-in-the-Loop",
    otogent: "Native approval gate node — no code",
    competitor: "interrupt() + custom checkpoint logic",
  },
  {
    name: "Credential Management",
    otogent: "HSM-encrypted vault — zero plaintext",
    competitor: ".env files / LangSmith API keys in config",
  },
  {
    name: "Tool Integrations",
    otogent: "250+ via Composio — no custom connectors",
    competitor: "LangChain tool wrappers — per-tool code",
  },
  {
    name: "Execution Loop Detection",
    otogent: "Automatic — configurable max-visit threshold",
    competitor: "Manual recursion_limit param per graph",
  },
  {
    name: "Production Deployment",
    otogent: "Deploy from dashboard — no infra",
    competitor: "LangGraph Platform / self-host required",
  },
];

const relatedItems = [
  {
    title: "The Stateful Alternative to Temporal.io",
    description:
      "Compare Temporal's worker boilerplate against Otogent's visual runtime state manager for distributed multi-agent orchestration.",
    href: "/docs/temporal-alternative",
    category: "Engineering Docs",
  },
  {
    title: "AI Workflow Orchestration Engine",
    description:
      "Model-agnostic routing across Gemini, Claude, and OpenAI through a unified abstraction layer via Composio.",
    href: "/ai-workflow-orchestration",
    category: "Platform Infrastructure",
  },
  {
    title: "Autonomous Execution Systems",
    description:
      "Production-grade autonomous execution with encrypted credentials, webhook triggers, and edge worker loops.",
    href: "/autonomous-execution",
    category: "Platform Infrastructure",
  },
];

export default function LangGraphAlternativePage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <TechArticleSchema
        headline="Production-Grade LangGraph Alternative for Multi-Agent Loops"
        description="Deploy multi-agent system graphs without complex python infrastructure management. Otogent delivers built-in model routing, secure credentials encryption, and edge execution."
        url="https://otogent.com/docs/langgraph-alternative"
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Docs", href: "/docs" },
            { label: "LangGraph Alternative", href: "/docs/langgraph-alternative" },
          ]}
        />

        <header className="mb-12">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">
            Engineering Comparison
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Production-Grade LangGraph Alternative
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
            LangGraph gives you the graph abstraction for multi-agent loops — but
            ships you a Python process, a local checkpoint store, and a per-model
            integration problem. Otogent is the production runtime that removes
            every layer of that stack: visual graph editor, built-in model routing,
            HSM-encrypted credentials, and edge execution out of the box.
          </p>
        </header>

        <section className="mb-12 space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Python Boilerplate vs. Visual Graph Execution
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A LangGraph agent graph requires you to define a{" "}
              <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                StateGraph
              </code>
              , register node functions, wire edges with{" "}
              <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                add_conditional_edges
              </code>
              , and compile the graph before execution. Every new agent or branch
              means more Python, more test coverage, and more diff surface. Otogent
              replaces this entire layer with a canvas where nodes, edges, and
              conditions are configuration — not code — and the runtime compiles
              the execution plan automatically.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Out-of-the-Box Human-in-the-Loop Approval Barriers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              LangGraph supports human-in-the-loop via{" "}
              <code className="text-sm font-mono bg-muted px-1.5 py-0.5 rounded">
                interrupt()
              </code>{" "}
              calls and a custom checkpoint saver — you write the persistence
              layer, the resume logic, and the notification routing yourself.
              Otogent ships a native approval gate node: drop it on the canvas,
              configure your reviewer channel (Slack, email, webhook), and the
              runtime handles the pause, notification, context packaging, and
              conditional resume automatically.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Composio Integrations vs. LangChain Tool Wrappers
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Every external tool in LangGraph is a LangChain tool wrapper you
              write, maintain, and test. OAuth flows, token refresh, and API
              version upgrades are your problem. Otogent routes all tool calls
              through Composio&apos;s unified action API — 250+ integrations with
              managed auth, automatic token refresh, and zero custom connector
              code. A GitHub, Notion, or Slack action becomes a node on the
              canvas in under a minute.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Secure Credential Encryption at the Infrastructure Layer
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              LangGraph graphs authenticate via API keys loaded from environment
              variables — the same plaintext pattern that creates credential
              sprawl across local dev machines, CI pipelines, and production
              servers. Otogent encrypts every credential with envelope encryption
              (unique DEK per credential, root key in HSM), decrypts in-memory
              only at execution time, and enforces rotation policies as a
              first-class configuration primitive. Your credentials never appear
              in a log or an environment variable.
            </p>
          </div>
        </section>

        <ComparisonTable
          competitorName="LangGraph (Python)"
          features={comparisonFeatures}
        />

        <RelatedContent
          title="Continue Reading"
          items={relatedItems}
        />

        <SeoCtaSection
          title="Multi-Agent Graphs Without the Python Infrastructure Tax"
          description="Built-in model routing, 250+ Composio integrations, HSM-encrypted credentials, and edge execution — no Python environment required."
          primaryLink={{ label: "Deploy Free", href: "/signup" }}
          secondaryLink={{ label: "Explore Integrations", href: "/integrations" }}
        />
      </div>
      <Footer />
    </main>
  );
}
