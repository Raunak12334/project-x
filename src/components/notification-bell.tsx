"use client";

import { BellIcon, CheckCircle2Icon, AlertCircleIcon, InfoIcon, MoreHorizontalIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Notification } from "@prisma/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export const NotificationBell = () => {
  const trpc = useTRPC();
  const { data: notifications, refetch } = useQuery({
    ...trpc.notifications.getNotifications.queryOptions(),
    refetchInterval: 30000,
  });

  const markAsRead = useMutation({
    ...trpc.notifications.markAsRead.mutationOptions(),
    onSuccess: () => refetch(),
  });

  const markAllAsRead = useMutation({
    ...trpc.notifications.markAllAsRead.mutationOptions(),
    onSuccess: () => refetch(),
  });

  const unreadCount = notifications?.filter((n: Notification) => !n.isRead).length || 0;

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "WORKFLOW":
        return <AlertCircleIcon className="size-4 text-rose-500" />;
      case "SYSTEM":
        return <InfoIcon className="size-4 text-blue-500" />;
      case "BILLING":
        return <CheckCircle2Icon className="size-4 text-emerald-500" />;
      default:
        return <InfoIcon className="size-4 text-slate-500" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none group active:scale-95">
        <BellIcon className="size-5 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2.5 bg-rose-500 border-2 border-white dark:border-slate-950"></span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-96 p-0 border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
          <DropdownMenuLabel className="font-bold text-base px-0 tracking-tight">Notifications</DropdownMenuLabel>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Mark all as read
              </button>
            )}
            <button className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors text-slate-400">
              <MoreHorizontalIcon className="size-4" />
            </button>
          </div>
        </div>
        
        <ScrollArea className="h-[400px]">
          <div className="flex flex-col">
            {notifications?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                  <BellIcon className="size-6 text-slate-400" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">All caught up!</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">You don&apos;t have any new notifications.</p>
                </div>
              </div>
            ) : (
              notifications?.map((notification: Notification) => (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.isRead) {
                      markAsRead.mutate({ id: notification.id });
                    }
                    if (notification.link) {
                      window.location.href = notification.link;
                    }
                  }}
                  className={cn(
                    "group relative flex items-start gap-4 p-4 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all duration-200",
                    !notification.isRead && "bg-blue-50/30 dark:bg-blue-900/5"
                  )}
                >
                  <div className={cn(
                    "mt-1 p-2 rounded-xl transition-colors",
                    notification.type === "WORKFLOW" ? "bg-rose-50 dark:bg-rose-900/10" :
                    notification.type === "BILLING" ? "bg-emerald-50 dark:bg-emerald-900/10" :
                    "bg-blue-50 dark:bg-blue-900/10"
                  )}>
                    {getStatusIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn(
                        "text-sm truncate tracking-tight",
                        !notification.isRead ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-600 dark:text-slate-400"
                      )}>
                        {notification.title}
                      </p>
                      <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="size-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-center">
          <button className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            View all activity
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
