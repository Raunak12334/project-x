import { Provider } from "jotai";
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Instrument_Serif,
  Space_Grotesk,
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
  metadataBase: new URL("https://otogent.com"),

  title: {
    default:
      "Otogent | Multi-Agent Automation Platform & No-Code Workflow Builder",
    template: "%s | Otogent Multi-Agent Platform",
  },

  description:
    "Otogent is the leading Multi-Agent Automation Platform to build and scale complex workflows using OpenAI, Anthropic Claude, and Google Gemini. No-code orchestration for intelligent agent teams.",

  applicationName: "Otogent",
  authors: [{ name: "Otogent" }],
  creator: "Otogent",
  publisher: "Otogent",
  category: "technology",
  referrer: "origin-when-cross-origin",
  manifest: "/site.webmanifest",

  keywords: [
    "AI agent platform",
    "multi agent system",
    "AI workflow builder",
    "OpenAI integration",
    "Anthropic AI",
    "Gemini AI",
    "AI automation platform",
  ],

  alternates: {
    canonical: "/",
    languages: {
      en: "https://otogent.com",
      "x-default": "https://otogent.com",
    },
  },

  openGraph: {
    title: "Otogent - Multi-Agent AI Platform",
    description:
      "Build and deploy scalable AI agent workflows using Otogent. One platform. Infinite automation.",
    url: "https://otogent.com",
    siteName: "Otogent",
    images: [
      {
        url: "/logo.svg",
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
    images: ["/logo.svg"],
  },

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },

  verification: {
    google: "your-google-verification-code",
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
              "@type": "SoftwareApplication",
              "name": "Otogent",
              "url": "https://otogent.com",
              "applicationCategory": "AutomationSoftware",
              "applicationSubCategory": "Multi-Agent AI Orchestration",
              "operatingSystem": "Web",
              "description":
                "Otogent is a high-performance Multi-Agent Automation Platform that enables businesses to build, orchestrate, and deploy complex AI workflows using multiple agents. It integrates seamlessly with OpenAI GPT-4, Anthropic Claude 3.5, and Google Gemini.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.9",
                "reviewCount": "128"
              },
              "featureList": [
                "Multi-agent workflow orchestration",
                "Visual drag-and-drop canvas builder",
                "State management for long-running agents",
                "Secure API credential management",
                "Native integrations with OpenAI, Anthropic, and Gemini",
                "Sector-specific automation blueprints",
                "Human-in-the-loop validation nodes"
              ],
              "keywords": "multi-agent system, AI automation platform, LLM orchestration, agentic workflows, no-code AI builder, autonomous agents",
              "softwareVersion": "1.0.0",
              "author": {
                "@type": "Organization",
                "name": "Otogent",
                "logo": "https://otogent.com/logo.svg"
              }
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is Otogent Multi-Agent Automation?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Otogent is the leading platform for building and orchestrating multi-agent automation workflows. Unlike simple chatbots, Otogent allows multiple intelligent agents to work together on complex business tasks, similar to a digital workforce."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How does Otogent compare to Zapier?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Zapier is for simple 'if this, then that' app connections. Otogent is a multi-agent orchestration engine. It handles complex, multi-step reasoning, long-running agent states, and autonomous decision-making that simple automation tools cannot."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Otogent an alternative to n8n for AI?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Otogent is the specialized multi-agent alternative to n8n. While n8n is a general-purpose workflow tool, Otogent is built from the ground up for agentic workflows, featuring native support for shared memory and multi-model collaboration."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Which AI models does Otogent support?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Otogent supports the industry's leading LLMs, including OpenAI (GPT-4), Anthropic (Claude 3.5), and Google (Gemini 1.5). You can even mix and match different models within a single multi-agent workflow."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Otogent a no-code platform?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Otogent features a visual, drag-and-drop canvas that allows business users to build production-ready multi-agent automations without writing a single line of code."
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
