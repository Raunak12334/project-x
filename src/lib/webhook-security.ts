import crypto from "node:crypto";

const WEBHOOK_SECRET_BYTES = 32;

export const createWebhookSecret = () =>
  crypto.randomBytes(WEBHOOK_SECRET_BYTES).toString("hex");

export const verifyWebhookSecret = (
  expectedSecret: string,
  receivedSecret: string | null,
) => {
  if (!receivedSecret) {
    return false;
  }

  const expected = Buffer.from(expectedSecret, "utf8");
  const received = Buffer.from(receivedSecret, "utf8");

  if (expected.length !== received.length) {
    return false;
  }

  return crypto.timingSafeEqual(expected, received);
};
