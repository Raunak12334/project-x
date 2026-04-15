"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Building2Icon,
  SearchIcon,
  UsersIcon,
  WorkflowIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";

export default function OrganizationsManagementPage() {
  const trpc = useTRPC();
  const { data: orgs, isLoading } = useQuery(
    trpc.platform.getOrganizations.queryOptions(),
  );
  const [search, setSearch] = useState("");
  const planLabel = (plan?: string | null) =>
    plan === "ENTERPRISE" ? "CUSTOM" : plan || "AUTO_FREE";

  const filteredOrgs = orgs?.filter(
    (o) =>
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-64" />
        {[1, 2, 3, 4, 5, 6].map((slot) => (
          <div
            key={`org-skeleton-${slot}`}
            className="h-20 bg-slate-100 rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">
            Multi-Tenant Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Global directory of all organizational clusters.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search organizations..."
            className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="hidden md:grid grid-cols-6 px-6 text-xs font-bold uppercase tracking-widest text-slate-400">
          <div className="col-span-2 text-left">Organization Info</div>
          <div className="text-center">Tier</div>
          <div className="text-center">Team Weight</div>
          <div className="text-center">Workflows</div>
          <div className="text-right">Created</div>
        </div>

        {filteredOrgs?.map((org) => (
          <Link key={org.id} href={`/super-admin/organizations/${org.id}`}>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow group">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-6 items-center p-6 gap-4">
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="size-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 shrink-0 group-hover:bg-blue-600 transition-colors group-hover:text-white">
                      <Building2Icon className="size-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-600 transition-colors">
                        {org.name}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate uppercase tracking-tighter">
                        Cluster ID: {org.id}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <Badge
                      className={`${
                        org.subscription?.plan === "CUSTOM" ||
                        org.subscription?.plan === "ENTERPRISE"
                          ? "bg-purple-500 hover:bg-purple-600"
                          : org.subscription?.plan === "PRO"
                            ? "bg-blue-500 hover:bg-blue-600"
                            : "bg-slate-400"
                      }`}
                    >
                      {planLabel(org.subscription?.plan)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                    <UsersIcon className="size-4 opacity-50" />
                    <span>{org._count.users} members</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 font-medium">
                    <WorkflowIcon className="size-4 opacity-50" />
                    <span>{org._count.workflows} assets</span>
                  </div>

                  <div className="text-right text-xs text-slate-400 font-mono">
                    {format(new Date(org.createdAt), "MMM dd, yyyy")}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredOrgs?.length === 0 && (
          <div className="py-20 text-center text-slate-400 italic font-medium bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            No organizations match your current investigation.
          </div>
        )}
      </div>
    </div>
  );
}
