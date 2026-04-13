# Detailed Workflow Example: Google Form → Gemini → Discord

## Workflow Overview
**Name:** `witty-hot-ad`  
**Purpose:** Collect customer inquiries via Google Form, use AI to analyze and respond, then notify a Discord channel

---

## Node Configuration

### 1. **Google Form Trigger Node**
**Node Type:** `GOOGLE_FORM_TRIGGER`  
**ID:** `node_1`

#### Configuration:
```json
{
  "name": "Google Form",
  "type": "GOOGLE_FORM_TRIGGER",
  "position": { "x": 200, "y": 300 },
  "data": {
    "formId": "1FAIpQLSf3x5K8n9p2L4m6Q7R9S1T3U5V7W9X1Y3Z5"
  },
  "credentials": {
    "googleAuth": "cred_google_oauth_123"
  }
}
```

#### Input Fields:
- **formId** (required): `1FAIpQLSf3x5K8n9p2L4m6Q7R9S1T3U5V7W9X1Y3Z5`
- **googleAuth** (required): OAuth2 Google Account credential

#### Output Structure:
```json
{
  "answers": [
    {
      "questionId": "q1",
      "question": "What is your name?",
      "answer": "John Smith"
    },
    {
      "questionId": "q2",
      "question": "What is your company?",
      "answer": "Acme Corp"
    },
    {
      "questionId": "q3",
      "question": "What is your problem?",
      "answer": "We need help automating our lead follow-up process"
    }
  ],
  "respondentEmail": "john@acme.com",
  "timestamp": "2026-04-13T14:30:00Z"
}
```

---

### 2. **Gemini AI Node**
**Node Type:** `GEMINI_CALL`  
**ID:** `node_2`

#### Configuration:
```json
{
  "name": "Gemini",
  "type": "GEMINI_CALL",
  "position": { "x": 550, "y": 300 },
  "data": {
    "prompt": "You are a helpful customer support specialist. Analyze the following customer inquiry and provide:\n1. A summary of their problem\n2. Priority level (LOW, MEDIUM, HIGH, CRITICAL)\n3. A professional response template\n4. Suggested next steps\n\nCustomer Name: {{node_1.answers[0].answer}}\nCompany: {{node_1.answers[1].answer}}\nProblem: {{node_1.answers[2].answer}}\nEmail: {{node_1.respondentEmail}}\n\nProvide the response as JSON with keys: summary, priority, response, nextSteps",
    "model": "gemini-2.0-flash",
    "temperature": 0.7,
    "maxTokens": 1000
  },
  "credentials": {
    "geminiApiKey": "cred_gemini_api_456"
  }
}
```

#### Input Fields:
- **prompt** (required): The prompt with dynamic references to Google Form data
- **model** (required): `gemini-2.0-flash`
- **temperature** (optional): `0.7` (controls creativity)
- **maxTokens** (optional): `1000`
- **geminiApiKey** (credential): API key for authentication

#### Input Data Flow Example:
```json
{
  "prompt": "You are a helpful customer support specialist. Analyze the following customer inquiry and provide:\n1. A summary...\n\nCustomer Name: John Smith\nCompany: Acme Corp\nProblem: We need help automating our lead follow-up process\nEmail: john@acme.com\n\nProvide the response as JSON..."
}
```

#### Output Structure:
```json
{
  "responseText": "{\"summary\": \"Customer wants automation for lead follow-up\", \"priority\": \"HIGH\", \"response\": \"Thank you for reaching out to us...\", \"nextSteps\": [\"Schedule demo\", \"Send proposal\"]}",
  "usage": {
    "inputTokens": 256,
    "outputTokens": 342
  },
  "model": "gemini-2.0-flash"
}
```

---

### 3. **Discord Send Node**
**Node Type:** `DISCORD_SEND`  
**ID:** `node_3`

#### Configuration:
```json
{
  "name": "Discord",
  "type": "DISCORD_SEND",
  "position": { "x": 900, "y": 300 },
  "data": {
    "channelId": "1234567890123456789",
    "messageFormat": "embed",
    "embedTitle": "🔔 New Lead: {{node_1.answers[0].answer}}",
    "embedDescription": "**Company:** {{node_1.answers[1].answer}}\n**Email:** {{node_1.respondentEmail}}\n\n**Problem:** {{node_1.answers[2].answer}}",
    "embedFields": [
      {
        "name": "📊 AI Analysis",
        "value": "```json\n{{node_2.responseText}}\n```",
        "inline": false
      },
      {
        "name": "🎯 Priority",
        "value": "{{JSON.parse(node_2.responseText).priority}}",
        "inline": true
      }
    ],
    "embedColor": "#5865F2"
  },
  "credentials": {
    "discordBot": "cred_discord_bot_789"
  }
}
```

#### Input Fields:
- **channelId** (required): `1234567890123456789`
- **messageFormat** (required): `"embed"`
- **embedTitle**: Uses dynamic data from Google Form
- **embedDescription**: Multi-line formatted with line breaks
- **embedFields**: Array of additional fields with AI response
- **discordBot** (credential): Discord bot token

#### Example Input Data:
```json
{
  "channelId": "1234567890123456789",
  "messageFormat": "embed",
  "embedTitle": "🔔 New Lead: John Smith",
  "embedDescription": "**Company:** Acme Corp\n**Email:** john@acme.com\n\n**Problem:** We need help automating our lead follow-up process",
  "embedFields": [
    {
      "name": "📊 AI Analysis",
      "value": "```json\n{\"summary\": \"Customer wants automation for lead follow-up\", \"priority\": \"HIGH\", \"response\": \"Thank you for reaching out...\"}\n```",
      "inline": false
    },
    {
      "name": "🎯 Priority",
      "value": "HIGH",
      "inline": true
    }
  ],
  "embedColor": "#5865F2"
}
```

#### Output Structure:
```json
{
  "messageId": "1234567890123456789",
  "channelId": "1234567890123456789",
  "success": true,
  "timestamp": "2026-04-13T14:30:45Z"
}
```

---

## Connections Between Nodes

### Connection 1: Google Form → Gemini
```json
{
  "id": "conn_1",
  "from": "node_1",
  "to": "node_2",
  "label": "Form Data"
}
```

**Data Passed:**
- Node 2's prompt can reference `node_1.answers`, `node_1.respondentEmail`, etc.

### Connection 2: Gemini → Discord
```json
{
  "id": "conn_2",
  "from": "node_2",
  "to": "node_3",
  "label": "AI Analysis"
}
```

**Data Passed:**
- Node 3 uses `node_2.responseText` in the Discord embed message

---

## Complete Workflow JSON

```json
{
  "workflow": {
    "id": "cmwnx1mgzn00ekv042431d1u",
    "name": "witty-hot-ad",
    "organizationId": "org_12345",
    "currentVersion": 1,
    "nodes": [
      {
        "id": "node_1",
        "name": "Google Form",
        "type": "GOOGLE_FORM_TRIGGER",
        "position": { "x": 200, "y": 300 },
        "data": {
          "formId": "1FAIpQLSf3x5K8n9p2L4m6Q7R9S1T3U5V7W9X1Y3Z5"
        },
        "credentialId": "cred_google_oauth_123"
      },
      {
        "id": "node_2",
        "name": "Gemini",
        "type": "GEMINI_CALL",
        "position": { "x": 550, "y": 300 },
        "data": {
          "prompt": "You are a helpful customer support specialist. Analyze the following customer inquiry and provide:\n1. A summary of their problem\n2. Priority level (LOW, MEDIUM, HIGH, CRITICAL)\n3. A professional response template\n4. Suggested next steps\n\nCustomer Name: {{node_1.answers[0].answer}}\nCompany: {{node_1.answers[1].answer}}\nProblem: {{node_1.answers[2].answer}}\nEmail: {{node_1.respondentEmail}}\n\nProvide the response as JSON with keys: summary, priority, response, nextSteps",
          "model": "gemini-2.0-flash",
          "temperature": 0.7,
          "maxTokens": 1000
        },
        "credentialId": "cred_gemini_api_456"
      },
      {
        "id": "node_3",
        "name": "Discord",
        "type": "DISCORD_SEND",
        "position": { "x": 900, "y": 300 },
        "data": {
          "channelId": "1234567890123456789",
          "messageFormat": "embed",
          "embedTitle": "🔔 New Lead: {{node_1.answers[0].answer}}",
          "embedDescription": "**Company:** {{node_1.answers[1].answer}}\n**Email:** {{node_1.respondentEmail}}\n\n**Problem:** {{node_1.answers[2].answer}}",
          "embedFields": [
            {
              "name": "📊 AI Analysis",
              "value": "```json\n{{node_2.responseText}}\n```",
              "inline": false
            },
            {
              "name": "🎯 Priority",
              "value": "{{JSON.parse(node_2.responseText).priority}}",
              "inline": true
            }
          ],
          "embedColor": "#5865F2"
        },
        "credentialId": "cred_discord_bot_789"
      }
    ],
    "connections": [
      {
        "id": "conn_1",
        "from": "node_1",
        "to": "node_2"
      },
      {
        "id": "conn_2",
        "from": "node_2",
        "to": "node_3"
      }
    ]
  }
}
```

---

## Execution Flow Example

### Step 1: Google Form Submission
User submits form with:
- Name: "John Smith"
- Company: "Acme Corp"
- Problem: "We need help automating our lead follow-up process"
- Email: "john@acme.com"

### Step 2: Gemini Processing
Gemini receives the form data and generates:
```json
{
  "summary": "Acme Corp (John Smith) needs automation for lead follow-up process",
  "priority": "HIGH",
  "response": "Thank you for reaching out! We'd love to help you streamline your lead follow-up. Our platform can automate responses and track engagement...",
  "nextSteps": ["Schedule a 30-min demo", "Share your current process", "Discuss pricing options"]
}
```

### Step 3: Discord Notification
Your team receives a rich embed in Discord with:
- Customer name as the title
- Company and email details
- AI-generated summary and priority
- Suggested response and next steps
- Color-coded by priority

---

## Key Features Demonstrated

✅ **Dynamic Data References:** Using `{{node_1.answers[0].answer}}` to pass data between nodes  
✅ **AI Processing:** Gemini analyzes customer data and generates insights  
✅ **JSON Parsing:** Using `{{JSON.parse()}}` to extract values from AI responses  
✅ **Rich Formatting:** Discord embeds with custom fields and formatting  
✅ **Credential Management:** Secure storage of Google OAuth, Gemini API, Discord bot tokens  
✅ **Conditional Routing:** Could add a Router node to split on priority level  

---

## Next Steps / Enhancements

- Add a **Router node** after Gemini to handle different priorities differently
- Add an **Email node** to also email the customer an acknowledgment
- Add a **Database node** to log all inquiries in PostgreSQL
- Add a **Delay node** before Discord to batch multiple submissions
- Add **Slack** notification as an alternative to Discord
