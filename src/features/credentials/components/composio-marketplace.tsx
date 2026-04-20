"use client";

import { useState } from "react";
import { SearchIcon, CheckCircle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingView } from "@/components/entity-components";
import { SetupSidebar } from "./setup-sidebar";
import { IntegrationCard } from "./integration-card";
import { Button } from "@/components/ui/button";

export const ComposioMarketplace = () => {
  const trpc = useTRPC();
  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
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

  const handleCategoryChange = (category: string) => {
    if (category === "All") {
      setSelectedCategories([]);
      return;
    }

    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };

  if (isLoading) {
    return (
        <div className="flex h-[600px] items-center justify-center">
            <LoadingView message="Loading marketplace..." />
        </div>
    );
  }

  const apps = data?.items || [];
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.name.toLowerCase().includes(search.toLowerCase()) ||
                         app.slug.toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategories.length === 0 || 
                           (app.categories || []).some((cat: string) => selectedCategories.includes(cat));
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex min-h-[calc(100vh-200px)] w-full gap-8 bg-white max-w-[1600px] mx-auto px-4">
      {/* Sidebar Section */}
      <SetupSidebar 
        selectedCategories={selectedCategories} 
        onCategoryChange={handleCategoryChange} 
      />

      {/* Main Content Section */}
      <div className="flex-1 flex flex-col gap-8 pb-12">
        <header className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">Toolkits</h1>
              <p className="text-sm font-medium text-slate-500 max-w-2xl">
                Explore and connect from over 11,000+ specialized toolkits to empower your agents.
              </p>
            </div>
            <button className="size-10 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-50 border border-slate-100 rounded-2xl transition-all">
                <X className="size-5" />
            </button>
          </div>

          <div className="flex items-center justify-between gap-6 pt-2">
            <div className="relative max-w-xl w-full group">
              <SearchIcon className="size-5 absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search apps (Gmail, GitHub, Slack...)"
                className="pl-14 h-14 bg-slate-50/50 border-slate-100 rounded-[24px] focus-visible:ring-2 focus-visible:ring-slate-900/5 focus-visible:border-slate-300 transition-all text-sm font-medium placeholder:text-slate-400"
              />
            </div>
            <div className="px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
               <span className="text-xs font-bold text-slate-900 uppercase tracking-widest">
                 {filteredApps.length} Toolkits
               </span>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredApps.map((app) => (
            <IntegrationCard
              key={app.slug}
              name={app.name}
              logo={app.logo}
              description={app.description || `Integrate ${app.name} tools into your Otogent workflows.`}
              isConnected={app.isConnected || false}
              onConnect={() => handleConnect(app.slug)}
              isConnecting={connectMutation.isPending && (connectMutation.variables as any)?.toolkitSlug === app.slug}
              authType={(app as any).authType}
            />
          ))}

          {filteredApps.length === 0 && (
            <div className="col-span-full py-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-[48px] bg-slate-50/30">
                <div className="size-20 rounded-3xl bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center mb-6 border border-slate-100">
                    <SearchIcon className="size-10 text-slate-200" />
                </div>
                <h3 className="text-slate-900 text-xl font-bold mb-2">No toolkits found</h3>
                <p className="text-sm text-slate-500 max-w-xs text-center leading-relaxed">
                    We couldn't find any toolkits matching your search and category selection.
                </p>
                <button 
                    onClick={() => {setSearch(""); setSelectedCategories([]);}}
                    className="mt-6 text-sm font-bold text-slate-900 underline underline-offset-4"
                >
                    Clear all filters
                </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
