import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { SeoCtaSection } from "@/components/seo/cta-section";
import { RelatedContent } from "@/components/seo/related-content";
import { TechArticleSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "The Stateful Alternative to Temporal.io Workflows | Otogent",
  description:
    "Compare Temporal's worker boilerplate against Otogent's visual runtime state manager. Orchestrate distributed multi-agent systems with infinite persistence checkpoints.",
  alternates: {
    canonical: "https://otogent.com/docs/temporal-alternative",
  },
  openGraph: {
    title: "The Stateful Alternative to Temporal.io Workflows | Otogent",
    description:
      "Compare Temporal's worker boilerplate against Otogent's visual runtime state manager. Orchestrate distributed multi-agent systems with infinite persistence checkpoints.",
    url: "https://otogent.com/docs/temporal-alternative",
    type: "article",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Stateful Alternative to Temporal.io Workflows | Otogent",
    description:
      "Compare Temporal's worker boilerplate against Otogent's visual runtime state manager. Orchestrate distributed multi-agent systems with infinite persistence checkpoints.",
  },
};

const comparisonFeatures = [
  {
    name: "Workflow Definition",
    otogent: "Visual canvas — drag, connect, publish",
    competitor: "TypeScript/Go/Java worker classes",
  },
  {
    name: "State Persistence",
    otogent: "Infinite checkpoint WAL — zero config",
    competitor: "Event-sourced history log — requires tuning",
  },
  {
    name: "Setup Overhead",
    otogent: "Hosted runtime — zero infrastructure",
    competitor: "Self-host Temporal Server + worker fleet",
  },
  {
    name: "Multi-Agent Coordination",
    otogent: "Native DAG orchestration",
    competitor: "Manual child-workflow orchestration",
  },
  {
    name: "Human-in-the-Loop Gates",
    otogent: true,
    competitor: "Signal/query workarounds required",
  },
  {
    name: "Model-Agnostic LLM Routing",
    otogent: true,
    competitor: false,
  },
  {
    name: "Visual Execution Replay",
    otogent: true,
    competitor: "Timeline UI only — no canvas",
  },
  {
    name: "Credential Encryption",
    otogent: "HSM envelope encryption",
    competitor: false,
  },
];

const relatedItems = [
  {
    title: "Production-Grade LangGraph Alternative",
    description:
      "Deploy multi-agent graph loops without complex Python infrastructure. Built-in model routing, credential encryption, and edge execution.",
    href: "/docs/langgraph-alternative",
    category: "Engineering Docs",
  },
  {
    title: "Agentic Workflows",
    description:
      "Persistent runtime state machines that survive restarts, prevent execution loops, and sustain long-running agentic logic.",
    href: "/agentic-workflows",
    category: "Platform Infrastructure",
  },
  {
    title: "Workflow Infrastructure",
    description:
      "Database-backed persistence, automated backup layers, and human-in-the-loop approval blocks for mission-critical deployments.",
    href: "/workflow-infrastructure",
    category: "Platform Infrastructure",
  },
];

export default function TemporalAlternativePage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <TechArticleSchema
        headline="The Stateful Alternative to Temporal.io Workflows"
        description="Compare Temporal's worker boilerplate against Otogent's visual runtime state manager. Orchestrate distributed multi-agent systems with infinite persistence checkpoints."
        url="https://otogent.com/docs/temporal-alternative"
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Docs", href: "/docs" },
            { label: "Temporal Alternative", href: "/docs/temporal-alternative" },
          ]}
        />

        <header className="mb-12">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">
            Engineering Comparison
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            The Stateful Alternative to Temporal.io
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
            Temporal is powerful — but it ships every team the same problem: a
            worker fleet to provision, a history log to tune, and thousands of
            lines of boilerplate before the first workflow runs. Otogent
            delivers the same infinite-persistence state machine model through
            a visual canvas runtime, with zero infrastructure to self-host.
          </p>
        </header>

        <section className="mb-12 space-y-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Worker Boilerplate vs. Visual Runtime
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              A Temporal workflow requires at minimum a workflow function, one
              or more activity functions, a worker process to register them, and
              a Temporal Server (or Temporal Cloud account) to schedule
              execution. Before your first durable step runs, you have already
              written infrastructure code. Otogent replaces every layer of that
              stack with a visual canvas — nodes are activities, edges are
              transitions, and the runtime is fully managed. Your team ships
              the workflow logic, not the infrastructure wiring it together.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Infinite Persistence Checkpoints
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Temporal stores workflow state as an append-only event history log
              that replays on recovery. This is robust but comes with a real
              operational cost: history size limits, compression overhead, and
              non-determinism bugs that surface only in production. Otogent
              writes execution state to a WAL-backed relational store with
              point-in-time recovery, no determinism constraints, and no history
              truncation policy to manage.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-4">
              Multi-Agent Orchestration as a First-Class Primitive
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Temporal models multi-step processes as child workflows —
              composable, but requiring explicit orchestration code at every
              fan-out point. Otogent models the same topology as a DAG on the
              canvas: parallel branches, conditional merges, and human-in-the-loop
              gates are visual primitives, not code patterns you maintain across
              a codebase.
            </p>
          </div>
        </section>

        <ComparisonTable
          competitorName="Temporal.io"
          features={comparisonFeatures}
        />

        <RelatedContent
          title="Continue Reading"
          items={relatedItems}
        />

        <SeoCtaSection
          title="Ship Durable Workflows Without the Infrastructure Tax"
          description="Infinite state persistence, visual canvas orchestration, and zero worker fleet management — start your first workflow in minutes."
          primaryLink={{ label: "Start Building Free", href: "/signup" }}
          secondaryLink={{ label: "Read the Architecture Docs", href: "/docs" }}
        />
      </div>
      <Footer />
    </main>
  );
}
