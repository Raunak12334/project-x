"use client";

import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import {
  ClockIcon,
  GlobeIcon,
  MailIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";

export default function UsersManagementPage() {
  const trpc = useTRPC();
  const { data: users, isLoading } = useQuery(
    trpc.platform.getUsers.queryOptions(),
  );
  const [search, setSearch] = useState("");
  const planLabel = (plan?: string | null) =>
    plan === "ENTERPRISE" ? "CUSTOM" : plan || "FREE";

  const filteredUsers = users?.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase()),
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return (
          <Badge className="bg-rose-600 hover:bg-rose-700 gap-1">
            <ShieldAlertIcon className="size-3" /> SUPER ADMIN
          </Badge>
        );
      case "ADMIN":
        return (
          <Badge className="bg-amber-600 hover:bg-amber-700 gap-1">
            <ShieldCheckIcon className="size-3" /> ADMIN
          </Badge>
        );
      default:
        return <Badge variant="secondary">USER</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded w-64" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((slot) => (
          <div
            key={`user-skeleton-${slot}`}
            className="h-16 bg-slate-100 rounded-xl"
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
            Global Identity Hub
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Master directory of all platform-wide user records.
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, or ID..."
            className="pl-10 bg-white dark:bg-slate-900 border-none shadow-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {/* Table Header */}
        <div className="hidden md:grid grid-cols-12 px-6 text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
          <div className="col-span-4 text-left font-bold">User Identity</div>
          <div className="col-span-2 text-center font-bold">Role Hierarchy</div>
          <div className="col-span-3 text-center font-bold">
            Primary Organization
          </div>
          <div className="col-span-2 text-center font-bold">
            Last Active Presence
          </div>
          <div className="col-span-1 text-right font-bold">Origin</div>
        </div>

        {filteredUsers?.map((user) => (
          <Link key={user.id} href={`/super-admin/users/${user.id}`}>
            <Card className="border-none shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-12 items-center p-4 gap-4">
                  {/* User Info */}
                  <div className="col-span-1 md:col-span-4 flex items-center gap-4">
                    <Avatar className="size-10 ring-2 ring-slate-100 dark:ring-slate-800 transition-all group-hover:ring-primary/20">
                      <AvatarImage src={user.image || ""} />
                      <AvatarFallback className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-400">
                        {user.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {user.name}
                      </span>
                      <span className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <MailIcon className="size-3 opacity-50" /> {user.email}
                      </span>
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-1 md:col-span-2 flex justify-center">
                    {getRoleBadge(user.role)}
                  </div>

                  {/* Organization */}
                  <div className="col-span-1 md:col-span-3 flex flex-col items-center gap-1">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {user.organization?.name || "Unassigned Workspace"}
                    </span>
                    {user.organization?.subscription && (
                      <Badge
                        variant="outline"
                        className="text-[9px] h-4 py-0 font-black uppercase tracking-widest border-primary/20 text-primary"
                      >
                        {planLabel(user.organization.subscription.plan)}{" "}
                        Subscriber
                      </Badge>
                    )}
                  </div>

                  {/* Activity */}
                  <div className="col-span-1 md:col-span-2 text-center">
                    <div className="flex flex-col items-center gap-0.5">
                      <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <ClockIcon className="size-3" />
                        {user.sessions[0]
                          ? formatDistanceToNow(
                              new Date(user.sessions[0].createdAt),
                              { addSuffix: true },
                            )
                          : "Never Logged In"}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Member since{" "}
                        {format(new Date(user.createdAt), "MMM yyyy")}
                      </span>
                    </div>
                  </div>

                  {/* Login Origin */}
                  <div className="col-span-1 md:col-span-1 text-right flex flex-col items-end">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                      <GlobeIcon className="size-3" />
                      {user.sessions[0]?.ipAddress || "0.0.0.0"}
                    </div>
                    <span className="text-[9px] text-slate-500 uppercase font-black opacity-30 mt-0.5 tracking-tighter">
                      Identity Verified
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredUsers?.length === 0 && (
          <div className="py-20 text-center space-y-4 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <div className="size-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <UserIcon className="size-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-medium italic">
              No identities found in this specific cluster segment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
