"use client";

import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  ActivityIcon,
  AlertCircleIcon,
  DownloadIcon,
  LayersIcon,
  ShieldIcon,
  UsersIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";

const COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#0088fe",
  "#00C49F",
  "#FFBB28",
];

export default function SuperAdminDashboardPage() {
  const trpc = useTRPC();
  const { data, isLoading } = useQuery(
    trpc.platform.getDashboardData.queryOptions(),
  );

  const handleDownloadReport = () => {
    if (!data) return;
    const reportData = {
      summary: data.metrics,
      errors: data.charts.topErrors,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `platform-report-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((slot) => (
            <div
              key={`dashboard-skeleton-${slot}`}
              className="h-32 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
          <div className="h-80 bg-slate-100 dark:bg-slate-900 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const { metrics, activity, charts } = data || {
    metrics: null,
    activity: null,
    charts: null,
  };

  return (
    <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            Platform Command
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Global infrastructure monitor & platform orchestration.
          </p>
        </div>
        <Button
          onClick={handleDownloadReport}
          variant="outline"
          className="gap-2 border-primary/20 hover:border-primary/50 transition-colors"
        >
          <DownloadIcon className="size-4" />
          Export Platform Audit
        </Button>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500/10 via-transparent to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Total Ecosystem
            </CardTitle>
            <UsersIcon className="size-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {metrics?.totalUsers?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-indigo-600 font-medium mt-1">
              Authenticated user profiles
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Organizations
            </CardTitle>
            <ShieldIcon className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {metrics?.totalOrganizations?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              Tenant clusters managed
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-amber-500/10 via-transparent to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Live Node Instances
            </CardTitle>
            <LayersIcon className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {metrics?.totalNodes?.toLocaleString() || 0}
            </div>
            <p className="text-xs text-amber-600 font-medium mt-1">
              Across all workflow graphs
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-gradient-to-br from-blue-500/10 via-transparent to-transparent">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
              Premium Revenue
            </CardTitle>
            <ActivityIcon className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black">
              {metrics?.activeSubscriptions || 0}
            </div>
            <p className="text-xs text-blue-600 font-medium mt-1">
              PRO: {metrics?.subscriptionCounts?.PRO || 0} | CUSTOM:{" "}
              {metrics?.subscriptionCounts?.CUSTOM || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Execution Flow Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle>System Load Pattern</CardTitle>
            <CardDescription>
              Daily workflow execution volume (last 7 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.dailyExecutions}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />
                  <XAxis
                    dataKey="date"
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Node Composition */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle>Infrastructure Mix</CardTitle>
            <CardDescription>Logical node type distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.nodeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {charts?.nodeDistribution?.map((_entry, index) => (
                      <Cell
                        key={JSON.stringify(_entry)}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Growth Chart */}
        <Card className="lg:col-span-2 border-none shadow-sm bg-white dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle>Platform Growth</CardTitle>
            <CardDescription>
              New user signups per day (last 7 days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={charts?.dailyUserSignups}>
                  <defs>
                    <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorSignups)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Execution Success Rate */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50">
          <CardHeader>
            <CardTitle>Execution Health</CardTitle>
            <CardDescription>Global status ratio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={charts?.executionStatusRatio}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                    nameKey="status"
                  >
                    {charts?.executionStatusRatio?.map((entry: any, index: number) => {
                      const colorMap: Record<string, string> = {
                        SUCCESS: "#10b981", // emerald
                        FAILED: "#f43f5e",  // rose
                        RUNNING: "#3b82f6", // blue
                        WAITING_APPROVAL: "#f59e0b", // amber
                      };
                      return <Cell key={JSON.stringify(entry)} fill={colorMap[entry.status] || COLORS[index % COLORS.length]} />;
                    })}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Systems Log */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="size-5 text-rose-500" />
              <CardTitle>System Diagnostic Log</CardTitle>
            </div>
            <CardDescription>
              Top failure points detected in pipeline
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {charts?.topErrors?.map((err) => (
                <div
                  key={err.error}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <span className="text-sm font-mono text-rose-600 dark:text-rose-400 truncate">
                      {err.error}
                    </span>
                    <span className="text-xs text-slate-400">
                      Recurring platform anomaly
                    </span>
                  </div>
                  <div className="px-2 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-md text-xs font-bold">
                    {err.count} Occurrences
                  </div>
                </div>
              ))}
              {charts?.topErrors?.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic">
                  No critical anomalies detected. System stable.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Global Activity */}
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <CardTitle>Global Infrastructure Activity</CardTitle>
            <CardDescription>Real-time execution streams</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {activity?.recentExecutions?.map((execution) => (
                <div
                  key={execution.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-sm">
                      {execution.workflow?.name || "Internal Process"}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {execution.workflow?.organization?.name}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${
                        execution.status === "SUCCESS"
                          ? "bg-emerald-100 text-emerald-700"
                          : execution.status === "FAILED"
                            ? "bg-rose-100 text-rose-700"
                            : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {execution.status}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDistanceToNow(new Date(execution.startedAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Workflows Leaderboard */}
        <Card className="lg:col-span-3 border-none shadow-sm bg-white dark:bg-slate-900/50 overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <div className="flex items-center gap-2">
              <ActivityIcon className="size-5 text-indigo-500" />
              <CardTitle>Top Workflows by Volume</CardTitle>
            </div>
            <CardDescription>
              Most heavily executed workflows across the ecosystem
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50 dark:divide-slate-800">
              {charts?.topWorkflows?.map((wf: any, i: number) => (
                <div
                  key={wf.id}
                  className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold text-xs">
                      #{i + 1}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-sm">
                        {wf.name}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        {wf.organizationName}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md text-xs font-bold">
                      {wf.executions.toLocaleString()} Executions
                    </span>
                  </div>
                </div>
              ))}
              {charts?.topWorkflows?.length === 0 && (
                <div className="p-8 text-center text-slate-400 italic">
                  No workflows have been executed yet.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
