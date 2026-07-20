import type { Metadata } from "next";
import Link from "next/link";
import { getDocs } from "./utils";
import { ArrowRight, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "Documentation | Otogent",
  description: "Comprehensive guides and API references for building with Otogent.",
  alternates: {
    canonical: "/docs",
  },
};

export default function DocsPage() {
  const docs = getDocs();

  return (
    <div className="py-8">
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
          Documentation
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Explore our guides, API references, and developer resources to master multi-agent automation.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {docs.map((doc) => (
          <Link
            key={doc.slug}
            href={`/docs/${doc.slug}`}
            className="group relative overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/50 flex flex-col"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight mb-2 group-hover:text-primary transition-colors">
              {doc.title}
            </h2>
            <p className="text-muted-foreground line-clamp-2 mb-4 flex-1">
              {doc.description || "Read the documentation for detailed insights."}
            </p>
            <div className="flex items-center text-sm font-medium text-primary mt-auto">
              Read more
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
