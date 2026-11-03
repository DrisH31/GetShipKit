import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("keeps a house type size and a colour together", () => {
    expect(cn("text-display text-ink")).toBe("text-display text-ink");
    expect(cn("text-h1", "text-ink-2")).toBe("text-h1 text-ink-2");
  });
  it("still lets a later size win over an earlier one", () => {
    expect(cn("text-h1", "text-h2")).toBe("text-h2");
  });
});
