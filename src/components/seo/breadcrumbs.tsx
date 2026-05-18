import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `https://otogent.com${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={item.href} className="flex items-center">
                {isLast ? (
                  <span
                    className="font-medium text-foreground"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <>
                    <Link
                      href={item.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {item.label}
                    </Link>
                    <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground/50" />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
