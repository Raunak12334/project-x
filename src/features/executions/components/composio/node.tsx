"use client";

import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { memo, useState } from "react";
import { COMPOSIO_CHANNEL_NAME } from "@/inngest/channels/composio";
import { getIntegrationLogo } from "@/lib/integration-logo";
import { useNodeStatus } from "../../hooks/use-node-status";
import { BaseExecutionNode } from "../base-execution-node";
import { fetchComposioRealtimeToken } from "./actions";
import { ComposioDialog, type ComposioFormValues } from "./dialog";

type ComposioNodeData = {
  appLogo?: string;
  name?: string;
  variableName?: string;
  credentialId?: string;
  integrationId?: string;
  toolSlug?: string;
  toolkitSlug?: string;
  argumentsJson?: string;
};

type ComposioNodeType = Node<ComposioNodeData>;

export const ComposioNode = memo((props: NodeProps<ComposioNodeType>) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setNodes } = useReactFlow();

  const nodeStatus = useNodeStatus({
    nodeId: props.id,
    channel: COMPOSIO_CHANNEL_NAME,
    topic: "status",
    refreshToken: fetchComposioRealtimeToken,
  });

  const handleOpenSettings = () => setDialogOpen(true);

  const handleSubmit = (values: ComposioFormValues) => {
    setNodes((nodes) =>
      nodes.map((node) => {
        if (node.id === props.id) {
          return {
            ...node,
            data: {
              ...node.data,
              ...values,
            },
          };
        }
        return node;
      }),
    );
  };

  const nodeData = props.data;
  const description = nodeData?.toolSlug
    ? `Action: ${nodeData.toolSlug.slice(0, 30)}`
    : nodeData?.toolkitSlug
      ? `App: ${nodeData.toolkitSlug}`
      : "Not configured";
  const name = nodeData?.name || "Composio";
  const icon = getIntegrationLogo({
    slug: nodeData?.toolkitSlug,
    name,
    logo: nodeData?.appLogo,
  });

  return (
    <>
      <ComposioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
        defaultValues={nodeData}
      />
      <BaseExecutionNode
        {...props}
        id={props.id}
        icon={icon}
        name={name}
        status={nodeStatus}
        description={description}
        onSettings={handleOpenSettings}
        onDoubleClick={handleOpenSettings}
      />
    </>
  );
});

ComposioNode.displayName = "ComposioNode";
