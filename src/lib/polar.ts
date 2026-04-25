import { Polar } from "@polar-sh/sdk";
import { requireEnv } from "@/lib/env";

let _polarClient: Polar | null = null;

export function getPolarClient() {
  if (!_polarClient) {
    const polarServer =
      process.env.POLAR_SERVER === "production" ? "production" : "sandbox";

    _polarClient = new Polar({
      accessToken: requireEnv("POLAR_ACCESS_TOKEN"),
      server: polarServer,
    });
  }
  return _polarClient;
}
