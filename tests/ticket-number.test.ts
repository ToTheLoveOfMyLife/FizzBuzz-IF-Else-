import { describe, expect, it } from "vitest";
import { createTicketNumber } from "../src/lib/ticket-number";

describe("ticket numbers", () => {
  it("contains the UTC date and a four-digit suffix", () => {
    const value = createTicketNumber(new Date("2026-09-29T15:00:00Z"));
    expect(value).toMatch(/^WO-20260929-\d{4}$/);
  });
});
