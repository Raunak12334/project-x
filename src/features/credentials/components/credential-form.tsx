"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CredentialType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
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
import { useUpgradeModal } from "@/hooks/use-upgrade-modal";
import { useTRPC } from "@/trpc/client";
import {
  useCreateCredential,
  useSuspenseCredential,
  useUpdateCredential,
} from "../hooks/use-credentials";

const createFormSchema = (isEdit: boolean) =>
  z
    .object({
      name: z.string().min(1, "Name is required"),
      type: z.enum(CredentialType),
      value: z.string().optional(),
    })
    .superRefine((values, ctx) => {
      if (!isEdit && !values.value?.trim()) {
        ctx.addIssue({
          code: "custom",
          path: ["value"],
          message: "API key is required",
        });
      }
    });

type FormValues = {
  name: string;
  type: CredentialType;
  value?: string;
};

const credentialTypeOptions = [
  {
    value: CredentialType.OPENAI,
    label: "OpenAI",
    logo: "/logos/openai.svg",
  },
  {
    value: CredentialType.ANTHROPIC,
    label: "Anthropic",
    logo: "/logos/anthropic.svg",
  },
  {
    value: CredentialType.GEMINI,
    label: "Gemini",
    logo: "/logos/gemini.svg",
  },
  {
    value: CredentialType.GEMMA,
    label: "Gemma",
    logo: "/logos/google.svg",
  },
  {
    value: CredentialType.HUGGINGFACE,
    label: "Hugging Face",
    logo: "/logos/huggingface.svg",
  },
  {
    value: CredentialType.GENERIC,
    label: "Generic (API Key/Token)",
    logo: "/logos/google.svg",
  },
];

interface CredentialFormProps {
  initialData?: {
    id?: string;
    name: string;
    type: CredentialType;
    value?: string | null;
  };
}

export const CredentialForm = ({ initialData }: CredentialFormProps) => {
  const router = useRouter();
  const trpc = useTRPC();
  const createCredential = useCreateCredential();
  const updateCredential = useUpdateCredential();
  const { handleError, modal } = useUpgradeModal();
  const [testResult, setTestResult] = useState<{
    status: "pending" | "success" | "error";
    message?: string;
  } | null>(null);

  const isEdit = !!initialData?.id;

  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema(isEdit)),
    defaultValues: initialData
      ? {
          name: initialData.name,
          type: initialData.type,
          value: "",
        }
      : {
          name: "",
          type: CredentialType.OPENAI,
          value: "",
        },
  });

  const selectedType = form.watch("type");
  const selectedValue = form.watch("value");

  const valueLabel =
    selectedType === CredentialType.HUGGINGFACE ? "Token" : "API Key";
  const valuePlaceholder =
    selectedType === CredentialType.HUGGINGFACE ? "hf_..." : "sk-...";

  const testMutation = useMutation(
    trpc.credentials.test.mutationOptions({
      onSuccess: (data) => {
        if (data.isValid) {
          setTestResult({
            status: "success",
            message: "Credential is valid!",
          });
          toast.success("Credential validated successfully");
        } else {
          setTestResult({
            status: "error",
            message: data.error || "Invalid credential",
          });
          toast.error(data.error || "Credential validation failed");
        }
      },
      onError: (error) => {
        setTestResult({
          status: "error",
          message: error.message || "Test failed",
        });
        toast.error(`Test failed: ${error.message}`);
      },
    }),
  );

  const handleTestCredential = async () => {
    if (!selectedValue) {
      toast.error("Please enter an API key to test");
      return;
    }
    testMutation.mutate({ type: selectedType, value: selectedValue });
  };

  const onSubmit = async (values: FormValues) => {
    if (isEdit && initialData?.id) {
      await updateCredential.mutateAsync({
        id: initialData.id,
        name: values.name,
        type: values.type,
        ...(values.value?.trim() ? { value: values.value.trim() } : {}),
      });
    } else {
      await createCredential.mutateAsync(
        {
          name: values.name,
          type: values.type,
          value: values.value?.trim() ?? "",
        },
        {
          onSuccess: (data) => {
            router.push(`/credentials/${data.id}`);
          },
          onError: (error) => {
            handleError(error);
          },
        },
      );
    }
  };

  return (
    <>
      {modal}
      <Card className="mx-auto w-full max-w-2xl rounded-lg border-border/70 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>
            {isEdit ? "Edit Credential" : "Create Credential"}
          </CardTitle>
          <CardDescription className="max-w-xl">
            {isEdit
              ? "Update your API key or credential details"
              : "Add a new API key or credential to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        className="h-11"
                        placeholder="Production OpenAI key"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-11 w-full">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {credentialTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <Image
                                src={option.logo}
                                alt={option.label}
                                width={16}
                                height={16}
                              />
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{valueLabel}</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        className="h-11 font-mono text-sm"
                        placeholder={
                          isEdit
                            ? "Leave blank to keep existing secret"
                            : valuePlaceholder
                        }
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Test Credential Section */}
              <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">
                    Test Credential
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleTestCredential}
                    disabled={
                      testMutation.isPending ||
                      !selectedValue ||
                      selectedType === CredentialType.GENERIC
                    }
                  >
                    {testMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      "Test Connection"
                    )}
                  </Button>
                </div>

                {testResult && (
                  <div
                    className={`flex items-start gap-3 rounded-md p-3 ${
                      testResult.status === "success"
                        ? "border border-green-200 bg-green-50"
                        : "border border-red-200 bg-red-50"
                    }`}
                  >
                    {testResult.status === "success" ? (
                      <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-600" />
                    ) : (
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                    )}
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          testResult.status === "success"
                            ? "text-green-900"
                            : "text-red-900"
                        }`}
                      >
                        {testResult.message}
                      </p>
                    </div>
                  </div>
                )}

                {selectedType === CredentialType.GENERIC && (
                  <p className="text-xs text-muted-foreground">
                    Generic credentials cannot be automatically validated.
                    Please ensure your API key is correct.
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" asChild>
                  <Link href="/credentials" prefetch>
                    Cancel
                  </Link>
                </Button>
                <Button
                  type="submit"
                  disabled={
                    createCredential.isPending || updateCredential.isPending
                  }
                >
                  {isEdit ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};

export const CredentialView = ({ credentialId }: { credentialId: string }) => {
  const { data: credential } = useSuspenseCredential(credentialId);

  return <CredentialForm initialData={credential} />;
};
