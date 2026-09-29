import { NextResponse } from "next/server";
import { canManageWork, getCurrentUser, publicUser } from "@/lib/auth";
import { db } from "@/lib/db";

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
    orderBy: [{ updatedAt: "desc" }],
    take: 100,
  });

  const metrics = {
    open: workOrders.filter((item) => item.status === "OPEN").length,
    assigned: workOrders.filter((item) => item.status === "ASSIGNED").length,
    active: workOrders.filter((item) => item.status === "IN_PROGRESS").length,
    blocked: workOrders.filter((item) => item.status === "BLOCKED").length,
    completed: workOrders.filter((item) => item.status === "COMPLETED").length,
  };

  const customers = canManageWork(user)
    ? await db.customer.findMany({ orderBy: { name: "asc" } })
    : [];

  const technicians = canManageWork(user)
    ? await db.user.findMany({
        where: { active: true, role: "TECHNICIAN" },
        select: { id: true, name: true, email: true, role: true },
        orderBy: { name: "asc" },
      })
    : [];

  const audit = canManageWork(user)
    ? await db.auditLog.findMany({
        include: { actor: { select: { id: true, name: true, email: true, role: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      })
    : [];

  return NextResponse.json({
    user: publicUser(user),
    metrics,
    workOrders,
    customers,
    technicians,
    audit,
  });
}
