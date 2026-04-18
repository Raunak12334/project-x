"use server";

import { getSubscriptionToken, type Realtime } from "@inngest/realtime";
import { composioChannel } from "@/inngest/channels/composio";
import { inngest } from "@/inngest/client";

export type ComposioToken = Realtime.Token<typeof composioChannel, ["status"]>;

export async function fetchComposioRealtimeToken(): Promise<ComposioToken> {
  const token = await getSubscriptionToken(inngest, {
    channel: composioChannel(),
    topics: ["status"],
  });

  return token;
}
