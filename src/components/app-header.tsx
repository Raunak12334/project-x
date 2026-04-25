"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { NotificationBell } from "./notification-bell";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

export const AppHeader = () => {
  const { data: session, isPending } = authClient.useSession();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="size-8 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" />
      </div>

      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800 h-8">
          {isPending ? (
            <Skeleton className="size-8 rounded-full" />
          ) : session?.user ? (
            <div className="flex items-center gap-2 group cursor-pointer">
              <Avatar className="size-8 border border-slate-200 dark:border-slate-800 group-hover:ring-2 group-hover:ring-blue-500/20 transition-all">
                <AvatarImage src={session.user.image || undefined} alt={session.user.name} />
                <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase">
                  {session.user.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:flex flex-col items-start -space-y-0.5 pr-2">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[100px]">
                  {session.user.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium capitalize">
                  {(session.user as any).role?.toLowerCase() || "user"}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
