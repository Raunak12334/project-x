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
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StripeTriggerDialog = ({ open, onOpenChange }: Props) => {
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
  const baseWebhookUrl = `${baseUrl}/api/webhooks/stripe?workflowId=${encodeURIComponent(workflowId)}`;
  const webhookUrl = plainSecret
    ? `${baseWebhookUrl}&secret=${encodeURIComponent(plainSecret)}`
    : baseWebhookUrl;

  const copyToClipboard = async (value: string, successMessage: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(successMessage);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Stripe Trigger Configuration</DialogTitle>
          <DialogDescription>
            Configure this webhook URL in your Stripe Dashboard to trigger this
            workflow on payment events.
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
                onClick={() =>
                  copyToClipboard(webhookUrl, "Webhook URL copied")
                }
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

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Setup instructions:</h4>
            <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
              <li>Open your Stripe Dashboard</li>
              <li>Go to Developers and then Webhooks</li>
              <li>Click Add endpoint</li>
              <li>Paste the webhook URL above</li>
              <li>Rotate the secret if you need a new fully signed URL</li>
              <li>Select the Stripe events you want to listen for</li>
              <li>
                Save and keep the Stripe signing secret configured server-side
              </li>
            </ol>
          </div>

          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium text-sm">Available Variables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.amount}}"}
                </code>{" "}
                - Payment amount
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.currency}}"}
                </code>{" "}
                - Currency code
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.customerId}}"}
                </code>{" "}
                - Customer ID
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{json stripe}}"}
                </code>{" "}
                - Full event data as JSON
              </li>
              <li>
                <code className="bg-background px-1 py-0.5 rounded">
                  {"{{stripe.eventType}}"}
                </code>{" "}
                - Event type
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
