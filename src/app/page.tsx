import type { Metadata } from "next";
import { LandingPage } from "@/features/landing/components/landing-page";

export const metadata: Metadata = {
  title: "Otogent | Agentic Automation Infrastructure",
  description: "Otogent is an Agentic Automation Platform powered by Multi-Agent Infrastructure.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Otogent | Agentic Automation Infrastructure",
    description: "Otogent is an Agentic Automation Platform powered by Multi-Agent Infrastructure.",
    url: "https://www.otogent.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Otogent | Agentic Automation Infrastructure",
    description: "Otogent is an Agentic Automation Platform powered by Multi-Agent Infrastructure.",
  },
};

export default function Page() {
  return <LandingPage />;
}
