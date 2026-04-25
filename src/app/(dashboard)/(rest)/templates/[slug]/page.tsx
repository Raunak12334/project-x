import { Metadata } from "next";
import { notFound } from "next/navigation";
import { 
  type WorkflowTemplateDefinition,
  workflowTemplates, 
  getWorkflowTemplateBySlug 
} from "@/features/templates/lib/workflow-templates";
import { TemplateCta } from "@/features/templates/components/template-cta";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  CheckCircle2Icon, 
  ArrowRightIcon, 
  LayersIcon, 
  CpuIcon,
  SearchIcon
} from "lucide-react";
import Link from "next/link";
import { getNodeCatalogItem } from "@/config/node-catalog";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return workflowTemplates.map((template) => ({
    slug: template.slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const template = getWorkflowTemplateBySlug(slug);

  if (!template) return {};

  const title = template.seoTitle || `${template.name} Multi-Agent Automation Template | Otogent`;
  const description = template.seoDescription || 
    `${template.description} Automate ${template.category} tasks with this no-code multi-agent blueprint. ${template.benefits?.join(" ") || ""}`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://otogent.com/templates/${slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://otogent.com/templates/${slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    }
  };
}

export default async function TemplateDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const template = getWorkflowTemplateBySlug(slug);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!template) {
    notFound();
  }

  // Get related templates
  const relatedTemplates = workflowTemplates
    .filter(t => t.category === template.category && t.id !== template.id)
    .slice(0, 3);

  // Tools used (Unique node types)
  const tools = Array.from(new Set(template.nodes.map(n => n.type)))
    .map(type => getNodeCatalogItem(type))
    .filter(Boolean);

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": template.name,
    "description": template.description,
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="container mx-auto py-12 px-4 max-w-5xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col gap-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-3 py-1">
                {template.category} Template
              </Badge>
              {template.isPremium && <Badge variant="default" className="bg-amber-500">PRO</Badge>}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              {template.name}
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              {template.description}
            </p>
            <div className="pt-4">
              <TemplateCta 
                templateId={template.id} 
                templateSlug={template.slug!} 
                isLoggedIn={!!session} 
              />
            </div>
          </div>
          
          <div className="w-full md:w-80 p-6 rounded-[32px] border bg-slate-50/50 dark:bg-slate-900/50 flex flex-col gap-6">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Main Tools</p>
              <div className="flex flex-wrap gap-2">
                {tools.map((tool) => {
                  if (!tool) return null;
                  const Icon = tool.icon;
                  return (
                    <div key={tool.label} className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border shadow-sm">
                      {Icon && <Icon className="size-4" />}
                      <span className="text-xs font-medium">{tool.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8 border-t">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <SearchIcon className="size-6 text-primary" />
                What this automation does
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg text-slate-600 dark:text-slate-400">
                  {template.useCase || `This automated blueprint allows businesses to streamline their ${template.category.toLowerCase()} operations using agentic AI workflows. By orchestrating multi-agent systems, it handles repetitive tasks with high precision.`}
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <LayersIcon className="size-6 text-primary" />
                How it works
              </h2>
              <div className="grid gap-4">
                {(template.steps || template.nodes.map((n, i) => `Step ${i + 1}: ${getNodeCatalogItem(n.type)?.label || n.type} task execution`)).map((step, idx) => (
                  <div key={idx} className="flex gap-4 p-4 rounded-2xl border bg-background hover:border-primary/30 transition-colors group">
                    <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <CheckCircle2Icon className="size-6 text-primary" />
                Key Benefits
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {(template.benefits || [
                  "Eliminate manual data entry",
                  "Scale operations without adding headcount",
                  "Ensure 100% consistency in task execution",
                  "Instant response times for critical events"
                ]).map((benefit, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-transparent">
                    <div className="size-5 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mt-0.5 shrink-0">
                      <CheckCircle2Icon className="size-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">{benefit}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar / Related */}
          <div className="space-y-8">
            <div className="p-6 rounded-[32px] border bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
              <h3 className="text-xl font-bold mb-4">Start using this template</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                Click below to instantly create this workflow in your dashboard. You can customize every step after creation.
              </p>
              <TemplateCta 
                templateId={template.id} 
                templateSlug={template.slug!} 
                isLoggedIn={!!session} 
              />
            </div>

            {relatedTemplates.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold">Related Blueprints</h3>
                <div className="grid gap-4">
                  {relatedTemplates.map((t) => (
                    <Link 
                      key={t.id} 
                      href={`/templates/${t.slug}`}
                      className="group p-4 rounded-2xl border bg-background hover:border-primary/50 transition-all shadow-sm hover:shadow-md"
                    >
                      <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">{t.category}</p>
                      <h4 className="font-bold group-hover:text-primary transition-colors line-clamp-1">{t.name}</h4>
                      <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                        <span>Learn more</span>
                        <ArrowRightIcon className="size-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
