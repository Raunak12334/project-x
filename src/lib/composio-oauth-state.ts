import crypto from "node:crypto";
import { requireEnv } from "@/lib/env";

type ComposioOAuthStatePayload = {
  organizationId: string;
  toolkitSlug: string;
  expiresAt: number;
  nonce: string;
};

const STATE_TTL_MS = 10 * 60 * 1000;

const getStateSecret = () => requireEnv("BETTER_AUTH_SECRET");

const sign = (payload: string) =>
  crypto
    .createHmac("sha256", getStateSecret())
    .update(payload)
    .digest("base64url");

export function createComposioOAuthState(input: {
  organizationId: string;
  toolkitSlug: string;
}) {
  const payload: ComposioOAuthStatePayload = {
    organizationId: input.organizationId,
    toolkitSlug: input.toolkitSlug,
    expiresAt: Date.now() + STATE_TTL_MS,
    nonce: crypto.randomBytes(16).toString("hex"),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyComposioOAuthState(
  state: string | null,
): ComposioOAuthStatePayload | null {
  if (!state) {
    return null;
  }

  const [encodedPayload, signature] = state.split(".");
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = sign(encodedPayload);
  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf8"),
    ) as ComposioOAuthStatePayload;

    if (
      !payload.organizationId ||
      !payload.toolkitSlug ||
      payload.expiresAt < Date.now()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
