"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutGrid, SearchIcon, X } from "lucide-react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { LoadingView } from "@/components/entity-components";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getIntegrationLogoCandidates } from "@/lib/integration-logo";
import { useTRPC } from "@/trpc/client";
import { IntegrationCard } from "./integration-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { KeyIcon } from "lucide-react";

const MARKETPLACE_PAGE_SIZE = 12;

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
  const [page, setPage] = useState(1);
  const [pendingToolkitSlug, setPendingToolkitSlug] = useState<string | null>(
    null,
  );
  const [apiKeyToolkit, setApiKeyToolkit] = useState<ComposioApp | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState("");

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

  const saveApiKeyMutation = useMutation(
    trpc.composio.saveApiKey.mutationOptions({
      onSuccess: () => {
        toast.success(`Successfully connected to ${apiKeyToolkit?.name}!`);
        setApiKeyToolkit(null);
        setApiKeyInput("");
        refetch();
        refreshCredentialsList();
      },
      onError: (error) => {
        toast.error(`Failed to save API key: ${error.message}`);
      },
    }),
  );

  const handleConnect = (app: ComposioApp) => {
    if (app.authType === "API_KEY") {
      setApiKeyToolkit(app);
      return;
    }
    connectMutation.mutate({ toolkitSlug: app.slug });
  };

  const handleSaveApiKey = () => {
    if (!apiKeyToolkit || !apiKeyInput.trim()) return;
    saveApiKeyMutation.mutate({
      toolkitSlug: apiKeyToolkit.slug,
      apiKey: apiKeyInput.trim(),
    });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const filteredApps = useMemo<ComposioApp[]>(() => {
    const apps = (data?.items as ComposioApp[]) || [];

    return apps.filter((app: ComposioApp) => {
      const query = search.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (app.name || "").toLowerCase().includes(query) ||
        (app.slug || "").toLowerCase().includes(query);

      return matchesSearch;
    });
  }, [data, search]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredApps.length / MARKETPLACE_PAGE_SIZE),
  );
  const paginatedApps = useMemo(
    () =>
      filteredApps.slice(
        (page - 1) * MARKETPLACE_PAGE_SIZE,
        page * MARKETPLACE_PAGE_SIZE,
      ),
    [filteredApps, page],
  );
  const visiblePages = useMemo(() => {
    const pages = new Set([1, totalPages, page - 1, page, page + 1]);
    return [...pages]
      .filter((item) => item >= 1 && item <= totalPages)
      .sort((a, b) => a - b);
  }, [page, totalPages]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const goToPage = (nextPage: number) => {
    setPage(Math.min(Math.max(nextPage, 1), totalPages));
  };

  if (isLoading && !data) {
    return (
      <div className="flex h-[420px] items-center justify-center">
        <LoadingView message="Initializing marketplace..." />
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      <div className="w-full p-4 lg:p-5">
        <div className="flex min-w-0 flex-col gap-5">
          <header className="space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-lg border bg-white shadow-sm">
                    <LayoutGrid className="size-4 text-muted-foreground" />
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
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Search over 11,000+ integrations..."
                className="h-10 rounded-lg border-border/70 bg-background pl-9 text-sm shadow-none transition-all focus-visible:ring-primary/15"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => handleSearchChange("")}
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
                All Toolkits ({filteredApps.length}) - Page {page} of{" "}
                {totalPages}
              </h2>
              <div className="mx-4 h-px flex-1 bg-border/70" />
            </div>

            <motion.div
              layout
              className="grid grid-cols-1 gap-3 xl:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {paginatedApps.map((app: ComposioApp, index: number) => (
                  <motion.div
                    key={app.slug}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                  >
                    <IntegrationCard
                      name={app.name}
                      logoCandidates={getIntegrationLogoCandidates({
                        slug: app.slug,
                        name: app.name,
                        logo: app.logo,
                      })}
                      description={
                        app.description ||
                        `Integrate ${app.name} tools into your Otogent workflows.`
                      }
                      isConnected={app.isConnected || false}
                      onConnect={() => handleConnect(app)}
                      isConnecting={
                        (connectMutation.isPending &&
                          (
                            connectMutation.variables as
                              | ConnectVariables
                              | undefined
                          )?.toolkitSlug === app.slug) ||
                        (saveApiKeyMutation.isPending &&
                          apiKeyToolkit?.slug === app.slug)
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
                    We couldn't find any toolkits matching your search.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      handleSearchChange("");
                      setPage(1);
                    }}
                    className="rounded-lg border bg-white px-4 py-2 text-sm font-medium text-foreground transition-all hover:bg-muted active:scale-95"
                  >
                    Clear search
                  </button>
                </motion.div>
              )}
            </motion.div>

            {filteredApps.length > MARKETPLACE_PAGE_SIZE && (
              <Pagination className="justify-end border-t pt-4">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      aria-disabled={page === 1}
                      className={
                        page === 1 ? "pointer-events-none opacity-50" : ""
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(page - 1);
                      }}
                    />
                  </PaginationItem>
                  {visiblePages.map((pageNumber, index) => {
                    const previousPage = visiblePages[index - 1];
                    const showGap =
                      previousPage !== undefined &&
                      pageNumber - previousPage > 1;

                    return (
                      <Fragment key={pageNumber}>
                        {showGap && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={pageNumber === page}
                            onClick={(event) => {
                              event.preventDefault();
                              goToPage(pageNumber);
                            }}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      </Fragment>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      aria-disabled={page === totalPages}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                      onClick={(event) => {
                        event.preventDefault();
                        goToPage(page + 1);
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </main>
        </div>
      </div>

      <Dialog
        open={Boolean(apiKeyToolkit)}
        onOpenChange={(open) => !open && setApiKeyToolkit(null)}
      >
        <DialogContent className="max-w-md gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl">
          <DialogHeader className="border-b bg-muted/30 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg border bg-white shadow-sm">
                <KeyIcon className="size-5 text-amber-500" />
              </div>
              <DialogTitle>Connect {apiKeyToolkit?.name}</DialogTitle>
            </div>
            <DialogDescription className="mt-2">
              Enter your {apiKeyToolkit?.name} API key below to enable its
              tools in your workflows.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                API Key
              </label>
              <Input
                type="password"
                placeholder={`sk-... or your ${apiKeyToolkit?.name} token`}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                className="h-11"
                autoFocus
              />
              <p className="text-[11px] leading-5 text-muted-foreground">
                Your key is encrypted and stored securely. You can find your key
                in the {apiKeyToolkit?.name} developer dashboard.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col gap-2 border-t bg-muted/30 px-6 py-4 sm:flex-row">
            <Button
              variant="ghost"
              onClick={() => setApiKeyToolkit(null)}
              className="h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveApiKey}
              disabled={!apiKeyInput.trim() || saveApiKeyMutation.isPending}
              className="h-11 min-w-[120px]"
            >
              {saveApiKeyMutation.isPending ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="mr-2 size-4 border-2 border-white/30 border-t-white rounded-full"
                />
              ) : null}
              Save Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
