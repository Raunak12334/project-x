"use client";

import { useState } from "react";

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
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
      <DropdownMenuTrigger className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none group active:scale-95">
        <BellIcon className="size-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2.5 bg-rose-500 border-2 border-white dark:border-slate-950"></span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-80 p-0 border-slate-200 dark:border-slate-800 shadow-lg rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        <Tabs defaultValue="unread" className="w-full">
          <div className="flex items-center justify-between px-3 pt-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <TabsList className="bg-transparent h-8 p-0 gap-4">
              <TabsTrigger 
                value="unread" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-8 text-[11px] font-bold px-0 text-slate-500 transition-all"
              >
                Unread ({unreadCount})
              </TabsTrigger>
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 rounded-none h-8 text-[11px] font-bold px-0 text-slate-500 transition-all"
              >
                All
              </TabsTrigger>
            </TabsList>
            
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead.mutate()}
                className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <TabsContent value="unread" className="mt-0">
            <ScrollArea className="h-[350px]">
              <div className="flex flex-col">
                {notifications?.filter(n => !n.isRead).length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center space-y-3">
                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <BellIcon className="size-6 text-slate-400" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">All caught up!</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">No new notifications.</p>
                    </div>
                  </div>
                ) : (
                  notifications?.filter(n => !n.isRead).map((n) => (
                    <NotificationItem 
                      key={n.id} 
                      notification={n} 
                      onMarkRead={(id) => markAsRead.mutate({ id })} 
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="all" className="mt-0">
            <ScrollArea className="h-[350px]">
              <div className="flex flex-col">
                {notifications?.length === 0 ? (
                  <div className="p-12 text-center text-[11px] text-slate-500">
                    No activity found.
                  </div>
                ) : (
                  notifications?.map((n) => (
                    <NotificationItem 
                      key={n.id} 
                      notification={n} 
                      onMarkRead={(id) => markAsRead.mutate({ id })} 
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <div className="p-2 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 text-center">
          <Link 
            href="/notifications"
            className="text-[10px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors block w-full py-1"
          >
            View full history
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NotificationItem = ({ 
  notification, 
  onMarkRead 
}: { 
  notification: Notification; 
  onMarkRead: (id: string) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const getStatusIcon = (type: string) => {
    switch (type) {
      case "WORKFLOW":
        return <AlertCircleIcon className="size-4 text-rose-500" />;
      case "BILLING":
        return <CheckCircle2Icon className="size-4 text-emerald-500" />;
      default:
        return <InfoIcon className="size-4 text-blue-500" />;
    }
  };

  return (
    <div
      onClick={(e) => {
        // Prevent trigger if clicking "Show more"
        if (!notification.isRead) {
          onMarkRead(notification.id);
        }
      }}
      className={cn(
        "group relative flex items-start gap-4 p-4 cursor-pointer border-b border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-all duration-200",
        !notification.isRead && "bg-blue-50/30 dark:bg-blue-900/5"
      )}
    >
      <div className={cn(
        "mt-0.5 p-1.5 rounded-lg transition-colors border shadow-sm",
        notification.type === "WORKFLOW" ? "bg-rose-50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/20" :
        notification.type === "BILLING" ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20" :
        "bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20"
      )}>
        {getStatusIcon(notification.type)}
      </div>
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex items-center justify-between gap-2">
          <p className={cn(
            "text-xs truncate tracking-tight",
            !notification.isRead ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-600 dark:text-slate-400"
          )}>
            {notification.title}
          </p>
          <span className="text-[9px] text-slate-400 font-medium whitespace-nowrap">
            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="space-y-1">
          <p className={cn(
            "text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed transition-all",
            !isExpanded && "line-clamp-2"
          )}>
            {notification.message}
          </p>
          {notification.message.length > 80 && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-[10px] text-blue-600 dark:text-blue-400 font-bold hover:underline block"
            >
              {isExpanded ? "Show less" : "Show more"}
            </button>
          )}
        </div>
        
        {isExpanded && notification.link && (
          <Link 
            href={notification.link}
            onClick={(e) => e.stopPropagation()}
            className="mt-2 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-2 py-1 rounded-md font-bold inline-block hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Go to action
          </Link>
        )}
      </div>
      {!notification.isRead && (
        <div className="absolute right-3 top-4">
          <div className="size-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
        </div>
      )}
    </div>
  );
};


