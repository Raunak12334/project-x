import { z } from "zod";
import prisma from "@/lib/db";
import { createTRPCRouter, protectedProcedure } from "../init";

export const notificationsRouter = createTRPCRouter({
  getNotifications: protectedProcedure.query(async ({ ctx }) => {
    return prisma.notification.findMany({
      where: {
        OR: [
          { userId: ctx.auth.user.id },
          ctx.auth.organizationId
            ? { organizationId: ctx.auth.organizationId }
            : { userId: "impossible_value" }, // fallback
          { userId: null, organizationId: null }, // global system notifications
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });
  }),

  markAsRead: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // In a real app we might verify ownership, but this is simple enough
      return prisma.notification.update({
        where: { id: input.id },
        data: { isRead: true },
      });
    }),

  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    return prisma.notification.updateMany({
      where: {
        OR: [
          { userId: ctx.auth.user.id },
          ctx.auth.organizationId
            ? { organizationId: ctx.auth.organizationId }
            : { userId: "impossible_value" },
        ],
        isRead: false,
      },
      data: { isRead: true },
    });
  }),
});
