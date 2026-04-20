import { type NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { getAppUrl } from "@/lib/env";

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl();

  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const toolkitSlug = searchParams.get("toolkit_slug");
    const connectionId = searchParams.get("connection_id");
    const status = searchParams.get("status");
    const accountName = searchParams.get("account_name");

    if (!orgId || !toolkitSlug || !connectionId || status !== "success") {
      return NextResponse.redirect(
        new URL("/credentials?integration_status=failed", appUrl),
      );
    }

    await prisma.composioIntegration.upsert({
      where: {
        organizationId_toolkitSlug: {
          organizationId: orgId,
          toolkitSlug,
        },
      },
      update: {
        connectionId,
        accountName: accountName || undefined,
        authToken: encrypt(connectionId),
        isConnected: true,
        lastSyncedAt: new Date(),
      },
      create: {
        organizationId: orgId,
        toolkitSlug,
        name: toolkitSlug,
        connectionId,
        accountName: accountName || undefined,
        isConnected: true,
        authToken: encrypt(connectionId),
      },
    });

    return NextResponse.redirect(
      new URL("/credentials?integration_status=success", appUrl),
    );
  } catch (error) {
    console.error("Composio callback error:", error);
    return NextResponse.redirect(
      new URL("/credentials?integration_status=error", appUrl),
    );
  }
}
