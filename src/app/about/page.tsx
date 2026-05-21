import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";

export const metadata: Metadata = {
  title: "About Us | Otogent",
  description: "Learn more about Otogent, our mission, and the team building the future of AI automation.",
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "About Us | Otogent",
    description: "Learn more about Otogent, our mission, and the team building the future of AI automation.",
    url: "https://www.otogent.com/about",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Us | Otogent",
    description: "Learn more about Otogent, our mission, and the team building the future of AI automation.",
  },
};

export default function AboutPage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <LandingNavbar />
      <section className="flex-1 container py-32">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-center">About Us</h1>
        <p className="mt-6 text-xl text-muted-foreground text-center max-w-2xl mx-auto">
          We are building the intelligent orchestration layer for the modern internet.
        </p>
      </section>
      <Footer />
    </main>
  );
}
