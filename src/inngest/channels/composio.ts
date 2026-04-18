import { channel, topic } from "@inngest/realtime";

export const COMPOSIO_CHANNEL_NAME = "composio-execution";

export const composioChannel = channel(COMPOSIO_CHANNEL_NAME).addTopic(
  topic("status").type<{
    nodeId: string;
    status: "loading" | "success" | "error";
  }>(),
);
