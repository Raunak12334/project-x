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
    id: "real-estate-ai-qualifier",
    name: "Real Estate Lead Qualifier",
    description: "Qualifies inbound Zillow/Trulia leads using AI and alerts agents on high-intent buyers.",
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
    id: "healthcare-appointment-reminder",
    name: "Healthcare Patient Reminder",
    description: "Summarizes patient notes and sends a personalized appointment reminder via SMS/Email.",
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
    id: "ecommerce-sentiment-alert",
    name: "E-commerce Review Monitor",
    description: "Analyzes customer reviews for sentiment and alerts the support team on negative feedback.",
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
    id: "finance-expense-auditor",
    name: "Finance Expense Auditor",
    description: "Audits receipt data using AI to flag unusual spending or non-compliant expenses.",
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
    id: "marketing-content-multiplier",
    name: "Marketing Content Multiplier",
    description: "Generates a Blog Post, Twitter Thread, and LinkedIn Update from a single topic.",
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
    id: "education-feedback-bot",
    name: "Education Feedback Bot",
    description: "Analyzes student submissions and provides personalized feedback and grading suggestions.",
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
    id: "legal-contract-summarizer",
    name: "Legal Contract Summarizer",
    description: "Identifies key risks and summarizes termination clauses in legal documents.",
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
    id: "hr-resume-screener",
    name: "HR AI Resume Screener",
    description: "Screens candidates against a Job Description and ranks them by cultural and technical fit.",
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
    id: "saas-roadmap-prioritizer",
    name: "SaaS Roadmap Prioritizer",
    description: "Analyzes customer feature requests and prioritizes them based on effort vs impact.",
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

export const getFilteredTemplates = (
  plan: "FREE" | "PRO" | "CUSTOM" = "FREE",
) => {
  if (plan === "PRO" || plan === "CUSTOM") {
    return workflowTemplates;
  }

  // FREE plan only gets non-premium templates
  return workflowTemplates.filter((template) => !template.isPremium);
};
