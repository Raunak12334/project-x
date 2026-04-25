"use client";

import { LayoutTemplateIcon, SearchIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useDeferredValue, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getNodeCatalogItem } from "@/config/node-catalog";
import { useCreateWorkflowFromTemplate } from "@/features/workflows/hooks/use-workflows";
import { cn } from "@/lib/utils";
import {
  type WorkflowTemplateDefinition,
  workflowTemplates,
} from "../lib/workflow-templates";
import { authClient } from "@/lib/auth-client";

const credentialLabels: Record<string, string> = {
  OPENAI: "OpenAI",
  ANTHROPIC: "Anthropic",
  GEMINI: "Gemini",
  GEMMA: "Gemma",
  HUGGINGFACE: "Hugging Face",
  GENERIC: "API Key",
};

const matchesTemplateSearch = (
  template: WorkflowTemplateDefinition,
  query: string,
) => {
  if (!query) {
    return true;
  }

  const nodeLabels = template.nodes
    .map((node) => getNodeCatalogItem(node.type)?.label || node.type)
    .join(" ");
  const searchable = [
    template.name,
    template.description,
    template.category,
    ...template.tags,
    nodeLabels,
  ].join(" ");

  return searchable.toLowerCase().includes(query);
};

export const TemplatesLibrary = () => {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const createFromTemplate = useCreateWorkflowFromTemplate();
  const [search, setSearch] = useState("");
  const [pendingTemplateId, setPendingTemplateId] = useState<string | null>(
    null,
  );
  const deferredSearch = useDeferredValue(search);

  const filteredTemplates = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    return workflowTemplates.filter((template) =>
      matchesTemplateSearch(template, normalizedSearch),
    );
  }, [deferredSearch]);

  const groupedTemplates = useMemo(() => {
    const categories = [
      ...new Set(filteredTemplates.map((item) => item.category)),
    ];

    return categories.map((category) => ({
      category,
      items: filteredTemplates.filter(
        (template) => template.category === category,
      ),
    }));
  }, [filteredTemplates]);

  const handleUseTemplate = (templateId: string) => {
    if (!session) {
      router.push("/sign-in?callbackUrl=/templates");
      return;
    }

    setPendingTemplateId(templateId);
    createFromTemplate.mutate(
      { templateId },
      {
        onSuccess: (workflow) => {
          router.push(`/workflows/${workflow.id}`);
        },
        onSettled: () => {
          setPendingTemplateId(null);
        },
      },
    );
  };

  return (
    <div className="p-4 md:px-10 md:py-6 h-full">
      <div className="mx-auto flex h-full w-full max-w-screen-xl flex-col gap-y-8">
        <section className="rounded-[28px] border bg-card p-6 shadow-sm md:p-8">
          <div className="mb-4 flex size-14 items-center justify-center rounded-2xl border bg-muted/30 shadow-sm">
            <LayoutTemplateIcon className="size-7 text-primary" />
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight font-display">
                AI Automation Templates
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                Explore ready-to-use AI agent workflows for Real Estate, Healthcare, Marketing, and more. 
                Select a template below to start automating your business sector today.
              </p>
            </div>
          </div>

          <div className="relative mt-6 max-w-md">
            <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search templates"
              className="h-11 rounded-2xl border-border/60 bg-background pl-9 shadow-sm"
            />
          </div>
        </section>

        <section className="flex flex-col gap-8">
          {groupedTemplates.length === 0 && (
            <div className="rounded-[28px] border border-dashed bg-card p-10 text-center">
              <p className="text-base font-medium">No templates found</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Try another word.
              </p>
            </div>
          )}

          {groupedTemplates.map((group) => (
            <div key={group.category} className="space-y-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">
                    {group.category}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {group.items.length} template
                    {group.items.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {group.items.map((template) => {
                  const nodeLabels = Array.from(
                    new Set(
                      template.nodes.map(
                        (node) =>
                          getNodeCatalogItem(node.type)?.label || node.type,
                      ),
                    ),
                  );
                  const extraNodeCount = Math.max(nodeLabels.length - 5, 0);

                  return (
                    <Card
                      key={template.id}
                      className={cn(
                        "overflow-hidden rounded-[28px] border-border/60 transition-all hover:-translate-y-0.5 hover:shadow-md",
                        pendingTemplateId === template.id && "opacity-80",
                      )}
                    >
                      <CardHeader className="border-b bg-muted/15">
                        <Badge variant="outline">{template.category}</Badge>
                        <h3 className="mt-2 text-lg font-bold">
                          {template.name}
                        </h3>
                      </CardHeader>

                      <CardContent className="space-y-5 pt-6">
                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            What it does
                          </p>
                          <p className="text-sm leading-6 text-muted-foreground">
                            {template.description}
                          </p>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Uses
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {nodeLabels.slice(0, 5).map((label) => (
                              <Badge key={label} variant="secondary">
                                {label}
                              </Badge>
                            ))}
                            {extraNodeCount > 0 && (
                              <Badge variant="outline">
                                +{extraNodeCount} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div>
                          <p className="mb-2 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                            Needs
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {template.requiredCredentials.length > 0 ? (
                              template.requiredCredentials.map((credential) => (
                                <Badge key={credential} variant="outline">
                                  {credentialLabels[credential]}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline">No API key needed</Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>

                      <CardFooter className="border-t bg-muted/10 pt-6">
                        <div className="flex w-full items-center justify-between gap-4">
                          <p className="text-sm text-muted-foreground">
                            You can edit it after opening.
                          </p>
                          <Button
                            onClick={() => handleUseTemplate(template.id)}
                            disabled={createFromTemplate.isPending}
                          >
                            {!session 
                              ? "Login to use" 
                              : pendingTemplateId === template.id
                                ? "Creating..."
                                : "Use template"}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
};
