import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { ComparisonTable } from "@/components/seo/comparison-table";
import { SeoCtaSection } from "@/components/seo/cta-section";
import { RelatedContent } from "@/components/seo/related-content";
import { TechArticleSchema } from "@/components/seo/schemas";

export const metadata: Metadata = {
  title: "Autonomous Execution Systems & Agent Clusters | Otogent",
  description:
    "Production-grade autonomous execution with encrypted credential storage, webhook-driven triggers, and edge worker loops for resilient agent cluster deployments.",
  alternates: {
    canonical: "https://otogent.com/autonomous-execution",
  },
  openGraph: {
    title: "Autonomous Execution Systems & Agent Clusters | Otogent",
    description:
      "Production-grade autonomous execution with encrypted credential storage, webhook-driven triggers, and edge worker loops for resilient agent cluster deployments.",
    url: "https://otogent.com/autonomous-execution",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Autonomous Execution Systems & Agent Clusters | Otogent",
    description:
      "Production-grade autonomous execution with encrypted credential storage, webhook-driven triggers, and edge worker loops for resilient agent cluster deployments.",
  },
};

const comparisonFeatures = [
  { name: "Encrypted Credential Storage", otogent: true, competitor: false },
  { name: "Webhook-Driven Triggers", otogent: true, competitor: "Limited" },
  { name: "Edge Worker Execution Loops", otogent: true, competitor: false },
  { name: "Production Security Posture", otogent: "SOC-2 ready", competitor: "Basic" },
  { name: "Agent Cluster Management", otogent: true, competitor: false },
  { name: "Autonomous Run Scheduling", otogent: true, competitor: "Cron only" },
];

const relatedItems = [
  {
    title: "AI Workflow Orchestration",
    description:
      "Model-agnostic routing that abstracts Gemini, Claude, and OpenAI into a unified orchestration runtime via Composio.",
    href: "/ai-workflow-orchestration",
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

export default function AutonomousExecutionPage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <TechArticleSchema
        headline="Autonomous Execution Systems & Agent Clusters"
        description="Production-grade autonomous execution with encrypted credential storage, webhook-driven triggers, and edge worker loops for resilient agent cluster deployments."
        url="https://otogent.com/autonomous-execution"
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-5xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Autonomous Execution", href: "/autonomous-execution" },
          ]}
        />

        <header className="mb-12">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            Autonomous Execution Systems
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-3xl">
            Moving agent workflows from prototype to production requires more than
            a working demo. Otogent&apos;s autonomous execution layer provides encrypted
            credential management, webhook-driven event triggers, and durable edge
            worker loops — the production infrastructure your agent clusters need
            to run reliably without human babysitting.
          </p>
        </header>

        <section className="prose prose-neutral dark:prose-invert max-w-none mb-12">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Secure Credential Encryption
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Agent workflows authenticate against dozens of external services. Otogent
            encrypts every credential at rest using envelope encryption — a unique
            data encryption key per credential, wrapped by a root key stored in a
            hardware security module. Credentials are decrypted in-memory only at
            execution time and never logged. Rotation policies and expiry alerts
            are first-class configuration primitives.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Webhook-Driven Execution Triggers
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Autonomous agents shouldn&apos;t poll. Otogent provisioning a unique inbound
            webhook endpoint per workflow that accepts structured JSON payloads from
            any external system — GitHub push events, Stripe payment confirmations,
            Slack slash commands — and maps payload fields directly onto workflow
            input variables. Event arrival to first agent node execution latency
            is sub-100ms at the edge.
          </p>

          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Edge Worker Execution Loops
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Long-polling loops and scheduled autonomous runs execute on Otogent&apos;s
            edge worker fleet — distributed compute nodes co-located with your data
            to minimise round-trip latency. Worker loops maintain a heartbeat,
            self-heal on process crashes, and report execution health metrics to
            a central observability layer accessible from your Otogent dashboard.
          </p>
        </section>

        <ComparisonTable
          competitorName="Standard Workflow Runners"
          features={comparisonFeatures}
        />

        <RelatedContent
          title="Explore Platform Infrastructure"
          items={relatedItems}
        />

        <SeoCtaSection
          title="Run Agents Autonomously in Production"
          description="Encrypted credentials, webhook triggers, and edge workers — everything your autonomous agent clusters need to run reliably at scale."
          primaryLink={{ label: "Deploy Free", href: "/signup" }}
          secondaryLink={{ label: "Explore Docs", href: "/docs" }}
        />
      </div>
      <Footer />
    </main>
  );
}
