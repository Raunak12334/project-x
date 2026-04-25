"use client";

import { LayoutTemplateIcon, ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { workflowTemplates } from "@/features/templates/lib/workflow-templates";
import { cn } from "@/lib/utils";

export function TemplatesSection() {
  // Show 6 featured templates in the carousel
  const featuredTemplates = workflowTemplates.slice(0, 6);

  return (
    <section id="templates" className="py-24 bg-slate-50/50 dark:bg-slate-900/50 border-y border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
              <LayoutTemplateIcon className="size-4" />
              <span>Industry Blueprints</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
              Automation for Every Sector
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
              Don't start from scratch. Use our pre-built, sector-specific agentic workflows to scale your business today.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-2xl h-12 px-6 group border-slate-200 dark:border-slate-800 bg-background/50 backdrop-blur-sm">
            <Link href="/templates" className="flex items-center gap-2">
              View All Templates
              <ArrowRightIcon className="size-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
        
        {/* Horizontal Carousel */}
        <div className="relative group">
          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory no-scrollbar -mx-4 px-4">
            {featuredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="min-w-[300px] md:min-w-[380px] snap-start rounded-[28px] border-border/60 bg-background/60 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
              >
                <CardHeader className="border-b bg-muted/10 pb-4">
                  <Badge variant="secondary" className="w-fit bg-white/80 dark:bg-slate-800/80">{template.category}</Badge>
                  <h3 className="mt-2 text-lg font-bold truncate">
                    {template.name}
                  </h3>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3 min-h-[4.5rem]">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <Button asChild variant="ghost" size="sm" className="w-full rounded-xl text-primary hover:text-primary hover:bg-primary/5 transition-all group">
                    <Link href={`/templates/${template.slug}`}>
                      Preview Blueprint
                      <ArrowRightIcon className="size-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
            
            {/* View More Card */}
            <Link 
              href="/templates" 
              className="min-w-[200px] snap-start rounded-[28px] border border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center gap-4 group/more hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all"
            >
              <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 group-hover/more:scale-110 transition-transform">
                <ArrowRightIcon className="size-6 text-slate-400 dark:text-slate-500" />
              </div>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">Explore 50+ More</span>
            </Link>
          </div>
          
          {/* Subtle Fade Effect */}
          <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-slate-50/80 dark:from-slate-900/80 to-transparent pointer-events-none hidden md:block" />
        </div>
      </div>
      
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
