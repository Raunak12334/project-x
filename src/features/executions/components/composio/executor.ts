import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { composioChannel } from "@/inngest/channels/composio";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { executeComposioAction } from "@/lib/integrations/composio";
import { logger } from "@/lib/logger";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type ComposioData = {
  variableName?: string;
  credentialId?: string;
  integrationId?: string;
  toolSlug?: string;
  toolkitSlug?: string;
  argumentsJson?: string;
};

export const composioExecutor: NodeExecutor<ComposioData> = async ({
  data,
  nodeId,
  organizationId,
  context,
  step,
  publish,
}) => {
  await publish(
    composioChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  if (!data.variableName) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Composio node: Variable name is missing");
  }

  if (!data.credentialId && !data.integrationId) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Composio node: Credential or connected integration is required",
    );
  }

  if (!data.toolSlug) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Composio node: Tool slug is missing");
  }
  const toolSlug = data.toolSlug;

  const argumentsTemplate = data.argumentsJson || "{}";
  const compiledArgsJsonString = Handlebars.compile(argumentsTemplate)(context);

  let parsedArguments = {};
  try {
    parsedArguments = JSON.parse(compiledArgsJsonString);
  } catch (_err) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Composio node: Failed to parse arguments JSON",
    );
  }

  const credential = data.credentialId
    ? await step.run("get-credential", () =>
        prisma.credential.findFirst({
          where: {
            id: data.credentialId,
            organizationId,
          },
        }),
      )
    : null;

  if (data.credentialId && !credential) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Composio node: Credential not found");
  }

  const credentialValue = credential
    ? credential.valueEncrypted || credential.value
    : null;
  if (data.credentialId && !credentialValue) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Composio node: Credential value is empty");
  }

  const integration = data.integrationId
    ? await step.run("get-composio-integration", () =>
        prisma.composioIntegration.findFirst({
          where: {
            id: data.integrationId,
            organizationId,
            isConnected: true,
          },
        }),
      )
    : null;

  if (data.integrationId && !integration) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Composio node: Connected integration not found",
    );
  }

  try {
    const outputData = await step.run("composio-execute", async () => {
      const connectionId = integration?.connectionId;

      // Preferred flow: org-level Composio API key + persisted OAuth connection.
      if (connectionId && process.env.COMPOSIO_API_KEY) {
        return executeComposioAction({
          organizationId,
          action: toolSlug,
          input: parsedArguments as Record<string, unknown>,
          connectionId,
        });
      }

      // Backward compatible fallback: execute via credential-supplied Composio API key.
      if (!credentialValue) {
        throw new NonRetriableError(
          "Composio node: No executable auth path found for action",
        );
      }

      const apiKey = decrypt(credentialValue);
      const originalApiKey = process.env.COMPOSIO_API_KEY;

      try {
        process.env.COMPOSIO_API_KEY = apiKey;
        return executeComposioAction({
          organizationId,
          action: toolSlug,
          input: parsedArguments as Record<string, unknown>,
        });
      } finally {
        if (originalApiKey === undefined) {
          delete process.env.COMPOSIO_API_KEY;
        } else {
          process.env.COMPOSIO_API_KEY = originalApiKey;
        }
      }
    });

    await publish(
      composioChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [data.variableName]: {
        data: outputData,
      },
    };
  } catch (error) {
    logger.error("composio.node.execution.failed", {
      nodeId,
      organizationId,
      integrationId: data.integrationId ?? null,
      action: toolSlug,
      error,
    });
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
