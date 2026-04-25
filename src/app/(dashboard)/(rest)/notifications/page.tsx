"use client";

import { useTRPC } from "@/trpc/client";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { BellIcon, AlertCircleIcon, InfoIcon, CheckCircle2Icon } from "lucide-react";
import { 
  EntityContainer, 
  EntityHeader, 
  EntityItem, 
  EntityList, 
  LoadingView, 
  ErrorView, 
  EmptyView 
} from "@/components/entity-components";
import type { Notification } from "@prisma/client";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const trpc = useTRPC();
  const { data: notifications, isLoading, isError, refetch } = useQuery({
    ...trpc.notifications.getNotifications.queryOptions(),
  });

  const markAsRead = useMutation({
    ...trpc.notifications.markAsRead.mutationOptions(),
    onSuccess: () => refetch(),
  });

  const getStatusIcon = (type: string) => {
    switch (type) {
      case "WORKFLOW":
        return <AlertCircleIcon className="size-5 text-rose-500" />;
      case "SYSTEM":
        return <InfoIcon className="size-5 text-blue-500" />;
      case "BILLING":
        return <CheckCircle2Icon className="size-5 text-emerald-500" />;
      default:
        return <BellIcon className="size-5 text-slate-400" />;
    }
  };

  if (isLoading) return (
    <EntityContainer header={<EntityHeader title="Notifications" description="Stay updated with your platform activity" />}>
      <LoadingView message="Loading notifications..." />
    </EntityContainer>
  );

  if (isError) return (
    <EntityContainer header={<EntityHeader title="Notifications" description="Stay updated with your platform activity" />}>
      <ErrorView message="Failed to load notifications" />
    </EntityContainer>
  );

  return (
    <EntityContainer 
      header={
        <EntityHeader 
          title="Notifications" 
          description="Stay updated with your platform activity" 
        />
      }
    >
      <EntityList
        items={notifications || []}
        getKey={(n) => n.id}
        emptyView={<EmptyView message="You don't have any notifications yet." />}
        renderItem={(notification: Notification) => (
          <EntityItem
            href={notification.link || "#"}
            title={notification.title}
            subtitle={
              <div className="space-y-1">
                <p className="line-clamp-2">{notification.message}</p>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">
                  {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                </p>
              </div>
            }
            image={
              <div className={cn(
                "size-10 rounded-xl flex items-center justify-center transition-colors shadow-sm border border-slate-100 dark:border-slate-800",
                !notification.isRead ? "bg-white dark:bg-slate-900" : "bg-slate-50 dark:bg-slate-900/50"
              )}>
                {getStatusIcon(notification.type)}
              </div>
            }
            className={cn(
              "transition-all",
              !notification.isRead && "border-l-2 border-l-blue-500 bg-blue-50/10 dark:bg-blue-900/5"
            )}
            onRemove={async () => {
                if (!notification.isRead) {
                    await markAsRead.mutateAsync({ id: notification.id });
                }
            }}
          />
        )}
      />
    </EntityContainer>
  );
}
