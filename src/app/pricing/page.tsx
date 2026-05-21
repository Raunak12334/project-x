import type { Metadata } from "next";
import { PricingTable } from "./pricing-table";

export const metadata: Metadata = {
  title: "Pricing | Otogent",
  description: "Simple, transparent pricing for Otogent's Multi-Agent Automation Platform.",
  alternates: {
    canonical: "/pricing",
  },
  openGraph: {
    title: "Pricing | Otogent",
    description: "Simple, transparent pricing for Otogent's Multi-Agent Automation Platform.",
    url: "https://www.otogent.com/pricing",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Otogent",
    description: "Simple, transparent pricing for Otogent's Multi-Agent Automation Platform.",
  },
};

export default function PricingPage() {
  return <PricingTable />;
}
