import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
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

    return NextResponse.json({
      redirectUrl: connectionRequest.redirectUrl,
      toolkitSlug: input.toolkitSlug,
    });
  } catch (_error) {
    return NextResponse.json(
      { error: "Failed to create Composio connection request" },
      { status: 400 },
    );
  }
}
