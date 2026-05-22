import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { SeoCtaSection } from "@/components/seo/cta-section";
import { RelatedContent } from "@/components/seo/related-content";
import { TechArticleSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "Stateful Agentic Workflows & Multi-Agent Systems | Otogent",
  description:
    "Build persistent runtime state machines that survive restarts, prevent execution loops, and sustain long-running agentic logic across multi-agent systems.",
  alternates: {
    canonical: "https://otogent.com/agentic-workflows",
  },
  openGraph: {
    title: "Stateful Agentic Workflows & Multi-Agent Systems | Otogent",
    description:
      "Build persistent runtime state machines that survive restarts, prevent execution loops, and sustain long-running agentic logic across multi-agent systems.",
    url: "https://otogent.com/agentic-workflows",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stateful Agentic Workflows & Multi-Agent Systems | Otogent",
    description:
      "Build persistent runtime state machines that survive restarts, prevent execution loops, and sustain long-running agentic logic across multi-agent systems.",
  },
};

const comparisonFeatures = [
  { name: "Persistent Runtime State", otogent: true, competitor: false },
  { name: "Execution Loop Detection", otogent: true, competitor: false },
  { name: "Long-Running Agent Support", otogent: "Unlimited duration", competitor: "Timeout-bound" },
  { name: "State Machine Checkpoints", otogent: true, competitor: false },
  { name: "Crash Recovery & Resume", otogent: true, competitor: false },
  { name: "Human-in-the-Loop Gates", otogent: true, competitor: "Limited" },
];

const relatedItems = [
  {
    title: "Multi-Agent Automation",
    description:
      "Orchestrate asynchronous execution graphs, manage parallel agent coordination, and control per-agent token budgets at scale.",
    href: "/multi-agent-automation",
    category: "Platform Infrastructure",
  },
  {
    title: "Workflow Infrastructure",
    description:
      "Deep system computing architecture with database persistence, human-in-the-loop approval blocks, and reliable backup layers.",
    href: "/workflow-infrastructure",
    category: "Platform Infrastructure",
  },
];

export default function AgenticWorkflowsPage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <TechArticleSchema
        headline="Stateful Agentic Workflows & Multi-Agent Systems"
        description="Build persistent runtime state machines that survive restarts, prevent execution loops, and sustain long-running agentic logic across multi-agent systems."
        url="https://otogent.com/agentic-workflows"
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Agentic Workflows", href: "/agentic-workflows" },
          ]}
        />

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Stateful Agentic Workflows
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
            Long-running agent logic demands more than a serverless function timeout.
            Otogent backs every workflow with a persistent runtime state machine —
            checkpointing execution at every node, detecting and breaking infinite
            loops, and resuming exactly where a crashed agent left off.
          </p>
        </header>

        <section className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Persistent Runtime State Machines
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Each agentic workflow in Otogent is backed by a durable state machine
            stored in a write-ahead log. When an agent node completes — or fails —
            the runtime commits its output to the log before advancing. This means
            a network partition, OOM kill, or upstream model error can never corrupt
            your workflow state. Resume from the last committed checkpoint with a
            single API call.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Execution Loop Prevention
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Agentic reasoning loops are a production hazard. Otogent tracks
            visit counts per node per execution branch. If a node is visited beyond
            its configured threshold — indicating a circular dependency or a
            stuck reasoning chain — the runtime automatically breaks the loop,
            records the violation, and escalates to a configured fallback: halt,
            notify, or route to a human-in-the-loop gate.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Long-Running Agent Logic
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Multi-step research pipelines, code generation tasks, and approval
            workflows can run for hours. Otogent&apos;s runtime is built for duration —
            not bounded by a function timeout. Agents sleep between steps, wake on
            external events or webhook signals, and maintain full context across
            the gap without losing their place in the workflow graph.
          </p>
        </section>

        <ComparisonTable
          competitorName="Serverless Automation Platforms"
          features={comparisonFeatures}
        />

        <RelatedContent
          title="Explore Platform Infrastructure"
          items={relatedItems}
        />

        <SeoCtaSection
          title="Build Workflows That Never Break"
          description="Persistent state, loop detection, and long-running execution out of the box. Start your first stateful agentic workflow in minutes."
          primaryLink={{ label: "Get Started Free", href: "/signup" }}
          secondaryLink={{ label: "Read the Docs", href: "/docs" }}
        />
      </div>
      <Footer />
    </main>
  );
}
