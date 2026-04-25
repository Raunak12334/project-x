import type { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import {
  decryptAuthValueIfNeeded,
  encryptAuthValue,
  hashAuthToken,
} from "@/lib/auth-security";
import prisma from "@/lib/db";
import { requireEnv } from "@/lib/env";

const createSecurePrismaAdapter = (client: PrismaClient) => {
  const baseAdapterFactory = prismaAdapter(client, {
    provider: "postgresql",
  });

  return (options: unknown) => {
    const baseAdapter = baseAdapterFactory(options as never) as Record<
      string,
      unknown
    >;

    return {
      ...baseAdapter,
      createSession: async (...args: unknown[]) => {
        const baseCreateSession = baseAdapter.createSession as (
          ...innerArgs: unknown[]
        ) => Promise<Record<string, unknown>>;
        const session = await baseCreateSession(...args);
        const rawToken =
          typeof session.tokenHash === "string"
            ? session.tokenHash
            : typeof session.token === "string"
              ? session.token
              : null;

        if (!rawToken || typeof session.id !== "string") {
          return session;
        }

        await client.session.update({
          where: { id: session.id },
          data: {
            tokenHash: hashAuthToken(rawToken),
          },
        });

        return {
          ...session,
          tokenHash: rawToken,
          token: rawToken,
        };
      },
      findSession: async (token: unknown, ...args: unknown[]) => {
        if (typeof token !== "string") {
          return null;
        }

        const baseFindSession = baseAdapter.findSession as (
          ...innerArgs: unknown[]
        ) => Promise<{
          session: Record<string, unknown>;
          user: Record<string, unknown>;
        } | null>;
        const result = await baseFindSession(hashAuthToken(token), ...args);

        if (!result) {
          return null;
        }

        return {
          ...result,
          session: {
            ...result.session,
            tokenHash: token,
            token,
          },
        };
      },
      findSessions: async (tokens: unknown, ...args: unknown[]) => {
        if (!Array.isArray(tokens)) {
          return [];
        }

        const rawTokens = tokens.filter(
          (token): token is string => typeof token === "string",
        );
        const hashToRawToken = new Map(
          rawTokens.map((token) => [hashAuthToken(token), token]),
        );

        const baseFindSessions = baseAdapter.findSessions as (
          ...innerArgs: unknown[]
        ) => Promise<
          Array<{
            session: Record<string, unknown>;
            user: Record<string, unknown>;
          }>
        >;
        const results = await baseFindSessions(
          rawTokens.map((token) => hashAuthToken(token)),
          ...args,
        );

        return results.map((result) => {
          const storedToken =
            typeof result.session.tokenHash === "string"
              ? result.session.tokenHash
              : typeof result.session.token === "string"
                ? result.session.token
                : "";
          const rawToken = hashToRawToken.get(storedToken) ?? storedToken;

          return {
            ...result,
            session: {
              ...result.session,
              tokenHash: rawToken,
              token: rawToken,
            },
          };
        });
      },
      updateSession: async (token: unknown, ...args: unknown[]) => {
        const baseUpdateSession = baseAdapter.updateSession as (
          ...innerArgs: unknown[]
        ) => Promise<Record<string, unknown>>;
        const rawToken = typeof token === "string" ? token : null;
        const result = await baseUpdateSession(
          rawToken ? hashAuthToken(rawToken) : token,
          ...args,
        );

        if (!rawToken || !result) {
          return result;
        }

        return {
          ...result,
          tokenHash: rawToken,
          token: rawToken,
        };
      },
      deleteSession: async (token: unknown, ...args: unknown[]) => {
        const baseDeleteSession = baseAdapter.deleteSession as (
          ...innerArgs: unknown[]
        ) => Promise<unknown>;
        return baseDeleteSession(
          typeof token === "string" ? hashAuthToken(token) : token,
          ...args,
        );
      },
      createVerificationValue: async (data: unknown, ...args: unknown[]) => {
        if (!data || typeof data !== "object") {
          const baseCreateVerificationValue =
            baseAdapter.createVerificationValue as (
              ...innerArgs: unknown[]
            ) => Promise<Record<string, unknown>>;
          return baseCreateVerificationValue(data, ...args);
        }

        const record = data as Record<string, unknown>;
        const baseCreateVerificationValue =
          baseAdapter.createVerificationValue as (
            ...innerArgs: unknown[]
          ) => Promise<Record<string, unknown>>;
        const result = await baseCreateVerificationValue(
          {
            ...record,
            identifier:
              typeof record.identifier === "string"
                ? hashAuthToken(record.identifier)
                : record.identifier,
            value:
              typeof record.value === "string"
                ? encryptAuthValue(record.value)
                : record.value,
          },
          ...args,
        );

        return {
          ...result,
          identifier:
            typeof record.identifier === "string"
              ? record.identifier
              : result.identifierHash,
          value:
            typeof record.value === "string"
              ? record.value
              : result.valueEncrypted,
        };
      },
      findVerificationValue: async (
        identifier: unknown,
        ...args: unknown[]
      ) => {
        if (typeof identifier !== "string") {
          return null;
        }

        const baseFindVerificationValue = baseAdapter.findVerificationValue as (
          ...innerArgs: unknown[]
        ) => Promise<Record<string, unknown> | null>;
        const result = await baseFindVerificationValue(
          hashAuthToken(identifier),
          ...args,
        );

        if (!result) {
          return null;
        }

        return {
          ...result,
          identifierHash: identifier,
          identifier,
          valueEncrypted:
            typeof result.valueEncrypted === "string"
              ? decryptAuthValueIfNeeded(result.valueEncrypted)
              : result.valueEncrypted,
          value:
            typeof result.valueEncrypted === "string"
              ? decryptAuthValueIfNeeded(result.valueEncrypted)
              : result.valueEncrypted,
        };
      },
      deleteVerificationByIdentifier: async (
        identifier: unknown,
        ...args: unknown[]
      ) => {
        const baseDeleteVerificationByIdentifier =
          baseAdapter.deleteVerificationByIdentifier as (
            ...innerArgs: unknown[]
          ) => Promise<unknown>;
        return baseDeleteVerificationByIdentifier(
          typeof identifier === "string"
            ? hashAuthToken(identifier)
            : identifier,
          ...args,
        );
      },
      updateVerificationValue: async (
        id: unknown,
        data: unknown,
        ...args: unknown[]
      ) => {
        const baseUpdateVerificationValue =
          baseAdapter.updateVerificationValue as (
            ...innerArgs: unknown[]
          ) => Promise<Record<string, unknown>>;
        const record =
          data && typeof data === "object"
            ? (data as Record<string, unknown>)
            : {};

        const result = await baseUpdateVerificationValue(
          id,
          {
            ...record,
            identifier:
              typeof record.identifier === "string"
                ? hashAuthToken(record.identifier)
                : record.identifier,
            value:
              typeof record.value === "string"
                ? encryptAuthValue(record.value)
                : record.value,
          },
          ...args,
        );

        return {
          ...result,
          identifierHash:
            typeof record.identifier === "string"
              ? record.identifier
              : result.identifierHash,
          identifier:
            typeof record.identifier === "string"
              ? record.identifier
              : result.identifierHash,
          valueEncrypted:
            typeof result.valueEncrypted === "string"
              ? decryptAuthValueIfNeeded(result.valueEncrypted)
              : result.valueEncrypted,
          value:
            typeof result.valueEncrypted === "string"
              ? decryptAuthValueIfNeeded(result.valueEncrypted)
              : result.valueEncrypted,
        };
      },
    };
  };
};

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET || "fallback_secret_for_build_only",
  database: createSecurePrismaAdapter(prisma),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    fields: {
      token: "tokenHash",
    },
  },
  verification: {
    fields: {
      identifier: "identifierHash",
      value: "valueEncrypted",
    },
  },
  account: {
    encryptOAuthTokens: true,
    fields: {
      accessToken: "accessTokenEncrypted",
      refreshToken: "refreshTokenEncrypted",
      idToken: "idTokenEncrypted",
      password: "passwordHash",
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  databaseHooks: {
    // Removed auto-admin promotion for security
  },
});
