import { Composio } from "@composio/core";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";

export const composioRouter = createTRPCRouter({
  listApps: protectedProcedure
    .input(z.object({
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      // For now, we assume a global API key or fetch it from context if we move to per-user
      const apiKey = process.env.COMPOSIO_API_KEY;
      if (!apiKey) return { items: [] };

      const composio = new Composio({ apiKey });
      const session = await composio.create(ctx.auth.organizationId);
      
      const response = await session.toolkits({ 
        limit: 50,
        // search: input.search // SDK might support this or we filter manually
      });

      return {
        items: response.items.map(toolkit => ({
          slug: toolkit.slug,
          name: toolkit.name,
          logo: toolkit.logo,
          description: toolkit.description,
          isConnected: toolkit.connection?.isActive ?? false,
        })),
      };
    }),

  getConnectUrl: protectedProcedure
    .input(z.object({
      toolkitSlug: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const apiKey = process.env.COMPOSIO_API_KEY;
      if (!apiKey) throw new Error("Composio API Key not configured in environment");

      const composio = new Composio({ apiKey });
      const session = await composio.create(ctx.auth.organizationId);
      
      const connectionRequest = await session.authorize(input.toolkitSlug, {
          // You might want to pass a callback URL back to your integration page
          callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/credentials`,
      });

      return {
        url: connectionRequest.redirectUrl,
      };
    }),

  listConnectedAccounts: protectedProcedure.query(async ({ ctx }) => {
    const apiKey = process.env.COMPOSIO_API_KEY;
    if (!apiKey) return { items: [] };

    const composio = new Composio({ apiKey });
    const session = await composio.create(ctx.auth.organizationId);
    
    // session.connections() or similar to list active integrations
    const { items } = await session.toolkits({ limit: 100 });
    
    return {
      items: items
        .filter(t => t.connection?.isActive)
        .map(t => ({
          slug: t.slug,
          name: t.name,
          logo: t.logo,
        })),
    };
  }),
});
