"use client";

import { useState } from "react";
import Image from "next/image";
import { SearchIcon, PlusIcon, CheckIcon, ExternalLinkIcon, Plug } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingView } from "@/components/entity-components";

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
    return <LoadingView message="Loading marketplace..." />;
  }

  const apps = data?.items || [];
  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(search.toLowerCase()) ||
    app.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-md w-full">
          <SearchIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search 11,000+ apps (Gmail, GitHub, Slack...)"
            className="pl-9 h-11 rounded-xl"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredApps.length} apps available
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredApps.map((app) => (
          <div 
            key={app.slug}
            className="group relative flex items-start gap-4 p-4 rounded-2xl border bg-card hover:shadow-md transition-all border-border/60"
          >
            <div className="size-12 shrink-0 flex items-center justify-center rounded-xl border bg-background overflow-hidden p-2">
              {app.logo ? (
                <Image 
                  src={app.logo} 
                  alt={app.name} 
                  width={32} 
                  height={32} 
                  className="object-contain"
                />
              ) : (
                <Plug className="size-6 text-muted-foreground" />
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold text-sm truncate">{app.name}</h3>
                {app.isConnected && (
                   <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full uppercase">
                     <CheckIcon className="size-2.5" />
                     Connected
                   </span>
                )}
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                Integrate {app.name} tools into your Otogent workflows.
              </p>
              
              <div className="mt-4">
                <Button 
                  size="sm" 
                  variant={app.isConnected ? "outline" : "default"}
                  className="w-full h-8 rounded-lg text-xs font-medium gap-2"
                  onClick={() => handleConnect(app.slug)}
                  disabled={connectMutation.isPending}
                >
                  {app.isConnected ? (
                    <>Reconnect <ExternalLinkIcon className="size-3" /></>
                  ) : (
                    <>Connect <PlusIcon className="size-3" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}

        {filteredApps.length === 0 && (
            <div className="col-span-full py-20 text-center border border-dashed rounded-3xl">
                <p className="text-sm text-muted-foreground">No apps found matching "{search}"</p>
            </div>
        )}
      </div>
    </div>
  );
};
