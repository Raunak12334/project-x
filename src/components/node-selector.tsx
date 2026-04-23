import { createId } from "@paralleldrive/cuid2";
import { NodeType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { useNodes, useReactFlow } from "@xyflow/react";
import { SearchIcon, XIcon } from "lucide-react";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand-logo";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  COMPOSIO_FULL_CATALOG,
  type ComposioAppMeta,
} from "@/config/composio-full-catalog";
import {
  getNodeIconByGroup,
  type NodeCatalogItem,
  nodeCatalog,
  nodeCatalogGroups,
} from "@/config/node-catalog";
import { isTriggerNodeType } from "@/features/workflows/lib/start-nodes";
import { getIntegrationLogo } from "@/lib/integration-logo";
import { cn } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

type DynamicComposioApp = Omit<ComposioAppMeta, "authType"> & {
  authType?: string;
  accountName?: string | null;
  integrationId?: string | null;
  isConnected?: boolean;
  tags?: string[];
  logo?: string | null;
};

const toVariableName = (value: string) => {
  const normalized = value
    .replace(/[^A-Za-z0-9_$]+/g, " ")
    .trim()
    .replace(/\s+([A-Za-z0-9_$])/g, (_, char: string) => char.toUpperCase())
    .replace(/^[^A-Za-z_$]+/, "");

  return `${normalized || "composio"}Result`;
};

const matchesSearch = (item: NodeCatalogItem, query: string) => {
  if (!query) {
    return true;
  }

  const searchable = [
    item.label,
    item.description,
    item.type,
    ...item.keywords,
  ].join(" ");

  return searchable.toLowerCase().includes(query);
};

export function NodeSelector({
  open,
  onOpenChange,
  children,
}: NodeSelectorProps) {
  const nodes = useNodes();
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const trpc = useTRPC();
  const { data: composioApps } = useQuery(
    trpc.composio.listApps.queryOptions({ search: deferredSearch }),
  );

  const hasConfiguredNode = useMemo(() => {
    return nodes.some(
      (node) => typeof node.type === "string" && node.type !== NodeType.INITIAL,
    );
  }, [nodes]);

  const isTriggerOnboardingMode = !hasConfiguredNode;

  const groupedNodes = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    const sdkApps = (composioApps?.items ?? []) as DynamicComposioApp[];

    // Merge SDK results with our comprehensive static catalog
    // prioritizing SDK results (which might have live connection data)
    const sdkSlugs = new Set(sdkApps.map((app) => app.slug));
    const mergedApps: DynamicComposioApp[] = [
      ...sdkApps,
      ...COMPOSIO_FULL_CATALOG.filter((app) => !sdkSlugs.has(app.slug)),
    ];

    // Map merged apps to individual tools in the catalog
    const dynamicComposioNodes: NodeCatalogItem[] = mergedApps.map((app) => {
      const appLogo = getIntegrationLogo({
        slug: app.slug,
        name: app.name,
        logo: app.logo,
      });

      return {
        type: NodeType.COMPOSIO,
        label: app.name,
        description:
          app.description || `Integration for ${app.name} via Composio.`,
        icon: appLogo,
        group: "integrations",
        keywords: [
          "composio",
          app.slug,
          (app.name || "").toLowerCase(),
          ...(app.categories || app.tags || []),
        ],
        inputs: [], // Dynamic nodes use their own data
        outputs: [
          { key: "data", type: "object", description: "Response data" },
        ],
        setupGuide: ["Ensure your account is connected in the marketplace."],
        defaultData: {
          argumentsJson: "{}",
          appLogo,
          integrationId: app.integrationId || undefined,
          name: `${app.name}`,
          toolSlug: "",
          toolkitSlug: app.slug,
          variableName: toVariableName(app.slug || app.name || "composio"),
        },
      };
    });

    const allNodes = [...nodeCatalog, ...dynamicComposioNodes];

    return nodeCatalogGroups
      .map((group) => ({
        ...group,
        items: allNodes
          .filter(
            (item) =>
              item.group === group.id && matchesSearch(item, normalizedSearch),
          )
          .filter((item) =>
            isTriggerOnboardingMode
              ? isTriggerNodeType(item.type)
              : !isTriggerNodeType(item.type),
          ),
      }))
      .filter((group) => group.items.length > 0);
  }, [deferredSearch, composioApps, isTriggerOnboardingMode]);

  const filteredNodeCount = useMemo(
    () =>
      groupedNodes.reduce((total, group) => {
        return total + group.items.length;
      }, 0),
    [groupedNodes],
  );

  const handleNodeSelect = useCallback(
    (selection: NodeCatalogItem) => {
      if (isTriggerNodeType(selection.type)) {
        const nodes = getNodes();
        const hasStartNode = nodes.some(
          (node) =>
            typeof node.type === "string" &&
            isTriggerNodeType(node.type as NodeType),
        );

        if (hasStartNode) {
          toast.error("Only one start node is supported right now");
          return;
        }
      }

      setNodes((nodes) => {
        const hasInitialTrigger = nodes.some(
          (node) => node.type === NodeType.INITIAL,
        );

        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        const flowPosition = screenToFlowPosition({
          x: centerX + (Math.random() - 0.5) * 200,
          y: centerY + (Math.random() - 0.5) * 200,
        });

        const newNode = {
          id: createId(),
          data: selection.defaultData || {},
          position: flowPosition,
          type: selection.type,
        };

        if (hasInitialTrigger) {
          return [newNode];
        }

        return [...nodes, newNode];
      });

      setSearch("");
      onOpenChange(false);
    },
    [getNodes, onOpenChange, screenToFlowPosition, setNodes],
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l bg-background p-0 sm:max-w-2xl"
      >
        <SheetHeader className="border-b bg-muted/20 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <SheetTitle>
                {isTriggerOnboardingMode
                  ? "What triggers this workflow?"
                  : "Add a node"}
              </SheetTitle>
              <SheetDescription>
                {isTriggerOnboardingMode
                  ? "A trigger is a step that starts your workflow."
                  : "Search or pick a group below."}
              </SheetDescription>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border p-1.5 text-muted-foreground transition hover:bg-accent hover:text-foreground"
              aria-label="Close node selector"
            >
              <XIcon className="size-4" />
            </button>
          </div>
        </SheetHeader>

        <div className="sticky top-0 z-10 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div className="relative max-w-lg">
            <SearchIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search nodes, apps, or triggers"
              className="h-11 rounded-2xl border-border/60 bg-card pl-9 shadow-sm"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {filteredNodeCount} result{filteredNodeCount === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-7 px-6 py-6">
          {groupedNodes.length === 0 && (
            <div className="rounded-3xl border border-dashed bg-card px-4 py-12 text-center">
              <p className="text-sm font-medium">No nodes found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try another word.
              </p>
            </div>
          )}

          {groupedNodes.map((group) => {
            const GroupIcon = getNodeIconByGroup(group.id);

            return (
              <section key={group.id} className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-2xl border bg-card shadow-sm">
                      <GroupIcon className="size-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold tracking-tight">
                        {group.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {group.description}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full border bg-card px-2.5 py-1 text-xs text-muted-foreground shadow-sm">
                    {group.items.length}
                  </span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isIntegration = item.group === "integrations";

                    return (
                      <button
                        type="button"
                        key={`${item.type}-${item.label}`}
                        className={cn(
                          "group relative flex flex-col items-center text-center gap-4 rounded-[24px] border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-accent/10 hover:shadow-lg",
                          isIntegration
                            ? "bg-gradient-to-b from-card to-slate-50/50"
                            : "",
                        )}
                        onClick={() => handleNodeSelect(item)}
                      >
                        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border bg-background shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:shadow-md group-hover:border-primary/20">
                          {typeof Icon === "string" ? (
                            <BrandLogo
                              src={Icon}
                              alt={`${item.label} logo`}
                              className="size-7"
                            />
                          ) : (
                            <Icon className="size-7 text-muted-foreground transition-colors group-hover:text-primary" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1 space-y-2">
                          <div className="flex flex-col items-center gap-1.5">
                            <span className="text-sm font-bold tracking-tight">
                              {item.label}
                            </span>
                            {item.group === "triggers" && (
                              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                                Trigger
                              </span>
                            )}
                            {isIntegration && (
                              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-widest text-emerald-600 border border-emerald-100">
                                Integration
                              </span>
                            )}
                          </div>
                          <p className="text-xs leading-relaxed text-muted-foreground line-clamp-2">
                            {item.description}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
