import { redirect } from "next/navigation";
import { FieldOpsDashboard } from "@/components/FieldOpsDashboard";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <main className="app-shell">
      <FieldOpsDashboard />
    </main>
  );
}
