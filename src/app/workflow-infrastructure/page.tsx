import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { SeoCtaSection } from "@/components/seo/cta-section";
import { RelatedContent } from "@/components/seo/related-content";
import { TechArticleSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "Multi-Agent Workflow Infrastructure & Runtime | Otogent",
  description:
    "Deep system computing architecture with database persistence, automated backup layers, and human-in-the-loop approval blocks for mission-critical multi-agent workflow infrastructure.",
  alternates: {
    canonical: "https://otogent.com/workflow-infrastructure",
  },
  openGraph: {
    title: "Multi-Agent Workflow Infrastructure & Runtime | Otogent",
    description:
      "Deep system computing architecture with database persistence, automated backup layers, and human-in-the-loop approval blocks for mission-critical multi-agent workflow infrastructure.",
    url: "https://otogent.com/workflow-infrastructure",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Multi-Agent Workflow Infrastructure & Runtime | Otogent",
    description:
      "Deep system computing architecture with database persistence, automated backup layers, and human-in-the-loop approval blocks for mission-critical multi-agent workflow infrastructure.",
  },
};

const comparisonFeatures = [
  { name: "Database-Backed Persistence", otogent: true, competitor: false },
  { name: "Automated Backup Layers", otogent: true, competitor: false },
  { name: "Human-in-the-Loop Approvals", otogent: true, competitor: "Manual" },
  { name: "Infrastructure Observability", otogent: true, competitor: "Limited" },
  { name: "Multi-Region Redundancy", otogent: true, competitor: false },
  { name: "Point-in-Time Recovery", otogent: true, competitor: false },
];

const relatedItems = [
  {
    title: "Agentic Workflows",
    description:
      "Persistent runtime state machines that survive restarts, prevent execution loops, and sustain long-running agentic logic.",
    href: "/agentic-workflows",
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

export default function WorkflowInfrastructurePage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <TechArticleSchema
        headline="Multi-Agent Workflow Infrastructure & Runtime"
        description="Deep system computing architecture with database persistence, automated backup layers, and human-in-the-loop approval blocks for mission-critical multi-agent workflow infrastructure."
        url="https://otogent.com/workflow-infrastructure"
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Workflow Infrastructure", href: "/workflow-infrastructure" },
          ]}
        />

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Workflow Infrastructure & Runtime
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
            Enterprise-grade agent deployments require infrastructure that never
            drops data, recovers from failures automatically, and enforces human
            oversight at critical decision points. Otogent&apos;s workflow infrastructure
            is built from the storage layer up — database-backed persistence,
            point-in-time recovery, and human-in-the-loop approval gates woven
            into every execution path.
          </p>
        </header>

        <section className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Database-Backed Persistence Architecture
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Otogent stores every workflow execution as a fully normalised relational
            record. Node outputs, agent memory snapshots, token usage metrics, and
            error traces are all written transactionally to a multi-region Postgres
            cluster. This means your execution history is queryable, auditable, and
            never stored in a proprietary binary format you can&apos;t export.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Automated Backup Layers
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Workflow definitions, execution state, and credential vaults are backed
            up continuously using write-ahead log streaming to geographically
            separated object storage. Point-in-time recovery lets you restore any
            workflow execution to its exact state at any second within the retention
            window — critical for regulated industries and disaster recovery
            scenarios.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Human-in-the-Loop Approval Blocks
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Not every decision should be fully autonomous. Otogent ships a native
            human-in-the-loop node type that pauses workflow execution, routes an
            approval request to a designated reviewer via email, Slack, or webhook,
            and resumes or halts based on their response. Approval blocks carry
            full execution context — the agent&apos;s reasoning, tool call outputs,
            and proposed next action — so reviewers have everything they need to
            decide in seconds.
          </p>
        </section>

        <ComparisonTable
          competitorName="Lightweight Workflow Engines"
          features={comparisonFeatures}
        />

        <RelatedContent
          title="Explore Platform Infrastructure"
          items={relatedItems}
        />

        <SeoCtaSection
          title="Infrastructure Built for Production Agents"
          description="Database persistence, automated backups, and human-in-the-loop oversight — the runtime foundation your mission-critical agent workflows deserve."
          primaryLink={{ label: "Build on Otogent", href: "/signup" }}
          secondaryLink={{ label: "View Architecture Docs", href: "/docs" }}
        />
      </div>
      <Footer />
    </main>
  );
}
