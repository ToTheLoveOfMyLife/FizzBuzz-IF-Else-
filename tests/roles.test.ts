import { describe, expect, it } from "vitest";
import { canManageWork } from "../src/lib/auth";

describe("role authorization", () => {
  it("allows administrative dispatch roles to manage work", () => {
    expect(canManageWork({ role: "ADMIN" })).toBe(true);
    expect(canManageWork({ role: "DISPATCHER" })).toBe(true);
  });

  it("keeps technician permissions scoped", () => {
    expect(canManageWork({ role: "TECHNICIAN" })).toBe(false);
  });
});
