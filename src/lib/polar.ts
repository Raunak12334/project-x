import { Polar } from "@polar-sh/sdk";
import { requireEnv } from "@/lib/env";

const polarServer =
  process.env.POLAR_SERVER === "production" ? "production" : "sandbox";

export const polarClient = new Polar({
  accessToken: requireEnv("POLAR_ACCESS_TOKEN"),
  server: polarServer,
});
