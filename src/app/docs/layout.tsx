import { ReactNode } from "react";
import { LandingNavbar } from "@/features/landing/components/landing-navbar";
import { Footer } from "@/features/landing/components/footer";
import Link from "next/link";
import { getDocs } from "./utils";

export default function DocsLayout({ children }: { children: ReactNode }) {
  const docs = getDocs();

  return (
    <div className="landing-theme min-h-screen bg-background text-foreground flex flex-col">
      <LandingNavbar />
      <div className="flex-1 container mx-auto py-8 md:py-12 flex flex-col md:flex-row gap-8 lg:gap-12 relative">
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
          <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
            <h3 className="font-semibold text-lg mb-4 text-foreground">Documentation</h3>
            <nav className="flex flex-col gap-3">
              <Link
                href="/docs"
                className="text-sm font-medium hover:text-primary transition-colors text-muted-foreground"
              >
                Overview
              </Link>
              {docs.map((doc) => (
                <Link
                  key={doc.slug}
                  href={`/docs/${doc.slug}`}
                  className="text-sm hover:text-primary transition-colors text-muted-foreground"
                >
                  {doc.title}
                </Link>
              ))}
            </nav>
          </div>
        </aside>
        
        {/* Main Content Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
