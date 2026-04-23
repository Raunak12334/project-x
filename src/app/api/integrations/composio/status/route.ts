import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getAuthenticatedRouteOrganization } from "@/lib/route-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const toolkitSlug = searchParams.get("toolkitSlug");
  const authContext = await getAuthenticatedRouteOrganization();

  if (!authContext) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!toolkitSlug) {
    return NextResponse.json(
      { error: "toolkitSlug is required" },
      { status: 400 },
    );
  }

  const integration = await prisma.composioIntegration.findUnique({
    where: {
      organizationId_toolkitSlug: {
        organizationId: authContext.organizationId,
        toolkitSlug,
      },
    },
  });

  return NextResponse.json({
    connected: integration?.isConnected ?? false,
    lastSyncedAt: integration?.lastSyncedAt ?? null,
  });
}
