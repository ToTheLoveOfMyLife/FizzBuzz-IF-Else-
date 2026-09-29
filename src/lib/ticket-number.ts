import { randomInt } from "node:crypto";

export function createTicketNumber(now = new Date()): string {
  const date = now.toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = randomInt(1000, 10000);
  return `WO-${date}-${suffix}`;
}
