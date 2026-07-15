import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "Otogent | AI-Powered Multi-Agent Automation Platform",
  description:
    "Otogent is an AI-powered multi-agent automation platform. Build, orchestrate, and deploy autonomous AI agent workflows using OpenAI, Claude, and Gemini. Visual no-code builder, DAG execution, 250+ integrations.",
  keywords: [
    "Otogent",
    "Otogent AI",
    "Otogent platform",
    "multi-agent automation",
    "AI agent platform",
    "AI workflow builder",
    "agentic automation",
    "LLM orchestration",
    "no-code AI agents",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Otogent — AI-Powered Multi-Agent Automation Platform",
    description:
      "Build and deploy autonomous AI agent workflows at production scale. Visual builder, multi-model support (OpenAI, Claude, Gemini), 250+ integrations.",
    url: "https://www.otogent.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Otogent — AI-Powered Multi-Agent Automation Platform",
    description:
      "Build and deploy autonomous AI agent workflows at production scale. Visual builder, multi-model support, 250+ integrations.",
  },
};


export default function Page() {
  return <LandingPage />;
}
