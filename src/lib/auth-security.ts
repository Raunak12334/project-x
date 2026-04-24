import crypto from "node:crypto";
import { decrypt, encrypt } from "@/lib/encryption";

export const hashAuthToken = (value: string) =>
  crypto.createHash("sha256").update(value).digest("hex");

export const encryptAuthValue = (value: string) => encrypt(value);

export const decryptAuthValue = (value: string) => decrypt(value);

export const decryptAuthValueIfNeeded = (value: string) => {
  try {
    return decrypt(value);
  } catch {
    return value;
  }
};
