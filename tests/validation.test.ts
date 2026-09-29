import { describe, expect, it } from "vitest";
import {
  customerCreateSchema,
  loginSchema,
  workOrderCreateSchema,
  workOrderUpdateSchema,
} from "../src/lib/validation";

describe("request schemas", () => {
  it("accepts a valid login payload", () => {
    expect(loginSchema.safeParse({
      email: "dispatcher@fieldops.local",
      password: "DemoDispatch123!",
    }).success).toBe(true);
  });

  it("rejects incomplete customer data", () => {
    expect(customerCreateSchema.safeParse({
      name: "A",
      contactName: "",
      contactEmail: "bad",
      siteAddress: "",
    }).success).toBe(false);
  });

  it("validates new work orders", () => {
    expect(workOrderCreateSchema.safeParse({
      title: "Replace failed access point",
      description: "The lobby access point is offline and no longer responds to management.",
      priority: "HIGH",
      customerId: "customer-1",
      assigneeId: null,
      scheduledFor: null,
    }).success).toBe(true);
  });

  it("requires at least one update field", () => {
    expect(workOrderUpdateSchema.safeParse({}).success).toBe(false);
  });
});
