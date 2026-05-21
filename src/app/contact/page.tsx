import type { Metadata } from "next";
import { Footer } from "@/features/landing/components/footer";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";

export const metadata: Metadata = {
  title: "Contact | Otogent",
  description: "Get in touch with the Otogent team for support, enterprise inquiries, and partnerships.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Otogent",
    description: "Get in touch with the Otogent team for support, enterprise inquiries, and partnerships.",
    url: "https://www.otogent.com/contact",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact | Otogent",
    description: "Get in touch with the Otogent team for support, enterprise inquiries, and partnerships.",
  },
};

export default function ContactPage() {
  return (
    <main className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <LandingNavbar />
      <section className="flex-1 container py-32">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-center">Contact Us</h1>
        <p className="mt-6 text-xl text-muted-foreground text-center max-w-2xl mx-auto">
          Have a question or need help scaling your workflows? We'd love to hear from you.
        </p>
      </section>
      <Footer />
    </main>
  );
}
