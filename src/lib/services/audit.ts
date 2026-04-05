import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface AuditParams {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Prisma.InputJsonValue;
  ipAddress?: string;
}

export function logAudit(params: AuditParams) {
  try {
    const data: Prisma.AuditLogUncheckedCreateInput = {
      action: params.action,
      entity: params.entity,
      userId: params.userId ?? null,
      entityId: params.entityId ?? null,
      details: params.details ?? undefined,
      ipAddress: params.ipAddress ?? null,
    };

    prisma.auditLog.create({ data }).catch((err) => {
      console.error("[AuditLog] Failed to log:", err);
    });
  } catch (err) {
    console.error("[AuditLog] Unexpected error:", err);
  }
}
