"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { NodeType } from "@prisma/client";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
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
import { getNodeDefinition } from "../core/registry";
import { CredentialField } from "./fields/credential-field";

interface Props {
  type: NodeType;
  version?: number;
  defaultValues: Record<string, unknown>;
  onSubmit: (values: Record<string, unknown>) => void;
}

export const NodeConfigRenderer = ({
  type,
  version = 1,
  defaultValues,
  onSubmit,
}: Props) => {
  const definition = getNodeDefinition(type, version);

  const form = useForm<Record<string, unknown>>({
    resolver: definition ? zodResolver(definition.configSchema) : undefined,
    defaultValues: defaultValues || {},
  });

  const watchValues = form.watch();

  if (!definition) {
    return <div>Node type {type} not found in registry.</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {definition.fields.map((fieldDef) => {
          // Visibility check
          if (fieldDef.visibleIf) {
            const {
              field: targetField,
              operator,
              value: targetValue,
            } = fieldDef.visibleIf;
            const actualValue = watchValues[targetField];

            let isVisible = false;
            if (operator === "eq") isVisible = actualValue === targetValue;
            else if (operator === "neq")
              isVisible = actualValue !== targetValue;
            else if (operator === "exists")
              isVisible =
                actualValue !== undefined &&
                actualValue !== null &&
                actualValue !== "";
            else if (operator === "includes")
              isVisible =
                Array.isArray(actualValue) && actualValue.includes(targetValue);

            if (!isVisible) return null;
          }

          return (
            <FormField
              key={fieldDef.name}
              control={form.control}
              name={fieldDef.name}
              render={({ field }) => {
                const stringValue =
                  typeof field.value === "string" ||
                  typeof field.value === "number"
                    ? field.value
                    : "";
                const credReq = definition.credentials.find(
                  (c) =>
                    c.key === fieldDef.name ||
                    (fieldDef.type === "credential" && c.type !== undefined),
                );

                if (fieldDef.type === "credential" && credReq) {
                  return (
                    <CredentialField
                      field={field}
                      definition={fieldDef}
                      credentialType={credReq.type}
                    />
                  );
                }

                return (
                  <FormItem>
                    <FormLabel>{fieldDef.label}</FormLabel>
                    <FormControl>
                      {fieldDef.type === "textarea" ? (
                        <Textarea
                          {...field}
                          value={stringValue}
                          placeholder={fieldDef.placeholder}
                        />
                      ) : fieldDef.type === "select" ? (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={
                            typeof field.value === "string"
                              ? field.value
                              : undefined
                          }
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  fieldDef.placeholder || "Select an option"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {fieldDef.options?.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          {...field}
                          value={stringValue}
                          placeholder={fieldDef.placeholder}
                        />
                      )}
                    </FormControl>
                    {fieldDef.description && (
                      <FormDescription>{fieldDef.description}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          );
        })}
        <div className="flex justify-end pt-4">
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </Form>
  );
};
