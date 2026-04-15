import { CredentialType, NodeType } from "@prisma/client";

export type WorkflowTemplateDefinition = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  isPremium?: boolean;
  requiredCredentials: CredentialType[];
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    data?: Record<string, unknown>;
  }>;
  edges: Array<{
    source: string;
    target: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
};

export const workflowTemplates: WorkflowTemplateDefinition[] = [
  {
    id: "support-triage-assistant",
    name: "Support Triage Assistant",
    description:
      "Checks if a support message is urgent. If it is urgent, it asks for approval and sends it to Slack.",
    category: "Support",
    tags: ["triage", "support", "approval", "urgent"],
    isPremium: true,
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      {
        id: "manual",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 0, y: 100 },
      },
      {
        id: "input",
        type: NodeType.SET_VARIABLE,
        position: { x: 240, y: 100 },
        data: {
          variableName: "ticketText",
          valueTemplate:
            "Customer says their production workspace is down and needs help immediately.",
          parseAsJson: false,
        },
      },
      {
        id: "classifier",
        type: NodeType.OPENAI,
        position: { x: 500, y: 100 },
        data: {
          variableName: "priorityDecision",
          systemPrompt:
            "You are a support triage assistant. Reply with only true for urgent issues and false for normal issues.",
          userPrompt: "Ticket text: {{ticketText}}",
        },
      },
      {
        id: "priority-check",
        type: NodeType.CONDITION,
        position: { x: 780, y: 100 },
        data: {
          variableName: "priorityRoute",
          expression: "{{priorityDecision.text}}",
          trueRoute: "urgent",
          falseRoute: "normal",
        },
      },
      {
        id: "approval",
        type: NodeType.HUMAN_APPROVAL,
        position: { x: 1040, y: 30 },
        data: {
          variableName: "approvalStatus",
          message:
            "Urgent ticket detected. Review this request before alerting the on-call channel.\n\n{{ticketText}}",
        },
      },
      {
        id: "slack",
        type: NodeType.SLACK,
        position: { x: 1310, y: 30 },
        data: {
          variableName: "urgentSlack",
          webhookUrl: "https://hooks.slack.com/services/replace-me",
          content:
            "Urgent support ticket approved for escalation:\n{{ticketText}}",
        },
      },
      {
        id: "logger",
        type: NodeType.LOGGER,
        position: { x: 1050, y: 210 },
        data: {
          level: "info",
          variableName: "normalTicketLog",
          message: "Normal priority ticket logged: {{ticketText}}",
        },
      },
    ],
    edges: [
      { source: "manual", target: "input" },
      { source: "input", target: "classifier" },
      { source: "classifier", target: "priority-check" },
      { source: "priority-check", target: "approval", sourceHandle: "urgent" },
      { source: "approval", target: "slack" },
      { source: "priority-check", target: "logger", sourceHandle: "normal" },
    ],
  },
  {
    id: "api-summary-to-slack",
    name: "API Summary To Slack",
    description:
      "Gets data from an API, makes a short summary, and sends it to Slack.",
    category: "Operations",
    tags: ["api", "summary", "slack", "digest"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      {
        id: "manual",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 0, y: 120 },
      },
      {
        id: "http",
        type: NodeType.HTTP_REQUEST,
        position: { x: 250, y: 120 },
        data: {
          variableName: "latestResponse",
          method: "GET",
          endpoint: "https://jsonplaceholder.typicode.com/posts/1",
          body: "",
        },
      },
      {
        id: "summary",
        type: NodeType.OPENAI,
        position: { x: 520, y: 120 },
        data: {
          variableName: "summaryResult",
          systemPrompt:
            "You turn API responses into short operator-ready summaries.",
          userPrompt:
            "Summarize this response in 3 short bullet points:\n{{json latestResponse.httpResponse.data}}",
        },
      },
      {
        id: "slack",
        type: NodeType.SLACK,
        position: { x: 810, y: 120 },
        data: {
          variableName: "summarySlack",
          webhookUrl: "https://hooks.slack.com/services/replace-me",
          content: "API digest:\n{{summaryResult.text}}",
        },
      },
    ],
    edges: [
      { source: "manual", target: "http" },
      { source: "http", target: "summary" },
      { source: "summary", target: "slack" },
    ],
  },
  {
    id: "lead-intake-router",
    name: "Lead Intake Router",
    description:
      "Reads new form leads and sends hot leads to Slack and the rest to Discord.",
    category: "Sales",
    tags: ["lead", "routing", "forms", "qualification"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      {
        id: "form",
        type: NodeType.GOOGLE_FORM_TRIGGER,
        position: { x: 0, y: 160 },
      },
      {
        id: "classification",
        type: NodeType.OPENAI,
        position: { x: 280, y: 160 },
        data: {
          variableName: "leadRoute",
          systemPrompt:
            "You classify inbound leads. Reply with only sales or nurture.",
          userPrompt:
            "Form response data:\n{{json googleForm.responses}}\n\nRoute:",
        },
      },
      {
        id: "router",
        type: NodeType.ROUTER,
        position: { x: 560, y: 160 },
        data: {
          variableName: "leadDecision",
          routeExpression: "{{leadRoute.text}}",
          routes: ["sales", "nurture"],
          fallbackRoute: "nurture",
        },
      },
      {
        id: "sales-slack",
        type: NodeType.SLACK,
        position: { x: 860, y: 80 },
        data: {
          variableName: "salesSlack",
          webhookUrl: "https://hooks.slack.com/services/replace-me",
          content:
            "New sales-ready lead:\n{{json googleForm.responses}}\nRoute: {{leadRoute.text}}",
        },
      },
      {
        id: "nurture-discord",
        type: NodeType.DISCORD,
        position: { x: 860, y: 260 },
        data: {
          variableName: "nurtureDiscord",
          webhookUrl: "https://discord.com/api/webhooks/replace-me",
          username: "Otogent Router",
          content:
            "Lead sent to nurture queue:\n{{json googleForm.responses}}\nRoute: {{leadRoute.text}}",
        },
      },
    ],
    edges: [
      { source: "form", target: "classification" },
      { source: "classification", target: "router" },
      { source: "router", target: "sales-slack", sourceHandle: "sales" },
      {
        source: "router",
        target: "nurture-discord",
        sourceHandle: "nurture",
      },
    ],
  },
  {
    id: "stripe-review-queue",
    name: "Stripe Review Queue",
    description:
      "Takes a Stripe event, saves a log, and waits for approval before sending an alert.",
    category: "Finance",
    tags: ["stripe", "payments", "approval", "ops"],
    requiredCredentials: [],
    nodes: [
      {
        id: "stripe",
        type: NodeType.STRIPE_TRIGGER,
        position: { x: 0, y: 120 },
      },
      {
        id: "logger",
        type: NodeType.LOGGER,
        position: { x: 260, y: 120 },
        data: {
          level: "info",
          variableName: "paymentLog",
          message:
            "Stripe event received: {{stripe.eventType}} for {{stripe.amount}} {{stripe.currency}}",
        },
      },
      {
        id: "approval",
        type: NodeType.HUMAN_APPROVAL,
        position: { x: 520, y: 120 },
        data: {
          variableName: "paymentApproval",
          message:
            "Review this Stripe event before notifying operations.\n\n{{json stripe}}",
        },
      },
      {
        id: "slack",
        type: NodeType.SLACK,
        position: { x: 790, y: 120 },
        data: {
          variableName: "paymentSlack",
          webhookUrl: "https://hooks.slack.com/services/replace-me",
          content:
            "Approved Stripe event:\nType: {{stripe.eventType}}\nCustomer: {{stripe.customerId}}",
        },
      },
    ],
    edges: [
      { source: "stripe", target: "logger" },
      { source: "logger", target: "approval" },
      { source: "approval", target: "slack" },
    ],
  },
  {
    id: "delayed-follow-up",
    name: "Delayed Follow-up",
    description:
      "Saves a reminder, waits for a set time, and sends it to Discord.",
    category: "Operations",
    tags: ["delay", "follow-up", "reminder", "discord"],
    requiredCredentials: [],
    nodes: [
      {
        id: "manual",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 0, y: 120 },
      },
      {
        id: "set",
        type: NodeType.SET_VARIABLE,
        position: { x: 240, y: 120 },
        data: {
          variableName: "followUpMessage",
          valueTemplate:
            "Check in with the customer after the deployment window.",
          parseAsJson: false,
        },
      },
      {
        id: "delay",
        type: NodeType.DELAY,
        position: { x: 500, y: 120 },
        data: {
          amount: 30,
          unit: "m",
        },
      },
      {
        id: "discord",
        type: NodeType.DISCORD,
        position: { x: 740, y: 120 },
        data: {
          variableName: "followUpDiscord",
          webhookUrl: "https://discord.com/api/webhooks/replace-me",
          username: "Otogent Reminder",
          content: "Reminder after delay:\n{{followUpMessage}}",
        },
      },
    ],
    edges: [
      { source: "manual", target: "set" },
      { source: "set", target: "delay" },
      { source: "delay", target: "discord" },
    ],
  },
  {
    id: "gemini-research-digest",
    name: "Gemini Research Digest",
    description:
      "Gets data from an API, asks Gemini to summarize it, and saves the result in the log.",
    category: "Research",
    tags: ["gemini", "research", "digest", "api"],
    requiredCredentials: [CredentialType.GEMINI],
    nodes: [
      {
        id: "manual",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 0, y: 120 },
      },
      {
        id: "http",
        type: NodeType.HTTP_REQUEST,
        position: { x: 250, y: 120 },
        data: {
          variableName: "researchPayload",
          method: "GET",
          endpoint: "https://jsonplaceholder.typicode.com/users",
          body: "",
        },
      },
      {
        id: "gemini",
        type: NodeType.GEMINI,
        position: { x: 520, y: 120 },
        data: {
          variableName: "geminiDigest",
          systemPrompt:
            "You produce concise research digests for operations teams.",
          userPrompt:
            "Summarize the most important points from this payload:\n{{json researchPayload.httpResponse.data}}",
        },
      },
      {
        id: "logger",
        type: NodeType.LOGGER,
        position: { x: 810, y: 120 },
        data: {
          level: "info",
          variableName: "geminiLog",
          message: "Gemini digest:\n{{geminiDigest.text}}",
        },
      },
    ],
    edges: [
      { source: "manual", target: "http" },
      { source: "http", target: "gemini" },
      { source: "gemini", target: "logger" },
    ],
  },
  {
    id: "anthropic-review-desk",
    name: "Anthropic Review Desk",
    description:
      "Creates a review summary with Anthropic, then asks for approval before sending it to Slack.",
    category: "Reviews",
    tags: ["anthropic", "approval", "review", "slack"],
    requiredCredentials: [CredentialType.ANTHROPIC],
    nodes: [
      {
        id: "manual",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 0, y: 120 },
      },
      {
        id: "set",
        type: NodeType.SET_VARIABLE,
        position: { x: 250, y: 120 },
        data: {
          variableName: "reviewSubject",
          valueTemplate:
            "Review the new onboarding workflow before it goes live.",
          parseAsJson: false,
        },
      },
      {
        id: "anthropic",
        type: NodeType.ANTHROPIC,
        position: { x: 530, y: 120 },
        data: {
          variableName: "reviewDraft",
          systemPrompt:
            "You prepare concise internal review summaries for senior operators.",
          userPrompt:
            "Prepare a short review summary for this item:\n{{reviewSubject}}",
        },
      },
      {
        id: "approval",
        type: NodeType.HUMAN_APPROVAL,
        position: { x: 820, y: 120 },
        data: {
          variableName: "reviewApproval",
          message:
            "Please approve this review summary before sending it to Slack.\n\n{{reviewDraft.text}}",
        },
      },
      {
        id: "slack",
        type: NodeType.SLACK,
        position: { x: 1090, y: 120 },
        data: {
          variableName: "reviewSlack",
          webhookUrl: "https://hooks.slack.com/services/replace-me",
          content: "Approved review summary:\n{{reviewDraft.text}}",
        },
      },
    ],
    edges: [
      { source: "manual", target: "set" },
      { source: "set", target: "anthropic" },
      { source: "anthropic", target: "approval" },
      { source: "approval", target: "slack" },
    ],
  },
  {
    id: "gemma-routing-ops",
    name: "Gemma Routing Ops",
    description:
      "Uses Gemma to decide where an ops message should go, then routes it to Discord or the log.",
    category: "Operations",
    tags: ["gemma", "routing", "ops", "classification"],
    requiredCredentials: [CredentialType.GEMMA],
    nodes: [
      {
        id: "manual",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 0, y: 150 },
      },
      {
        id: "set",
        type: NodeType.SET_VARIABLE,
        position: { x: 240, y: 150 },
        data: {
          variableName: "opsMessage",
          valueTemplate:
            "Customer requests a billing follow-up and wants a direct reply.",
          parseAsJson: false,
        },
      },
      {
        id: "gemma",
        type: NodeType.GEMMA,
        position: { x: 500, y: 150 },
        data: {
          variableName: "opsRoute",
          model: "gemma-3-27b-it",
          systemPrompt:
            "Reply with only chat or archive based on whether the message needs a human response.",
          userPrompt: "Message: {{opsMessage}}",
        },
      },
      {
        id: "router",
        type: NodeType.ROUTER,
        position: { x: 790, y: 150 },
        data: {
          variableName: "opsDecision",
          routeExpression: "{{opsRoute.text}}",
          routes: ["chat", "archive"],
          fallbackRoute: "archive",
        },
      },
      {
        id: "discord",
        type: NodeType.DISCORD,
        position: { x: 1080, y: 70 },
        data: {
          variableName: "opsDiscord",
          webhookUrl: "https://discord.com/api/webhooks/replace-me",
          username: "Otogent Ops",
          content: "Route: chat\n{{opsMessage}}",
        },
      },
      {
        id: "logger",
        type: NodeType.LOGGER,
        position: { x: 1080, y: 250 },
        data: {
          level: "info",
          variableName: "archiveLog",
          message: "Archived ops note: {{opsMessage}}",
        },
      },
    ],
    edges: [
      { source: "manual", target: "set" },
      { source: "set", target: "gemma" },
      { source: "gemma", target: "router" },
      { source: "router", target: "discord", sourceHandle: "chat" },
      { source: "router", target: "logger", sourceHandle: "archive" },
    ],
  },
  {
    id: "huggingface-support-draft",
    name: "Hugging Face Support Draft",
    description:
      "Creates a support reply draft with an open-source model and saves it to the log.",
    category: "Support",
    tags: ["huggingface", "support", "open-source", "draft"],
    requiredCredentials: [CredentialType.HUGGINGFACE],
    nodes: [
      {
        id: "manual",
        type: NodeType.MANUAL_TRIGGER,
        position: { x: 0, y: 120 },
      },
      {
        id: "set",
        type: NodeType.SET_VARIABLE,
        position: { x: 250, y: 120 },
        data: {
          variableName: "ticketText",
          valueTemplate:
            "A customer cannot access their dashboard after upgrading and wants a calm, helpful reply.",
          parseAsJson: false,
        },
      },
      {
        id: "huggingface",
        type: NodeType.HUGGINGFACE,
        position: { x: 530, y: 120 },
        data: {
          variableName: "supportDraft",
          model: "google/gemma-3-27b-it",
          systemPrompt:
            "You write short, clear, empathetic support replies for SaaS teams.",
          userPrompt:
            "Write a helpful reply for this customer message:\n{{ticketText}}",
        },
      },
      {
        id: "logger",
        type: NodeType.LOGGER,
        position: { x: 840, y: 120 },
        data: {
          level: "info",
          variableName: "supportDraftLog",
          message: "Hugging Face draft reply:\n{{supportDraft.text}}",
        },
      },
    ],
    edges: [
      { source: "manual", target: "set" },
      { source: "set", target: "huggingface" },
      { source: "huggingface", target: "logger" },
    ],
  },
];

export const getWorkflowTemplateById = (templateId: string) =>
  workflowTemplates.find((template) => template.id === templateId);

export const getFilteredTemplates = (
  plan: "FREE" | "PRO" | "CUSTOM" = "FREE",
) => {
  if (plan === "PRO" || plan === "CUSTOM") {
    return workflowTemplates;
  }

  // FREE plan only gets non-premium templates
  return workflowTemplates.filter((template) => !template.isPremium);
};
