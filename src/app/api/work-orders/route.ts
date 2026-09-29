import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { canManageWork, getCurrentUser } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { db } from "@/lib/db";
import { createTicketNumber } from "@/lib/ticket-number";
import { workOrderCreateSchema } from "@/lib/validation";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workOrders = await db.workOrder.findMany({
    where: user.role === "TECHNICIAN" ? { assigneeId: user.id } : {},
    include: {
      customer: true,
      assignee: { select: { id: true, name: true, email: true, role: true } },
      createdBy: { select: { id: true, name: true, email: true, role: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json({ workOrders });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageWork(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = workOrderCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const customer = await db.customer.findUnique({ where: { id: parsed.data.customerId } });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  if (parsed.data.assigneeId) {
    const technician = await db.user.findUnique({ where: { id: parsed.data.assigneeId } });
    if (!technician || !technician.active || technician.role !== "TECHNICIAN") {
      return NextResponse.json({ error: "Assignee must be an active technician" }, { status: 400 });
    }
  }

  const data = {
    title: parsed.data.title,
    description: parsed.data.description,
    priority: parsed.data.priority,
    customerId: parsed.data.customerId,
    assigneeId: parsed.data.assigneeId ?? null,
    scheduledFor: parsed.data.scheduledFor ? new Date(parsed.data.scheduledFor) : null,
    createdById: user.id,
    status: parsed.data.assigneeId ? ("ASSIGNED" as const) : ("OPEN" as const),
  };

  let workOrder = null;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      workOrder = await db.workOrder.create({
        data: { ...data, ticketNumber: createTicketNumber() },
        include: {
          customer: true,
          assignee: { select: { id: true, name: true, email: true, role: true } },
          createdBy: { select: { id: true, name: true, email: true, role: true } },
        },
      });
      break;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002" &&
        attempt < 3
      ) {
        continue;
      }
      throw error;
    }
  }

  if (!workOrder) {
    return NextResponse.json({ error: "Unable to allocate a ticket number" }, { status: 503 });
  }

  await writeAudit({
    actorId: user.id,
    action: "WORK_ORDER_CREATED",
    entityType: "WORK_ORDER",
    entityId: workOrder.id,
    details: {
      ticketNumber: workOrder.ticketNumber,
      customerId: workOrder.customerId,
      assigneeId: workOrder.assigneeId,
      priority: workOrder.priority,
    },
  });

  return NextResponse.json({ workOrder }, { status: 201 });
}
