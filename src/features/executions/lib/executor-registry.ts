import { NodeType } from "@prisma/client";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { stripeTriggerExecutor } from "@/features/triggers/components/stripe-trigger/executor";
import { webhookTriggerExecutor } from "@/features/triggers/components/webhook-trigger/executor";
import { anthropicExecutor } from "../components/anthropic/executor";
import { composioExecutor } from "../components/composio/executor";
import { conditionExecutor } from "../components/condition/executor";
import { dbQueryExecutor } from "../components/db-query/executor";
import { delayExecutor } from "../components/delay/executor";
import { discordExecutor } from "../components/discord/executor";
import { emailParserExecutor } from "../components/email-parser/executor";
import { emailSendExecutor } from "../components/email-send/executor";
import { fileStorageExecutor } from "../components/file-storage/executor";
import { geminiExecutor } from "../components/gemini/executor";
import { gemmaExecutor } from "../components/gemma/executor";
import { googleSheetsExecutor } from "../components/google-sheets/executor";
import { httpRequestExecutor } from "../components/http-request/executor";
import { hubspotExecutor } from "../components/hubspot/executor";
import { huggingFaceExecutor } from "../components/huggingface/executor";
import { humanApprovalExecutor } from "../components/human-approval/executor";
import { instagramExecutor } from "../components/instagram/executor";
import { jsonTransformExecutor } from "../components/json-transform/executor";
import { linkedinExecutor } from "../components/linkedin/executor";
import { loggerExecutor } from "../components/logger/executor";
import { mergeExecutor } from "../components/merge/executor";
import { openAiExecutor } from "../components/openai/executor";
import { routerExecutor } from "../components/router/executor";
import { scheduleExecutor } from "../components/schedule/executor";
import { setVariableExecutor } from "../components/set-variable/executor";
import { shopifyExecutor } from "../components/shopify/executor";
import { slackExecutor } from "../components/slack/executor";
import { telegramExecutor } from "../components/telegram/executor";
import { textTemplateExecutor } from "../components/text-template/executor";
import { twilioSmsExecutor } from "../components/twilio-sms/executor";
import { xExecutor } from "../components/x/executor";
import type { NodeExecutor } from "../types";

type RegistryExecutor = NodeExecutor<Record<string, unknown>>;

const asRegistryExecutor = <TData>(
  executor: NodeExecutor<TData>,
): RegistryExecutor => executor as RegistryExecutor;

export const executorRegistry: Record<NodeType, RegistryExecutor> = {
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor,
  [NodeType.WEBHOOK_TRIGGER]: webhookTriggerExecutor,
  [NodeType.HTTP_REQUEST]: httpRequestExecutor,
  [NodeType.ROUTER]: routerExecutor,
  [NodeType.CONDITION]: conditionExecutor,
  [NodeType.HUMAN_APPROVAL]: humanApprovalExecutor,
  [NodeType.SET_VARIABLE]: setVariableExecutor,
  [NodeType.TEXT_TEMPLATE]: textTemplateExecutor,
  [NodeType.JSON_TRANSFORM]: jsonTransformExecutor,
  [NodeType.DELAY]: delayExecutor,
  [NodeType.MERGE]: mergeExecutor,
  [NodeType.LOGGER]: loggerExecutor,
  [NodeType.GEMMA]: gemmaExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.STRIPE_TRIGGER]: stripeTriggerExecutor,
  [NodeType.GEMINI]: geminiExecutor,
  [NodeType.ANTHROPIC]: anthropicExecutor,
  [NodeType.OPENAI]: openAiExecutor,
  [NodeType.COMPOSIO]: composioExecutor as any,
  [NodeType.HUGGINGFACE]: huggingFaceExecutor,
  [NodeType.DISCORD]: discordExecutor,
  [NodeType.SLACK]: slackExecutor,
  [NodeType.X]: xExecutor,
  [NodeType.LINKEDIN]: linkedinExecutor,
  [NodeType.INSTAGRAM]: instagramExecutor,
  [NodeType.TELEGRAM]: telegramExecutor,
  [NodeType.GOOGLE_SHEETS]: asRegistryExecutor(googleSheetsExecutor),
  [NodeType.EMAIL_SEND]: asRegistryExecutor(emailSendExecutor),
  [NodeType.DB_QUERY]: asRegistryExecutor(dbQueryExecutor),
  [NodeType.TWILIO_SMS]: asRegistryExecutor(twilioSmsExecutor),
  [NodeType.EMAIL_PARSER]: asRegistryExecutor(emailParserExecutor),
  [NodeType.SCHEDULE]: asRegistryExecutor(scheduleExecutor),
  [NodeType.FILE_STORAGE]: asRegistryExecutor(fileStorageExecutor),
  [NodeType.HUBSPOT]: asRegistryExecutor(hubspotExecutor),
  [NodeType.SHOPIFY]: asRegistryExecutor(shopifyExecutor),
};

export const getExecutor = (type: NodeType): RegistryExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type: ${type}`);
  }

  return executor;
};
