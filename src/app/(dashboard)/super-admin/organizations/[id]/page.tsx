"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ActivityIcon,
  Building2Icon,
  CalendarIcon,
  UsersIcon,
  WorkflowIcon,
  ZapIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";

export default function OrganizationDetailPage() {
  const { id } = useParams();
  const trpc = useTRPC();

  // Note: I'll need to add a specific getOrganizationById procedure,
  // but for now we can filter from the list or I'll add the procedure.
  const { data: orgs, isLoading } = useQuery(
    trpc.platform.getOrganizations.queryOptions(),
  );
  const org = orgs?.find((o) => o.id === id);
  const planLabel = (plan?: string | null) =>
    plan === "ENTERPRISE" ? "CUSTOM" : plan || "AUTO_FREE";

  if (isLoading)
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-12 bg-slate-200 rounded-lg w-1/3" />
        <div className="grid grid-cols-3 gap-6">
          {["skeleton-a", "skeleton-b", "skeleton-c"].map((slot) => (
            <div key={slot} className="h-32 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );

  if (!org)
    return (
      <div className="p-20 text-center font-bold text-slate-400">
        Organization cluster not found.
      </div>
    );

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-6">
          <div className="size-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Building2Icon className="size-10" />
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50">
              {org.name}
            </h1>
            <div className="flex items-center gap-3">
              <Badge className="bg-emerald-500">
                {planLabel(org.subscription?.plan)}
              </Badge>
              <span className="text-xs text-slate-400 font-mono">
                UUID: {org.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-400 tracking-widest">
              Active Members
            </CardTitle>
            <UsersIcon className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{org._count.users}</div>
            <p className="text-xs text-slate-500 mt-2">
              Provisioned seat accounts
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-400 tracking-widest">
              Operational Workflows
            </CardTitle>
            <WorkflowIcon className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">{org._count.workflows}</div>
            <p className="text-xs text-slate-500 mt-2">
              Automated system graphs
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-400 tracking-widest">
              Infrastructure Age
            </CardTitle>
            <CalendarIcon className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black">
              {format(new Date(org.createdAt), "MMM dd, yyyy")}
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Initialized on platform
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ActivityIcon className="size-5 text-blue-500" />
            Infrastructure Health
          </h2>
          <Card className="border-none shadow-sm bg-slate-50 dark:bg-slate-900/50 p-6 space-y-4">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
              <span className="text-sm font-semibold">Database Integrity</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                STABLE
              </Badge>
            </div>
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm">
              <span className="text-sm font-semibold">API Connectivity</span>
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                ACTIVE
              </Badge>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <ZapIcon className="size-5 text-amber-500" />
            Action Command
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-blue-500 transition-colors cursor-pointer group">
              <h3 className="font-bold group-hover:text-blue-500 transition-colors">
                Adjust Tier
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Override subscription plan
              </p>
            </div>
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:border-rose-500 transition-colors cursor-pointer group">
              <h3 className="font-bold group-hover:text-rose-500 transition-colors text-rose-500">
                Suspend Org
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Restrict all cluster access
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
