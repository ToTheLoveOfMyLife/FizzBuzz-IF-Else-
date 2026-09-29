import { Prisma } from "@prisma/client";
import { db } from "./db";

export async function writeAudit(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details: Prisma.InputJsonValue;
}) {
  await db.auditLog.create({ data: input });
}
