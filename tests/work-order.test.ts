import { describe, expect, it } from "vitest";
import { canTransition, priorityLabel, statusLabel } from "../src/domain/work-order";

describe("work-order domain rules", () => {
  it("allows dispatching open work", () => {
    expect(canTransition("OPEN", "ASSIGNED")).toBe(true);
  });

  it("allows a technician workflow through completion", () => {
    expect(canTransition("ASSIGNED", "IN_PROGRESS")).toBe(true);
    expect(canTransition("IN_PROGRESS", "COMPLETED")).toBe(true);
  });

  it("keeps terminal states terminal", () => {
    expect(canTransition("COMPLETED", "IN_PROGRESS")).toBe(false);
    expect(canTransition("CANCELLED", "OPEN")).toBe(false);
  });

  it("formats enum labels for the UI", () => {
    expect(statusLabel("IN_PROGRESS")).toBe("In Progress");
    expect(priorityLabel("URGENT")).toBe("Urgent");
  });
});
