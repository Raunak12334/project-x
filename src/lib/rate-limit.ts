import prisma from "@/lib/db";

type RateLimitInput = {
  organizationId: string;
  key: string;
  limit: number;
  windowMs: number;
  subjectType?: "ORG" | "USER" | "IP";
  subjectId?: string;
  route?: string;
};

const getWindowResetAt = (now: number, windowMs: number) =>
  new Date(Math.floor(now / windowMs) * windowMs + windowMs);

export async function rateLimit({
  organizationId,
  key,
  limit,
  windowMs,
  subjectType = "ORG",
  subjectId = organizationId,
  route = "",
}: RateLimitInput): Promise<boolean> {
  if (limit < 1 || windowMs < 1000) {
    throw new Error("Invalid rate limit configuration");
  }

  const now = Date.now();
  const resetAt = getWindowResetAt(now, windowMs);

  const bucket = await prisma.rateLimitBucket.upsert({
    where: {
      organizationId_subjectType_subjectId_limitType_route_resetAt: {
        organizationId,
        subjectType,
        subjectId,
        limitType: key,
        route,
        resetAt,
      },
    },
    create: {
      organizationId,
      subjectType,
      subjectId,
      limitType: key,
      route,
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
