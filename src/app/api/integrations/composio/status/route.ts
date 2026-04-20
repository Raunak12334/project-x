import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");
  const toolkitSlug = searchParams.get("toolkitSlug");

  if (!organizationId || !toolkitSlug) {
    return NextResponse.json(
      { error: "organizationId and toolkitSlug are required" },
      { status: 400 },
    );
  }

  const integration = await prisma.composioIntegration.findUnique({
    where: {
      organizationId_toolkitSlug: {
        organizationId,
        toolkitSlug,
      },
    },
  });

  return NextResponse.json({
    connected: integration?.isConnected ?? false,
    connectionId: integration?.connectionId ?? null,
    lastSyncedAt: integration?.lastSyncedAt ?? null,
  });
}
