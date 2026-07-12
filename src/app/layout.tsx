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
    icon: "/fevicon.ico",
    shortcut: "/fevicon.ico",
    apple: "/logo.png",
  },
  // The verification block is removed because your DNS records handle ownership perfectly!
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
              "@id": "https://otogent.com/#software",
              "name": "Otogent",
              "url": "https://www.otogent.com",
              "applicationCategory": "DeveloperApplication, BusinessApplication, ComputingSoftware",
              "applicationSubCategory": "Multi-Agent AI Orchestration & Workflow Automation",
              "operatingSystem": "Cloud, Web, Linux, macOS, Windows",
              "description":
                "Otogent is an enterprise-grade Multi-Agent Automation Infrastructure platform enabling software engineers and teams to build, track, and execute parallel autonomous AI subagent networks. Native runtime loops integrated across primary LLM ecosystems.",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD",
                "availability": "https://schema.org/InStock"
              },
              "featureList": [
                "Multi-agent workflow orchestration infrastructure",
                "Parallel subagent task splitters",
                "State management & visual canvas graph builders",
                "Secure API key credential storage pipelines",
                "Native model adapters for OpenAI, Anthropic, and Gemini"
              ],
              "keywords": "multi-agent infrastructure, agentic orchestration layer, parallel workflow automation, LLM state manager",
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
              "description": "An enterprise technology platform building AI orchestration layers and runtime execution code environments.",
              "knowsAbout": [
                "https://en.wikipedia.org/wiki/Multi-agent_system",
                "https://en.wikipedia.org/wiki/Orchestration_(computing)",
                "https://en.wikipedia.org/wiki/Software_agent"
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
                    "text": "Otogent is an AI workflow orchestration architecture designed to manage multiple autonomous agents handling complex software tasks in parallel loops."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Does Otogent offer a no-code engine?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, Otogent couples a powerful technical multi-agent runtime layer with an intuitive visual node-graph editor canvas for zero-code deployments."
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