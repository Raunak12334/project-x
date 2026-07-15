import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "AI & Automation Glossary | Otogent",
  description:
    "Comprehensive glossary of AI agent, multi-agent automation, LLM orchestration, and workflow infrastructure terms. Definitions from the Otogent AI platform team.",
  alternates: {
    canonical: "https://otogent.com/glossary",
  },
  openGraph: {
    title: "AI & Automation Glossary | Otogent",
    description:
      "Comprehensive glossary of AI agent, multi-agent automation, LLM orchestration, and workflow infrastructure terms.",
    url: "https://otogent.com/glossary",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI & Automation Glossary | Otogent",
    description:
      "Comprehensive glossary of AI agent, multi-agent automation, LLM orchestration, and workflow infrastructure terms.",
  },
};

const glossaryTerms = [
  {
    term: "AI Agent",
    definition:
      "An autonomous software entity that uses a large language model (LLM) to reason about tasks, make decisions, and take actions toward a goal. Unlike simple chatbots, AI agents can use tools, access external systems, and execute multi-step workflows independently.",
    relatedLink: "/multi-agent-automation",
  },
  {
    term: "Agentic Workflow",
    definition:
      "A workflow where one or more AI agents autonomously execute a series of tasks with decision-making logic, branching, and tool use. Unlike traditional automation (rigid if/then rules), agentic workflows adapt to context and handle ambiguity through LLM reasoning.",
    relatedLink: "/agentic-workflows",
  },
  {
    term: "Multi-Agent System",
    definition:
      "An architecture where multiple AI agents collaborate, coordinate, or operate in parallel to solve complex problems. Each agent may have specialized capabilities, and a central orchestrator manages their communication and task distribution.",
    relatedLink: "/multi-agent-automation",
  },
  {
    term: "DAG (Directed Acyclic Graph)",
    definition:
      "A graph structure used to represent workflow execution order. In AI agent orchestration, DAGs define which agents run in parallel and which must wait for upstream dependencies to complete. Otogent uses DAGs to model all multi-agent workflows.",
    relatedLink: "/multi-agent-automation",
  },
  {
    term: "LLM Orchestration",
    definition:
      "The process of coordinating multiple large language model calls across a workflow. This includes model selection (choosing between GPT-4o, Claude, Gemini), prompt routing, token management, and handling model responses within a structured execution plan.",
    relatedLink: "/ai-workflow-orchestration",
  },
  {
    term: "Model-Agnostic Routing",
    definition:
      "An architecture pattern where the orchestration layer can route tasks to any supported LLM provider (OpenAI, Anthropic, Google) through a unified interface. This prevents vendor lock-in and allows teams to mix models for optimal cost and performance.",
    relatedLink: "/ai-workflow-orchestration",
  },
  {
    term: "Human-in-the-Loop (HITL)",
    definition:
      "A workflow pattern where automated execution pauses at designated checkpoints to require human approval before proceeding. In Otogent, HITL gates carry full execution context so reviewers can make informed decisions quickly.",
    relatedLink: "/workflow-infrastructure",
  },
  {
    term: "Token Management",
    definition:
      "The practice of tracking, budgeting, and enforcing limits on the number of tokens consumed by LLM calls. Otogent manages token budgets per agent per execution to prevent runaway costs and ensure predictable billing.",
    relatedLink: "/multi-agent-automation",
  },
  {
    term: "State Machine (Workflow)",
    definition:
      "A computational model that tracks the current state of a workflow execution. In Otogent, persistent state machines checkpoint every node completion, enabling crash recovery and exact-point resumption without data loss.",
    relatedLink: "/agentic-workflows",
  },
  {
    term: "Execution Loop Detection",
    definition:
      "A safety mechanism that detects when an AI agent enters a circular reasoning pattern (visiting the same node repeatedly). Otogent automatically breaks detected loops and escalates to a configured fallback — halt, notify, or route to human review.",
    relatedLink: "/agentic-workflows",
  },
  {
    term: "Webhook Trigger",
    definition:
      "An HTTP-based mechanism where an external event (e.g., a GitHub push, Stripe payment, Slack command) automatically initiates a workflow execution. Otogent provisions unique webhook endpoints per workflow for event-driven automation.",
    relatedLink: "/autonomous-execution",
  },
  {
    term: "Envelope Encryption",
    definition:
      "A security pattern where each piece of sensitive data (like an API key) is encrypted with a unique data key, and that data key is itself encrypted by a master key stored in a hardware security module (HSM). Otogent uses this for all stored credentials.",
    relatedLink: "/autonomous-execution",
  },
  {
    term: "No-Code Workflow Builder",
    definition:
      "A visual interface where users design automation workflows by dragging and connecting nodes on a canvas, without writing any code. Otogent's no-code builder supports agent configuration, model selection, tool integration, and conditional logic.",
    relatedLink: "/what-is-otogent",
  },
  {
    term: "Composio",
    definition:
      "A tool integration platform that provides a unified API for connecting AI agents to 250+ external services (GitHub, Slack, Notion, Salesforce, etc.). Otogent routes all external tool calls through Composio's action API.",
    relatedLink: "/ai-workflow-orchestration",
  },
  {
    term: "Workflow Template",
    definition:
      "A pre-built workflow blueprint that teams can clone and customize for common automation scenarios. Otogent provides 50+ templates spanning real estate, healthcare, e-commerce, finance, marketing, and education verticals.",
    relatedLink: "/templates",
  },
];

export default function GlossaryPage() {
  const definedTermsJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "AI & Automation Glossary by Otogent",
    description:
      "Comprehensive glossary of AI agent, multi-agent automation, and workflow orchestration terminology.",
    url: "https://otogent.com/glossary",
    hasDefinedTerm: glossaryTerms.map((item) => ({
      "@type": "DefinedTerm",
      name: item.term,
      description: item.definition,
    })),
  };

  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermsJsonLd) }}
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Glossary", href: "/glossary" },
          ]}
        />

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            AI &amp; Automation Glossary
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Key terms and concepts in multi-agent AI automation, LLM
            orchestration, and workflow infrastructure — defined by the Otogent
            engineering team.
          </p>
        </header>

        <section className="space-y-8">
          {glossaryTerms.map((item) => (
            <article
              key={item.term}
              id={item.term.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
              className="rounded-xl border border-border bg-card p-6"
            >
              <h2 className="text-xl font-bold tracking-tight mb-3">
                {item.term}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {item.definition}
              </p>
              {item.relatedLink && (
                <Link
                  href={item.relatedLink}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Learn more about {item.term.toLowerCase()} →
                </Link>
              )}
            </article>
          ))}
        </section>

        {/* CTA */}
        <section className="mt-16 text-center py-12 rounded-xl border border-border bg-card">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Ready to Build AI Agent Workflows?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Put these concepts into practice with Otogent&apos;s multi-agent
            automation platform. Free to start, no credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center rounded-lg border border-border px-6 py-3 font-semibold hover:bg-muted/50 transition-colors"
            >
              View Documentation
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
