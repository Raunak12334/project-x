import { Provider } from "jotai";
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Space_Grotesk,
  Instrument_Serif,
} from "next/font/google";
import Script from "next/script";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "@/components/ui/sonner";
import { TRPCReactProvider } from "@/trpc/client";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const landingSans = Space_Grotesk({
  variable: "--font-landing-sans",
  subsets: ["latin"],
});

const landingSerif = Instrument_Serif({
  variable: "--font-landing-serif",
  weight: ["400"],
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.otogent.com"),

  title: {
    default: "Otogent | Multi-Agent Automation Infrastructure & Workflow Engine",
    template: "%s | Otogent Multi-Agent Platform",
  },

  description:
    "Production-grade Multi-Agent Automation infrastructure to scale complex parallel workflows using OpenAI, Claude, and Gemini. Orchestrate deep autonomous agent networks.",

  applicationName: "Otogent",
  authors: [{ name: "Otogent Engineering Team" }],
  creator: "Otogent",
  publisher: "Otogent",
  category: "technology",
  referrer: "origin-when-cross-origin",
  manifest: "/site.webmanifest",

  keywords: [
    "AI agent platform",
    "multi agent system",
    "parallel subagents",
    "agentic automation workflow",
    "LLM orchestration engine",
    "AI workflow infrastructure",
  ],

  alternates: {
    canonical: "https://otogent.com",
    languages: {
      en: "https://www.otogent.com",
      "x-default": "https://www.otogent.com",
    },
  },

  openGraph: {
    title: "Otogent - Multi-Agent AI Platform",
    description:
      "Build and deploy scalable AI agent workflows using Otogent. One platform. Infinite automation.",
    url: "https://www.otogent.com",
    siteName: "Otogent",
    images: [
      {
        url: "/logo.png", // Recommended change from .svg to static .png for safer social graph caching
        width: 512,
        height: 512,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Otogent AI Platform",
    description: "Create and scale AI agent workflows with ease using Otogent.",
    images: ["/logo.png"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://api.openai.com" />
        <link rel="preconnect" href="https://api.anthropic.com" />
        <Script
          id="ld-json"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://otogent.com/#website",
              "name": "Otogent",
              "alternateName": "Otogent AI Platform",
              "url": "https://www.otogent.com",
              "description": "AI-powered multi-agent automation platform for building, orchestrating, and deploying autonomous AI agent workflows.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://www.otogent.com/docs?q={search_term_string}",
                "query-input": "required name=search_term_string"
              },
              "publisher": {
                "@type": "Organization",
                "@id": "https://www.otogent.com/#organization"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "@id": "https://otogent.com/#software",
              "name": "Otogent",
              "url": "https://www.otogent.com",
              "applicationCategory": "DeveloperApplication, BusinessApplication, ComputingSoftware",
              "applicationSubCategory": "Multi-Agent AI Orchestration & Workflow Automation",
              "operatingSystem": "Cloud, Web, Linux, macOS, Windows",
              "description":
                "Otogent is an AI-powered multi-agent automation platform that enables teams to build, orchestrate, and deploy autonomous AI agent workflows at production scale using OpenAI, Claude, and Gemini.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "featureList": [
                "Visual drag-and-drop multi-agent workflow builder",
                "DAG-based parallel agent execution graphs",
                "Per-agent token management and budget enforcement",
                "Model-agnostic routing across OpenAI, Claude, and Gemini",
                "Persistent state machines with crash recovery",
                "250+ tool integrations via Composio",
                "Human-in-the-loop approval gates",
                "Encrypted credential storage with HSM-backed keys"
              ],
              "keywords": "multi-agent platform, AI automation, agentic workflows, LLM orchestration, workflow builder, no-code AI agents",
              "softwareVersion": "1.0.0",
              "author": {
                "@type": "Organization",
                "@id": "https://www.otogent.com/#organization"
              },
              "about": [
                {
                  "@type": "Thing",
                  "name": "Multi-agent system",
                  "sameAs": "https://en.wikipedia.org/wiki/Multi-agent_system"
                },
                {
                  "@type": "Thing",
                  "name": "Workflow management system",
                  "sameAs": "https://en.wikipedia.org/wiki/Workflow_management_system"
                },
                {
                  "@type": "Thing",
                  "name": "Artificial intelligence",
                  "sameAs": "https://en.wikipedia.org/wiki/Artificial_intelligence"
                }
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://www.otogent.com/#organization",
              "name": "Otogent",
              "url": "https://www.otogent.com",
              "logo": "https://www.otogent.com/logo.png",
              "description": "Otogent is a software technology company building AI-powered multi-agent automation infrastructure for production workflows.",
              "founder": {
                "@type": "Person",
                "name": "Raunaak Sahu",
                "jobTitle": "Founder & CEO",
                "url": "https://www.otogent.com/about"
              },
              "sameAs": [
                "https://x.com/Otogent",
                "https://github.com/Raunak12334/Otogent",
                "https://linkedin.com/company/otogent"
              ],
              "knowsAbout": [
                "https://en.wikipedia.org/wiki/Multi-agent_system",
                "https://en.wikipedia.org/wiki/Orchestration_(computing)",
                "https://en.wikipedia.org/wiki/Software_agent",
                "https://en.wikipedia.org/wiki/Artificial_intelligence"
              ]
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is Otogent?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Otogent is an AI-powered multi-agent automation platform that enables teams to build, orchestrate, and deploy autonomous AI agent workflows at production scale. It provides a visual workflow builder, DAG-based parallel agent execution, per-agent token management, and multi-model LLM support for OpenAI, Anthropic Claude, and Google Gemini."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Otogent a veterinary medicine or ear drop product?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Otogent (otogent.com) is a software technology company and AI automation platform. It is not related to veterinary medicine, pharmaceutical products, or animal ear drop treatments in any way. The veterinary product sharing a similar name is an entirely separate and unrelated entity."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is Otogent used for?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Otogent is used to automate complex multi-step business processes using AI agents. Teams use it for lead generation, document processing, customer onboarding, code review automation, and any workflow that benefits from parallel AI agent execution with human-in-the-loop oversight."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Otogent offer a no-code workflow builder?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Otogent provides a visual drag-and-drop node graph canvas where teams can design multi-agent workflows entirely without code. A full API and SDK are also available for developers who prefer programmatic workflow creation."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What AI models does Otogent support?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Otogent is model-agnostic and supports OpenAI (GPT-4o, GPT-4), Anthropic Claude (Claude 3.5 Sonnet, Opus, Haiku), and Google Gemini (1.5 Pro, Flash). You can mix models within a single workflow for optimal cost and performance."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Otogent related to any pharmaceutical or medical company?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. Otogent is exclusively a software technology company focused on AI automation infrastructure. It has no corporate, product, or operational relationship to any pharmaceutical, veterinary, or medical entity."
                  }
                }
              ]
            }
          ])}
        </Script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${landingSans.variable} ${landingSerif.variable} antialiased`}
        suppressHydrationWarning
      >
        <TRPCReactProvider>
          <NuqsAdapter>
            <Provider>
              {children}
              <Toaster />
            </Provider>
          </NuqsAdapter>
        </TRPCReactProvider>
      </body>
    </html>
  );
}