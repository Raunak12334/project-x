import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export const useSubscription = () => {
  const trpc = useTRPC();
  return useQuery(trpc.subscriptions.getCurrent.queryOptions());
};

export const useHasActiveSubscription = () => {
  const { data: subscription, isLoading, ...rest } = useSubscription();

  const hasActiveSubscription =
    subscription?.status === "ACTIVE" &&
    (subscription.plan !== "FREE" ||
      (subscription.expiresAt && subscription.expiresAt > new Date()));

  return {
    hasActiveSubscription,
    subscription,
    isLoading,
    ...rest,
  };
};
