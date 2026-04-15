"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  Building2Icon,
  ClockIcon,
  GlobeIcon,
  MailIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTRPC } from "@/trpc/client";

export default function UserDetailPage() {
  const { id } = useParams();
  const trpc = useTRPC();

  const { data: users, isLoading } = useQuery(
    trpc.platform.getUsers.queryOptions(),
  );
  const user = users?.find((u) => u.id === id);
  const planLabel = (plan?: string | null) =>
    plan === "ENTERPRISE" ? "CUSTOM" : plan || "FREE";

  if (isLoading)
    return (
      <div className="p-8 animate-pulse space-y-4">
        <div className="h-20 bg-slate-200 rounded-full w-20" />
        <div className="h-10 bg-slate-100 rounded w-1/2" />
      </div>
    );

  if (!user)
    return (
      <div className="p-20 text-center font-bold text-slate-400">
        User record not found.
      </div>
    );

  return (
    <div className="p-8 space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col md:flex-row items-center gap-8 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm">
        <Avatar className="size-32 ring-4 ring-blue-500/10 shadow-2xl">
          <AvatarImage src={user.image || ""} />
          <AvatarFallback className="text-4xl font-black bg-slate-100 dark:bg-slate-800 text-slate-400">
            {user.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2 text-center md:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
            <h1 className="text-4xl font-black text-slate-900 dark:text-slate-50">
              {user.name}
            </h1>
            <Badge
              className={
                user.role === "SUPER_ADMIN" ? "bg-rose-500" : "bg-slate-500"
              }
            >
              {user.role}
            </Badge>
          </div>
          <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-2">
            <MailIcon className="size-4" /> {user.email}
          </p>
          <div className="flex items-center justify-center md:justify-start gap-4 text-xs text-slate-400 pt-2 font-mono">
            <span>ID: {user.id}</span>
            <span>
              MEMBERSHIP: {format(new Date(user.createdAt), "MMMM yyyy")}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheckIcon className="size-5 text-emerald-500" />
              Security Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Last Access Origin
              </span>
              <div className="flex items-center gap-2 mt-1 text-sm font-mono font-bold">
                <GlobeIcon className="size-4 text-slate-400" />
                {user.sessions[0]?.ipAddress || "Unknown / Native"}
              </div>
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">
                Session Persistence
              </span>
              <div className="flex items-center gap-2 mt-1 text-sm font-bold">
                <ClockIcon className="size-4 text-slate-400" />
                {user.sessions[0]
                  ? formatDistanceToNow(new Date(user.sessions[0].createdAt), {
                      addSuffix: true,
                    })
                  : "Never Active"}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2Icon className="size-5 text-blue-500" />
              Organizational Affiliation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl space-y-3">
              <div className="text-xl font-black">
                {user.organization?.name || "Individual Tier"}
              </div>
              <Badge
                variant="outline"
                className="border-blue-500 text-blue-500 font-black"
              >
                {planLabel(user.organization?.subscription?.plan)} CLUSTER
              </Badge>
              <p className="text-xs text-slate-500">
                Joined this organization cluster on{" "}
                {format(new Date(user.createdAt), "PP")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
