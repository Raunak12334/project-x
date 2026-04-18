"use client";

import { useState } from "react";
import { SearchIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingView } from "@/components/entity-components";
import { SetupSidebar } from "./setup-sidebar";
import { IntegrationCard } from "./integration-card";

export const ComposioMarketplace = () => {
  const trpc = useTRPC();
  const [search, setSearch] = useState("");
  
  const { data, isLoading } = useQuery(
    trpc.composio.listApps.queryOptions({ 
        search 
    })
  );

  const connectMutation = useMutation(
    trpc.composio.getConnectUrl.mutationOptions({
        onSuccess: (data) => {
            if (data.url) {
                window.open(data.url, "_blank");
                toast.success("Opening connection portal...");
            } else {
                toast.error("Connect URL is missing");
            }
        },
        onError: (error) => {
            toast.error(`Failed to get connect URL: ${error.message}`);
        }
    })
  );

  const handleConnect = (slug: string) => {
    connectMutation.mutate({ toolkitSlug: slug });
  };

  if (isLoading) {
    return (
        <div className="flex h-[600px] items-center justify-center">
            <LoadingView message="Loading marketplace..." />
        </div>
    );
  }

  const apps = data?.items || [];
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-[calc(100vh-200px)] w-full gap-8 bg-white">
      {/* Sidebar Section */}
      <SetupSidebar />

      {/* Main Content Section */}
      <div className="flex-1 flex flex-col gap-8 pb-12">
        <header className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Integrations</h1>
              <p className="text-sm font-medium text-slate-500 max-w-2xl">
                Connect apps to help your assistant take action on your behalf by granting access.
              </p>
            </div>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="size-6" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 pt-4">
            <div className="relative max-w-lg w-full">
              <SearchIcon className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search 11,000+ apps (Gmail, GitHub, Slack...)"
                className="pl-11 h-12 bg-slate-50 border-none rounded-2xl focus-visible:ring-1 focus-visible:ring-slate-200 transition-all text-sm font-medium"
              />
            </div>
            <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
               <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                 {filteredApps.length} Results
               </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <IntegrationCard
              key={app.slug}
              name={app.name}
              logo={app.logo}
              description={`Integrate ${app.name} tools into your Otogent workflows.`}
              isConnected={app.isConnected || false}
              onConnect={() => handleConnect(app.slug)}
              isConnecting={connectMutation.isPending && (connectMutation.variables as any)?.toolkitSlug === app.slug}
            />
          ))}

          {filteredApps.length === 0 && (
            <div className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[32px] bg-slate-50/30">
                <div className="size-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-4">
                    <SearchIcon className="size-8 text-slate-200" />
                </div>
                <h3 className="text-slate-900 font-semibold mb-1">No integrations found</h3>
                <p className="text-sm text-slate-500">Try searching for something else like "Gmail" or "Slack"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
