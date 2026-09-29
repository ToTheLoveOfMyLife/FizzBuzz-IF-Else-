export const workOrderStatuses = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "BLOCKED",
  "COMPLETED",
  "CANCELLED",
] as const;

export const workOrderPriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

export type WorkOrderStatusValue = (typeof workOrderStatuses)[number];
export type WorkOrderPriorityValue = (typeof workOrderPriorities)[number];

const transitions: Record<WorkOrderStatusValue, readonly WorkOrderStatusValue[]> = {
  OPEN: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["OPEN", "IN_PROGRESS", "BLOCKED", "CANCELLED"],
  IN_PROGRESS: ["BLOCKED", "COMPLETED", "CANCELLED"],
  BLOCKED: ["IN_PROGRESS", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
};

export function canTransition(from: WorkOrderStatusValue, to: WorkOrderStatusValue): boolean {
  if (from === to) return true;
  return transitions[from].includes(to);
}

export function statusLabel(status: WorkOrderStatusValue): string {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function priorityLabel(priority: WorkOrderPriorityValue): string {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}
