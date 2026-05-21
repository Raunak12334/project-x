import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface SeoCtaSectionProps {
  title: string;
  description: string;
  primaryLink: { label: string; href: string };
  secondaryLink?: { label: string; href: string };
}

export function SeoCtaSection({
  title,
  description,
  primaryLink,
  secondaryLink,
}: SeoCtaSectionProps) {
  return (
    <section className="my-16 py-16 px-6 bg-muted/30 rounded-3xl border border-border text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold tracking-tight mb-4">{title}</h2>
        <p className="text-muted-foreground mb-8 text-lg">{description}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={primaryLink.href}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 w-full sm:w-auto"
          >
            {primaryLink.label}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          {secondaryLink && (
            <Link
              href={secondaryLink.href}
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground w-full sm:w-auto"
            >
              {secondaryLink.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
