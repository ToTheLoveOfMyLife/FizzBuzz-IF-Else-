"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      setError(payload.error ?? "Unable to sign in.");
      setSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form className="login-form" onSubmit={submit}>
      <label>
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          defaultValue="dispatcher@fieldops.local"
          required
        />
      </label>

      <label>
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          defaultValue="DemoDispatch123!"
          required
        />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button className="primary-button" type="submit" disabled={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </button>

      <div className="demo-credentials">
        <strong>Seeded demo accounts</strong>
        <span>Dispatcher: dispatcher@fieldops.local / DemoDispatch123!</span>
        <span>Technician: tech@fieldops.local / DemoTech123!</span>
        <span>Admin: admin@fieldops.local / DemoAdmin123!</span>
      </div>
    </form>
  );
}
