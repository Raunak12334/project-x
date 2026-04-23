import { CredentialType } from "@prisma/client";
import z from "zod";
import { PAGINATION } from "@/config/constants";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import {
  createTRPCRouter,
  premiumProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { validateCredential } from "./validators";

export const credentialsRouter = createTRPCRouter({
  create: premiumProcedure
    .input(
      z.object({
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { name, value, type } = input;

      return prisma.credential.create({
        data: {
          name,
          organizationId: ctx.auth.organizationId,
          type,
          value: encrypt(value),
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return prisma.credential.delete({
        where: {
          id: input.id,
          organizationId: ctx.auth.organizationId,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(({ ctx, input }) => {
      const { id, name, type, value } = input;

      return prisma.credential.update({
        where: { id, organizationId: ctx.auth.organizationId },
        data: {
          name,
          type,
          value: encrypt(value),
        },
      });
    }),
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => {
      return prisma.credential.findUniqueOrThrow({
        where: { id: input.id, organizationId: ctx.auth.organizationId },
      });
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(PAGINATION.DEFAULT_PAGE),
        pageSize: z
          .number()
          .min(PAGINATION.MIN_PAGE_SIZE)
          .max(PAGINATION.MAX_PAGE_SIZE)
          .default(PAGINATION.DEFAULT_PAGE_SIZE),
        search: z.string().default(""),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search } = input;
      const searchFilter = search.trim();

      const [credentials, integrations] = await Promise.all([
        prisma.credential.findMany({
          where: {
            organizationId: ctx.auth.organizationId,
            deletedAt: null,
            ...(searchFilter
              ? {
                  name: {
                    contains: searchFilter,
                    mode: "insensitive" as const,
                  },
                }
              : {}),
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
        prisma.composioIntegration.findMany({
          where: {
            organizationId: ctx.auth.organizationId,
            deletedAt: null,
            isConnected: true,
            ...(searchFilter
              ? {
                  OR: [
                    {
                      name: {
                        contains: searchFilter,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      toolkitSlug: {
                        contains: searchFilter,
                        mode: "insensitive" as const,
                      },
                    },
                    {
                      accountName: {
                        contains: searchFilter,
                        mode: "insensitive" as const,
                      },
                    },
                  ],
                }
              : {}),
          },
          orderBy: {
            updatedAt: "desc",
          },
        }),
      ]);

      const items = [
        ...credentials.map((credential) => ({
          id: credential.id,
          source: "credential" as const,
          name: credential.name,
          type: credential.type,
          createdAt: credential.createdAt,
          updatedAt: credential.updatedAt,
        })),
        ...integrations.map((integration) => ({
          id: integration.id,
          source: "integration" as const,
          name: integration.name || integration.toolkitSlug,
          type: CredentialType.COMPOSIO,
          toolkitSlug: integration.toolkitSlug,
          accountName: integration.accountName,
          logo: integration.logo,
          createdAt: integration.createdAt,
          updatedAt: integration.updatedAt,
        })),
      ].sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      const totalCount = items.length;
      const paginatedItems = items.slice(
        (page - 1) * pageSize,
        page * pageSize,
      );
      const totalPages = Math.ceil(totalCount / pageSize);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        items: paginatedItems,
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      };
    }),
  getByType: protectedProcedure
    .input(
      z.object({
        type: z.enum(CredentialType),
      }),
    )
    .query(({ input, ctx }) => {
      const { type } = input;

      return prisma.credential.findMany({
        where: { type, organizationId: ctx.auth.organizationId },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }),
  test: protectedProcedure
    .input(
      z.object({
        type: z.enum(CredentialType),
        value: z.string().min(1, "Value is required"),
      }),
    )
    .mutation(async ({ input }) => {
      return await validateCredential(input.type, input.value);
    }),
});
