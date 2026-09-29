import { redirect } from "next/navigation";
import { LoginForm } from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");

  return (
    <main className="login-page">
      <section className="login-intro">
        <p className="hero-kicker">Software engineering portfolio project</p>
        <h1>FieldOps</h1>
        <p>
          A multi-user work-order operations platform with authentication, role-based
          authorization, PostgreSQL persistence, workflow rules, audit history, testing,
          and CI.
        </p>
        <div className="feature-pills">
          <span>Next.js</span>
          <span>TypeScript</span>
          <span>PostgreSQL</span>
          <span>Prisma</span>
          <span>RBAC</span>
          <span>Vitest</span>
        </div>
      </section>

      <section className="login-card">
        <p className="eyebrow">Demo workspace</p>
        <h2>Sign in</h2>
        <p className="muted">
          Seed the database locally, then use one of the demo roles to test authorization boundaries.
        </p>
        <LoginForm />
      </section>
    </main>
  );
}
