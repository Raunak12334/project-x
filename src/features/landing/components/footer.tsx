import Link from "next/link";
import { BrandLockup } from "@/components/brand-lockup";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Integrations", href: "/integrations" },
      { label: "Templates", href: "/templates" },
    ],
  },
  {
    title: "Platform Infrastructure",
    links: [
      { label: "Multi-Agent Automation", href: "/multi-agent-automation" },
      { label: "Agentic Workflows", href: "/agentic-workflows" },
      { label: "AI Workflow Orchestration", href: "/ai-workflow-orchestration" },
      { label: "Autonomous Execution Systems", href: "/autonomous-execution" },
      { label: "Workflow Infrastructure", href: "/workflow-infrastructure" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "Community", href: "/community" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border py-16">
      <div className="container">
        <div className="grid items-start gap-10 sm:grid-cols-2 lg:grid-cols-6">
          <div className="self-start lg:col-span-2">
            <BrandLockup
              imageSize={24}
              className="mb-3"
              textClassName="font-brand font-bold"
            />
            <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
              Infrastructure for multi-agent systems. Connect, orchestrate, and
              scale AI agents. Build robust autonomous workflows for your business.
            </p>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="self-start">
              <h4 className="text-sm font-semibold mb-4">{column.title}</h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} Otogent. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
