import { NextResponse } from "next/server";
import { canManageWork, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { customerCreateSchema } from "@/lib/validation";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const customers = await db.customer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ customers });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageWork(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = await request.json().catch(() => null);
  const parsed = customerCreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const customer = await db.customer.create({ data: parsed.data });
  await writeAudit({
    actorId: user.id,
    action: "CUSTOMER_CREATED",
    entityType: "CUSTOMER",
    entityId: customer.id,
    details: { name: customer.name },
  });

  return NextResponse.json({ customer }, { status: 201 });
}
