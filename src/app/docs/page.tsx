import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";

export const metadata: Metadata = {
  title: "Documentation | Otogent",
  description: "Comprehensive guides and API references for building with Otogent.",
  alternates: {
    canonical: "/docs",
  },
  openGraph: {
    title: "Documentation | Otogent",
    description: "Comprehensive guides and API references for building with Otogent.",
    url: "https://www.otogent.com/docs",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Documentation | Otogent",
    description: "Comprehensive guides and API references for building with Otogent.",
  },
};

export default function DocsPage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <LandingNavbar />
      <section className="flex-1 container py-32">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-center">Documentation</h1>
        <p className="mt-6 text-xl text-muted-foreground text-center max-w-2xl mx-auto">
          Explore our guides, API references, and developer resources to master multi-agent automation.
        </p>
      </section>
      <Footer />
    </main>
  );
}
