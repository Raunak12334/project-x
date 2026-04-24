import { type NextRequest, NextResponse } from "next/server";
import { verifyComposioOAuthState } from "@/lib/composio-oauth-state";
import prisma from "@/lib/db";
import { encrypt } from "@/lib/encryption";
import { getAppUrl } from "@/lib/env";
import { getAuthenticatedRouteOrganization } from "@/lib/route-auth";

export async function GET(request: NextRequest) {
  const appUrl = getAppUrl();

  try {
    const { searchParams } = new URL(request.url);
    const toolkitSlug = searchParams.get("toolkit_slug");
    const state = verifyComposioOAuthState(searchParams.get("state"));
    const connectionId =
      searchParams.get("connection_id") ||
      searchParams.get("connected_account_id") ||
      searchParams.get("connectedAccountId") ||
      searchParams.get("id");
    const status = searchParams.get("status");
    const accountName = searchParams.get("account_name");
    const authContext = await getAuthenticatedRouteOrganization();

    if (
      !authContext ||
      !state ||
      state.organizationId !== authContext.organizationId ||
      !toolkitSlug ||
      state.toolkitSlug !== toolkitSlug ||
      (status && status !== "success")
    ) {
      return NextResponse.redirect(
        new URL("/credentials?integration_status=failed", appUrl),
      );
    }

    const existingIntegration = await prisma.composioIntegration.findUnique({
      where: {
        organizationId_toolkitSlug: {
          organizationId: authContext.organizationId,
          toolkitSlug,
        },
      },
    });
    const resolvedConnectionId =
      connectionId || existingIntegration?.connectionId;

    if (!resolvedConnectionId) {
      return NextResponse.redirect(
        new URL("/credentials?integration_status=failed", appUrl),
      );
    }

    await prisma.composioIntegration.upsert({
      where: {
        organizationId_toolkitSlug: {
          organizationId: authContext.organizationId,
          toolkitSlug,
        },
      },
      update: {
        connectionId: resolvedConnectionId,
        accountName: accountName || undefined,
        authTokenEncrypted: encrypt(resolvedConnectionId),
        isConnected: true,
        lastSyncedAt: new Date(),
      },
      create: {
        organizationId: authContext.organizationId,
        toolkitSlug,
        name: toolkitSlug,
        connectionId: resolvedConnectionId,
        accountName: accountName || undefined,
        isConnected: true,
        authTokenEncrypted: encrypt(resolvedConnectionId),
      },
    });

    return NextResponse.redirect(
      new URL(
        `/integrations/callback/success?toolkit_slug=${toolkitSlug ?? "Integration"}`,
        appUrl,
      ),
    );
  } catch (error) {
    console.error("Composio callback error:", error);
    return NextResponse.redirect(
      new URL("/credentials?integration_status=error", appUrl),
    );
  }
}
