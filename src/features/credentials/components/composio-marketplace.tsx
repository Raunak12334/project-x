"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, SearchIcon, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LoadingView } from "@/components/entity-components";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { IntegrationCard } from "./integration-card";
import { SetupSidebar } from "./setup-sidebar";

interface ComposioApp {
  slug: string;
  name: string;
  logo: string | null;
  description: string;
  isConnected: boolean;
  categories: string[];
  authType: string;
}

type ConnectVariables = {
  toolkitSlug?: string;
};

export const ComposioMarketplace = () => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [pendingToolkitSlug, setPendingToolkitSlug] = useState<string | null>(
    null,
  );

  const { data, isLoading, refetch } = useQuery(
    trpc.composio.listApps.queryOptions({
      search,
    }),
  );
  const { data: pendingConnectionStatus } = useQuery(
    trpc.composio.getConnectionStatus.queryOptions(
      { toolkitSlug: pendingToolkitSlug || "" },
      {
        enabled: Boolean(pendingToolkitSlug),
        refetchInterval: pendingToolkitSlug ? 2000 : false,
      },
    ),
  );
  const refreshCredentialsList = useCallback(() => {
    queryClient.invalidateQueries(trpc.credentials.getMany.queryFilter());
  }, [queryClient, trpc]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;

      if (event.data?.type === "composio-connection-success") {
        const toolkit = event.data.toolkitSlug;
        toast.success(`Successfully connected to ${toolkit}!`);
        setPendingToolkitSlug(null);
        refetch();
        refreshCredentialsList();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [refetch, refreshCredentialsList]);

  useEffect(() => {
    if (!pendingToolkitSlug || !pendingConnectionStatus?.connected) {
      return;
    }

    toast.success(`Successfully connected to ${pendingToolkitSlug}!`);
    setPendingToolkitSlug(null);
    refetch();
    refreshCredentialsList();
  }, [
    pendingConnectionStatus,
    pendingToolkitSlug,
    refetch,
    refreshCredentialsList,
  ]);

  const openCenteredPopup = (
    url: string,
    title: string,
    w: number,
    h: number,
  ) => {
    const topWindow = window.top ?? window;
    const y = topWindow.outerHeight / 2 + topWindow.screenY - h / 2;
    const x = topWindow.outerWidth / 2 + topWindow.screenX - w / 2;
    return window.open(
      url,
      title,
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${y}, left=${x}`,
    );
  };

  const connectMutation = useMutation(
    trpc.composio.getConnectUrl.mutationOptions({
      onSuccess: (data, variables) => {
        if (data.url) {
          setPendingToolkitSlug(variables.toolkitSlug);
          openCenteredPopup(data.url, "Connect Integration", 600, 750);
          toast.success("Opening connection portal...");
        } else {
          toast.error("Connect URL is missing");
        }
      },
      onError: (error) => {
        toast.error(`Failed to get connect URL: ${error.message}`);
      },
    }),
  );

  const handleConnect = (slug: string) => {
    connectMutation.mutate({ toolkitSlug: slug });
  };

  const handleCategoryChange = (category: string) => {
    if (category === "All") {
      setSelectedCategories([]);
      return;
    }
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const filteredApps = useMemo<ComposioApp[]>(() => {
    const apps = (data?.items as ComposioApp[]) || [];

    return apps.filter((app: ComposioApp) => {
      const matchesSearch =
        (app.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (app.slug || "").toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 ||
        (app.categories || []).some((cat: string) =>
          selectedCategories.includes(cat),
        );

      return matchesSearch && matchesCategory;
    });
  }, [data, search, selectedCategories]);

  if (isLoading && !data) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <LoadingView message="Initializing marketplace..." />
      </div>
    );
  }

  return (
    <div className="w-full bg-background">
      <div className="grid w-full gap-5 p-4 lg:grid-cols-[240px_minmax(0,1fr)] lg:p-5">
        {/* Sidebar Section */}
        <SetupSidebar
          selectedCategories={selectedCategories}
          onCategoryChange={handleCategoryChange}
        />

        {/* Main Content Section */}
        <div className="flex min-w-0 flex-col gap-5">
          <header className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-foreground">
                    <LayoutGrid className="size-4 text-background" />
                  </div>
                  <h1 className="text-xl font-semibold tracking-tight text-foreground">
                    Integrations
                  </h1>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                  Power your agents with specialized tools. Securely connect
                  your favorite apps to automate complex workflows.
                </p>
              </div>
            </div>

            <div className="group relative max-w-xl">
              <SearchIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search over 11,000+ integrations..."
                className="h-10 rounded-lg border-border/70 bg-background pl-9 text-sm shadow-none transition-all focus-visible:ring-primary/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 transition-colors hover:bg-muted"
                >
                  <X className="size-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </header>

          <main className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                All Toolkits ({filteredApps.length})
              </h2>
              <div className="mx-4 h-px flex-1 bg-border/70" />
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 gap-3 xl:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app: ComposioApp, index: number) => (
                  <motion.div
                    key={app.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                  >
                    <IntegrationCard
                      name={app.name}
                      logo={app.logo}
                      description={
                        app.description ||
                        `Integrate ${app.name} tools into your Otogent workflows.`
                      }
                      isConnected={app.isConnected || false}
                      onConnect={() => handleConnect(app.slug)}
                      isConnecting={
                        connectMutation.isPending &&
                        (
                          connectMutation.variables as
                            | ConnectVariables
                            | undefined
                        )?.toolkitSlug === app.slug
                      }
                      authType={app.authType}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredApps.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed bg-background px-6 py-20"
                >
                  <div className="mb-5 flex size-14 items-center justify-center rounded-lg border bg-muted/40">
                    <SearchIcon className="size-6 text-muted-foreground" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">
                    No toolkits found
                  </h3>
                  <p className="mb-6 max-w-sm text-center text-sm leading-6 text-muted-foreground">
                    We couldn't find any toolkits matching your search and
                    category selection.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSelectedCategories([]);
                    }}
                    className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-all active:scale-95"
                  >
                    Reset filters
                  </button>
                </motion.div>
              )}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
};
