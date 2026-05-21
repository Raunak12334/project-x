import { NodeType } from "@prisma/client";
import {
  Boxes,
  BracesIcon,
  BrainCircuitIcon,
  CalendarClockIcon,
  CodeXmlIcon,
  DatabaseIcon,
  FileTextIcon,
  FileType2Icon,
  FolderOpenIcon,
  GitBranchIcon,
  GitMergeIcon,
  GlobeIcon,
  HourglassIcon,
  MailSearchIcon,
  MousePointerClickIcon,
  SendIcon,
  SplitIcon,
  TerminalSquareIcon,
  UserCheckIcon,
  WebhookIcon,
} from "lucide-react";
import type { ComponentType } from "react";

export type NodeCatalogGroupId =
  | "triggers"
  | "logic"
  | "data"
  | "ai"
  | "communication"
  | "integrations";

export type InputField = {
  key: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "select"
    | "checkbox"
    | "json"
    | "password"
    | "file"
    | "dynamic";
  required: boolean;
  supportsDynamic: boolean;
  options?: string[];
  placeholder?: string;
};

export type CredentialField = {
  key: string;
  label: string;
  type: "password" | "oauth2" | "text" | "number";
  required: boolean;
  supportsDynamic: boolean;
};

export type OutputField = {
  key: string;
  type: "string" | "number" | "boolean" | "object" | "array" | "any" | "branch";
  description: string;
  example?: unknown;
};

export type NodeCatalogItem = {
  type: NodeType;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }> | string;
  brandIcon?: string | null;
  logoCandidates?: string[];
  group: NodeCatalogGroupId;
  keywords: string[];
  inputs: InputField[];
  credentials?: CredentialField[];
  outputs: OutputField[];
  setupGuide: string[];
  testAction?: string;
  defaultData?: Record<string, unknown>;
};

export const nodeCatalogGroups: Array<{
  id: NodeCatalogGroupId;
  label: string;
  description: string;
}> = [
  {
    id: "triggers",
    label: "Start",
    description: "Choose how the workflow begins.",
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "Connect 11,000+ apps via Composio.",
  },
  {
    id: "logic",
    label: "Flow",
    description: "Control where the workflow goes next.",
  },
  {
    id: "data",
    label: "Data",
    description: "Get data, save data, or write logs.",
  },
  { id: "ai", label: "AI", description: "Use an AI model in your workflow." },
  {
    id: "communication",
    label: "Send",
    description: "Send updates to your team.",
  },
];

export const nodeCatalog: NodeCatalogItem[] = [
  {
    type: NodeType.MANUAL_TRIGGER,
    label: "Manual Trigger",
    description: "Start the workflow by clicking Run.",
    icon: MousePointerClickIcon,
    brandIcon: null,
    group: "triggers",
    keywords: ["manual", "button", "test", "run"],
    inputs: [
      {
        key: "testData",
        label: "Test Data (JSON)",
        type: "json",
        required: false,
        supportsDynamic: false,
        placeholder: '{"test": true}',
      },
    ],
    outputs: [
      {
        key: "triggerTime",
        type: "string",
        description: "ISO timestamp of trigger",
      },
      { key: "data", type: "object", description: "Passed test data" },
    ],
    setupGuide: [
      "Configure optional test JSON payload.",
      "Click 'Test Node' or trigger from canvas.",
    ],
    testAction: "executeManualTrigger",
  },
  {
    type: NodeType.WEBHOOK_TRIGGER,
    label: "Webhook",
    description: "Start when this URL gets a request.",
    icon: WebhookIcon,
    brandIcon: null,
    group: "triggers",
    keywords: ["webhook", "trigger", "api", "request", "post"],
    inputs: [
      {
        key: "endpoint",
        label: "Webhook URL",
        type: "text",
        required: true,
        supportsDynamic: false,
        placeholder: "Auto-generated upon save",
      },
      {
        key: "method",
        label: "HTTP Method",
        type: "select",
        options: ["POST", "GET", "PUT", "DELETE", "PATCH"],
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      { key: "body", type: "object", description: "Request body payload" },
      { key: "headers", type: "object", description: "HTTP request headers" },
      { key: "query", type: "object", description: "URL query parameters" },
    ],
    setupGuide: [
      "Copy the auto-generated webhook URL.",
      "Send a test request.",
      "Verify payload in output.",
    ],
    testAction: "executeWebhook",
  },
  {
    type: NodeType.GOOGLE_FORM_TRIGGER,
    label: "Google Form",
    description: "Start when a Google Form gets a new response.",
    icon: "/logos/googleform.svg",
    brandIcon: "/logos/googleform.svg",
    group: "triggers",
    keywords: ["google", "form", "submission", "lead", "intake"],
    inputs: [
      {
        key: "formId",
        label: "Form ID",
        type: "text",
        required: true,
        supportsDynamic: false,
      },
    ],
    credentials: [
      {
        key: "googleAuth",
        label: "Google Account",
        type: "oauth2",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      { key: "answers", type: "array", description: "Answers submitted" },
      {
        key: "respondentEmail",
        type: "string",
        description: "Email of respondent if collected",
      },
    ],
    setupGuide: [
      "Authenticate Google.",
      "Select your form.",
      "Submit a test response to map fields.",
    ],
    testAction: "executeGoogleForm",
  },
  {
    type: NodeType.STRIPE_TRIGGER,
    label: "Stripe Event",
    description: "Start when Stripe sends an event.",
    icon: "/logos/stripe.svg",
    brandIcon: "/logos/stripe.svg",
    group: "triggers",
    keywords: ["stripe", "payment", "billing", "webhook"],
    inputs: [
      {
        key: "eventTypes",
        label: "Event Types",
        type: "text",
        required: true,
        supportsDynamic: false,
        placeholder: "invoice.paid, payment_intent.succeeded",
      },
    ],
    credentials: [
      {
        key: "stripeKey",
        label: "Stripe API Key",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "event",
        type: "object",
        description: "Stripe event data payload",
      },
    ],
    setupGuide: [
      "Provide Stripe Secret Key.",
      "Select listening events.",
      "Receive test event to set up mapping.",
    ],
    testAction: "executeStripeEvent",
  },
  {
    type: NodeType.SCHEDULE,
    label: "Schedule",
    description: "Run workflow on a recurring schedule.",
    icon: CalendarClockIcon,
    brandIcon: null,
    group: "triggers",
    keywords: ["cron", "schedule", "time", "recurring"],
    inputs: [
      {
        key: "cronExpression",
        label: "CRON Expression",
        type: "text",
        required: true,
        supportsDynamic: false,
        placeholder: "0 0 * * *",
      },
      {
        key: "timezone",
        label: "Timezone",
        type: "select",
        options: ["UTC", "America/New_York", "Europe/London"],
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "fireTime",
        type: "string",
        description: "Exact time workflow was fired",
      },
    ],
    setupGuide: [
      "Define your cron schedule.",
      "Select the appropriate timezone.",
    ],
    testAction: "executeSchedule",
  },
  {
    type: NodeType.ROUTER,
    label: "Router",
    description: "Send the workflow to one named path.",
    icon: GitBranchIcon,
    brandIcon: null,
    group: "logic",
    keywords: ["branch", "route", "switch", "decision"],
    inputs: [
      {
        key: "branches",
        label: "Number of Branches",
        type: "number",
        required: true,
        supportsDynamic: false,
        placeholder: "2",
      },
    ],
    outputs: [
      { key: "route_1", type: "branch", description: "Path 1" },
      { key: "route_2", type: "branch", description: "Path 2" },
    ],
    setupGuide: [
      "Configure the number of branches.",
      "Connect nodes to each resulting path output.",
    ],
    testAction: "executeRouter",
  },
  {
    type: NodeType.CONDITION,
    label: "Condition",
    description: "Go to one path for yes and one for no.",
    icon: SplitIcon,
    brandIcon: null,
    group: "logic",
    keywords: ["if", "true", "false", "branch", "check"],
    inputs: [
      {
        key: "leftValue",
        label: "Compare Target",
        type: "dynamic",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "condition",
        label: "Operator",
        type: "select",
        options: ["equals", "contains", "greater than", "less than"],
        required: true,
        supportsDynamic: false,
      },
      {
        key: "rightValue",
        label: "Compare Value",
        type: "dynamic",
        required: true,
        supportsDynamic: true,
      },
    ],
    outputs: [
      { key: "result", type: "boolean", description: "Evaluation resolution" },
      { key: "truePath", type: "branch", description: "Path if true" },
      { key: "falsePath", type: "branch", description: "Path if false" },
    ],
    setupGuide: [
      "Select a variable to check.",
      "Define operator requirement.",
      "Map actions to True and False branches.",
    ],
    testAction: "executeCondition",
  },
  {
    type: NodeType.HUMAN_APPROVAL,
    label: "Human Approval",
    description: "Pause and wait for a person to approve.",
    icon: UserCheckIcon,
    brandIcon: null,
    group: "logic",
    keywords: ["approval", "review", "human", "pause"],
    inputs: [
      {
        key: "approverEmail",
        label: "Approver Email",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "context",
        label: "Context to Review",
        type: "textarea",
        required: false,
        supportsDynamic: true,
      },
    ],
    outputs: [
      { key: "decision", type: "string", description: "approved or rejected" },
      { key: "notes", type: "string", description: "Reviewer comments" },
      { key: "approvedPath", type: "branch", description: "Path if approved" },
      { key: "rejectedPath", type: "branch", description: "Path if rejected" },
    ],
    setupGuide: [
      "Identify the approver.",
      "Provide dynamic context payload.",
      "Workflow halts until button link in email is clicked.",
    ],
    testAction: "executeHumanApproval",
  },
  {
    type: NodeType.DELAY,
    label: "Delay",
    description: "Wait, then continue.",
    icon: HourglassIcon,
    brandIcon: null,
    group: "logic",
    keywords: ["wait", "sleep", "pause", "retry"],
    inputs: [
      {
        key: "duration",
        label: "Delay Value",
        type: "number",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "unit",
        label: "Time Unit",
        type: "select",
        options: ["seconds", "minutes", "hours"],
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "finishedAt",
        type: "string",
        description: "Resumption timestamp",
      },
    ],
    setupGuide: [
      "Enter duration number.",
      "Select unit of time.",
      "Workflow will transparently pause/re-queue.",
    ],
    testAction: "executeDelay",
  },
  {
    type: NodeType.MERGE,
    label: "Merge",
    description: "Bring branches back together.",
    icon: GitMergeIcon,
    brandIcon: null,
    group: "logic",
    keywords: ["merge", "join", "combine", "branch"],
    inputs: [
      {
        key: "waitBehavior",
        label: "Wait For",
        type: "select",
        options: ["all parents", "any parent"],
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "mergedData",
        type: "object",
        description: "Combined outputs of parents",
      },
    ],
    setupGuide: [
      "Connect multiple nodes into this node.",
      "Select if it should wait for all or any before proceeding.",
    ],
    testAction: "executeMerge",
  },
  {
    type: NodeType.HTTP_REQUEST,
    label: "HTTP Request",
    description: "Call an API and get data back.",
    icon: GlobeIcon,
    brandIcon: null,
    group: "data",
    keywords: ["api", "fetch", "rest", "request", "endpoint"],
    inputs: [
      {
        key: "url",
        label: "Request URL",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "method",
        label: "HTTP Method",
        type: "select",
        options: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        required: true,
        supportsDynamic: false,
      },
      {
        key: "headers",
        label: "Headers (JSON)",
        type: "json",
        required: false,
        supportsDynamic: true,
      },
      {
        key: "body",
        label: "Request Body",
        type: "textarea",
        required: false,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "apiKey",
        label: "API Key Header (Optional)",
        type: "password",
        required: false,
        supportsDynamic: false,
      },
    ],
    outputs: [
      { key: "response.status", type: "number", description: "HTTP Code" },
      { key: "response.body", type: "any", description: "Parsed Body" },
    ],
    setupGuide: [
      "Enter URL.",
      "Select method.",
      "Configure headers.",
      "Test the API configuration.",
    ],
    testAction: "executeHttpRequest",
    defaultData: {
      method: "GET",
      url: "https://api.example.com",
      variableName: "httpResponse",
      authMode: "none",
      bodyMode: "none",
    },
  },
  {
    type: NodeType.SET_VARIABLE,
    label: "Set Variable",
    description: "Save text or data for later steps.",
    icon: BracesIcon,
    brandIcon: null,
    group: "data",
    keywords: ["context", "variable", "state", "assign"],
    inputs: [
      {
        key: "variableName",
        label: "Variable Name",
        type: "text",
        required: true,
        supportsDynamic: false,
      },
      {
        key: "variableValue",
        label: "Value",
        type: "dynamic",
        required: true,
        supportsDynamic: true,
      },
    ],
    outputs: [
      { key: "value", type: "any", description: "The resolved variable value" },
    ],
    setupGuide: [
      "Name your variable.",
      "Set static or dynamic content into it.",
    ],
    testAction: "executeSetVariable",
  },
  {
    type: NodeType.TEXT_TEMPLATE,
    label: "Text Template",
    description: "Build text from workflow data.",
    icon: FileType2Icon,
    brandIcon: null,
    group: "data",
    keywords: ["text", "template", "message", "string"],
    inputs: [
      {
        key: "template",
        label: "Template Body",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    outputs: [
      {
        key: "result",
        type: "string",
        description: "The finalized text output",
      },
    ],
    setupGuide: [
      "Write base text.",
      "Inject dynamic node values where needed.",
    ],
    testAction: "executeTextTemplate",
  },
  {
    type: NodeType.JSON_TRANSFORM,
    label: "JSON Transform",
    description: "Build a JSON object from workflow data.",
    icon: CodeXmlIcon,
    brandIcon: null,
    group: "data",
    keywords: ["json", "transform", "object", "payload"],
    inputs: [
      {
        key: "sourcePath",
        label: "Source Input",
        type: "dynamic",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "extractionKey",
        label: "JMESPath / Key",
        type: "text",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "filteredData",
        type: "any",
        description: "Resulting structured JSON",
      },
    ],
    setupGuide: [
      "Select source binding.",
      "Write query or key to extract.",
      "Test extraction.",
    ],
    testAction: "executeJsonTransform",
  },
  {
    type: NodeType.LOGGER,
    label: "Logger",
    description: "Add a note to the run log.",
    icon: TerminalSquareIcon,
    brandIcon: null,
    group: "data",
    keywords: ["log", "debug", "audit", "trace"],
    inputs: [
      {
        key: "logMessage",
        label: "Message / Data",
        type: "dynamic",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "level",
        label: "Severity",
        type: "select",
        options: ["info", "warn", "error", "debug"],
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "logId",
        type: "string",
        description: "Execution log reference trace",
      },
    ],
    setupGuide: [
      "Set log level.",
      "Pass in variables you want to inspect during execution.",
    ],
    testAction: "executeLogger",
  },
  {
    type: NodeType.GOOGLE_SHEETS,
    label: "Google Sheets",
    description: "Read or append data to a sheet.",
    icon: "/logos/google%20Sheet.svg",
    brandIcon: "/logos/google%20Sheet.svg",
    group: "data",
    keywords: ["google", "sheets", "spreadsheet", "excel"],
    inputs: [
      {
        key: "sheetId",
        label: "Spreadsheet ID",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "action",
        label: "Action",
        type: "select",
        options: ["read", "write", "append"],
        required: true,
        supportsDynamic: false,
      },
      {
        key: "range",
        label: "Data Range",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "values",
        label: "Values (JSON)",
        type: "json",
        required: false,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "googleAuth",
        label: "Google OAuth Connection",
        type: "oauth2",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "rows",
        type: "array",
        description: "Row data from read operation",
      },
      {
        key: "updatedRange",
        type: "string",
        description: "Range that was affected",
      },
    ],
    setupGuide: [
      "Connect Google Auth.",
      "Input Sheet ID.",
      "Select action.",
      "Provide data mapped to columns.",
    ],
    testAction: "executeGoogleSheets",
  },
  {
    type: NodeType.EMAIL_PARSER,
    label: "Email Parser",
    description: "Extract data from incoming emails.",
    icon: MailSearchIcon,
    brandIcon: null,
    group: "data",
    keywords: ["email", "parse", "extract", "content"],
    inputs: [
      {
        key: "sourceText",
        label: "Raw Email Body",
        type: "dynamic",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "parseRules",
        label: "Rules (JSON schema)",
        type: "json",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "extractedData",
        type: "object",
        description: "Dictionary of parsed items",
      },
    ],
    setupGuide: [
      "Pass in incoming email body from a webhook/trigger.",
      "Define extraction keys object.",
    ],
    testAction: "executeEmailParser",
  },
  {
    type: NodeType.DB_QUERY,
    label: "Database Query",
    description: "Run SQL queries on your DB.",
    icon: DatabaseIcon,
    brandIcon: null,
    group: "data",
    keywords: ["sql", "database", "postgres", "query"],
    inputs: [
      {
        key: "engine",
        label: "SQL Engine",
        type: "select",
        options: ["postgres", "mysql", "mssql"],
        required: true,
        supportsDynamic: false,
      },
      {
        key: "query",
        label: "SQL Query String",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "dbUri",
        label: "Database Connection URI",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "results",
        type: "array",
        description: "Array of returned database records",
      },
    ],
    setupGuide: [
      "Select target engine.",
      "Provide connection securely.",
      "Write SQL query (use bindings for secure parameterized inputs).",
    ],
    testAction: "executeDatabaseQuery",
  },
  {
    type: NodeType.FILE_STORAGE,
    label: "File Storage",
    description: "Upload and manage files in S3/Drive.",
    icon: FolderOpenIcon,
    brandIcon: null,
    group: "data",
    keywords: ["storage", "s3", "drive", "file", "upload"],
    inputs: [
      {
        key: "action",
        label: "Protocol",
        type: "select",
        options: ["download", "upload", "delete"],
        required: true,
        supportsDynamic: false,
      },
      {
        key: "bucket",
        label: "Bucket Name",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "fileId",
        label: "File Key/Path",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "fileData",
        label: "File Buffer",
        type: "dynamic",
        required: false,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "s3Access",
        label: "S3 Key",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
      {
        key: "s3Secret",
        label: "S3 Secret",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      { key: "url", type: "string", description: "Resolvable URL of the file" },
      {
        key: "buffer",
        type: "any",
        description: "Buffer memory payload of downloaded file",
      },
    ],
    setupGuide: [
      "Connect your S3 key.",
      "Select operation.",
      "Map variables to paths.",
    ],
    testAction: "executeFileStorage",
  },
  {
    type: NodeType.OPENAI,
    label: "OpenAI",
    description: "Ask OpenAI and save the reply.",
    icon: "/logos/openai.svg",
    brandIcon: "/logos/openai.svg",
    group: "ai",
    keywords: ["llm", "gpt", "openai", "ai", "model"],
    inputs: [
      {
        key: "prompt",
        label: "System Prompt",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "model",
        label: "Model",
        type: "select",
        options: ["gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"],
        required: true,
        supportsDynamic: false,
      },
      {
        key: "temperature",
        label: "Temperature",
        type: "number",
        required: true,
        supportsDynamic: false,
      },
    ],
    credentials: [
      {
        key: "apiKey",
        label: "OpenAI API Key",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "response.text",
        type: "string",
        description: "Completion output",
      },
      {
        key: "response.usage",
        type: "object",
        description: "Token utilization count",
      },
    ],
    setupGuide: [
      "Input your OpenAI Key.",
      "Build your dynamic master prompt.",
      "Ensure temperature maps to creativity need.",
    ],
    testAction: "executeOpenai",
    defaultData: {
      userPrompt: "You are a helpful assistant. Summarize: {{payload}}",
      variableName: "openaiResponse",
      systemPrompt: "You are a helpful assistant.",
    },
  },
  {
    type: NodeType.ANTHROPIC,
    label: "Anthropic",
    description: "Ask Anthropic and save the reply.",
    icon: "/logos/anthropic.svg",
    brandIcon: "/logos/anthropic.svg",
    group: "ai",
    keywords: ["anthropic", "claude", "llm", "ai", "model"],
    inputs: [
      {
        key: "prompt",
        label: "Prompt Command",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "model",
        label: "Claude Version",
        type: "select",
        options: ["claude-3-opus", "claude-3-sonnet", "claude-3-haiku"],
        required: true,
        supportsDynamic: false,
      },
    ],
    credentials: [
      {
        key: "apiKey",
        label: "Anthropic API Key",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "response.text",
        type: "string",
        description: "Completion output",
      },
    ],
    setupGuide: [
      "Input API Key.",
      "Provide large data payloads into prompt.",
      "Extract answers.",
    ],
    testAction: "executeAnthropic",
  },
  {
    type: NodeType.GEMINI,
    label: "Gemini",
    description: "Ask Gemini and save the reply.",
    icon: "/logos/gemini.svg",
    brandIcon: "/logos/gemini.svg",
    group: "ai",
    keywords: ["google", "gemini", "llm", "ai", "model"],
    inputs: [
      {
        key: "prompt",
        label: "Prompt",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "model",
        label: "Model",
        type: "select",
        options: ["gemini-3.1-pro", "gemini-3.1-flash", "gemini-3-flash"],
        required: true,
        supportsDynamic: false,
      },
    ],
    credentials: [
      {
        key: "apiKey",
        label: "Gemini API Key",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "response.text",
        type: "string",
        description: "Generation result string",
      },
    ],
    setupGuide: ["Map keys.", "Test dynamic prompts."],
    testAction: "executeGemini",
  },
  {
    type: NodeType.GEMMA,
    label: "Gemma Native",
    description: "Ask Gemma and save the reply.",
    icon: "/logos/gemma.svg",
    brandIcon: "/logos/gemma.svg",
    group: "ai",
    keywords: ["google", "gemma", "llm", "ai", "model"],
    inputs: [
      {
        key: "prompt",
        label: "Prompt String",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    outputs: [
      {
        key: "response.text",
        type: "string",
        description: "Generation result",
      },
    ],
    setupGuide: ["Design lightweight logic.", "Run test."],
    testAction: "executeGemma",
  },
  {
    type: NodeType.HUGGINGFACE,
    label: "Hugging Face",
    description: "Run an open-source model and save the reply.",
    icon: "/logos/huggingface.svg",
    brandIcon: "/logos/huggingface.svg",
    group: "ai",
    keywords: ["huggingface", "hf", "open source", "task", "model"],
    inputs: [
      {
        key: "endpointUrl",
        label: "Inference Endpoint",
        type: "text",
        required: true,
        supportsDynamic: false,
      },
      {
        key: "inputs",
        label: "Request Vector/Text",
        type: "dynamic",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "hfToken",
        label: "HF Access Token",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "predictions",
        type: "any",
        description: "Raw prediction array or completion from model structure",
      },
    ],
    setupGuide: ["Find endpoint URL.", "Format json standard vector."],
    testAction: "executeHuggingFace",
  },
  {
    type: NodeType.SLACK,
    label: "Slack",
    description: "Send a Slack message.",
    icon: "/logos/slack.svg",
    brandIcon: "/logos/slack.svg",
    group: "communication",
    keywords: ["slack", "message", "notify", "alert"],
    inputs: [
      {
        key: "channelId",
        label: "Channel/User Target ID",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "text",
        label: "Markdown Message text",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "slackAuth",
        label: "Slack Bot Token",
        type: "oauth2",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "timestamp",
        type: "string",
        description: "Message delivery confirmation ts",
      },
    ],
    setupGuide: [
      "Setup Slack Auth.",
      "Identify the Channel ID.",
      "Construct dynamic mapped message.",
      "Send.",
    ],
    testAction: "executeSlack",
  },
  {
    type: NodeType.EMAIL_SEND,
    label: "Send Email",
    description: "Send an automated email.",
    icon: "/logos/Gmail.svg",
    brandIcon: "/logos/Gmail.svg",
    group: "communication",
    keywords: ["email", "smtp", "send", "mail"],
    inputs: [
      {
        key: "to",
        label: "Recipient Email",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "from",
        label: "Sender Name",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "subject",
        label: "Subject",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "body",
        label: "Email HTML Body",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "smtpServer",
        label: "SMTP Server",
        type: "text",
        required: true,
        supportsDynamic: false,
      },
      {
        key: "port",
        label: "Port",
        type: "number",
        required: true,
        supportsDynamic: false,
      },
      {
        key: "username",
        label: "Username",
        type: "text",
        required: true,
        supportsDynamic: false,
      },
      {
        key: "password",
        label: "Password",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      { key: "status", type: "string", description: "Delivery outcome" },
    ],
    setupGuide: [
      "Configure SMTP routes.",
      "Map dynamic elements.",
      "Test delivery block.",
    ],
    testAction: "executeEmailSend",
  },
  {
    type: NodeType.TWILIO_SMS,
    label: "Twilio SMS",
    description: "Send text messages via Twilio.",
    icon: "/logos/twilio.svg",
    brandIcon: "/logos/twilio.svg",
    group: "communication",
    keywords: ["sms", "text", "twilio", "mobile"],
    inputs: [
      {
        key: "toPhone",
        label: "Target Phone Number",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "fromPhone",
        label: "Sender Phone / Active Number",
        type: "text",
        required: true,
        supportsDynamic: false,
      },
      {
        key: "message",
        label: "SMS Body String",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "accountSid",
        label: "Twilio Account SID",
        type: "text",
        required: true,
        supportsDynamic: false,
      },
      {
        key: "authToken",
        label: "Twilio Auth Token",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "messageId",
        type: "string",
        description: "Twilio confirmation record reference",
      },
    ],
    setupGuide: [
      "Input your live Twilio credentials.",
      "Insert valid E.164 phone numbers (e.g. +1234567890).",
    ],
    testAction: "executeTwilioSms",
  },
  {
    type: NodeType.HUBSPOT,
    label: "HubSpot CRM",
    description: "Manage contacts and deals in HubSpot.",
    icon: DatabaseIcon,
    brandIcon: null,
    group: "communication",
    keywords: ["crm", "hubspot", "lead", "deal"],
    inputs: [
      {
        key: "objectType",
        label: "Target Object",
        type: "select",
        options: ["contacts", "companies", "deals"],
        required: true,
        supportsDynamic: false,
      },
      {
        key: "action",
        label: "Action Intent",
        type: "select",
        options: ["create", "update"],
        required: true,
        supportsDynamic: false,
      },
      {
        key: "properties",
        label: "Data Map (JSON)",
        type: "json",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "hubspotToken",
        label: "Private App Token / OAuth",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "recordId",
        type: "string",
        description: "Created or updated HubSpot internal ID references",
      },
    ],
    setupGuide: [
      "Authorize token.",
      "Decide object type routing.",
      "Pass strict JSON to override details.",
    ],
    testAction: "executeHubspot",
  },
  {
    type: NodeType.SHOPIFY,
    label: "Shopify Store",
    description: "Sync orders and products with Shopify.",
    icon: "/logos/shopify.svg",
    brandIcon: "/logos/shopify.svg",
    group: "communication",
    keywords: ["ecommerce", "shopify", "store", "order"],
    inputs: [
      {
        key: "endpoint",
        label: "Admin GraphQL / REST route",
        type: "text",
        required: true,
        supportsDynamic: false,
      },
      {
        key: "payload",
        label: "Mutation Payload",
        type: "json",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "shopAccessToken",
        label: "Admin API Token",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "response",
        type: "any",
        description: "Raw execution result from the shop store",
      },
    ],
    setupGuide: ["Provide Admin access token.", "Enter specific mutation."],
    testAction: "executeShopify",
  },
  {
    type: NodeType.DISCORD,
    label: "Discord",
    description: "Send a Discord message.",
    icon: "/logos/discord.svg",
    brandIcon: "/logos/discord.svg",
    group: "communication",
    keywords: ["discord", "message", "notify", "alert"],
    inputs: [
      {
        key: "webhookUrl",
        label: "Discord Webhook URI",
        type: "text",
        required: false,
        supportsDynamic: true,
      },
      {
        key: "content",
        label: "Message Content",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "botToken",
        label: "Optional Bot Token",
        type: "password",
        required: false,
        supportsDynamic: false,
      },
    ],
    outputs: [
      { key: "status", type: "string", description: "Success validation ping" },
    ],
    setupGuide: [
      "Generate a webhook link in Discord interface.",
      "Drop it here immediately.",
    ],
    testAction: "executeDiscord",
  },
  {
    type: NodeType.X,
    label: "X (Twitter)",
    description: "Post a tweet to X.",
    icon: "/logos/Twitter.svg",
    brandIcon: "/logos/Twitter.svg",
    group: "communication",
    keywords: ["twitter", "x", "post", "tweet", "social"],
    inputs: [
      {
        key: "tweetText",
        label: "Tweet Status Detail",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "twitterOauth",
        label: "X Connect Auth Handler",
        type: "oauth2",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "tweetId",
        type: "string",
        description: "The published tweet unique tag.",
      },
    ],
    setupGuide: [
      "Sign into your X logic portal.",
      "Submit standard text payload.",
    ],
    testAction: "executeX",
  },
  {
    type: NodeType.LINKEDIN,
    label: "LinkedIn",
    description: "Post an update to LinkedIn.",
    icon: "/logos/linkedin.svg",
    brandIcon: "/logos/linkedin.svg",
    group: "communication",
    keywords: ["linkedin", "post", "update", "social", "professional"],
    inputs: [
      {
        key: "authorURN",
        label: "Author URN (Optional string)",
        type: "text",
        required: false,
        supportsDynamic: true,
      },
      {
        key: "postContent",
        label: "Text Payload",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "linkedinOauth",
        label: "LinkedIn Connect Auth",
        type: "oauth2",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "postLink",
        type: "string",
        description: "Resolvable URL of the new post.",
      },
    ],
    setupGuide: [
      "Confirm exact network identifier.",
      "Post execution details.",
    ],
    testAction: "executeLinkedin",
  },
  {
    type: NodeType.INSTAGRAM,
    label: "Instagram",
    description: "Post a photo or update to Instagram.",
    icon: "/logos/instagram.svg",
    brandIcon: "/logos/instagram.svg",
    group: "communication",
    keywords: ["instagram", "photo", "post", "social", "meta"],
    inputs: [
      {
        key: "imageUrl",
        label: "Image CDN URL",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "caption",
        label: "Associated Status Text",
        type: "textarea",
        required: false,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "instagramOauth",
        label: "Instagram Access Token",
        type: "oauth2",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "mediaId",
        type: "string",
        description: "FB graphical network ID.",
      },
    ],
    setupGuide: [
      "Confirm image exists at URL string.",
      "Run test logic node execution sequence.",
    ],
    testAction: "executeInstagram",
  },
  {
    type: NodeType.TELEGRAM,
    label: "Telegram",
    description: "Send a message via Telegram bot.",
    icon: "/logos/telegram.svg",
    brandIcon: "/logos/telegram.svg",
    group: "communication",
    keywords: ["telegram", "bot", "message", "notify", "alert"],
    inputs: [
      {
        key: "chatId",
        label: "Direct Channel/Chat ID value",
        type: "text",
        required: true,
        supportsDynamic: true,
      },
      {
        key: "message",
        label: "Message Data String",
        type: "textarea",
        required: true,
        supportsDynamic: true,
      },
    ],
    credentials: [
      {
        key: "botKey",
        label: "Raw HTTP Bot Key String",
        type: "password",
        required: true,
        supportsDynamic: false,
      },
    ],
    outputs: [
      {
        key: "response",
        type: "object",
        description: "Raw validation API return.",
      },
    ],
    setupGuide: [
      "Use BotFather to obtain credentials.",
      "Supply exact ChatId numeric.",
    ],
    testAction: "executeTelegram",
  },
];

export const getNodeCatalogItem = (type: NodeType) =>
  nodeCatalog.find((item) => item.type === type);

export const getNodeIconByGroup = (group: NodeCatalogGroupId) => {
  switch (group) {
    case "triggers":
      return MousePointerClickIcon;
    case "logic":
      return GitBranchIcon;
    case "data":
      return FileTextIcon;
    case "ai":
      return BrainCircuitIcon;
    case "communication":
      return SendIcon;
    case "integrations":
      return Boxes;
  }
};
