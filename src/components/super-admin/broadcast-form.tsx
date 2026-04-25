"use client";

import { useState } from "react";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MegaphoneIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";

export const BroadcastNotificationForm = () => {
  const trpc = useTRPC();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"SYSTEM" | "OFFER" | "WELCOME" | "ALERT">("SYSTEM");
  const [targetOrg, setTargetOrg] = useState("all");

  const { data: organizations } = useQuery(
    trpc.platform.getOrganizations.queryOptions()
  );

  const broadcastMutation = useMutation({
    ...trpc.platform.broadcastNotification.mutationOptions(),
    onSuccess: () => {
      toast.success("Broadcast sent successfully!");
      setTitle("");
      setMessage("");
    },
    onError: (err) => {
      toast.error(`Failed to send broadcast: ${err.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    broadcastMutation.mutate({
      title,
      message,
      type,
      organizationId: targetOrg === "all" ? undefined : targetOrg,
    });
  };

  return (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900/50">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <MegaphoneIcon className="size-4 text-slate-500" />
          <CardTitle className="text-lg font-semibold">Global Broadcast</CardTitle>
        </div>
        <CardDescription>
          Send manual notifications across the platform.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-medium text-slate-500">
                Type
              </Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger id="type" className="h-9">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SYSTEM">System</SelectItem>
                  <SelectItem value="OFFER">Offer</SelectItem>
                  <SelectItem value="WELCOME">Welcome</SelectItem>
                  <SelectItem value="ALERT">Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="target" className="text-xs font-medium text-slate-500">
                Target
              </Label>
              <Select value={targetOrg} onValueChange={setTargetOrg}>
                <SelectTrigger id="target" className="h-9">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Everyone</SelectItem>
                  {organizations?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-xs font-medium text-slate-500">
              Title
            </Label>
            <Input
              id="title"
              placeholder="Title of notification"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="message" className="text-xs font-medium text-slate-500">
              Message
            </Label>
            <Textarea
              id="message"
              placeholder="Enter message content..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="resize-none min-h-[80px]"
            />
          </div>

          <Button
            type="submit"
            disabled={broadcastMutation.isPending || !title || !message}
            className="w-full font-semibold"
          >
            {broadcastMutation.isPending ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : (
              "Send Notification"
            )}
          </Button>
          
          <p className="text-[10px] text-center text-slate-400">
            Action will notify users immediately.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
