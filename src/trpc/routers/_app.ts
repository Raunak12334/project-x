import { credentialsRouter } from "@/features/credentials/server/routers";
import { executionsRouter } from "@/features/executions/server/routers";
import { subscriptionsRouter } from "@/features/subscriptions/server/routers";
import { workflowsRouter } from "@/features/workflows/server/routers";
import { createTRPCRouter } from "../init";
import { superAdminRouter } from "./super-admin";

export const appRouter = createTRPCRouter({
  workflows: workflowsRouter,
  credentials: credentialsRouter,
  executions: executionsRouter,
  subscriptions: subscriptionsRouter,
  platform: superAdminRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
