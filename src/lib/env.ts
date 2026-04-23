const isProduction = process.env.NODE_ENV === "production";

export function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is required`);
  }

  return value;
}

export function getAppUrl() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.BETTER_AUTH_URL;

  if (!appUrl) {
    if (!isProduction) {
      return "http://localhost:3000";
    }

    throw new Error(
      "NEXT_PUBLIC_APP_URL or BETTER_AUTH_URL environment variable is required",
    );
  }

  return appUrl;
}

export function getPolarSuccessBaseUrl() {
  return process.env.POLAR_SUCCESS_URL || getAppUrl();
}

export function getComposioApiKey() {
  return requireEnv("COMPOSIO_API_KEY");
}

export function getComposioCallbackUrl(toolkitSlug?: string, state?: string) {
  const appUrl = getAppUrl();
  const url = new URL("/api/integrations/composio/callback", appUrl);

  if (toolkitSlug) {
    url.searchParams.set("toolkit_slug", toolkitSlug);
  }

  if (state) {
    url.searchParams.set("state", state);
  }

  return url.toString();
}

export function getProductionEnvReport() {
  const required = [
    "DATABASE_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "ENCRYPTION_KEY",
    "NEXT_PUBLIC_APP_URL",
    "POLAR_ACCESS_TOKEN",
    "POLAR_WEBHOOK_SECRET",
    "POLAR_PRO_PRODUCT_ID",
    "POLAR_SERVER",
    "RESEND_API_KEY",
    "RESEND_FROM_EMAIL",
    "COMPOSIO_API_KEY",
  ];

  return required.map((name) => ({
    name,
    configured: Boolean(process.env[name]),
  }));
}
