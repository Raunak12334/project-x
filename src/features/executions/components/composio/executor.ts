import { Composio } from "@composio/core";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import type { NodeExecutor } from "@/features/executions/types";
import { composioChannel } from "@/inngest/channels/composio";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";

Handlebars.registerHelper("json", (context) => {
  const jsonString = JSON.stringify(context, null, 2);
  const safeString = new Handlebars.SafeString(jsonString);

  return safeString;
});

type ComposioData = {
  variableName?: string;
  credentialId?: string;
  toolSlug?: string;
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

  if (!data.credentialId) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Composio node: Credential is required");
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

  const argumentsTemplate = data.argumentsJson || "{}";
  const compiledArgsJsonString = Handlebars.compile(argumentsTemplate)(context);
  
  let parsedArguments = {};
  try {
    parsedArguments = JSON.parse(compiledArgsJsonString);
  } catch (err) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Composio node: Failed to parse arguments JSON");
  }

  const credential = await step.run("get-credential", () => {
    return prisma.credential.findFirst({
      where: {
        id: data.credentialId,
        organizationId,
      },
    });
  });

  if (!credential) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Composio node: Credential not found");
  }

  const credentialValue = credential.valueEncrypted || credential.value;
  if (!credentialValue) {
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError("Composio node: Credential value is empty");
  }

  try {
    const outputData = await step.run("composio-execute", async () => {
       const composio = new Composio({
           apiKey: decrypt(credentialValue),
       });
       
       // Try catching potential format needs of the sdk
       try {
         // Some versions require { userId, arguments: {} } wrapper
         return await (composio.tools.execute as any)(data.toolSlug, {
            user: "system",
            arguments: parsedArguments
         });
       } catch(e) {
           // Fallback to passing raw args depending on sdk version
           return await (composio.tools.execute as any)(data.toolSlug, parsedArguments);
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
    await publish(
      composioChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw error;
  }
};
