import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface RelatedItem {
  title: string;
  description: string;
  href: string;
  category?: string;
}

export interface RelatedContentProps {
  title?: string;
  items: RelatedItem[];
}

export function RelatedContent({
  title = "Related Content",
  items,
}: RelatedContentProps) {
  if (!items || items.length === 0) return null;

  return (
    <section className="mt-16 border-t border-border pt-12">
      <h2 className="text-2xl font-semibold mb-6 tracking-tight">{title}</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group block rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
          >
            {item.category && (
              <span className="text-xs font-medium text-primary mb-3 block">
                {item.category}
              </span>
            )}
            <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {item.description}
            </p>
            <div className="flex items-center text-sm font-medium text-primary mt-auto">
              Read more
              <ArrowRight className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
