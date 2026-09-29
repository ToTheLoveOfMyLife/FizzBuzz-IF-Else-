import { NextResponse } from "next/server";
import { createSession, publicUser, verifyCredentials } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const payload = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 400 });
  }

  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ user: publicUser(user) });
}
