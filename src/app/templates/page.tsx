import { TemplatesLibrary } from "@/features/templates/components/templates-library";
import { Metadata } from "next";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppHeader } from "@/components/app-header";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "AI Automation Templates | Otogent Library",
  description: "Browse high-quality AI automation templates for Real Estate, Healthcare, E-commerce, Finance, and more. Scale your business with Otogent's agentic workflows.",
  keywords: [
    "AI automation templates",
    "Real Estate AI automation",
    "Healthcare automation workflows",
    "Finance AI agents",
    "Marketing automation templates",
    "Legal AI summarizer",
    "HR resume screener",
    "SaaS roadmap prioritizer"
  ],
  openGraph: {
    title: "AI Automation Templates for Every Sector | Otogent",
    description: "Ready-to-use AI workflows for Real Estate, Healthcare, Finance, and more.",
    type: "website",
    url: "https://otogent.com/templates",
  }
};

export default async function PublicTemplatesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // If user is logged in, show the sidebar AND header to keep the dashboard flow perfectly intact
  if (session) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-slate-50/50 dark:bg-slate-950/50 flex flex-col">
          <AppHeader />
          <div className="flex-1 overflow-auto">
            <TemplatesLibrary />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // If not logged in, show a clean public view (SEO optimized)
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/30 dark:bg-slate-950/30">
      <TemplatesLibrary />
    </div>
  );
}
