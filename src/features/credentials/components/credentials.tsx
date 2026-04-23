"use client";

import type { Credential } from "@prisma/client";
import { formatDistanceToNow } from "date-fns";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  EmptyView,
  EntityContainer,
  EntityHeader,
  EntityItem,
  EntityList,
  EntityPagination,
  EntitySearch,
  ErrorView,
  LoadingView,
} from "@/components/entity-components";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEntitySearch } from "@/hooks/use-entity-search";
import {
  useRemoveCredential,
  useSuspenseCredentials,
} from "../hooks/use-credentials";
import { useCredentialsParams } from "../hooks/use-credentials-params";
import { ComposioMarketplace } from "./composio-marketplace";

export const CredentialsSearch = () => {
  const [params, setParams] = useCredentialsParams();
  const { searchValue, onSearchChange } = useEntitySearch({
    params,
    setParams,
  });

  return (
    <EntitySearch
      value={searchValue}
      onChange={onSearchChange}
      placeholder="Search credentials"
    />
  );
};

export const CredentialsList = () => {
  const credentials = useSuspenseCredentials();

  return (
    <EntityList
      items={credentials.data.items}
      getKey={(credential) => credential.id}
      renderItem={(credential) => <CredentialItem data={credential} />}
      emptyView={<CredentialsEmpty />}
    />
  );
};

export const CredentialsHeader = ({ disabled }: { disabled?: boolean }) => {
  return (
    <EntityHeader
      title="Credentials"
      description="Create and manage your credentials"
      newButtonHref="/credentials/new"
      newButtonLabel="New credential"
      disabled={disabled}
    />
  );
};

export const CredentialsPagination = () => {
  const credentials = useSuspenseCredentials();
  const [params, setParams] = useCredentialsParams();

  return (
    <EntityPagination
      disabled={credentials.isFetching}
      totalPages={credentials.data.totalPages}
      page={credentials.data.page}
      onPageChange={(page) => setParams({ ...params, page })}
    />
  );
};

export const CredentialsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [activeTab, setActiveTab] = useState("managed");

  return (
    <EntityContainer
      header={<CredentialsHeader disabled={activeTab === "marketplace"} />}
      search={activeTab === "managed" ? <CredentialsSearch /> : null}
      pagination={activeTab === "managed" ? <CredentialsPagination /> : null}
    >
      <Tabs
        defaultValue="managed"
        className="w-full overflow-hidden rounded-lg border bg-card shadow-sm"
        onValueChange={setActiveTab}
      >
        <div className="border-b bg-muted/20 px-4">
          <TabsList className="h-11 gap-2 bg-transparent p-0">
            <TabsTrigger
              value="managed"
              className="relative h-11 rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-2 text-sm font-medium outline-none ring-0 focus-visible:border-x-0 focus-visible:border-t-0 focus-visible:border-b-primary focus-visible:outline-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              API Credentials
            </TabsTrigger>
            <TabsTrigger
              value="marketplace"
              className="relative h-11 rounded-none border-x-0 border-t-0 border-b-2 border-transparent px-2 text-sm font-medium outline-none ring-0 focus-visible:border-x-0 focus-visible:border-t-0 focus-visible:border-b-primary focus-visible:outline-none focus-visible:ring-0 data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              Integrations Marketplace
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="managed" className="mt-0 p-4 outline-none">
          {children}
        </TabsContent>

        <TabsContent value="marketplace" className="mt-0 outline-none">
          <ComposioMarketplace />
        </TabsContent>
      </Tabs>
    </EntityContainer>
  );
};

export const CredentialsLoading = () => {
  return <LoadingView message="Loading credentials..." />;
};

export const CredentialsError = () => {
  return <ErrorView message="Error loading credentials" />;
};

export const CredentialsEmpty = () => {
  const router = useRouter();

  const handleCreate = () => {
    router.push(`/credentials/new`);
  };

  return (
    <EmptyView
      onNew={handleCreate}
      message="You haven't created any credentials yet. Get started by creating your first credential"
    />
  );
};

const credentialLogos: Record<string, string> = {
  OPENAI: "/logos/openai.svg",
  ANTHROPIC: "/logos/anthropic.svg",
  GEMINI: "/logos/gemini.svg",
  GEMMA: "/logos/google.svg",
  HUGGINGFACE: "/logos/huggingface.svg",
  GENERIC: "/logos/google.svg",
};

export const CredentialItem = ({ data }: { data: Credential }) => {
  const removeCredential = useRemoveCredential();

  const handleRemove = () => {
    removeCredential.mutate({ id: data.id });
  };

  const logo = credentialLogos[data.type] || "/logos/openai.svg";

  return (
    <EntityItem
      href={`/credentials/${data.id}`}
      title={data.name}
      subtitle={
        <>
          Updated {formatDistanceToNow(data.updatedAt, { addSuffix: true })}{" "}
          &bull; Created{" "}
          {formatDistanceToNow(data.createdAt, { addSuffix: true })}
        </>
      }
      image={
        <div className="size-8 flex items-center justify-center">
          <Image src={logo} alt={data.type} width={20} height={20} />
        </div>
      }
      onRemove={handleRemove}
      isRemoving={removeCredential.isPending}
    />
  );
};
