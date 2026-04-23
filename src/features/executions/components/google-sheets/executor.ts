import { auth as googleAuth, sheets as googleSheets } from "@googleapis/sheets";
import { NonRetriableError } from "inngest";
import { z } from "zod";
import type { NodeExecutor } from "@/features/executions/types";
import { googleSheetsChannel } from "@/inngest/channels/google-sheets";
import prisma from "@/lib/db";
import { decrypt } from "@/lib/encryption";
import { getErrorMessage } from "@/lib/utils";

const googleSheetsSchema = z.object({
  variableName: z.string().min(1),
  credentialId: z.string().min(1),
  spreadsheetId: z.string().min(1),
  range: z.string().min(1),
  action: z.enum(["read", "append", "update"]),
  values: z.array(z.array(z.any())).optional(),
});

type GoogleSheetsData = z.infer<typeof googleSheetsSchema>;

export const googleSheetsExecutor: NodeExecutor<GoogleSheetsData> = async ({
  data,
  nodeId,
  organizationId,
  context,
  step,
  publish,
}) => {
  await publish(
    googleSheetsChannel().status({
      nodeId,
      status: "loading",
    }),
  );

  const validated = googleSheetsSchema.parse(data);

  const credential = await step.run("get-google-credential", async () => {
    return prisma.credential.findFirstOrThrow({
      where: { id: validated.credentialId, organizationId },
    });
  });

  const credentialValue = credential.valueEncrypted;
  if (!credentialValue) {
    await publish(
      googleSheetsChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      "Google Sheets node: Credential value is empty",
    );
  }

  const auth = new googleAuth.OAuth2();
  auth.setCredentials({
    access_token: decrypt(credentialValue),
  });

  const sheets = googleSheets({ version: "v4", auth });

  try {
    const result = await step.run("google-sheets-action", async () => {
      const startTime = Date.now();
      const responseData =
        validated.action === "read"
          ? (
              await sheets.spreadsheets.values.get({
                spreadsheetId: validated.spreadsheetId,
                range: validated.range,
              })
            ).data
          : validated.action === "append"
            ? (
                await sheets.spreadsheets.values.append({
                  spreadsheetId: validated.spreadsheetId,
                  range: validated.range,
                  valueInputOption: "USER_ENTERED",
                  requestBody: { values: validated.values || [] },
                })
              ).data
            : (
                await sheets.spreadsheets.values.update({
                  spreadsheetId: validated.spreadsheetId,
                  range: validated.range,
                  valueInputOption: "USER_ENTERED",
                  requestBody: { values: validated.values || [] },
                })
              ).data;

      return {
        success: true,
        data: responseData || {},
        metadata: {
          executionTime: Date.now() - startTime,
          nodeType: "GOOGLE_SHEETS",
          action: validated.action,
        },
      };
    });

    await publish(
      googleSheetsChannel().status({
        nodeId,
        status: "success",
      }),
    );

    return {
      ...context,
      [validated.variableName]: result,
    };
  } catch (error: unknown) {
    await publish(
      googleSheetsChannel().status({
        nodeId,
        status: "error",
      }),
    );
    throw new NonRetriableError(
      `Google Sheets Error: ${getErrorMessage(error, "Unknown Google Sheets error")}`,
    );
  }
};
