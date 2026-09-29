import { NextResponse } from "next/server";
import { canManageWork, getCurrentUser, publicUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!canManageWork(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await db.user.findMany({
    where: { active: true },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return NextResponse.json({ users: users.map(publicUser) });
}
