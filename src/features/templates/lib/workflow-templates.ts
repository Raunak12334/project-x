import { CredentialType, NodeType } from "@prisma/client";

export type WorkflowTemplateDefinition = {
  id: string;
  name: string;
  description: string;
  category: string;
  tags: string[];
  isPremium?: boolean;
  requiredCredentials: CredentialType[];
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  useCase?: string;
  benefits?: string[];
  steps?: string[];
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
    id: "real-estate-multi-agent-qualifier",
    name: "Real Estate Multi-Agent Qualifier",
    slug: "real-estate-multi-agent-lead-qualification-automation",
    description: "Orchestrates multiple agents to qualify Zillow/Trulia leads and alert agents on high-intent buyers.",
    useCase: "Perfect for real estate teams managing high volumes of inbound leads. Automate the first contact and lead grading process.",
    benefits: [
      "Instantly qualify leads 24/7",
      "Prioritize high-budget buyers",
      "Reduce response time to seconds",
      "Seamless Slack/Discord alerts"
    ],
    steps: [
      "Receive lead data via Webhook from Zillow/Trulia",
      "AI Assistant analyzes budget, timeline, and intent",
      "Lead is scored (1-10) based on conversion probability",
      "Instant notification sent to the agent's mobile"
    ],
    category: "Real Estate",
    tags: ["real-estate", "lead-gen", "qualification"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      { id: "trigger", type: NodeType.WEBHOOK_TRIGGER, position: { x: 0, y: 150 } },
      { id: "ai", type: NodeType.OPENAI, position: { x: 250, y: 150 }, data: { 
        variableName: "qualification", 
        systemPrompt: "You are a Real Estate Assistant. Analyze the lead's budget and timeline. Score intent 1-10.",
        userPrompt: "Lead Data: {{json webhook}}" 
      }},
      { id: "slack", type: NodeType.SLACK, position: { x: 500, y: 150 }, data: { 
        variableName: "notif",
        content: "🏠 New Qualified Lead (Score: {{qualification.text}})\nDetails: {{json webhook}}"
      }}
    ],
    edges: [
      { source: "trigger", target: "ai" },
      { source: "ai", target: "slack" }
    ]
  },
  {
    id: "healthcare-multi-agent-reminder",
    name: "Healthcare Multi-Agent Reminder",
    slug: "healthcare-multi-agent-patient-reminder",
    description: "Orchestrates multiple agents to summarize patient notes and send personalized reminders.",
    useCase: "Clinics and private practices looking to reduce no-show rates with personalized, intelligent communication.",
    benefits: [
      "Reduce no-show rates significantly",
      "Personalized instructions for every patient",
      "HIPAA-compliant data handling",
      "Automated summary of doctor notes"
    ],
    steps: [
      "Fetch patient appointment data via API",
      "AI summarizes specific preparation instructions",
      "Personalized reminder is drafted and validated",
      "Notification sent via patient's preferred channel"
    ],
    category: "Healthcare",
    tags: ["healthcare", "patient-care", "reminders"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      { id: "trigger", type: NodeType.HTTP_REQUEST, position: { x: 0, y: 150 } },
      { id: "summarizer", type: NodeType.OPENAI, position: { x: 250, y: 150 }, data: { 
        variableName: "summary", 
        systemPrompt: "Summarize appointment prep instructions for the patient.",
        userPrompt: "Patient Notes: {{json httpRequest}}" 
      }},
      { id: "slack", type: NodeType.SLACK, position: { x: 500, y: 150 }, data: { 
        variableName: "notif",
        content: "🏥 Reminder Sent to Patient.\nPrep Summary: {{summary.text}}"
      }}
    ],
    edges: [
      { source: "trigger", target: "summarizer" },
      { source: "summarizer", target: "slack" }
    ]
  },
  {
    id: "ecommerce-multi-agent-monitor",
    name: "E-commerce Multi-Agent Monitor",
    slug: "ecommerce-multi-agent-customer-review-monitor",
    description: "Orchestrates multiple agents to analyze customer reviews for sentiment and alert teams.",
    useCase: "Brand managers who need to react instantly to negative social proof before it impacts sales.",
    benefits: [
      "Protect brand reputation in real-time",
      "Instant alerts for negative feedback",
      "AI-driven root cause analysis",
      "Seamless integration with support tools"
    ],
    steps: [
      "Monitor reviews from Shopify, Amazon, or Google",
      "AI analyzes sentiment and identifies complaints",
      "Logic branch determines if immediate action is needed",
      "Alert sent to customer support for rapid response"
    ],
    category: "E-commerce",
    tags: ["ecommerce", "sentiment", "customer-support"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      { id: "trigger", type: NodeType.WEBHOOK_TRIGGER, position: { x: 0, y: 150 } },
      { id: "sentiment", type: NodeType.OPENAI, position: { x: 250, y: 150 }, data: { 
        variableName: "sentimentResult", 
        systemPrompt: "Analyze the sentiment of this review. If negative, explain why.",
        userPrompt: "Review: {{json webhook}}" 
      }},
      { id: "router", type: NodeType.CONDITION, position: { x: 500, y: 150 }, data: {
        variableName: "isNegative",
        expression: "{{sentimentResult.text}}",
        trueRoute: "alert",
        falseRoute: "ignore"
      }},
      { id: "slack", type: NodeType.SLACK, position: { x: 750, y: 50 }, data: { 
        variableName: "alert",
        content: "🚨 Negative Review Detected!\nReason: {{sentimentResult.text}}"
      }}
    ],
    edges: [
      { source: "trigger", target: "sentiment" },
      { source: "sentiment", target: "router" },
      { source: "router", target: "slack", sourceHandle: "alert" }
    ]
  },
  {
    id: "finance-multi-agent-auditor",
    name: "Finance Multi-Agent Auditor",
    slug: "finance-multi-agent-expense-audit-automation",
    description: "Orchestrates multiple agents to audit receipt data and flag non-compliant expenses.",
    category: "Finance",
    tags: ["finance", "audit", "expenses"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      { id: "trigger", type: NodeType.GOOGLE_FORM_TRIGGER, position: { x: 0, y: 150 } },
      { id: "audit", type: NodeType.OPENAI, position: { x: 250, y: 150 }, data: { 
        variableName: "auditLog", 
        systemPrompt: "Audit this expense against company policy: Max $100 for meals, no alcohol. Flag any issues.",
        userPrompt: "Expense Data: {{json googleForm}}" 
      }},
      { id: "approval", type: NodeType.HUMAN_APPROVAL, position: { x: 500, y: 150 }, data: {
        variableName: "managerReview",
        message: "Expense Audit Result: {{auditLog.text}}\nDo you approve this expense?"
      }}
    ],
    edges: [
      { source: "trigger", target: "audit" },
      { source: "audit", target: "approval" }
    ]
  },
  {
    id: "marketing-multi-agent-multiplier",
    name: "Marketing Multi-Agent Multiplier",
    slug: "marketing-multi-agent-content-multiplier-automation",
    description: "Orchestrates multiple agents to generate a Blog Post, Twitter Thread, and LinkedIn update.",
    category: "Marketing",
    tags: ["marketing", "content", "social-media"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      { id: "trigger", type: NodeType.MANUAL_TRIGGER, position: { x: 0, y: 200 } },
      { id: "blog", type: NodeType.OPENAI, position: { x: 250, y: 50 }, data: { 
        variableName: "blogPost", 
        systemPrompt: "Write a 500-word blog post about the topic.",
        userPrompt: "Topic: {{json manual}}" 
      }},
      { id: "twitter", type: NodeType.OPENAI, position: { x: 250, y: 200 }, data: { 
        variableName: "tweets", 
        systemPrompt: "Write a 5-tweet thread about the topic.",
        userPrompt: "Topic: {{json manual}}" 
      }},
      { id: "linkedin", type: NodeType.OPENAI, position: { x: 250, y: 350 }, data: { 
        variableName: "linkedInPost", 
        systemPrompt: "Write a professional LinkedIn post about the topic.",
        userPrompt: "Topic: {{json manual}}" 
      }}
    ],
    edges: [
      { source: "trigger", target: "blog" },
      { source: "trigger", target: "twitter" },
      { source: "trigger", target: "linkedin" }
    ]
  },
  {
    id: "education-multi-agent-feedback",
    name: "Education Multi-Agent Feedback Bot",
    slug: "education-multi-agent-student-feedback-automation",
    description: "Orchestrates multiple agents to analyze submissions and provide personalized grading feedback.",
    category: "Education",
    tags: ["education", "grading", "feedback"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      { id: "trigger", type: NodeType.WEBHOOK_TRIGGER, position: { x: 0, y: 150 } },
      { id: "grader", type: NodeType.OPENAI, position: { x: 250, y: 150 }, data: { 
        variableName: "feedback", 
        systemPrompt: "Grade this student submission based on rubrics. Provide 3 tips for improvement.",
        userPrompt: "Submission: {{json webhook}}" 
      }},
      { id: "slack", type: NodeType.SLACK, position: { x: 500, y: 150 }, data: { 
        variableName: "log",
        content: "🎓 Grade Drafted for Student.\nFeedback: {{feedback.text}}"
      }}
    ],
    edges: [
      { source: "trigger", target: "grader" },
      { source: "trigger", target: "slack" }
    ]
  },
  {
    id: "legal-multi-agent-summarizer",
    name: "Legal Multi-Agent Summarizer",
    slug: "legal-multi-agent-contract-clause-summarizer",
    description: "Orchestrates multiple agents to identify key risks and summarize termination clauses in legal documents.",
    category: "Legal",
    tags: ["legal", "contract", "risk-management"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      { id: "trigger", type: NodeType.HTTP_REQUEST, position: { x: 0, y: 150 } },
      { id: "risk-scanner", type: NodeType.OPENAI, position: { x: 250, y: 150 }, data: { 
        variableName: "riskSummary", 
        systemPrompt: "Extract termination clauses and identify any high-risk liability terms.",
        userPrompt: "Contract Text: {{json httpRequest}}" 
      }},
      { id: "logger", type: NodeType.LOGGER, position: { x: 500, y: 150 }, data: { 
        variableName: "log",
        message: "Legal Risk Summary: {{riskSummary.text}}"
      }}
    ],
    edges: [
      { source: "trigger", target: "risk-scanner" },
      { source: "risk-scanner", target: "logger" }
    ]
  },
  {
    id: "hr-multi-agent-screener",
    name: "HR Multi-Agent Resume Screener",
    slug: "hr-multi-agent-candidate-resume-screener",
    description: "Uses a multi-agent workflow to screen candidates against a Job Description and rank them by fit.",
    category: "Human Resources",
    tags: ["hr", "recruiting", "hiring"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      { id: "trigger", type: NodeType.GOOGLE_FORM_TRIGGER, position: { x: 0, y: 150 } },
      { id: "screener", type: NodeType.OPENAI, position: { x: 250, y: 150 }, data: { 
        variableName: "fitScore", 
        systemPrompt: "Compare this resume against the JD. Score fit 1-100 and justify.",
        userPrompt: "Applicant: {{json googleForm}}" 
      }},
      { id: "slack", type: NodeType.SLACK, position: { x: 500, y: 150 }, data: { 
        variableName: "hiringAlert",
        content: "👥 New Candidate Screened!\nScore: {{fitScore.text}}"
      }}
    ],
    edges: [
      { source: "trigger", target: "screener" },
      { source: "screener", target: "slack" }
    ]
  },
  {
    id: "saas-multi-agent-prioritizer",
    name: "SaaS Multi-Agent Roadmap Prioritizer",
    slug: "saas-multi-agent-product-feature-prioritization",
    description: "Orchestrates multiple agents to analyze feature requests and prioritize roadmaps.",
    category: "Tech/SaaS",
    tags: ["saas", "product", "roadmap"],
    requiredCredentials: [CredentialType.OPENAI],
    nodes: [
      { id: "trigger", type: NodeType.WEBHOOK_TRIGGER, position: { x: 0, y: 150 } },
      { id: "prioritizer", type: NodeType.OPENAI, position: { x: 250, y: 150 }, data: { 
        variableName: "priority", 
        systemPrompt: "Estimate Effort (1-5) and Impact (1-5) for this feature request. Suggest roadmap quarter.",
        userPrompt: "Feature Request: {{json webhook}}" 
      }},
      { id: "logger", type: NodeType.LOGGER, position: { x: 500, y: 150 }, data: { 
        variableName: "roadmapLog",
        message: "New Feature Priority: {{priority.text}}"
      }}
    ],
    edges: [
      { source: "trigger", target: "prioritizer" },
      { source: "prioritizer", target: "logger" }
    ]
  }
];

export const getWorkflowTemplateById = (templateId: string) =>
  workflowTemplates.find((template) => template.id === templateId);

export const getWorkflowTemplateBySlug = (slug: string) =>
  workflowTemplates.find((template) => template.slug === slug);

export const getFilteredTemplates = (
  plan: "FREE" | "PRO" | "CUSTOM" = "FREE",
) => {
  if (plan === "PRO" || plan === "CUSTOM") {
    return workflowTemplates;
  }

  // FREE plan only gets non-premium templates
  return workflowTemplates.filter((template) => !template.isPremium);
};
