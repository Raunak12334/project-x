import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createComposioOAuthState } from "@/lib/composio-oauth-state";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { getComposioCallbackUrl } from "@/lib/env";
import { createComposioConnection } from "@/lib/integrations/composio";
import { getAuthenticatedRouteOrganization } from "@/lib/route-auth";

const connectSchema = z.object({
  toolkitSlug: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = connectSchema.parse(body);
    const authContext = await getAuthenticatedRouteOrganization();

    if (!authContext) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = createComposioOAuthState({
      organizationId: authContext.organizationId,
      toolkitSlug: input.toolkitSlug,
    });
    const callbackUrl = getComposioCallbackUrl(input.toolkitSlug, state);
    const connectionRequest = await createComposioConnection({
      organizationId: authContext.organizationId,
      toolkitSlug: input.toolkitSlug,
      callbackUrl,
    });

    await prisma.composioIntegration.upsert({
      where: {
        organizationId_toolkitSlug: {
          organizationId: authContext.organizationId,
          toolkitSlug: input.toolkitSlug,
        },
      },
      update: {
        connectionId: connectionRequest.id,
        authTokenEncrypted: encrypt(connectionRequest.id),
        isConnected: false,
        lastSyncedAt: new Date(),
      },
      create: {
        organizationId: authContext.organizationId,
        toolkitSlug: input.toolkitSlug,
        name: input.toolkitSlug,
        connectionId: connectionRequest.id,
        authTokenEncrypted: encrypt(connectionRequest.id),
        isConnected: false,
      },
    });

    return NextResponse.json({
      redirectUrl: connectionRequest.redirectUrl,
      connectionId: connectionRequest.id,
      toolkitSlug: input.toolkitSlug,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create Composio connection request" },
      { status: 400 },
    );
  }
}
