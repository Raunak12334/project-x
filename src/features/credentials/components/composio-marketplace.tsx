"use client";

import { useState, useMemo } from "react";
import { SearchIcon, X, LayoutGrid, Check, ExternalLink, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LoadingView } from "@/components/entity-components";
import { SetupSidebar } from "./setup-sidebar";
import { IntegrationCard } from "./integration-card";
import { motion, AnimatePresence } from "framer-motion";

// High-end fallback data to ensure marketplace is never empty
const FALLBACK_TOOLKITS = [
  { slug: "github", name: "GitHub", logo: "https://cdn.simpleicons.org/github/000", description: "Manage repositories, issues, and automated workflows.", categories: ["Developer Tools & DevOps"], authType: "OAUTH2" },
  { slug: "slack", name: "Slack", logo: "https://cdn.simpleicons.org/slack/4A154B", description: "Seamless communication for teams and automated alerts.", categories: ["Collaboration & Communication"], authType: "OAUTH2" },
  { slug: "gmail", name: "Gmail", logo: "https://cdn.simpleicons.org/gmail/EA4335", description: "Send emails and manage inbox triggers for your agents.", categories: ["Collaboration & Communication"], authType: "OAUTH2" },
  { slug: "google-sheets", name: "Google Sheets", logo: "https://cdn.simpleicons.org/googlesheets/34A853", description: "Read, write and sync data with spreadsheets.", categories: ["Productivity & Project Management"], authType: "OAUTH2" },
  { slug: "notion", name: "Notion", logo: "https://cdn.simpleicons.org/notion/000000", description: "Connect to pages and databases for knowledge management.", categories: ["Productivity & Project Management"], authType: "OAUTH2" },
  { slug: "openai", name: "OpenAI", logo: "https://cdn.simpleicons.org/openai/412991", description: "Advanced language processing and intelligence tools.", categories: ["AI & Machine Learning"], authType: "API_KEY" },
  { slug: "discord", name: "Discord", logo: "https://cdn.simpleicons.org/discord/5865F2", description: "Integrate chat communities and bot interactions.", categories: ["Collaboration & Communication"], authType: "OAUTH2" },
  { slug: "trello", name: "Trello", logo: "https://cdn.simpleicons.org/trello/0079BF", description: "Manage boards and tasks for project coordination.", categories: ["Productivity & Project Management"], authType: "OAUTH2" },
  { slug: "hubspot", name: "HubSpot", logo: "https://cdn.simpleicons.org/hubspot/FF7A59", description: "Powerful CRM tools for managing customer data.", categories: ["CRM"], authType: "OAUTH2" },
];

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

  const filteredApps = useMemo(() => {
    // Combine SDK data with fallbacks, ensuring uniqueness by slug
    const sdkApps = data?.items || [];
    const allApps = [...sdkApps];
    
    // Add fallbacks only if they don't exist in SDK apps
    const sdkSlugs = new Set(sdkApps.map((a: any) => a.slug));
    FALLBACK_TOOLKITS.forEach(fb => {
      if (!sdkSlugs.has(fb.slug)) {
        allApps.push(fb);
      }
    });

    return allApps.filter((app: any) => {
      const matchesSearch = (app.name || "").toLowerCase().includes(search.toLowerCase()) ||
                           (app.slug || "").toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = selectedCategories.length === 0 || 
                             (app.categories || []).some((cat: string) => selectedCategories.includes(cat));
      
      return matchesSearch && matchesCategory;
    });
  }, [data, search, selectedCategories]);

  if (isLoading && !data) {
    return (
        <div className="flex h-[600px] items-center justify-center">
            <LoadingView message="Initializing marketplace..." />
        </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-[#fbfbfc]">
      <div className="max-w-[1600px] w-full mx-auto flex gap-10 px-8 py-10">
        
        {/* Sidebar Section */}
        <SetupSidebar 
          selectedCategories={selectedCategories} 
          onCategoryChange={handleCategoryChange} 
        />

        {/* Main Content Section */}
        <div className="flex-1 flex flex-col gap-10">
          <header className="space-y-8">
            <div className="flex items-end justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-900 rounded-xl">
                    <LayoutGrid className="size-5 text-white" />
                  </div>
                  <h1 className="text-3xl font-black tracking-tight text-slate-900">Integrations</h1>
                </div>
                <p className="text-slate-500 font-medium max-w-xl leading-relaxed">
                  Power your agents with specialized tools. Securely connect your favorite apps to automate complex workflows.
                </p>
              </div>
              
              <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm">
                <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="size-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center">
                      <Check className="size-3 text-slate-400" />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-2">
                  Cloud Verified
                </span>
              </div>
            </div>

            <div className="relative group max-w-2xl">
              <SearchIcon className="size-5 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search over 11,000+ integrations..."
                className="pl-16 h-16 bg-white border-slate-200/60 rounded-[28px] focus-visible:ring-4 focus-visible:ring-slate-900/5 focus-visible:border-slate-300 transition-all text-base font-medium shadow-sm hover:shadow-md"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")}
                  className="absolute right-6 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="size-4 text-slate-400" />
                </button>
              )}
            </div>
          </header>

          <main className="space-y-6">
            <div className="flex items-center justify-between px-2">
               <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">
                 All Toolkits ({filteredApps.length})
               </h2>
               <div className="h-[1px] flex-1 mx-6 bg-slate-100" />
            </div>

            <motion.div 
              layout
              className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-5"
            >
              <AnimatePresence mode="popLayout">
                {filteredApps.map((app, index) => (
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
                      description={app.description || `Integrate ${app.name} tools into your Otogent workflows.`}
                      isConnected={app.isConnected || false}
                      onConnect={() => handleConnect(app.slug)}
                      isConnecting={connectMutation.isPending && (connectMutation.variables as any)?.toolkitSlug === app.slug}
                      authType={(app as any).authType}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>

              {filteredApps.length === 0 && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="col-span-full py-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[40px] bg-white ring-8 ring-slate-50/50"
                >
                    <div className="size-24 rounded-[32px] bg-slate-50 flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                        <SearchIcon className="size-10 text-slate-300" />
                    </div>
                    <h3 className="text-slate-900 text-2xl font-black mb-3">No toolkits found</h3>
                    <p className="text-base text-slate-500 max-w-sm text-center font-medium leading-relaxed mb-10 px-6">
                        We couldn't find any toolkits matching your search and category selection.
                    </p>
                    <button 
                        onClick={() => {setSearch(""); setSelectedCategories([]);}}
                        className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-900/10 hover:shadow-slate-900/20 active:scale-95 transition-all"
                    >
                        Reset Application Filters
                    </button>
                </motion.div>
              )}
            </motion.div>
          </main>

          <footer className="pt-10 pb-20 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                All Systems Operational
              </span>
            </div>
            <div className="flex items-center gap-8">
              <button className="text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.15em] transition-colors">Documentation</button>
              <button className="text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.15em] transition-colors">Request App</button>
              <button className="text-[11px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-[0.15em] transition-colors">Support</button>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
};
