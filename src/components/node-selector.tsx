"use client";

import { createId } from "@paralleldrive/cuid2";
import { NodeType } from "@prisma/client";
import { useReactFlow } from "@xyflow/react";
import { SearchIcon } from "lucide-react";
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
  getNodeIconByGroup,
  type NodeCatalogItem,
  nodeCatalog,
  nodeCatalogGroups,
} from "@/config/node-catalog";
import { isTriggerNodeType } from "@/features/workflows/lib/start-nodes";
import { useTRPC } from "@/trpc/client";

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

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
  const { setNodes, getNodes, screenToFlowPosition } = useReactFlow();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);

  const trpc = useTRPC();
  const { data: connectedApps } = trpc.composio.listConnectedAccounts.useQuery();

  const groupedNodes = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase();

    // Map connected Composio apps to individual tools in the catalog
    const dynamicComposioNodes: NodeCatalogItem[] = (connectedApps?.items || []).map(app => ({
      type: NodeType.COMPOSIO,
      label: app.name,
      description: `Managed integration for ${app.name} via Composio.`,
      icon: app.logo || Boxes,
      group: "integrations",
      keywords: ["composio", app.slug, app.name.toLowerCase()],
      inputs: [], // Dynamic nodes use their own data
      outputs: [{ key: "data", type: "object", description: "Response data" }],
      setupGuide: ["Ensure your account is connected in the marketplace."],
      defaultData: {
        toolSlug: `${app.slug.toUpperCase()}_GET_INFO`, // Default to a safe action or list
        name: `${app.name} Action`
      }
    }));

    const allNodes = [...nodeCatalog, ...dynamicComposioNodes];

    return nodeCatalogGroups
      .map((group) => ({
        ...group,
        items: allNodes.filter(
          (item) =>
            item.group === group.id && matchesSearch(item, normalizedSearch),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [deferredSearch, connectedApps]);

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
          <SheetTitle>Add a node</SheetTitle>
          <SheetDescription>Search or pick a group below.</SheetDescription>
        </SheetHeader>

        <div className="sticky top-0 z-10 border-b bg-background/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/85">
          <div className="relative max-w-lg">
            <SearchIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search nodes"
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

                    return (
                      <button
                        type="button"
                        key={item.type}
                        className="group flex min-h-[120px] w-full items-start gap-4 rounded-3xl border bg-card px-4 py-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-accent/20 hover:shadow-md"
                        onClick={() => handleNodeSelect(item)}
                      >
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl border bg-background shadow-sm transition-colors group-hover:border-primary/30">
                          {typeof Icon === "string" ? (
                            <BrandLogo
                              src={Icon}
                              alt={`${item.label} logo`}
                              className="size-6"
                            />
                          ) : (
                            <Icon className="size-6 text-muted-foreground" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold">
                              {item.label}
                            </span>
                            {item.group === "triggers" && (
                              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide text-primary">
                                Start
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
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
