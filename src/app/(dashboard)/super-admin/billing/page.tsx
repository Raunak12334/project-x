"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  AlertCircleIcon,
  CalendarIcon,
  TrendingUpIcon,
  UsersIcon,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";

const PLAN_COLORS = {
  FREE: "#94a3b8",
  PRO: "#3b82f6",
  CUSTOM: "#a855f7",
};

export default function PlatformBillingPage() {
  const trpc = useTRPC();
  const { data: stats, isLoading } = useQuery(
    trpc.platform.getRevenueStats.queryOptions(),
  );

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((card) => (
            <div key={card} className="h-32 bg-slate-100 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-50 rounded-3xl" />
      </div>
    );
  }

  const pieData = [
    {
      name: "Free",
      value: stats?.planStats.FREE || 0,
      color: PLAN_COLORS.FREE,
    },
    { name: "Pro", value: stats?.planStats.PRO || 0, color: PLAN_COLORS.PRO },
    {
      name: "Custom",
      value: stats?.planStats.CUSTOM || 0,
      color: PLAN_COLORS.CUSTOM,
    },
  ];

  return (
    <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">
          Revenue Intelligence
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Financial health, tier distribution, and retention risk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-blue-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold uppercase opacity-80 flex items-center gap-2">
              <TrendingUpIcon className="size-4" /> Estimated MRR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black">
              ${stats?.estimatedMRR.toLocaleString()}
            </div>
            <p className="text-xs mt-2 opacity-70">
              Monthly Recurring Revenue projection
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-slate-400 flex items-center gap-2 tracking-widest">
              <UsersIcon className="size-4" /> Premium Density
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 dark:text-slate-100">
              {(
                (((stats?.planStats.PRO || 0) +
                  (stats?.planStats.CUSTOM || 0)) /
                  ((stats?.planStats.FREE || 1) +
                    (stats?.planStats.PRO || 0) +
                    (stats?.planStats.CUSTOM || 0))) *
                100
              ).toFixed(1)}
              %
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Of total user base converted
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900 border-l-4 border-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase text-amber-600 flex items-center gap-2 tracking-widest">
              <AlertCircleIcon className="size-4" /> Retention Risk
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900 dark:text-slate-100">
              {stats?.expiringCount || 0}
            </div>
            <p className="text-xs text-slate-500 mt-2 font-medium">
              Subscriptions expiring within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle>User Tier Distribution</CardTitle>
            <CardDescription>
              Visual breakdown of plan membership
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pieData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-slate-900 text-white">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Expirations</CardTitle>
            <CardDescription className="text-slate-400">
              High-priority retention focuses
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-800">
              {stats?.expiringSoon.map((sub) => (
                <div
                  key={`${sub.plan}-${sub.expiresAt?.toISOString() ?? sub.createdAt?.toISOString() ?? "unknown"}`}
                  className="p-4 flex items-center justify-between hover:bg-slate-800 transition-colors"
                >
                  <div className="flex flex-col">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full w-fit mb-1 ${
                        sub.plan === "PRO"
                          ? "bg-blue-500/20 text-blue-400"
                          : "bg-purple-500/20 text-purple-400"
                      }`}
                    >
                      {sub.plan}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-500 flex items-center gap-1 justify-end">
                      <CalendarIcon className="size-3" />
                      {sub.expiresAt
                        ? format(new Date(sub.expiresAt), "MMM dd")
                        : "N/A"}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      Scheduled expiry
                    </span>
                  </div>
                </div>
              ))}
              {stats?.expiringSoon.length === 0 && (
                <div className="p-8 text-center text-slate-500 italic text-sm">
                  No imminent expirations found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
