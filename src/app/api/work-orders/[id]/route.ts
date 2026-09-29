import { NextResponse } from "next/server";
import { canTransition, type WorkOrderStatusValue } from "@/domain/work-order";
import { canManageWork, getCurrentUser } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { workOrderUpdateSchema } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  const current = await db.workOrder.findUnique({ where: { id } });
  if (!current) return NextResponse.json({ error: "Work order not found" }, { status: 404 });

  const manager = canManageWork(user);
  if (!manager && current.assigneeId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = workOrderUpdateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  if (!manager && (
    parsed.data.priority !== undefined ||
    parsed.data.assigneeId !== undefined ||
    parsed.data.scheduledFor !== undefined
  )) {
    return NextResponse.json(
      { error: "Technicians may only update work-order status." },
      { status: 403 },
    );
  }

  const nextStatus = parsed.data.status;
  if (
    nextStatus &&
    !canTransition(current.status as WorkOrderStatusValue, nextStatus)
  ) {
    return NextResponse.json(
      { error: `Cannot transition from ${current.status} to ${nextStatus}` },
      { status: 409 },
    );
  }

  if (parsed.data.assigneeId) {
    const technician = await db.user.findUnique({ where: { id: parsed.data.assigneeId } });
    if (!technician || !technician.active || technician.role !== "TECHNICIAN") {
      return NextResponse.json({ error: "Assignee must be an active technician" }, { status: 400 });
    }
  }

  const patch = {
    ...(parsed.data.priority !== undefined ? { priority: parsed.data.priority } : {}),
    ...(parsed.data.scheduledFor !== undefined
      ? { scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : null }
      : {}),
    ...(parsed.data.assigneeId !== undefined ? { assigneeId: parsed.data.assigneeId } : {}),
    ...(nextStatus ? { status: nextStatus } : {}),
  };

  if (
    manager &&
    parsed.data.assigneeId !== undefined &&
    !nextStatus &&
    current.status === "OPEN" &&
    parsed.data.assigneeId
  ) {
    Object.assign(patch, { status: "ASSIGNED" as const });
  }

  if (
    manager &&
    parsed.data.assigneeId === null &&
    !nextStatus &&
    current.status === "ASSIGNED"
  ) {
    Object.assign(patch, { status: "OPEN" as const });
  }

  const workOrder = await db.workOrder.update({
    where: { id },
    data: patch,
    include: {
      customer: true,
      assignee: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "WORK_ORDER_UPDATED",
    entityType: "WORK_ORDER",
    entityId: id,
    details: {
      before: {
        status: current.status,
        priority: current.priority,
        assigneeId: current.assigneeId,
      },
      after: {
        status: workOrder.status,
        priority: workOrder.priority,
        assigneeId: workOrder.assigneeId,
      },
    },
  });

  return NextResponse.json({ workOrder });
}
