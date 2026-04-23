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
  perplexity: "/logos/Perplexity.svg",
  shopify: "/logos/shopify.svg",
  slack: "/logos/slack.svg",
  skype: "/logos/skype.svg",
  stripe: "/logos/stripe.svg",
  supabase: "/logos/supabase.svg",
  telegram: "/logos/telegram.svg",
  twilio: "/logos/twilio.svg",
  twitter: "/logos/Twitter.svg",
  wikipedia: "/logos/wikipedia.svg",
  x: "/logos/Twitter.svg",
};

const normalizeLogoKey = (value?: string | null) =>
  (value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getIntegrationLogo = ({
  slug,
  name,
  logo,
}: {
  slug?: string | null;
  name?: string | null;
  logo?: string | null;
}) => {
  if (logo) {
    return logo;
  }

  const slugKey = normalizeLogoKey(slug);
  const nameKey = normalizeLogoKey(name);

  return (
    localIntegrationLogos[slugKey] ||
    localIntegrationLogos[nameKey] ||
    DEFAULT_INTEGRATION_LOGO
  );
};
