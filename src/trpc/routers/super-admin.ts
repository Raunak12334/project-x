import { headers } from "next/headers";
import { z } from "zod";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { getExecutionScalarSelect } from "@/lib/execution-schema-compat";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
  superAdminProcedure,
} from "../init";

function isCustomPlan(plan: "FREE" | "PRO" | "CUSTOM" | "ENTERPRISE") {
  return plan === "CUSTOM" || plan === "ENTERPRISE";
}

export const superAdminRouter = createTRPCRouter({
  createTicket: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1),
        message: z.string().min(1),
        priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
      }),
    )
    // Force VS Code TS Server Cache Reload
    .mutation(async ({ ctx, input }) => {
      return prisma.supportTicket.create({
        data: {
          subject: input.subject,
          description: input.message,
          priority: input.priority,
          userId: ctx.auth.user.id,
          organizationId: ctx.auth.organizationId,
        },
      });
    }),

  getCurrentUserRole: baseProcedure.query(async () => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });
    if (!session) return null;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    return user?.role;
  }),

  getDashboardData: superAdminProcedure.query(async () => {
    const executionSelect = await getExecutionScalarSelect();
    const [
      totalUsers,
      totalOrganizations,
      subscriptions,
      totalWorkflows,
      totalExecutions,
      recentUsers,
      recentExecutions,
      nodeDistribution,
      dailyExecutions,
      topErrors,
    ] = await Promise.all([
      prisma.user.count({ where: { deletedAt: null } }),
      prisma.organization.count({ where: { deletedAt: null } }),
      prisma.subscription.findMany({
        where: { deletedAt: null },
        select: { plan: true },
      }),
      prisma.workflow.count({ where: { deletedAt: null } }),
      prisma.execution.count({ where: { deletedAt: null } }),
      prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          organization: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.execution.findMany({
        where: { deletedAt: null },
        select: {
          ...executionSelect,
          workflow: {
            select: { name: true, organization: { select: { name: true } } },
          },
        },
        orderBy: { startedAt: "desc" },
        take: 10,
      }),
      prisma.node.groupBy({
        by: ["type"],
        _count: { _all: true },
        where: { deletedAt: null },
      }),
      // Simple daily execution count for the last 7 days
      prisma.$queryRaw<{ date: Date; count: number }[]>`
        SELECT DATE_TRUNC('day', "startedAt") as date, count(*)::int as count 
        FROM execution 
        WHERE "startedAt" > NOW() - INTERVAL '7 days' AND "deletedAt" IS NULL
        GROUP BY 1 
        ORDER BY 1 ASC
      `,
      prisma.execution.groupBy({
        by: ["error"],
        _count: { _all: true },
        where: { status: "FAILED", deletedAt: null, error: { not: null } },
        orderBy: { _count: { error: "desc" } },
        take: 5,
      }),
    ]);

    const subscriptionCounts = {
      FREE: subscriptions.filter((s) => s.plan === "FREE").length,
      PRO: subscriptions.filter((s) => s.plan === "PRO").length,
      CUSTOM: subscriptions.filter((s) => isCustomPlan(s.plan)).length,
    };

    return {
      metrics: {
        totalUsers,
        totalOrganizations,
        activeSubscriptions: subscriptionCounts.PRO + subscriptionCounts.CUSTOM,
        subscriptionCounts,
        totalWorkflows,
        totalExecutions,
        totalNodes: nodeDistribution.reduce(
          (acc, curr) => acc + (curr._count?._all || 0),
          0,
        ),
      },
      activity: {
        recentUsers,
        recentExecutions,
      },
      charts: {
        nodeDistribution: nodeDistribution.map((n) => ({
          type: n.type,
          count: n._count?._all || 0,
        })),
        dailyExecutions: dailyExecutions.map((d) => ({
          date: d.date.toISOString().split("T")[0],
          count: d.count,
        })),
        topErrors: topErrors.map((e) => ({
          error: e.error || "Unknown Error",
          count: e._count?._all || 0,
        })),
      },
    };
  }),

  getUsers: superAdminProcedure.query(async () => {
    return prisma.user.findMany({
      where: { deletedAt: null },
      include: {
        organization: {
          select: { name: true, subscription: { select: { plan: true } } },
        },
        sessions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true, ipAddress: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getOrganizations: superAdminProcedure.query(async () => {
    return prisma.organization.findMany({
      where: { deletedAt: null },
      include: {
        subscription: true,
        _count: { select: { users: true, workflows: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }),

  getRevenueStats: superAdminProcedure.query(async () => {
    const subs = await prisma.subscription.findMany({
      where: { deletedAt: null },
      select: { plan: true, expiresAt: true, createdAt: true },
    });

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const planStats = {
      FREE: subs.filter((s) => s.plan === "FREE").length,
      PRO: subs.filter((s) => s.plan === "PRO").length,
      CUSTOM: subs.filter((s) => isCustomPlan(s.plan)).length,
    };

    const expiringSoon = subs.filter(
      (s) =>
        s.plan !== "FREE" &&
        s.expiresAt &&
        s.expiresAt > now &&
        s.expiresAt < thirtyDaysFromNow,
    );

    // Simple revenue estimation: PRO=$20, CUSTOM=$100
    const estimatedMRR = planStats.PRO * 20 + planStats.CUSTOM * 100;

    return {
      planStats,
      estimatedMRR,
      expiringCount: expiringSoon.length,
      expiringSoon: expiringSoon.slice(0, 10),
      totalRevenue: estimatedMRR, // Placeholder for historical total
    };
  }),

  getTickets: superAdminProcedure.query(async () => {
    return prisma.supportTicket.findMany({
      where: { deletedAt: null },
      include: {
        user: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });
  }),

  updateTicketStatus: superAdminProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"]),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.supportTicket.update({
        where: { id: input.id },
        data: { status: input.status },
      });
    }),

  getSystemActivity: superAdminProcedure.query(async () => {
    const executionSelect = await getExecutionScalarSelect();
    const [auditLogs, executions] = await Promise.all([
      prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: "desc" },
      }),
      prisma.execution.findMany({
        where: { deletedAt: null },
        take: 50,
        orderBy: { startedAt: "desc" },
        select: {
          ...executionSelect,
          workflow: {
            select: { name: true, organization: { select: { name: true } } },
          },
        },
      }),
    ]);

    return { auditLogs, executions };
  }),
});
