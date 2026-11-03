import { describe, expect, it, vi } from "vitest";

// polar-sync imports the Supabase admin client; nothing here touches it.
vi.mock("@/lib/supabase-admin", () => ({ createAdminSupabaseClient: vi.fn() }));
vi.mock("@/lib/polar-user", () => ({ resolvePolarUserId: vi.fn() }));

const { subscriptionStatus, billingPeriod } = await import("@/lib/polar-sync");

type Sub = Parameters<typeof subscriptionStatus>[0];
const sub = (status: string, cancel_at_period_end = false) => ({ status, cancel_at_period_end }) as unknown as Sub;

describe("subscriptionStatus: Polar status → stored status", () => {
  it.each([
    ["active", false, "active"],
    ["active", true, "ending"],
    ["trialing", false, "trial"],
    ["trialing", true, "ending"],
    ["past_due", false, "past_due"],
    ["canceled", false, "canceled"],
    ["unpaid", false, "unpaid"],
    ["incomplete", false, "incomplete"],
    ["incomplete_expired", false, "incomplete_expired"],
    ["paused", false, "paused"],
  ])("%s (cancel at period end: %s) → %s", (status, cancel, expected) => {
    expect(subscriptionStatus(sub(status as string, cancel as boolean))).toBe(expected);
  });

  it("grants nothing for a status it does not know", () => {
    expect(subscriptionStatus(sub("something_new"))).toBe("pending");
  });
});

describe("billingPeriod", () => {
  it("names Polar's intervals", () => {
    expect(billingPeriod("month")).toBe("monthly");
    expect(billingPeriod("year")).toBe("annual");
    expect(billingPeriod("week")).toBe("week");
  });
});
