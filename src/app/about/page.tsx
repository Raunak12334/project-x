import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Breadcrumbs } from "@/components/seo/breadcrumbs";

export const metadata: Metadata = {
  title: "About Otogent | AI Automation Company & Mission",
  description:
    "Otogent is a software technology company building the AI-powered multi-agent automation platform. Learn about our mission, vision, and the team behind the platform.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Otogent | AI Automation Company & Mission",
    description:
      "Otogent is a software technology company building the AI-powered multi-agent automation platform. Learn about our mission and vision.",
    url: "https://www.otogent.com/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Otogent | AI Automation Company & Mission",
    description:
      "Otogent is a software technology company building the AI-powered multi-agent automation platform.",
  },
};

export default function AboutPage() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "https://www.otogent.com/#organization",
    name: "Otogent",
    url: "https://www.otogent.com",
    logo: "https://www.otogent.com/logo.png",
    description:
      "Otogent is a software technology company building AI-powered multi-agent automation infrastructure for production workflows. Not affiliated with any pharmaceutical or veterinary entity.",
    foundingDate: "2025",
    founder: {
      "@type": "Person",
      name: "Raunaak Sahu",
      jobTitle: "Founder & CEO",
      url: "https://www.otogent.com/about",
    },
    sameAs: [
      "https://x.com/Otogent",
      "https://github.com/Raunak12334/Otogent",
      "https://www.linkedin.com/company/otogent",
    ],
    knowsAbout: [
      "Multi-agent systems",
      "AI workflow orchestration",
      "Large language model automation",
      "Agentic AI infrastructure",
    ],
  };

  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />
      <LandingNavbar />
      <div className="flex-1 container py-24 max-w-4xl mx-auto">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ]}
        />

        <header className="mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            About Otogent
          </h1>
          <p className="mt-6 text-xl text-muted-foreground leading-relaxed max-w-3xl">
            Otogent is a software technology company building the intelligent
            orchestration layer for the modern AI-powered internet. We create
            infrastructure that enables teams to deploy autonomous AI agent
            workflows at production scale.
          </p>
        </header>

        {/* Mission */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            AI agents are transforming how software gets built, how businesses
            operate, and how decisions get made. But deploying agents in
            production today is painful — teams wrestle with state management,
            model routing, token budgets, credential security, and orchestration
            plumbing instead of focusing on the automation logic that matters.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Otogent exists to solve that. We&apos;re building a platform where
            anyone — from senior engineers to business operations teams — can
            design, deploy, and scale multi-agent AI workflows without managing
            the underlying infrastructure. Our goal is to make production-grade
            agent orchestration as simple as drawing a flowchart.
          </p>
        </section>

        {/* What we build */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">What We Build</h2>
          <div className="space-y-6">
            {[
              {
                title: "Multi-Agent Automation Platform",
                desc: "A visual workflow builder for designing, deploying, and monitoring parallel AI agent execution graphs. Support for any LLM — OpenAI, Claude, Gemini — through a single unified interface.",
              },
              {
                title: "Production Runtime Infrastructure",
                desc: "Persistent state machines, crash recovery, execution loop detection, encrypted credential storage, and human-in-the-loop approval gates. Infrastructure built for workflows that run for hours, not seconds.",
              },
              {
                title: "Enterprise Integration Layer",
                desc: "250+ tool integrations via Composio — GitHub, Slack, Notion, Salesforce, and more. Webhook-driven triggers, scheduled automation, and a full API/SDK for programmatic control.",
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

        {/* Founder */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">Leadership</h2>
          <div className="rounded-xl border border-border bg-card p-8">
            <div className="flex items-start gap-6">
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-border flex items-center justify-center">
                <span className="text-3xl font-black text-primary">RS</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">Raunaak Sahu</h3>
                <p className="text-sm font-medium text-primary mb-3">
                  Founder &amp; CEO
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Building the intelligent orchestration layer for the
                  AI-powered internet. Focused on making production-grade
                  multi-agent automation accessible to every engineering team
                  and business.
                </p>
                <div className="flex gap-4 mt-4">
                  <a
                    href="https://x.com/Otogent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    X / Twitter →
                  </a>
                  <a
                    href="https://www.linkedin.com/company/otogent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    LinkedIn →
                  </a>
                  <a
                    href="https://github.com/Raunak12334/Otogent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    GitHub →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology vision */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Technology Vision
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We believe the future of software is agentic — systems that reason,
            plan, and act autonomously to accomplish complex goals. This shift
            requires a new category of infrastructure: orchestration platforms
            purpose-built for AI agents, not retrofitted from traditional
            workflow tools.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Otogent is designed from the ground up for this reality. Our platform
            handles the hard problems of agent orchestration — parallel execution,
            state persistence, model routing, token economics, security — so
            teams can focus on building the automation that moves their business
            forward.
          </p>
        </section>

        {/* Built with */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold tracking-tight mb-6">
            Built With
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {[
              "Next.js & TypeScript",
              "Prisma & PostgreSQL",
              "Temporal Workflows",
              "LangGraph",
              "OpenAI, Claude & Gemini",
              "Composio Integrations",
            ].map((tech) => (
              <div
                key={tech}
                className="rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium"
              >
                {tech}
              </div>
            ))}
          </div>
        </section>

        {/* Disambiguation */}
        <section className="mb-16 rounded-xl border border-amber-500/30 bg-amber-500/5 p-8">
          <h2 className="text-xl font-bold tracking-tight mb-4 flex items-center gap-2">
            <span>ℹ️</span> Note on Name Disambiguation
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Otogent (otogent.com) is a software technology company focused
            exclusively on AI automation infrastructure. We are not affiliated
            with, nor related to, any veterinary, pharmaceutical, or medical
            product bearing a similar name. If you are seeking information about
            veterinary ear drop treatments, please consult your veterinarian.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center py-12">
          <h2 className="text-3xl font-black tracking-tight mb-4">
            Ready to Automate with AI Agents?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
            Join engineering teams and businesses already using Otogent to build
            production AI workflows. Free to start.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              href="/what-is-otogent"
              className="inline-flex items-center rounded-lg border border-border px-6 py-3 font-semibold hover:bg-muted/50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
