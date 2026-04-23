"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2Icon, Plug, Wand2Icon } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import { VariablePicker } from "@/features/editor/components/variable-picker";
import type { VariableSuggestion } from "@/features/editor/lib/variable-suggestions";
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
  onTest?: (values: z.infer<typeof formSchema>) => Promise<unknown>;
  defaultValues?: Partial<ComposioFormValues>;
  variableSuggestions?: VariableSuggestion[];
}

type ActionParameter = {
  name: string;
  label: string;
  description?: string;
  type: "string" | "number" | "boolean" | "object" | "array";
  required: boolean;
};

const humanize = (value: string) =>
  value
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());

const getParameterSchema = (parameters: unknown): Record<string, unknown> => {
  if (
    !parameters ||
    typeof parameters !== "object" ||
    Array.isArray(parameters)
  ) {
    return {};
  }

  const record = parameters as Record<string, unknown>;
  const nested =
    record.properties && typeof record.properties === "object"
      ? (record.properties as Record<string, unknown>)
      : record;

  return nested;
};

const getRequiredParameters = (parameters: unknown) => {
  if (
    !parameters ||
    typeof parameters !== "object" ||
    Array.isArray(parameters)
  ) {
    return new Set<string>();
  }

  const required = (parameters as { required?: unknown }).required;
  return new Set(
    Array.isArray(required)
      ? required.filter((item) => typeof item === "string")
      : [],
  );
};

const getActionParameters = (parameters: unknown): ActionParameter[] => {
  const schema = getParameterSchema(parameters);
  const required = getRequiredParameters(parameters);

  return Object.entries(schema).map(([name, value]) => {
    const field =
      value && typeof value === "object" && !Array.isArray(value)
        ? (value as Record<string, unknown>)
        : {};
    const rawType = Array.isArray(field.type)
      ? field.type.find((item) => item !== "null")
      : field.type;
    const type =
      rawType === "number" || rawType === "integer"
        ? "number"
        : rawType === "boolean"
          ? "boolean"
          : rawType === "object"
            ? "object"
            : rawType === "array"
              ? "array"
              : "string";

    return {
      name,
      label: humanize(name),
      description:
        typeof field.description === "string" ? field.description : undefined,
      type,
      required: required.has(name),
    };
  });
};

const parseArgumentsJson = (value?: string) => {
  try {
    const parsed = JSON.parse(value || "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    return {};
  }
};

const serializeGeneratedArgs = (
  params: ActionParameter[],
  values: Record<string, string | boolean>,
) => {
  const payload: Record<string, unknown> = {};

  for (const param of params) {
    const value = values[param.name];
    if (value === undefined || value === "") {
      continue;
    }

    if (param.type === "boolean") {
      payload[param.name] = Boolean(value);
    } else if (param.type === "number") {
      const numberValue = Number(value);
      payload[param.name] = Number.isNaN(numberValue) ? value : numberValue;
    } else if (param.type === "object" || param.type === "array") {
      try {
        payload[param.name] = JSON.parse(String(value));
      } catch {
        payload[param.name] = value;
      }
    } else {
      payload[param.name] = value;
    }
  }

  return JSON.stringify(payload, null, 2);
};

export const ComposioDialog = ({
  open,
  onOpenChange,
  onSubmit,
  onTest,
  defaultValues = {},
  variableSuggestions = [],
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
  const selectedActionSlug = form.watch("toolSlug") || "";
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
  const selectedAction = availableActions.find(
    (action) => action.slug === selectedActionSlug,
  );
  const actionParameters = useMemo(
    () => getActionParameters(selectedAction?.parameters),
    [selectedAction?.parameters],
  );
  const [useRawJson, setUseRawJson] = useState(false);
  const [generatedArgs, setGeneratedArgs] = useState<
    Record<string, string | boolean>
  >({});
  const [testResult, setTestResult] = useState<unknown>(null);
  const [isTesting, setIsTesting] = useState(false);

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
        toolkitSlug:
          defaultValues.toolkitSlug || integration?.toolkitSlug || "",
        argumentsJson: defaultValues.argumentsJson || "{}",
      });
      setGeneratedArgs(
        parseArgumentsJson(defaultValues.argumentsJson) as Record<
          string,
          string | boolean
        >,
      );
      setTestResult(null);
    }
  }, [open, defaultValues, form, connectedAccounts]);

  useEffect(() => {
    if (actionParameters.length === 0) {
      return;
    }

    const parsed = parseArgumentsJson(form.getValues("argumentsJson"));
    setGeneratedArgs((current) => {
      const next: Record<string, string | boolean> = {};
      for (const param of actionParameters) {
        const value = current[param.name] ?? parsed[param.name];
        if (param.type === "boolean") {
          next[param.name] = Boolean(value);
        } else if (value !== undefined && value !== null) {
          next[param.name] =
            typeof value === "object"
              ? JSON.stringify(value, null, 2)
              : String(value);
        }
      }
      return next;
    });
  }, [actionParameters, form]);

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
    const nextValues = { ...values };
    if (!useRawJson && actionParameters.length > 0) {
      nextValues.argumentsJson = serializeGeneratedArgs(
        actionParameters,
        generatedArgs,
      );
    }
    onSubmit(nextValues);
    onOpenChange(false);
  };

  const handleTest = async () => {
    if (!onTest) {
      return;
    }

    const values = form.getValues();
    const nextValues = { ...values };
    if (!useRawJson && actionParameters.length > 0) {
      nextValues.argumentsJson = serializeGeneratedArgs(
        actionParameters,
        generatedArgs,
      );
      form.setValue("argumentsJson", nextValues.argumentsJson);
    }

    setIsTesting(true);
    setTestResult(null);
    try {
      setTestResult(await onTest(nextValues));
    } catch (error) {
      setTestResult({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsTesting(false);
    }
  };

  const appendToken = (fieldName: "argumentsJson", token: string) => {
    const current = form.getValues(fieldName) || "";
    form.setValue(fieldName, `${current}${token}`, { shouldDirty: true });
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

            <div className="space-y-4 rounded-xl border bg-muted/20 p-4 sm:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <FormLabel>Action Parameters</FormLabel>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Fill the fields from Composio metadata, or switch to raw
                    JSON for advanced payloads.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    Raw JSON
                  </span>
                  <Switch
                    checked={useRawJson}
                    onCheckedChange={setUseRawJson}
                  />
                </div>
              </div>

              {!useRawJson && actionParameters.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                  {actionParameters.map((param) => (
                    <div
                      key={param.name}
                      className={
                        param.type === "object" || param.type === "array"
                          ? "space-y-2 sm:col-span-2"
                          : "space-y-2"
                      }
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium">
                          {param.label}
                          {param.required ? (
                            <span className="text-destructive"> *</span>
                          ) : null}
                        </span>
                        {param.type !== "boolean" && (
                          <VariablePicker
                            suggestions={variableSuggestions}
                            onInsert={(token) =>
                              setGeneratedArgs((current) => ({
                                ...current,
                                [param.name]: `${current[param.name] ?? ""}${token}`,
                              }))
                            }
                          />
                        )}
                      </div>
                      {param.type === "boolean" ? (
                        <Switch
                          checked={Boolean(generatedArgs[param.name])}
                          onCheckedChange={(checked) =>
                            setGeneratedArgs((current) => ({
                              ...current,
                              [param.name]: checked,
                            }))
                          }
                        />
                      ) : param.type === "object" || param.type === "array" ? (
                        <Textarea
                          value={String(generatedArgs[param.name] ?? "")}
                          onChange={(event) =>
                            setGeneratedArgs((current) => ({
                              ...current,
                              [param.name]: event.target.value,
                            }))
                          }
                          className="min-h-[96px] font-mono text-sm"
                          placeholder={param.type === "array" ? "[ ]" : "{ }"}
                        />
                      ) : (
                        <Input
                          value={String(generatedArgs[param.name] ?? "")}
                          onChange={(event) =>
                            setGeneratedArgs((current) => ({
                              ...current,
                              [param.name]: event.target.value,
                            }))
                          }
                          type={param.type === "number" ? "number" : "text"}
                        />
                      )}
                      {param.description && (
                        <p className="text-xs leading-5 text-muted-foreground">
                          {param.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!useRawJson && actionParameters.length === 0 && (
                <div className="rounded-lg border border-dashed bg-background px-4 py-6 text-center text-sm text-muted-foreground">
                  Select an action to load generated fields. You can still use
                  raw JSON for actions that do not expose metadata.
                </div>
              )}

              {useRawJson && (
                <FormField
                  control={form.control}
                  name="argumentsJson"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between gap-3">
                        <FormLabel>JSON Arguments</FormLabel>
                        <VariablePicker
                          suggestions={variableSuggestions}
                          onInsert={(token) =>
                            appendToken("argumentsJson", token)
                          }
                        />
                      </div>
                      <FormControl>
                        <Textarea
                          placeholder={'{\n  "repo": "{{trigger.repo}}"\n}'}
                          className="min-h-[140px] resize-y font-mono text-sm leading-6"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs leading-5">
                        Supports Handlebars variables like{" "}
                        {"{{myvariable.value}}"} and {"{{json myObject}}"}.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {testResult ? (
              <div className="rounded-xl border bg-slate-950 p-4 text-slate-50 sm:col-span-2">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Wand2Icon className="size-4" />
                  Test result
                </div>
                <pre className="max-h-56 overflow-auto whitespace-pre-wrap text-xs leading-5">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            ) : null}

            <DialogFooter className="sticky bottom-0 -mx-5 -mb-5 flex-col gap-2 border-t bg-background/95 px-5 py-4 backdrop-blur sm:col-span-2 sm:-mx-6 sm:-mb-5 sm:flex-row sm:px-6">
              <Button
                type="button"
                variant="outline"
                className="h-11 min-w-28"
                disabled={!onTest || isTesting}
                onClick={handleTest}
              >
                {isTesting ? (
                  <Loader2Icon className="mr-2 size-4 animate-spin" />
                ) : (
                  <Wand2Icon className="mr-2 size-4" />
                )}
                Test node
              </Button>
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
