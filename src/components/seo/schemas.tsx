import React from "react";

export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function OrganizationSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Otogent",
    url: "https://otogent.com",
    logo: "https://otogent.com/logo.png",
    description: "Multi-Agent Automation Platform and Agentic Workflow Infrastructure.",
    sameAs: [
      "https://x.com/Otogent",
      "https://github.com/Raunak12334/Otogent",
      "https://linkedin.com/company/otogent"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function SoftwareAppSchema({
  name,
  description,
  category = "BusinessApplication",
}: {
  name: string;
  description: string;
  category?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: name,
    operatingSystem: "Web",
    applicationCategory: category,
    description: description,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function TechArticleSchema({
  headline,
  description,
  url,
  datePublished = "2026-05-22",
  dateModified = "2026-05-22",
}: {
  headline: string;
  description: string;
  url: string;
  datePublished?: string;
  dateModified?: string;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline,
    description,
    url,
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      name: "Otogent",
      url: "https://otogent.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Otogent",
      url: "https://otogent.com",
      logo: {
        "@type": "ImageObject",
        url: "https://otogent.com/logo.png",
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
