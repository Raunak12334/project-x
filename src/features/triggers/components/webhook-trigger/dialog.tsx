"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { CopyIcon } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTRPC } from "@/trpc/client";

interface Props {
  nodeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WebhookTriggerDialog = ({ nodeId, open, onOpenChange }: Props) => {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const trpc = useTRPC();
  const { data: workflow } = useQuery(
    trpc.workflows.getOne.queryOptions({ id: workflowId }),
  );
  const [plainSecret, setPlainSecret] = useState("");
  const rotateWebhookSecret = useMutation(
    trpc.workflows.rotateWebhookSecret.mutationOptions({
      onSuccess: (data) => {
        setPlainSecret(data.secret);
        toast.success("New webhook secret generated");
      },
      onError: (error) => {
        toast.error(error.message || "Failed to generate webhook secret");
      },
    }),
  );
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== "undefined" ? window.location.origin : "");
  const webhookUrl = `${baseUrl}/api/webhooks/generic?workflowId=${encodeURIComponent(workflowId)}&nodeId=${encodeURIComponent(nodeId)}`;
  const curlExample = plainSecret
    ? `curl -X POST "${webhookUrl}" \\\n  -H "Content-Type: application/json" \\\n  -H "x-otogent-webhook-secret: ${plainSecret}" \\\n  -d '{"orderId":"123","status":"paid"}'`
    : `curl -X POST "${webhookUrl}" \\\n  -H "Content-Type: application/json" \\\n  -H "x-otogent-webhook-secret: <generate-secret-first>" \\\n  -d '{"orderId":"123","status":"paid"}'`;

  const copyText = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Could not copy");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Webhook Trigger</DialogTitle>
          <DialogDescription>
            Send a request to this URL to start the workflow.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook-url">Webhook URL</Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                value={webhookUrl}
                readOnly
                className="font-mono text-sm"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => copyText(webhookUrl, "Webhook URL copied")}
              >
                <CopyIcon className="size-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="webhook-secret">Webhook Secret</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => rotateWebhookSecret.mutate({ id: workflowId })}
                disabled={rotateWebhookSecret.isPending}
              >
                {workflow?.webhookSecretConfigured
                  ? "Rotate Secret"
                  : "Generate Secret"}
              </Button>
            </div>
            <Input
              id="webhook-secret"
              value={
                plainSecret ||
                (workflow?.webhookSecretConfigured
                  ? "Current secret is hidden. Rotate to generate a new one."
                  : "No webhook secret generated yet.")
              }
              readOnly
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2 rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between gap-4">
              <h4 className="text-sm font-medium">Quick test</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => copyText(curlExample, "cURL example copied")}
              >
                <CopyIcon className="mr-2 size-4" />
                Copy cURL
              </Button>
            </div>
            <pre className="overflow-x-auto rounded-md bg-background p-3 text-xs text-muted-foreground">
              {curlExample}
            </pre>
          </div>

          <div className="space-y-2 rounded-lg bg-muted p-4">
            <h4 className="text-sm font-medium">Available data</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>
                <code className="rounded bg-background px-1 py-0.5">
                  {"{{webhook.method}}"}
                </code>{" "}
                request method
              </li>
              <li>
                <code className="rounded bg-background px-1 py-0.5">
                  {"{{json webhook.body}}"}
                </code>{" "}
                request body
              </li>
              <li>
                <code className="rounded bg-background px-1 py-0.5">
                  {"{{json webhook.headers}}"}
                </code>{" "}
                request headers
              </li>
              <li>
                <code className="rounded bg-background px-1 py-0.5">
                  {"{{webhook.query.orderId}}"}
                </code>{" "}
                query value
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
