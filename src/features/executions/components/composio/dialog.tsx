"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Plug } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { useTRPC } from "@/trpc/client";

const formSchema = z
  .object({
    variableName: z
      .string()
      .min(1, { message: "Variable name is required" })
      .regex(/^[A-Za-z_$][A-Za-z0-9_$]*$/, {
        message:
          "Variable name must start with a letter or underscore and container only letters, numbers, and underscores",
      }),
    credentialId: z.string().optional(),
    integrationId: z.string().optional(),
    toolSlug: z.string().min(1, "Composio action is required"),
    toolkitSlug: z.string().optional(),
    argumentsJson: z.string().optional(),
  })
  .refine((value) => Boolean(value.integrationId || value.credentialId), {
    message: "Select a connected integration or Composio API credential",
    path: ["integrationId"],
  });

export type ComposioFormValues = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  defaultValues?: Partial<ComposioFormValues>;
}

export const ComposioDialog = ({
  open,
  onOpenChange,
  onSubmit,
  defaultValues = {},
}: Props) => {
  const trpc = useTRPC();
  const { data: credentials, isLoading: isLoadingCredentials } =
    useCredentialsByType(CredentialType.COMPOSIO);
  const { data: integrations, isLoading: isLoadingIntegrations } = useQuery(
    trpc.composio.listConnectedAccounts.queryOptions(),
  );

  const connectedAccounts = integrations?.items ?? [];
  const selectedIntegrationId = defaultValues.integrationId;
  const initialIntegration = connectedAccounts.find(
    (integration) => integration.id === selectedIntegrationId,
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variableName: defaultValues.variableName || "",
      credentialId: defaultValues.credentialId || undefined,
      integrationId: defaultValues.integrationId || undefined,
      toolSlug: defaultValues.toolSlug || "",
      toolkitSlug:
        defaultValues.toolkitSlug || initialIntegration?.toolkitSlug || "",
      argumentsJson: defaultValues.argumentsJson || "{}",
    },
  });

  const selectedToolkitSlug = form.watch("toolkitSlug") || "";
  const selectedAccountId = form.watch("integrationId");
  const selectedIntegration = connectedAccounts.find(
    (integration) => integration.id === selectedAccountId,
  );
  const matchingAccounts = selectedToolkitSlug
    ? connectedAccounts.filter(
        (integration) => integration.toolkitSlug === selectedToolkitSlug,
      )
    : connectedAccounts;
  const { data: actions, isLoading: isLoadingActions } = useQuery(
    trpc.composio.listAvailableActions.queryOptions(
      { toolkitSlug: selectedToolkitSlug },
      { enabled: Boolean(selectedToolkitSlug) },
    ),
  );
  const availableActions = actions?.items ?? [];

  useEffect(() => {
    if (open) {
      const integration = connectedAccounts.find(
        (item) => item.id === defaultValues.integrationId,
      );

      form.reset({
        variableName: defaultValues.variableName || "",
        credentialId: defaultValues.credentialId || undefined,
        integrationId: defaultValues.integrationId || undefined,
        toolSlug: defaultValues.toolSlug || "",
        toolkitSlug: defaultValues.toolkitSlug || integration?.toolkitSlug || "",
        argumentsJson: defaultValues.argumentsJson || "{}",
      });
    }
  }, [open, defaultValues, form, connectedAccounts]);

  useEffect(() => {
    if (!selectedIntegration?.toolkitSlug) {
      return;
    }

    if (selectedIntegration.toolkitSlug !== selectedToolkitSlug) {
      form.setValue("toolkitSlug", selectedIntegration.toolkitSlug);
    }
  }, [form, selectedIntegration, selectedToolkitSlug]);

  const watchVariableName = form.watch("variableName") || "myComposioResult";

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    // Basic JSON validation before submitting
    if (values.argumentsJson && values.argumentsJson.trim() !== "") {
      try {
        // Attempt to parse to see if it's generally valid JSON, ignoring interpolation blocks since they could make JSON technically invalid until runtime.
        // For simplicity we just accept the string, as Handlebars templating might break strict JSON parsing.
      } catch (_e) {
        // We'll let it pass because of Handlebars
      }
    }
    onSubmit(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100dvh-2rem)] gap-0 overflow-hidden rounded-2xl p-0 shadow-2xl sm:max-w-3xl">
        <DialogHeader className="border-b bg-muted/30 px-6 py-5 pr-14">
          <DialogTitle>Composio Execution Configuration</DialogTitle>
          <DialogDescription className="max-w-2xl">
            Configure a tool execution directly via Composio.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="grid max-h-[calc(100dvh-8.5rem)] gap-5 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-6"
          >
            <FormField
              control={form.control}
              name="variableName"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Variable Name</FormLabel>
                  <FormControl>
                    <Input
                      className="h-11"
                      placeholder="myComposioResult"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs leading-5">
                    Use this name to reference the result in other nodes:{" "}
                    {`{{${watchVariableName}.data}}`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="integrationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Connected App Account</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      const integration = connectedAccounts.find(
                        (item) => item.id === value,
                      );

                      if (integration?.toolkitSlug) {
                        form.setValue("toolkitSlug", integration.toolkitSlug);
                      }
                    }}
                    value={field.value}
                    disabled={
                      isLoadingIntegrations || matchingAccounts.length === 0
                    }
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select connected integration (recommended)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {matchingAccounts.map((integration) => (
                        <SelectItem key={integration.id} value={integration.id}>
                          {integration.name}
                          {integration.accountName
                            ? ` (${integration.accountName})`
                            : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs leading-5">
                    Uses OAuth connections created from Integrations
                    Marketplace.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toolkitSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>App / Toolkit</FormLabel>
                  <FormControl>
                    <Input
                      className="h-11"
                      placeholder="github, slack, gmail"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs leading-5">
                    Used to load the available Composio actions for this app.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="credentialId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Composio API Credential (fallback)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
                    value={field.value}
                    disabled={isLoadingCredentials || !credentials?.length}
                  >
                    <FormControl>
                      <SelectTrigger className="h-11 w-full">
                        <SelectValue placeholder="Select a Composio Key" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {credentials?.map((credential) => (
                        <SelectItem key={credential.id} value={credential.id}>
                          <div className="flex items-center gap-2">
                            <Plug size={16} />
                            {credential.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-xs leading-5">
                    Use only if you are executing with a direct API key flow.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="toolSlug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Action</FormLabel>
                  {availableActions.length > 0 ? (
                    <Select
                      onValueChange={(value) => field.onChange(value)}
                      value={field.value}
                      disabled={isLoadingActions}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue placeholder="Select an action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableActions.map((action) => (
                          <SelectItem key={action.slug} value={action.slug}>
                            {action.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <FormControl>
                      <Input
                        className="h-11"
                        placeholder="GITHUB_STAR_REPO or SLACK_SEND_MESSAGE"
                        {...field}
                      />
                    </FormControl>
                  )}
                  <FormDescription className="text-xs leading-5">
                    {selectedToolkitSlug
                      ? "Choose an action returned by Composio, or type the action slug manually if the list is empty."
                      : "Enter an app/toolkit first to load available actions."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="argumentsJson"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>JSON Arguments</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={'{\n  "repo": "{{trigger.repo}}"\n}'}
                      className="min-h-[140px] resize-y font-mono text-sm leading-6"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs leading-5">
                    The parameters required by the tool. Can use Handlebars
                    templating like `{"{{myvariable}}"}`
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sticky bottom-0 -mx-5 -mb-5 border-t bg-background/95 px-5 py-4 backdrop-blur sm:col-span-2 sm:-mx-6 sm:-mb-5 sm:px-6">
              <Button type="submit" className="h-11 min-w-28">
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
