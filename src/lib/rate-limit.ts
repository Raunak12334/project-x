import prisma from "@/lib/db";

type RateLimitInput = {
  organizationId: string;
  key: string;
  limit: number;
  windowMs: number;
};

const getWindowResetAt = (now: number, windowMs: number) =>
  new Date(Math.floor(now / windowMs) * windowMs + windowMs);

export async function rateLimit({
  organizationId,
  key,
  limit,
  windowMs,
}: RateLimitInput): Promise<boolean> {
  if (limit < 1 || windowMs < 1000) {
    throw new Error("Invalid rate limit configuration");
  }

  const now = Date.now();
  const resetAt = getWindowResetAt(now, windowMs);

  const bucket = await prisma.rateLimitBucket.upsert({
    where: {
      organizationId_limitType_resetAt: {
        organizationId,
        limitType: key,
        resetAt,
      },
    },
    create: {
      organizationId,
      limitType: key,
      count: 1,
      limit,
      resetAt,
    },
    update: {
      count: { increment: 1 },
      limit,
    },
  });

  return bucket.count <= limit;
}
