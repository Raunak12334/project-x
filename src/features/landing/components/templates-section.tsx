"use client";

import { TemplatesLibrary } from "@/features/templates/components/templates-library";

export function TemplatesSection() {
  return (
    <section id="templates" className="py-24 bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-200/50 dark:border-slate-800/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
            Automation Templates for Every Sector
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Get started in seconds with professional, sector-specific agentic workflows. 
            From Real Estate to Healthcare, we've got you covered.
          </p>
        </div>
        
        <div className="rounded-[32px] border bg-background/50 backdrop-blur-sm shadow-xl overflow-hidden">
          <TemplatesLibrary />
        </div>
      </div>
    </section>
  );
}
