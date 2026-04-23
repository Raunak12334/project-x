export const DEFAULT_INTEGRATION_LOGO = "/logos/composio.svg";

const localIntegrationLogos: Record<string, string> = {
  airtable: "/logos/airtable.svg",
  discord: "/logos/discord.svg",
  dropbox: "/logos/dropbox.svg",
  facebook: "/logos/facebook.svg",
  gemini: "/logos/gemini.svg",
  gemma: "/logos/gemma.svg",
  github: "/logos/github.svg",
  gmail: "/logos/Gmail.svg",
  google: "/logos/google.svg",
  "google-calendar": "/logos/google calendar.svg",
  googlecalendar: "/logos/google calendar.svg",
  "google-drive": "/logos/Google_Drive.svg",
  googledrive: "/logos/Google_Drive.svg",
  "google-form": "/logos/googleform.svg",
  googleform: "/logos/googleform.svg",
  "google-forms": "/logos/googleform.svg",
  googleforms: "/logos/googleform.svg",
  "google-sheet": "/logos/google Sheet.svg",
  googlesheet: "/logos/google Sheet.svg",
  "google-sheets": "/logos/google Sheet.svg",
  googlesheets: "/logos/google Sheet.svg",
  hubspot: "/logos/hubspot.svg",
  huggingface: "/logos/huggingface.svg",
  instagram: "/logos/instagram.svg",
  linear: "/logos/linear.svg",
  linkedin: "/logos/linkedin.svg",
  notion: "/logos/notion.svg",
  openai: "/logos/openai.svg",
  outlook: "/logos/outlook.svg",
  "perplexity-ai": "/logos/Perplexity.svg",
  perplexity: "/logos/Perplexity.svg",
  "code-interpreter": "/logos/openai.svg",
  shopify: "/logos/shopify.svg",
  slack: "/logos/slack.svg",
  skype: "/logos/skype.svg",
  serpapi: "https://cdn.simpleicons.org/google/4285F4",
  stripe: "/logos/stripe.svg",
  supabase: "/logos/supabase.svg",
  telegram: "/logos/telegram.svg",
  twilio: "/logos/twilio.svg",
  twitter: "/logos/Twitter.svg",
  wikipedia: "/logos/wikipedia.svg",
  x: "/logos/Twitter.svg",
};

const simpleIconAliases: Record<string, string> = {
  amazonaws: "amazonaws",
  aws: "amazonaws",
  "google-analytics": "googleanalytics",
  googleanalytics: "googleanalytics",
  "google-doc": "googledocs",
  googledoc: "googledocs",
  "google-docs": "googledocs",
  googledocs: "googledocs",
  "google-mail": "gmail",
  googlemail: "gmail",
  jira: "jira",
  "lemon-squeezy": "lemonsqueezy",
  lemonsqueezy: "lemonsqueezy",
  "microsoft-outlook": "microsoftoutlook",
  microsoftoutlook: "microsoftoutlook",
  "microsoft-teams": "microsoftteams",
  microsoftteams: "microsoftteams",
  "monday-com": "mondaydotcom",
  monday: "mondaydotcom",
  mondaydotcom: "mondaydotcom",
  "quick-books": "quickbooks",
  quickbooks: "quickbooks",
  "sales-force": "salesforce",
  salesforce: "salesforce",
  "todo-ist": "todoist",
  todoist: "todoist",
  whatsapp: "whatsapp",
  "woo-commerce": "woocommerce",
  woocommerce: "woocommerce",
  xero: "xero",
  zendesk: "zendesk",
  zoom: "zoom",
};

const normalizeLogoKey = (value?: string | null) =>
  (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const isGenericComposioLogo = (slugKey: string, logo?: string | null) =>
  slugKey !== "composio" && Boolean(logo?.toLowerCase().includes("composio"));

export const getIntegrationLogo = ({
  slug,
  name,
  logo,
}: {
  slug?: string | null;
  name?: string | null;
  logo?: string | null;
}) => {
  const slugKey = normalizeLogoKey(slug);
  const nameKey = normalizeLogoKey(name);
  const localLogo =
    localIntegrationLogos[slugKey] || localIntegrationLogos[nameKey];

  if (localLogo) {
    return localLogo;
  }

  if (logo && !isGenericComposioLogo(slugKey, logo)) {
    return logo;
  }

  const simpleIconKey =
    simpleIconAliases[slugKey] || simpleIconAliases[nameKey] || slugKey;

  return (
    (simpleIconKey
      ? `https://cdn.simpleicons.org/${simpleIconKey}/111827`
      : "") || DEFAULT_INTEGRATION_LOGO
  );
};
