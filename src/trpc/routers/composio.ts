import { z } from "zod";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { getComposioCallbackUrl } from "@/lib/env";
import {
  createComposioConnection,
  listComposioActions,
  listComposioApps,
} from "@/lib/integrations/composio";
import { createTRPCRouter, protectedProcedure } from "../init";
import { COMPOSIO_FULL_CATALOG } from "@/config/composio-full-catalog";

type ComposioToolkitMeta = {
  description?: string;
  categories?: string[];
  authScheme?: string;
  auth_type?: string;
};

function asToolkitMeta(toolkit: unknown): ComposioToolkitMeta {
  return toolkit as ComposioToolkitMeta;
}

export const composioRouter = createTRPCRouter({
  listApps: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const response = await listComposioApps(ctx.auth.organizationId);
        let toolkitItems = Array.isArray(response?.items) ? response.items : [];

        // If the marketplace is empty, provide a fallback of common integrations
        // to ensure the UI remains functional while the SDK/API might be empty.
        if (toolkitItems.length === 0) {
          toolkitItems = COMPOSIO_FULL_CATALOG;
        }

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
          items: toolkitItems
            .filter(
              (toolkit: any) =>
                !input.search ||
                (toolkit.name || "")
                  .toLowerCase()
                  .includes(input.search.toLowerCase()) ||
                (toolkit.slug || "")
                  .toLowerCase()
                  .includes(input.search.toLowerCase()),
            )
            .map((toolkit: any) => {
              const meta = asToolkitMeta(toolkit);
              // Ensure we have fallback values for everything
              return {
                slug: toolkit.slug || "unknown",
                name: toolkit.name || toolkit.slug || "Unknown Tool",
                logo: toolkit.logo || null,
                description: meta.description || `Connect ${toolkit.name || toolkit.slug} to power your agent workflows.`,
                isConnected: connectedSlugs.has(toolkit.slug),
                categories: Array.isArray(meta.categories) && meta.categories.length > 0 
                  ? meta.categories 
                  : (toolkit.tags || ["Other"]), // Try tags as fallback for categories
                authType:
                  meta.authScheme ||
                  meta.auth_type ||
                  (toolkit.authConfig?.auth_type) ||
                  "OAUTH2",
              };
            }),
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
      try {
        const callbackUrl = getComposioCallbackUrl(ctx.auth.organizationId);
        const connectionRequest = await createComposioConnection({
          organizationId: ctx.auth.organizationId,
          toolkitSlug: input.toolkitSlug,
          callbackUrl,
        });

        return {
          url: connectionRequest.redirectUrl,
        };
      } catch (error) {
        console.error("Error getting Composio connect URL:", error);
        throw new Error("Failed to get connection URL");
      }
    }),
  listAvailableActions: protectedProcedure
    .input(
      z.object({
        toolkitSlug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const actions = await listComposioActions(
          ctx.auth.organizationId,
          input.toolkitSlug,
        );

        return {
          items: actions.map((action) => {
            const meta = action as Record<string, unknown>;
            return {
              slug: (meta.name as string) || (meta.slug as string),
              name: (meta.name as string) || (meta.slug as string),
              description: (meta.description as string) || "",
              parameters: (meta.parameters as any) || {},
            };
          }),
        };
      } catch (error) {
        console.error("Error listing available actions:", error);
        return { items: [] };
      }
    }),
  disconnect: protectedProcedure
    .input(
      z.object({
        toolkitSlug: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        await prisma.composioIntegration.updateMany({
          where: {
            organizationId: ctx.auth.organizationId,
            toolkitSlug: input.toolkitSlug,
          },
          data: {
            isConnected: false,
          },
        });
        return { success: true };
      } catch (error) {
        console.error("Error disconnecting integration:", error);
        throw new Error("Failed to disconnect integration");
      }
    }),

  listConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const integrations = await prisma.composioIntegration.findMany({
        where: {
          organizationId: ctx.auth.organizationId,
          isConnected: true,
        },
      });

      return {
        items: integrations.map((integration) => ({
          id: integration.id,
          name: integration.name,
          accountName: integration.accountName,
        })),
      };
    } catch (error) {
      console.error("Error listing connected accounts:", error);
      return { items: [] };
    }
  }),
});
