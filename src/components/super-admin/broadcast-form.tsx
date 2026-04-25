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
import { MegaphoneIcon, Loader2Icon, CheckCircleIcon } from "lucide-react";
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
    <Card className="border-none shadow-xl bg-white dark:bg-slate-900/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <MegaphoneIcon className="size-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold">Global Broadcast</CardTitle>
            <CardDescription className="text-blue-100 mt-1">
              Send manual notifications to users across the platform.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="type" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Notification Type
              </Label>
              <Select value={type} onValueChange={(v: any) => setType(v)}>
                <SelectTrigger id="type" className="bg-slate-50 dark:bg-slate-800 border-none h-11">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SYSTEM">System Update</SelectItem>
                  <SelectItem value="OFFER">Special Offer</SelectItem>
                  <SelectItem value="WELCOME">Welcome Message</SelectItem>
                  <SelectItem value="ALERT">Critical Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="target" className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Target Audience
              </Label>
              <Select value={targetOrg} onValueChange={setTargetOrg}>
                <SelectTrigger id="target" className="bg-slate-50 dark:bg-slate-800 border-none h-11">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Global (All Users)</SelectItem>
                  {organizations?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      Only: {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Notification Title
            </Label>
            <Input
              id="title"
              placeholder="e.g. Platform Maintenance Scheduled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-none h-11 focus-visible:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Message Content
            </Label>
            <Textarea
              id="message"
              placeholder="Write your broadcast message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="bg-slate-50 dark:bg-slate-800 border-none focus-visible:ring-blue-500 resize-none"
            />
          </div>

          <Button
            type="submit"
            disabled={broadcastMutation.isPending || !title || !message}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20"
          >
            {broadcastMutation.isPending ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Sending Broadcast...
              </>
            ) : (
              <>
                <MegaphoneIcon className="mr-2 size-4" />
                Send Notification Now
              </>
            )}
          </Button>

          <p className="text-[10px] text-center text-slate-400 font-medium">
            Note: This action is permanent and will notify users immediately.
          </p>
        </form>
      </CardContent>
    </Card>
  );
};
