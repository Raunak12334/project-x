import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "Otogent | Multi-Agent Automation Platform",
  description: "Otogent is an Agentic Automation Platform powered by Multi-Agent Infrastructure.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Otogent | Multi-Agent Automation Platform",
    description: "Agentic Multi Agent Automation Infrastructure for modern businesses.",
    url: "https://www.otogent.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Otogent | Multi-Agent Automation Platform",
    description: "Agentic Multi Agent Automation Infrastructure for modern businesses.",
  },
};

export default function Page() {
  return <LandingPage />;
}
