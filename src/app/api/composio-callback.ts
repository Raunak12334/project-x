import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

/**
 * Composio OAuth callback handler
 * Called after user completes OAuth flow with an integration
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get("orgId");
    const toolkitSlug = searchParams.get("toolkit_slug");
    const connectionId = searchParams.get("connection_id");
    const status = searchParams.get("status");
    const accountName = searchParams.get("account_name");

    if (!orgId || !connectionId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    if (status === "success" && toolkitSlug) {
      // Save the connection to database
      const integration = await prisma.composioIntegration.upsert({
        where: {
          organizationId_toolkitSlug: {
            organizationId: orgId,
            toolkitSlug,
          },
        },
        update: {
          connectionId,
          accountName: accountName || undefined,
          isConnected: true,
          lastSyncedAt: new Date(),
        },
        create: {
          organizationId: orgId,
          toolkitSlug,
          name: toolkitSlug, // Will be updated with actual name
          connectionId,
          accountName: accountName || undefined,
          isConnected: true,
          authToken: connectionId, // In production, encrypt this
        },
      });

      // Redirect to credentials page with success message
      const redirectUrl = new URL(
        "/credentials?integration_status=success",
        process.env.NEXT_PUBLIC_APP_URL,
      );
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect on failure
    const redirectUrl = new URL(
      "/credentials?integration_status=failed",
      process.env.NEXT_PUBLIC_APP_URL,
    );
    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Composio callback error:", error);
    const redirectUrl = new URL(
      "/credentials?integration_status=error",
      process.env.NEXT_PUBLIC_APP_URL,
    );
    return NextResponse.redirect(redirectUrl);
  }
}
