import { Bot, GitBranch, Layers, Link2, Shield, Zap } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Visual Workflow Builder",
    description:
      "Design complex agent pipelines with a drag-and-drop canvas. No code required to get started.",
  },
  {
    icon: Shield,
    title: "Secure Credential Management",
    description:
      "Store and manage your API keys with AES encryption. Your secrets stay yours.",
  },
  {
    icon: Bot,
    title: "Multi-Model Support",
    description:
      "Orchestrate OpenAI, Anthropic Claude, Google Gemini, and other leading LLM providers in a single workflow.",
  },
  {
    icon: Zap,
    title: "Real-Time Execution",
    description:
      "Monitor every step of your agent's run live. Debug faster, deploy with confidence.",
  },
  {
    icon: GitBranch,
    title: "Human-in-the-Loop",
    description:
      "Pause workflows for human approval before critical actions. Stay in control of every decision.",
  },
  {
    icon: Link2,
    title: "Trigger Anywhere",
    description:
      "Start workflows via HTTP, Stripe webhooks, Google Forms, Discord, Slack — or manually.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24">
      <div className="container">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-[0.3em] text-primary uppercase">
            Why Otogent
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-5xl">
            Everything you need to build production-ready AI workflows.
          </h2>
          <p className="mx-auto max-w-xl text-muted-foreground">
            From connectors to orchestration, Otogent handles the infrastructure
            so you can focus on outcomes.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="card-3d group rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/40"
            >
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
