import { describe, expect, it } from "vitest";
import { safeRedirectPath } from "@/lib/safe-redirect";

const FALLBACK = "/dashboard/billing";

describe("safeRedirectPath", () => {
  it.each([
    ["/dashboard", "/dashboard"],
    ["/dashboard/billing?x=1#a", "/dashboard/billing?x=1#a"],
    ["/%2F%2Fevil.example", "/%2F%2Fevil.example"],
  ])("keeps a path on this site: %j", (input, expected) => {
    expect(safeRedirectPath(input)).toBe(expected);
  });

  it.each([
    "//evil.example",
    "/\\evil.example",
    "/\t/evil.example", // browsers drop tabs and newlines
    "/\n/evil.example",
    "/.//evil.example", // resolves to a protocol-relative path
    "/x/..//evil.example",
    "https://evil.example",
    "javascript:alert(1)",
    "",
    null,
    undefined,
  ])("refuses anything that leaves the site: %j", (input) => {
    expect(safeRedirectPath(input)).toBe(FALLBACK);
  });

  it("never returns something a browser would resolve to another origin", () => {
    for (const input of ["/ \t\\/evil.example", "/%09/evil.example", "/./\\/evil.example"]) {
      const landed = new URL(safeRedirectPath(input), "https://mysite.example");
      expect(landed.origin).toBe("https://mysite.example");
    }
  });
});
