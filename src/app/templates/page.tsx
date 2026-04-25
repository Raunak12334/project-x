import { TemplatesLibrary } from "@/features/templates/components/templates-library";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Automation Templates | Otogent Library",
  description: "Browse high-quality AI automation templates for Real Estate, Healthcare, E-commerce, Finance, and more. Scale your business with Otogent's agentic workflows.",
  keywords: [
    "AI automation templates",
    "Real Estate AI automation",
    "Healthcare automation workflows",
    "Finance AI agents",
    "Marketing automation templates",
    "Legal AI summarizer",
    "HR resume screener",
    "SaaS roadmap prioritizer"
  ],
  openGraph: {
    title: "AI Automation Templates for Every Sector | Otogent",
    description: "Ready-to-use AI workflows for Real Estate, Healthcare, Finance, and more.",
    type: "website",
    url: "https://otogent.com/templates",
  }
};

export default function PublicTemplatesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30 dark:bg-slate-950/30">
      <TemplatesLibrary />
    </div>
  );
}
