import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";

export interface PlanLimits {
  workflows: number; // -1 for unlimited
  templates: "free-only" | "all" | "configured";
}

export interface PlanUsage {
  workflows: number;
}

export const usePlan = () => {
  const trpc = useTRPC();
  const {
    data: subscription,
    isLoading,
    error,
  } = useQuery(trpc.subscriptions.getCurrent.queryOptions());

  const planLimits: Record<string, PlanLimits> = {
    FREE: { workflows: 2, templates: "free-only" },
    PRO: { workflows: -1, templates: "all" },
    CUSTOM: { workflows: -1, templates: "configured" }, // Will be configured per org
    ENTERPRISE: { workflows: -1, templates: "configured" }, // Legacy plan value
  };

  const currentPlan = subscription?.plan ?? "FREE";
  const limits = planLimits[currentPlan];
  const usage: PlanUsage = { workflows: subscription?.usage.workflows ?? 0 };

  return {
    plan: currentPlan,
    limits,
    usage,
    subscription,
    canCreateWorkflow:
      limits.workflows === -1 || usage.workflows < limits.workflows,
    isNearLimit:
      limits.workflows !== -1 && usage.workflows >= limits.workflows * 0.8,
    requiresUpgrade:
      limits.workflows !== -1 && usage.workflows >= limits.workflows,
    isLoading,
    error,
  };
};
