import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { SeoCtaSection } from "@/components/seo/cta-section";
import { RelatedContent } from "@/components/seo/related-content";
import { TechArticleSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "Multi-Agent Automation Platform & Infrastructure | Otogent",
  description:
    "Run asynchronous multi-agent execution graphs with full DAG orchestration, token management, and parallel agent coordination on Otogent's automation infrastructure.",
  alternates: {
    canonical: "https://otogent.com/multi-agent-automation",
  },
  openGraph: {
    title: "Multi-Agent Automation Platform & Infrastructure | Otogent",
    description:
      "Run asynchronous multi-agent execution graphs with full DAG orchestration, token management, and parallel agent coordination on Otogent's automation infrastructure.",
    url: "https://otogent.com/multi-agent-automation",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multi-Agent Automation Platform & Infrastructure | Otogent",
    description:
      "Run asynchronous multi-agent execution graphs with full DAG orchestration, token management, and parallel agent coordination on Otogent's automation infrastructure.",
  },
};

const comparisonFeatures = [
  { name: "Asynchronous Agent Execution", otogent: true, competitor: false },
  { name: "DAG-based Workflow Graphs", otogent: true, competitor: false },
  { name: "Per-agent Token Management", otogent: true, competitor: "Manual only" },
  { name: "Parallel Agent Coordination", otogent: "Native", competitor: "Limited" },
  { name: "Runtime State Persistence", otogent: true, competitor: false },
  { name: "Model-Agnostic Routing", otogent: true, competitor: false },
];

const relatedItems = [
  {
    title: "Agentic Workflows",
    description:
      "Design stateful, long-running agentic workflows backed by persistent runtime state machines that survive restarts and execution loops.",
    href: "/agentic-workflows",
    category: "Platform Infrastructure",
  },
  {
    title: "AI Workflow Orchestration",
    description:
      "Model-agnostic routing that abstracts Gemini, Claude, and OpenAI into a single composable orchestration layer.",
    href: "/ai-workflow-orchestration",
    category: "Platform Infrastructure",
  },
];

export default function MultiAgentAutomationPage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <TechArticleSchema
        headline="Multi-Agent Automation Platform & Infrastructure"
        description="Run asynchronous multi-agent execution graphs with full DAG orchestration, token management, and parallel agent coordination on Otogent's automation infrastructure."
        url="https://otogent.com/multi-agent-automation"
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Multi-Agent Automation", href: "/multi-agent-automation" },
          ]}
        />

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Multi-Agent Automation Platform
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
            Orchestrate fleets of AI agents across asynchronous execution graphs.
            Otogent&apos;s multi-agent infrastructure manages workflow DAGs, parallel
            agent coordination, and per-agent token budgets — so you can ship
            production-grade automation without managing the runtime yourself.
          </p>
        </header>

        <section className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Asynchronous Execution Graphs
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Traditional automation tools execute agents sequentially. Otogent models
            agent pipelines as directed acyclic graphs (DAGs), allowing any branch
            of your workflow to execute in parallel the moment its upstream
            dependencies resolve. This cuts wall-clock time dramatically for complex
            multi-step automations and ensures your infrastructure scales linearly
            with parallelism.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Per-Agent Token Management
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Each agent in a workflow runs with an isolated token context. Otogent
            tracks cumulative token consumption per agent per execution, enforces
            configurable budget ceilings, and emits real-time telemetry — preventing
            runaway cost spikes before they hit your billing dashboard. Token
            allocation is inherited from the workflow definition and can be
            overridden at the node level.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Workflow DAG Architecture
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Every Otogent workflow is stored as an immutable DAG snapshot.
            Conditional branches, fan-out merges, and human-in-the-loop approval
            gates are all first-class graph primitives. The runtime evaluates
            topological order at execution time, meaning you can dynamically
            re-route execution without rebuilding the entire workflow from scratch.
          </p>
        </section>

        <ComparisonTable
          competitorName="Traditional Automation Tools"
          features={comparisonFeatures}
        />

        <RelatedContent
          title="Explore Platform Infrastructure"
          items={relatedItems}
        />

        <SeoCtaSection
          title="Deploy Your First Multi-Agent Workflow"
          description="Connect your models, define your agent graph, and execute — Otogent handles the orchestration runtime so your team ships faster."
          primaryLink={{ label: "Start Building Free", href: "/signup" }}
          secondaryLink={{ label: "View Docs", href: "/docs" }}
        />
      </div>
      <Footer />
    </main>
  );
}
