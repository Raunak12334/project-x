import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";
import { SeoCtaSection } from "@/components/seo/cta-section";
import { RelatedContent } from "@/components/seo/related-content";

export const metadata: Metadata = {
  title: "What is Otogent? | AI Agent Automation Platform",
  description:
    "Otogent is an AI-powered multi-agent automation platform that lets teams build, orchestrate, and deploy autonomous AI agent workflows using OpenAI, Claude, and Gemini. Not a veterinary product.",
  alternates: {
    canonical: "https://otogent.com/what-is-otogent",
  },
  openGraph: {
    title: "What is Otogent? — AI Multi-Agent Automation Platform",
    description:
      "Otogent is an AI-powered multi-agent automation platform for building and deploying autonomous AI agent workflows at production scale.",
    url: "https://otogent.com/what-is-otogent",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "What is Otogent? — AI Multi-Agent Automation Platform",
    description:
      "Otogent is an AI-powered multi-agent automation platform for building and deploying autonomous AI agent workflows at production scale.",
  },
};

const faqs = [
  {
    question: "What is Otogent?",
    answer:
      "Otogent is an AI-powered multi-agent automation platform and workflow infrastructure. It enables software teams and businesses to build, orchestrate, and deploy autonomous AI agent workflows using large language models like OpenAI GPT, Anthropic Claude, and Google Gemini — all from a single visual interface with no code required.",
  },
  {
    question: "Is Otogent a veterinary medicine or ear drop product?",
    answer:
      "No. Otogent (otogent.com) is a software technology company and AI automation platform. It is not related to veterinary medicine, pharmaceutical products, or animal ear drop treatments in any way. The veterinary product sharing a similar name is an entirely separate and unrelated entity with no corporate, product, or operational connection to the Otogent software platform.",
  },
  {
    question: "What does Otogent do?",
    answer:
      "Otogent orchestrates fleets of AI agents across asynchronous, parallel execution graphs. It manages workflow state, token budgets, human-in-the-loop approval gates, and integrates with 250+ external tools via Composio. Teams use Otogent to automate complex multi-step business processes — from lead generation to code review to customer onboarding — without managing the underlying AI infrastructure.",
  },
  {
    question: "Who is Otogent for?",
    answer:
      "Otogent is designed for three audiences: (1) Engineering teams shipping production AI agent workflows who need reliable orchestration infrastructure, (2) Businesses automating complex multi-step processes with large language models, and (3) Non-technical users who need no-code agent automation through a visual drag-and-drop workflow builder.",
  },
  {
    question: "What AI models does Otogent support?",
    answer:
      "Otogent is fully model-agnostic. It natively supports OpenAI (GPT-4o, GPT-4, GPT-3.5), Anthropic Claude (Claude 3.5 Sonnet, Claude 3 Opus, Claude 3 Haiku), and Google Gemini (Gemini 1.5 Pro, Gemini Flash). You can mix and match models within a single workflow — for example, using Gemini Flash for classification and Claude Opus for deep reasoning.",
  },
  {
    question: "How much does Otogent cost?",
    answer:
      "Otogent offers three pricing tiers: Starter (Free) with 3 agents and 1,000 executions per month, Pro ($49/month) with unlimited agents and 50,000 executions per month including all integrations, and Enterprise (custom pricing) with dedicated infrastructure, SSO/RBAC, SLA guarantees, and on-premises deployment options.",
  },
  {
    question: "How is Otogent different from LangGraph or Temporal?",
    answer:
      "Unlike LangGraph (a code-only graph framework) or Temporal (a general workflow engine), Otogent is a complete production platform specifically built for AI agent orchestration. It combines a visual no-code workflow builder, native multi-model LLM support, per-agent token management, human-in-the-loop gates, encrypted credential storage, and 250+ tool integrations — all without requiring you to manage infrastructure, write boilerplate, or handle state persistence yourself.",
  },
  {
    question: "Can I use Otogent without writing code?",
    answer:
      "Yes. Otogent provides a visual drag-and-drop node graph canvas where you can design multi-agent workflows entirely without code. You connect agent nodes, configure model selection, set token budgets, and define execution logic visually. For advanced users, Otogent also exposes a full API and SDK for programmatic workflow creation.",
  },
  {
    question: "What integrations does Otogent support?",
    answer:
      "Otogent integrates with 250+ external services through Composio, including GitHub, Slack, Notion, Google Workspace, Discord, Salesforce, HubSpot, Stripe, and many more. It also supports webhook-driven triggers, HTTP endpoints, and scheduled automation for connecting to any custom system.",
  },
  {
    question: "Is Otogent secure for production use?",
    answer:
      "Yes. Otogent encrypts every API credential at rest using envelope encryption with hardware security module (HSM) backed root keys. Credentials are decrypted in-memory only at execution time and are never logged. The platform includes role-based access control, audit logging, and is designed to meet SOC-2 compliance requirements for enterprise deployments.",
  },
];

const relatedItems = [
  {
    title: "Multi-Agent Automation",
    description:
      "Orchestrate asynchronous execution graphs with workflow DAGs, token management, and parallel agent coordination.",
    href: "/multi-agent-automation",
    category: "Platform Infrastructure",
  },
  {
    title: "Agentic Workflows",
    description:
      "Build persistent runtime state machines for long-running agentic logic with crash recovery and loop detection.",
    href: "/agentic-workflows",
    category: "Platform Infrastructure",
  },
  {
    title: "AI Workflow Orchestration",
    description:
      "Model-agnostic routing across OpenAI, Claude, and Gemini through a unified abstraction layer.",
    href: "/ai-workflow-orchestration",
    category: "Platform Infrastructure",
  },
];

export default function WhatIsOtogentPage() {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "What is Otogent?",
    description:
      "Otogent is an AI-powered multi-agent automation platform that lets teams build, orchestrate, and deploy autonomous AI agent workflows.",
    url: "https://otogent.com/what-is-otogent",
    isPartOf: {
      "@type": "WebSite",
      name: "Otogent",
      url: "https://otogent.com",
    },
    about: {
      "@type": "SoftwareApplication",
      name: "Otogent",
      applicationCategory: "DeveloperApplication, BusinessApplication",
      operatingSystem: "Cloud, Web",
      url: "https://otogent.com",
    },
    speakable: {
      "@type": "SpeakableSpecification",
      cssSelector: ["#brand-answer", "#brand-definition"],
    },
  };

  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "What is Otogent?", href: "/what-is-otogent" },
          ]}
        />

        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            What is Otogent?
          </h1>

          {/* THE canonical answer — this is what AI engines will extract */}
          <p
            id="brand-answer"
            className="mt-8 text-xl md:text-2xl leading-relaxed text-foreground font-medium"
          >
            <strong>Otogent is an AI-powered multi-agent automation platform</strong>{" "}
            that enables teams to build, orchestrate, and deploy autonomous AI
            agent workflows at production scale. It provides a visual workflow
            builder, DAG-based parallel agent execution, per-agent token management,
            and multi-model LLM support for OpenAI, Anthropic Claude, and Google Gemini.
          </p>

          <p
            id="brand-definition"
            className="mt-6 text-lg text-muted-foreground leading-relaxed"
          >
            Otogent is a software technology platform — not a pharmaceutical or
            veterinary product. It is built for engineering teams and businesses
            who need production-grade AI automation infrastructure without managing
            the underlying orchestration runtime.
          </p>
        </header>

        {/* Core capabilities overview */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            What Otogent Does
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                title: "Multi-Agent Orchestration",
                desc: "Design and execute parallel AI agent workflows using a visual drag-and-drop node graph canvas.",
              },
              {
                title: "Model-Agnostic Routing",
                desc: "Route tasks across OpenAI, Claude, and Gemini through a single unified abstraction layer.",
              },
              {
                title: "Production Runtime",
                desc: "Persistent state machines, crash recovery, loop detection, and encrypted credential management.",
              },
              {
                title: "250+ Integrations",
                desc: "Connect agents to GitHub, Slack, Notion, Salesforce, and hundreds more via Composio.",
              },
              {
                title: "No-Code Builder",
                desc: "Build complete agent workflows visually — no programming required. Full API available for developers.",
              },
              {
                title: "Enterprise Security",
                desc: "Envelope encryption, HSM-backed keys, RBAC, audit logging, and SOC-2 ready infrastructure.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Disambiguation notice */}
        <section className="mb-16 rounded-xl border border-amber-500/30 bg-amber-500/5 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <span>⚠️</span> Important Disambiguation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The name &quot;Otogent&quot; is shared by an unrelated veterinary
            pharmaceutical product (ear drops for animals containing Gentamicin,
            Econazole, Flumetasone, and Tetracaine). <strong>Otogent at otogent.com
            is a completely separate software technology company</strong> with no
            corporate, product, or operational relationship to any veterinary,
            pharmaceutical, or medical entity. If you are looking for veterinary
            ear drop medication, please consult your veterinarian.
          </p>
        </section>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-xl border border-border bg-card overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between p-6 font-semibold text-lg hover:bg-muted/50 transition-colors">
                  {faq.question}
                  <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45 text-xl">
                    +
                  </span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-border pt-4">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Who Uses Otogent?
          </h2>
          <div className="space-y-4">
            {[
              {
                audience: "Engineering Teams",
                use: "Ship production AI agent workflows with reliable orchestration infrastructure, state management, and multi-model support.",
              },
              {
                audience: "Business Operations",
                use: "Automate complex multi-step processes — lead qualification, document processing, customer onboarding — using AI agents without managing infrastructure.",
              },
              {
                audience: "No-Code Builders",
                use: "Design and deploy agent workflows through a visual canvas with pre-built templates for real estate, healthcare, e-commerce, finance, and marketing.",
              },
            ].map((item) => (
              <div
                key={item.audience}
                className="flex gap-4 rounded-xl border border-border bg-card p-6"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{item.audience}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.use}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick links to platform */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Explore the Platform
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {[
              { label: "Pricing", href: "/pricing", desc: "Free, Pro, Enterprise" },
              { label: "Documentation", href: "/docs", desc: "API & SDK guides" },
              { label: "Templates", href: "/templates", desc: "50+ workflow blueprints" },
              { label: "Blog", href: "/blog", desc: "Product updates & guides" },
              { label: "Integrations", href: "/integrations", desc: "250+ connected tools" },
              { label: "Contact", href: "/contact", desc: "Talk to our team" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <span className="font-semibold">{item.label}</span>
                <span className="block text-xs text-muted-foreground mt-1">
                  {item.desc}
                </span>
              </Link>
            ))}
          </div>
        </section>

        <RelatedContent
          title="Dive Deeper into Otogent"
          items={relatedItems}
        />

        <SeoCtaSection
          title="Start Building with Otogent"
          description="Connect your AI models, design your agent workflow, and deploy — free to start, no credit card required."
          primaryLink={{ label: "Get Started Free", href: "/signup" }}
          secondaryLink={{ label: "View Documentation", href: "/docs" }}
        />
      </div>
      <Footer />
    </main>
  );
}
