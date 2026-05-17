import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";

export const metadata: Metadata = {
  title: "Features | Otogent",
  description: "Explore the powerful features of Otogent's Multi-Agent Automation Platform.",
  alternates: {
    canonical: "/features",
  },
  openGraph: {
    title: "Features | Otogent",
    description: "Explore the powerful features of Otogent's Multi-Agent Automation Platform.",
    url: "https://www.otogent.com/features",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Features | Otogent",
    description: "Explore the powerful features of Otogent's Multi-Agent Automation Platform.",
  },
};

export default function FeaturesPage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <LandingNavbar />
      <section className="flex-1 container py-32">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-center">Features</h1>
        <p className="mt-6 text-xl text-muted-foreground text-center max-w-2xl mx-auto">
          Discover how our multi-agent architecture can automate your most complex workflows with ease.
        </p>
      </section>
      <Footer />
    </main>
  );
}
