"use client";

import { BellIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Notification } from "@prisma/client";

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none">
        <BellIcon className="size-5 text-slate-700 dark:text-slate-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex size-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full size-2.5 bg-rose-500"></span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between p-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <DropdownMenuLabel className="font-semibold px-0 text-sm">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead.mutate()}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications?.length === 0 ? (
            <div className="p-4 text-center text-sm text-slate-500">
              No notifications yet.
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
                className={`p-3 border-b border-slate-100 dark:border-slate-800 last:border-0 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors ${
                  !notification.isRead ? "bg-blue-50/50 dark:bg-blue-900/10" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <p className={`text-sm ${!notification.isRead ? "font-bold text-slate-900 dark:text-slate-100" : "font-medium text-slate-700 dark:text-slate-300"}`}>
                      {notification.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <div className="size-2 rounded-full bg-blue-500 mt-1 flex-shrink-0" />
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
