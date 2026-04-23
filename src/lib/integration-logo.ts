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
  adobe: "adobe",
  apollo: "apollo",
  asana: "asana",
  amazonaws: "amazonaws",
  aws: "amazonaws",
  basecamp: "basecamp",
  bamboohr: "bamboohr",
  bitbucket: "bitbucket",
  buffer: "buffer",
  canva: "canva",
  clickup: "clickup",
  cohere: "cohere",
  datadog: "datadog",
  digitalocean: "digitalocean",
  exa: "exa",
  figma: "figma",
  firecrawl: "firecrawl",
  framer: "framer",
  gitlab: "gitlab",
  gong: "gong",
  "google-analytics": "googleanalytics",
  googleanalytics: "googleanalytics",
  "google-doc": "googledocs",
  googledoc: "googledocs",
  "google-docs": "googledocs",
  googledocs: "googledocs",
  "google-mail": "gmail",
  googlemail: "gmail",
  grafana: "grafana",
  gumroad: "gumroad",
  intercom: "intercom",
  jira: "jira",
  klaviyo: "klaviyo",
  "lemon-squeezy": "lemonsqueezy",
  lemonsqueezy: "lemonsqueezy",
  mailchimp: "mailchimp",
  mixpanel: "mixpanel",
  "microsoft-outlook": "microsoftoutlook",
  microsoftoutlook: "microsoftoutlook",
  "microsoft-teams": "microsoftteams",
  microsoftteams: "microsoftteams",
  "monday-com": "mondaydotcom",
  monday: "mondaydotcom",
  mondaydotcom: "mondaydotcom",
  moodle: "moodle",
  paypal: "paypal",
  pinecone: "pinecone",
  pipedrive: "pipedrive",
  posthog: "posthog",
  "quick-books": "quickbooks",
  quickbooks: "quickbooks",
  reddit: "reddit",
  "sales-force": "salesforce",
  salesforce: "salesforce",
  sentry: "sentry",
  tableau: "tableau",
  tavily: "tavily",
  "todo-ist": "todoist",
  todoist: "todoist",
  trello: "trello",
  vercel: "vercel",
  webflow: "webflow",
  whatsapp: "whatsapp",
  "woo-commerce": "woocommerce",
  woocommerce: "woocommerce",
  xero: "xero",
  youtube: "youtube",
  zendesk: "zendesk",
  zoho: "zoho",
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

const unique = (values: string[]) =>
  values.filter(
    (value, index, array) => value && array.indexOf(value) === index,
  );

const getLogoDomains = (slugKey: string, nameKey: string) =>
  unique([
    slugKey ? `${slugKey}.com` : "",
    nameKey ? `${nameKey}.com` : "",
    slugKey ? `${slugKey.replace(/-/g, "")}.com` : "",
    nameKey ? `${nameKey.replace(/-/g, "")}.com` : "",
  ]);

export const getIntegrationLogoCandidates = ({
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
  const simpleIconKey =
    simpleIconAliases[slugKey] || simpleIconAliases[nameKey] || slugKey;
  const compactSlugKey = slugKey.replace(/-/g, "");
  const compactNameKey = nameKey.replace(/-/g, "");
  const domains = getLogoDomains(slugKey, nameKey);

  return unique([
    localLogo,
    logo && !isGenericComposioLogo(slugKey, logo) ? logo : "",
    simpleIconKey ? `https://cdn.simpleicons.org/${simpleIconKey}` : "",
    compactSlugKey ? `https://cdn.simpleicons.org/${compactSlugKey}` : "",
    compactNameKey ? `https://cdn.simpleicons.org/${compactNameKey}` : "",
    ...domains.map(
      (domain) => `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
    ),
    ...domains.map(
      (domain) => `https://icons.duckduckgo.com/ip3/${domain}.ico`,
    ),
    DEFAULT_INTEGRATION_LOGO,
  ]);
};

export const getIntegrationLogo = (input: {
  slug?: string | null;
  name?: string | null;
  logo?: string | null;
}) => getIntegrationLogoCandidates(input)[0] || DEFAULT_INTEGRATION_LOGO;
