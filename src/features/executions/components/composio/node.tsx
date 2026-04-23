"use client";

import { useMutation } from "@tanstack/react-query";
import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import { useParams } from "next/navigation";
import { memo, useState } from "react";
import { toast } from "sonner";
import { getVariableSuggestions } from "@/features/editor/lib/variable-suggestions";
import { COMPOSIO_CHANNEL_NAME } from "@/inngest/channels/composio";
import { getIntegrationLogo } from "@/lib/integration-logo";
import { useTRPC } from "@/trpc/client";
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
  const { setNodes, getNodes, getEdges } = useReactFlow();
  const params = useParams<{ workflowId: string }>();
  const trpc = useTRPC();
  const testNode = useMutation(trpc.workflows.testNode.mutationOptions());

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

  const handleTest = async (values: ComposioFormValues) => {
    const nodes = getNodes();
    const edges = getEdges();
    const currentNode = nodes.find((node) => node.id === props.id);

    if (!currentNode) {
      throw new Error("Node not found on canvas");
    }

    const result = await testNode.mutateAsync({
      workflowId: params.workflowId,
      nodeId: props.id,
      node: {
        id: props.id,
        type: currentNode.type,
        position: currentNode.position,
        data: {
          ...currentNode.data,
          ...values,
        },
      },
      nodes: nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.id === props.id ? { ...node.data, ...values } : node.data,
      })),
      edges: edges.map((edge) => ({
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle,
      })),
      sampleInput: { trigger: {} },
    });

    if (result.ok) {
      toast.success("Node test completed");
    } else {
      toast.error("Node test failed");
    }

    return result;
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
        onTest={handleTest}
        defaultValues={nodeData}
        variableSuggestions={getVariableSuggestions({
          nodeId: props.id,
          nodes: getNodes(),
          edges: getEdges(),
        })}
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
