import { CTASection } from "@/features/landing/components/cta-section";
import { FAQSection } from "@/features/landing/components/faq-section";
import { FeaturesSection } from "@/features/landing/components/features-section";
import { Footer } from "@/features/landing/components/footer";
import { HeroSection } from "@/features/landing/components/hero-section";
import { HowItWorksSection } from "@/features/landing/components/how-it-works-section";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { PricingSection } from "@/features/landing/components/pricing-section";
import { TemplatesSection } from "@/features/landing/components/templates-section";

export function LandingPage() {
  return (
    <div className="landing-theme min-h-screen bg-background text-foreground">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TemplatesSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
