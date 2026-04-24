import crypto from "node:crypto";

const WEBHOOK_SECRET_BYTES = 32;
const WEBHOOK_SECRET_HEADER = "x-otogent-webhook-secret";

export const createWebhookSecret = () =>
  crypto.randomBytes(WEBHOOK_SECRET_BYTES).toString("hex");

export const getWebhookSecretHeaderName = () => WEBHOOK_SECRET_HEADER;

export const hashWebhookSecret = (secret: string) =>
  crypto.createHash("sha256").update(secret).digest("hex");

export const verifyWebhookSecret = (
  expectedSecretHash: string | null | undefined,
  receivedSecret: string | null,
) => {
  if (!expectedSecretHash || !receivedSecret) {
    return false;
  }

  const receivedSecretHash = hashWebhookSecret(receivedSecret);
  const expected = Buffer.from(expectedSecretHash, "utf8");
  const received = Buffer.from(receivedSecretHash, "utf8");

  if (!receivedSecret) {
    return false;
  }

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
};
