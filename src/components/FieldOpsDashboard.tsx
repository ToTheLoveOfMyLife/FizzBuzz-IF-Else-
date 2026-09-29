"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  priorityLabel,
  statusLabel,
  workOrderPriorities,
  workOrderStatuses,
  type WorkOrderStatusValue,
} from "@/domain/work-order";

type User = { id: string; name: string; email: string; role: string };
type Customer = {
  id: string;
  name: string;
  contactName: string;
  contactEmail: string;
  phone?: string | null;
  siteAddress: string;
};
type WorkOrder = {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: WorkOrderStatusValue;
  scheduledFor: string | null;
  createdAt: string;
  updatedAt: string;
  customer: Customer;
  assignee: User | null;
  createdBy: User;
};
type AuditEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  createdAt: string;
  actor: User;
};
type DashboardPayload = {
  user: User;
  metrics: { open: number; assigned: number; active: number; blocked: number; completed: number };
  workOrders: WorkOrder[];
  customers: Customer[];
  technicians: User[];
  audit: AuditEntry[];
};

export function FieldOpsDashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"ALL" | WorkOrderStatusValue>("ALL");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/dashboard", { cache: "no-store" });
    if (response.status === 401) {
      window.location.assign("/login");
      return;
    }
    if (!response.ok) {
      setError("Unable to load operations data.");
      return;
    }
    setData((await response.json()) as DashboardPayload);
    setError("");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const visibleOrders = useMemo(() => {
    if (!data) return [];
    return filter === "ALL"
      ? data.workOrders
      : data.workOrders.filter((order) => order.status === filter);
  }, [data, filter]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.assign("/login");
  }

  async function updateOrder(id: string, patch: Record<string, unknown>) {
    const response = await fetch(`/api/work-orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => ({}))) as { error?: string };
      window.alert(payload.error ?? "Unable to update work order.");
      return;
    }

    await load();
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);

    const form = new FormData(event.currentTarget);
    const scheduledRaw = String(form.get("scheduledFor") ?? "");
    const payload = {
      title: form.get("title"),
      description: form.get("description"),
      priority: form.get("priority"),
      customerId: form.get("customerId"),
      assigneeId: form.get("assigneeId") || null,
      scheduledFor: scheduledRaw ? new Date(scheduledRaw).toISOString() : null,
    };

    const response = await fetch("/api/work-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setCreating(false);
    if (!response.ok) {
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      window.alert(body.error ?? "Unable to create work order.");
      return;
    }

    event.currentTarget.reset();
    await load();
  }

  if (!data) {
    return (
      <div className="loading-card">
        {error || "Loading FieldOps workspace…"}
      </div>
    );
  }

  const manager = data.user.role === "ADMIN" || data.user.role === "DISPATCHER";

  return (
    <>
      <header className="app-header">
        <div>
          <p className="eyebrow">Operations workspace</p>
          <h1>FieldOps</h1>
          <p>{data.user.name} · {roleLabel(data.user.role)}</p>
        </div>
        <button className="secondary-button" type="button" onClick={() => void logout()}>
          Sign out
        </button>
      </header>

      <section className="metric-grid" aria-label="Work order metrics">
        <Metric label="Open" value={data.metrics.open} />
        <Metric label="Assigned" value={data.metrics.assigned} />
        <Metric label="In progress" value={data.metrics.active} />
        <Metric label="Blocked" value={data.metrics.blocked} />
        <Metric label="Completed" value={data.metrics.completed} />
      </section>

      <div className="dashboard-grid">
        <section className="panel work-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Work queue</p>
              <h2>{manager ? "All work orders" : "My assigned work"}</h2>
            </div>
            <select
              aria-label="Filter work orders by status"
              value={filter}
              onChange={(event) => setFilter(event.target.value as typeof filter)}
            >
              <option value="ALL">All statuses</option>
              {workOrderStatuses.map((status) => (
                <option key={status} value={status}>{statusLabel(status)}</option>
              ))}
            </select>
          </div>

          <div className="order-list">
            {visibleOrders.length === 0 && <p className="muted">No work orders match this view.</p>}
            {visibleOrders.map((order) => (
              <article className="order-card" key={order.id}>
                <div className="order-topline">
                  <span className={`priority priority-${order.priority.toLowerCase()}`}>
                    {priorityLabel(order.priority)}
                  </span>
                  <span>{order.ticketNumber}</span>
                </div>

                <h3>{order.title}</h3>
                <p>{order.description}</p>

                <div className="order-details">
                  <span><strong>Customer</strong>{order.customer.name}</span>
                  <span><strong>Site</strong>{order.customer.siteAddress}</span>
                  <span><strong>Assigned</strong>{order.assignee?.name ?? "Unassigned"}</span>
                  <span><strong>Updated</strong>{new Date(order.updatedAt).toLocaleString()}</span>
                </div>

                <div className="order-actions">
                  <label>
                    Status
                    <select
                      value={order.status}
                      onChange={(event) =>
                        void updateOrder(order.id, { status: event.target.value })
                      }
                    >
                      {workOrderStatuses.map((status) => (
                        <option key={status} value={status}>{statusLabel(status)}</option>
                      ))}
                    </select>
                  </label>

                  {manager && (
                    <label>
                      Technician
                      <select
                        value={order.assignee?.id ?? ""}
                        onChange={(event) =>
                          void updateOrder(order.id, { assigneeId: event.target.value || null })
                        }
                      >
                        <option value="">Unassigned</option>
                        {data.technicians.map((technician) => (
                          <option key={technician.id} value={technician.id}>
                            {technician.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="side-stack">
          {manager && (
            <section className="panel">
              <p className="eyebrow">Dispatch</p>
              <h2>Create work order</h2>
              <form className="stack-form" onSubmit={createOrder}>
                <label>
                  Customer
                  <select name="customerId" required>
                    <option value="">Select customer</option>
                    {data.customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>{customer.name}</option>
                    ))}
                  </select>
                </label>

                <label>
                  Summary
                  <input name="title" minLength={5} maxLength={160} required />
                </label>

                <label>
                  Description
                  <textarea name="description" minLength={12} maxLength={3000} rows={4} required />
                </label>

                <div className="form-row">
                  <label>
                    Priority
                    <select name="priority" defaultValue="MEDIUM">
                      {workOrderPriorities.map((priority) => (
                        <option key={priority} value={priority}>{priorityLabel(priority)}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    Technician
                    <select name="assigneeId" defaultValue="">
                      <option value="">Unassigned</option>
                      {data.technicians.map((technician) => (
                        <option key={technician.id} value={technician.id}>
                          {technician.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <label>
                  Scheduled time
                  <input name="scheduledFor" type="datetime-local" />
                </label>

                <button className="primary-button" type="submit" disabled={creating}>
                  {creating ? "Creating…" : "Create work order"}
                </button>
              </form>
            </section>
          )}

          {manager && (
            <section className="panel">
              <p className="eyebrow">Audit trail</p>
              <h2>Recent activity</h2>
              <div className="audit-list">
                {data.audit.map((entry) => (
                  <div key={entry.id}>
                    <strong>{humanAction(entry.action)}</strong>
                    <span>{entry.actor.name}</span>
                    <small>{new Date(entry.createdAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </section>
          )}
        </aside>
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="metric"><span>{label}</span><strong>{value}</strong></div>;
}

function roleLabel(role: string) {
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function humanAction(action: string) {
  return action.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}
