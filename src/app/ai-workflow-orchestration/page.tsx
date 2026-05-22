import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { SeoCtaSection } from "@/components/seo/cta-section";
import { RelatedContent } from "@/components/seo/related-content";
import { TechArticleSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "AI Workflow Orchestration Engine & Runtime Layer | Otogent",
  description:
    "Model-agnostic orchestration that routes across Gemini, Claude, and OpenAI via Composio. A unified abstraction layer for multi-model AI workflow execution.",
  alternates: {
    canonical: "https://otogent.com/ai-workflow-orchestration",
  },
  openGraph: {
    title: "AI Workflow Orchestration Engine & Runtime Layer | Otogent",
    description:
      "Model-agnostic orchestration that routes across Gemini, Claude, and OpenAI via Composio. A unified abstraction layer for multi-model AI workflow execution.",
    url: "https://otogent.com/ai-workflow-orchestration",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Workflow Orchestration Engine & Runtime Layer | Otogent",
    description:
      "Model-agnostic orchestration that routes across Gemini, Claude, and OpenAI via Composio. A unified abstraction layer for multi-model AI workflow execution.",
  },
};

const comparisonFeatures = [
  { name: "Model-Agnostic Routing", otogent: true, competitor: false },
  { name: "Gemini Integration", otogent: true, competitor: false },
  { name: "Claude Integration", otogent: true, competitor: "Partial" },
  { name: "OpenAI Integration", otogent: true, competitor: true },
  { name: "Composio Tool Layer", otogent: true, competitor: false },
  { name: "Unified Abstraction API", otogent: true, competitor: false },
];

const relatedItems = [
  {
    title: "Autonomous Execution Systems",
    description:
      "Production-grade autonomous execution with secure credential encryption, webhooks, and edge worker loops.",
    href: "/autonomous-execution",
    category: "Platform Infrastructure",
  },
  {
    title: "Multi-Agent Automation",
    description:
      "Asynchronous execution graphs, workflow DAGs, and per-agent token management for large-scale agent coordination.",
    href: "/multi-agent-automation",
    category: "Platform Infrastructure",
  },
];

export default function AiWorkflowOrchestrationPage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <TechArticleSchema
        headline="AI Workflow Orchestration Engine & Runtime Layer"
        description="Model-agnostic orchestration that routes across Gemini, Claude, and OpenAI via Composio. A unified abstraction layer for multi-model AI workflow execution."
        url="https://otogent.com/ai-workflow-orchestration"
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "AI Workflow Orchestration", href: "/ai-workflow-orchestration" },
          ]}
        />

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            AI Workflow Orchestration Engine
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
            Vendor lock-in is a dead end for AI infrastructure. Otogent&apos;s
            orchestration runtime is fully model-agnostic — routing execution across
            Gemini, Claude, and OpenAI through a unified abstraction layer, with
            Composio bridging every external tool integration.
          </p>
        </header>

        <section className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Model-Agnostic Routing Architecture
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Otogent&apos;s orchestration layer exposes a single, normalised interface
            for LLM inference regardless of provider. Each workflow node declares a
            model selector — Gemini 1.5 Pro, Claude 3.5 Sonnet, GPT-4o — and the
            runtime resolves the appropriate adapter at execution time. Switching
            providers requires a config change, not a code rewrite.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Composio Integration Layer
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Connecting AI models to external tools — GitHub, Slack, Notion, databases
            — historically requires per-integration OAuth plumbing. Otogent routes
            all tool calls through Composio&apos;s unified action API. Any of Composio&apos;s
            250+ integrations become first-class workflow nodes with zero custom
            connector code.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Unified Abstraction for Multi-Model Pipelines
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Production AI pipelines often benefit from routing different tasks to the
            most capable — or most cost-effective — model. Otogent lets you mix
            models within a single workflow graph: run fast classification with
            Gemini Flash, chain deep reasoning to Claude Opus, and delegate code
            execution to GPT-4o, all within one cohesive runtime execution plan.
          </p>
        </section>

        <ComparisonTable
          competitorName="Single-Model Automation Tools"
          features={comparisonFeatures}
        />

        <RelatedContent
          title="Explore Platform Infrastructure"
          items={relatedItems}
        />

        <SeoCtaSection
          title="Orchestrate Any Model, Any Workflow"
          description="Stop rebuilding integrations for every provider. Connect Gemini, Claude, and OpenAI through a single runtime layer — free to start."
          primaryLink={{ label: "Start Orchestrating", href: "/signup" }}
          secondaryLink={{ label: "View Integrations", href: "/integrations" }}
        />
      </div>
      <Footer />
    </main>
  );
}
