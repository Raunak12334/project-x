import { Provider } from "jotai";
import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
  Quattrocento,
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

const landingSerif = Quattrocento({
  variable: "--font-landing-serif",
  weight: ["400", "700"],
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
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Otogent",
            url: "https://otogent.com",
            applicationCategory: "AI Platform",
            operatingSystem: "Web",
            description:
              "All-in-one AI agent platform for building and managing multi-agent workflows to automate repetitive tasks.",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Multi-agent workflow builder",
              "OpenAI integration",
              "Anthropic integration",
              "Gemini integration",
              "No-code AI automation",
            ],
          })}
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
