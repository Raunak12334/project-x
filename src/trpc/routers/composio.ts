import { Composio } from "@composio/core";
import { z } from "zod";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { createTRPCRouter, protectedProcedure } from "../init";

export const composioRouter = createTRPCRouter({
  listApps: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const apiKey = process.env.COMPOSIO_API_KEY;
      if (!apiKey) return { items: [] };

      try {
        const composio = new Composio({ apiKey });
        const session = await composio.create(ctx.auth.organizationId);

        const response = await session.toolkits({
          limit: 100,
        });

        // Get connected integrations for this organization
        const connectedIntegrations = await prisma.composioIntegration.findMany(
          {
            where: {
              organizationId: ctx.auth.organizationId,
              isConnected: true,
            },
          },
        );

        const connectedSlugs = new Set(
          connectedIntegrations.map((i) => i.toolkitSlug),
        );

        return {
          items: response.items
            .filter(
              (toolkit) =>
                !input.search ||
                toolkit.name
                  .toLowerCase()
                  .includes(input.search.toLowerCase()) ||
                toolkit.slug
                  .toLowerCase()
                  .includes(input.search.toLowerCase()),
            )
            .map((toolkit) => ({
              slug: toolkit.slug,
              name: toolkit.name,
              logo: toolkit.logo,
              description: (toolkit as any).description,
              isConnected: connectedSlugs.has(toolkit.slug),
              categories: (toolkit as any).categories || ["Other"],
              authType:
                (toolkit as any).authScheme ||
                (toolkit as any).auth_type ||
                "OAUTH2",
            })),
        };
      } catch (error) {
        console.error("Error fetching Composio apps:", error);
        return { items: [] };
      }
    }),

  getConnectUrl: protectedProcedure
    .input(
      z.object({
        toolkitSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const apiKey = process.env.COMPOSIO_API_KEY;
      if (!apiKey)
        throw new Error("Composio API Key not configured in environment");

      try {
        const composio = new Composio({ apiKey });
        const session = await composio.create(ctx.auth.organizationId);

        const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/credentials/composio/callback?orgId=${ctx.auth.organizationId}`;

        const connectionRequest = await session.authorize(
          input.toolkitSlug,
          {
            callbackUrl,
          },
        );

        return {
          url: connectionRequest.redirectUrl,
        };
      } catch (error) {
        console.error("Error getting Composio connect URL:", error);
        throw new Error("Failed to get connection URL");
      }
    }),

  listConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const integrations = await prisma.composioIntegration.findMany({
        where: {
          organizationId: ctx.auth.organizationId,
          isConnected: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return {
        items: integrations.map((i) => ({
          id: i.id,
          slug: i.toolkitSlug,
          name: i.name,
          logo: i.logo,
          accountName: i.accountName,
          connectedAt: i.createdAt,
          lastSyncedAt: i.lastSyncedAt,
        })),
      };
    } catch (error) {
      console.error("Error fetching connected accounts:", error);
      return { items: [] };
    }
  }),

  disconnectIntegration: protectedProcedure
    .input(
      z.object({
        integrationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Delete the integration
        await prisma.composioIntegration.delete({
          where: {
            id: input.integrationId,
            organizationId: ctx.auth.organizationId,
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Error disconnecting integration:", error);
        throw new Error("Failed to disconnect integration");
      }
    }),

  saveConnectionData: protectedProcedure
    .input(
      z.object({
        toolkitSlug: z.string(),
        connectionId: z.string(),
        accountName: z.string().optional(),
        metadata: z.record(z.string(), z.any()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const apiKey = process.env.COMPOSIO_API_KEY;
        if (!apiKey)
          throw new Error("Composio API Key not configured in environment");

        // Get toolkit details to store name and logo
        const composio = new Composio({ apiKey });
        const session = await composio.create(ctx.auth.organizationId);
        const response = await session.toolkits({ limit: 100 });
        const toolkit = response.items.find((t) => t.slug === input.toolkitSlug);

        if (!toolkit) throw new Error("Toolkit not found");

        // Upsert the integration
        await prisma.composioIntegration.upsert({
          where: {
            organizationId_toolkitSlug: {
              organizationId: ctx.auth.organizationId,
              toolkitSlug: input.toolkitSlug,
            },
          },
          update: {
            connectionId: input.connectionId,
            accountName: input.accountName,
            isConnected: true,
            lastSyncedAt: new Date(),
            metadata: input.metadata,
          },
          create: {
            organizationId: ctx.auth.organizationId,
            toolkitSlug: input.toolkitSlug,
            name: toolkit.name,
            logo: toolkit.logo,
            connectionId: input.connectionId,
            accountName: input.accountName,
            isConnected: true,
            authToken: encrypt(input.connectionId), // Store connection ID securely
            metadata: input.metadata,
          },
        });

        return { success: true };
      } catch (error) {
        console.error("Error saving connection data:", error);
        throw new Error("Failed to save integration connection");
      }
    }),
});

