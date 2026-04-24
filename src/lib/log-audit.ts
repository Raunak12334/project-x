import type { Prisma } from "@prisma/client";
import type { InputJsonValue } from "@prisma/client/runtime/library";
import prisma from "@/lib/db";

export async function logAudit(params: {
  userId?: string;
  organizationId?: string;
  action: string;
  metadata?: Prisma.InputJsonObject;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  severity?: string;
  resourceType?: string;
  resourceId?: string;
}) {
  const {
    userId,
    organizationId,
    action,
    metadata,
    ipAddress,
    userAgent,
    requestId,
    severity = "INFO",
    resourceType,
    resourceId,
  } = params;
  if (!organizationId && !userId) return;
  await prisma.auditLog.create({
    data: {
      userId: userId ?? null,
      organizationId: organizationId ?? "",
      action,
      metadata: (metadata as InputJsonValue) ?? undefined,
      ipAddress,
      userAgent,
      requestId,
      severity,
      resourceType,
      resourceId,
    },
  });
}
