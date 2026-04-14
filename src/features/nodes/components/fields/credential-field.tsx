"use client";

import { useCredentialsByType } from "@/features/credentials/hooks/use-credentials";
import type { CredentialType } from "@prisma/client";
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { NodeFieldDefinition } from "../../core/types";

interface Props {
  field: any;
  definition: NodeFieldDefinition;
  credentialType: CredentialType;
}

export const CredentialField = ({
  field,
  definition,
  credentialType,
}: Props) => {
  const { data: credentials, isLoading } = useCredentialsByType(credentialType);

  return (
    <FormItem>
      <FormLabel>{definition.label}</FormLabel>
      <Select
        onValueChange={field.onChange}
        defaultValue={field.value}
        disabled={isLoading || !credentials?.length}
      >
        <FormControl>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a credential" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {credentials?.map((credential) => (
            <SelectItem key={credential.id} value={credential.id}>
              {credential.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {definition.description && (
        <FormDescription>{definition.description}</FormDescription>
      )}
      <FormMessage />
    </FormItem>
  );
};
