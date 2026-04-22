import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { getComposioCallbackUrl } from "@/lib/env";
import { createComposioConnection } from "@/lib/integrations/composio";

const connectSchema = z.object({
  organizationId: z.string().min(1),
  toolkitSlug: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = connectSchema.parse(body);

    const callbackUrl = getComposioCallbackUrl(input.organizationId);
    const connectionRequest = await createComposioConnection({
      organizationId: input.organizationId,
      toolkitSlug: input.toolkitSlug,
      callbackUrl,
    });

    await prisma.composioIntegration.upsert({
      where: {
        organizationId_toolkitSlug: {
          organizationId: input.organizationId,
          toolkitSlug: input.toolkitSlug,
        },
      },
      update: {
        connectionId: connectionRequest.id,
        authToken: encrypt(connectionRequest.id),
        isConnected: false,
        lastSyncedAt: new Date(),
      },
      create: {
        organizationId: input.organizationId,
        toolkitSlug: input.toolkitSlug,
        name: input.toolkitSlug,
        connectionId: connectionRequest.id,
        authToken: encrypt(connectionRequest.id),
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
