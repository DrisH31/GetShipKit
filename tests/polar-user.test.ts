import { beforeEach, describe, expect, it, vi } from "vitest";

// A fake Clerk: which users exist, and their primary email + verification.
const users = new Map<string, { email: string; verified: boolean }>();
vi.mock("@clerk/nextjs/server", () => ({
  clerkClient: async () => ({
    users: {
      getUser: async (id: string) => {
        const u = users.get(id);
        if (!u) throw Object.assign(new Error("not found"), { status: 404 });
        return {
          primaryEmailAddress: {
            emailAddress: u.email,
            verification: { status: u.verified ? "verified" : "unverified" },
          },
        };
      },
    },
  }),
}));

const { resolvePolarUserId } = await import("@/lib/polar-user");

const order = (o: { meta?: string; external?: string | null; email?: string | null }) => ({
  metadata: o.meta ? { clerk_user_id: o.meta } : {},
  customer: { external_id: o.external ?? null, email: o.email ?? null },
});

describe("resolvePolarUserId: who a first-seen purchase belongs to", () => {
  beforeEach(() => {
    users.clear();
    users.set("user_alice", { email: "alice@example.com", verified: true });
    users.set("user_bob", { email: "bob@example.com", verified: true });
    users.set("user_unverified", { email: "u@example.com", verified: false });
  });

  it("credits a checkout whose customer email is the user's verified email", async () => {
    expect(await resolvePolarUserId(order({ meta: "user_alice", email: "Alice@Example.com" }))).toBe("user_alice");
  });

  it("refuses when the buyer typed someone else's email at checkout", async () => {
    expect(await resolvePolarUserId(order({ meta: "user_bob", email: "alice@example.com" }))).toBeNull();
  });

  it("refuses even if Polar bound that customer to the buyer", async () => {
    expect(
      await resolvePolarUserId(order({ meta: "user_bob", external: "user_bob", email: "alice@example.com" }))
    ).toBeNull();
  });

  it("refuses when checkout metadata and the customer's binding disagree", async () => {
    expect(
      await resolvePolarUserId(order({ meta: "user_alice", external: "user_bob", email: "alice@example.com" }))
    ).toBeNull();
  });

  it("refuses a user whose email Clerk has not verified", async () => {
    expect(await resolvePolarUserId(order({ meta: "user_unverified", email: "u@example.com" }))).toBeNull();
  });

  it("refuses a user Clerk no longer has", async () => {
    expect(await resolvePolarUserId(order({ meta: "user_deleted", email: "gone@example.com" }))).toBeNull();
  });

  it("trusts an existing binding when the object carries no checkout metadata", async () => {
    expect(await resolvePolarUserId(order({ external: "user_alice", email: "anything@example.com" }))).toBe("user_alice");
  });

  it("never matches by email alone", async () => {
    expect(await resolvePolarUserId(order({ email: "alice@example.com" }))).toBeNull();
  });

  it("ignores ids that are not Clerk user ids", async () => {
    expect(await resolvePolarUserId(order({ meta: "admin", email: "alice@example.com" }))).toBeNull();
  });
});
