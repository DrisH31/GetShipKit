import { describe, expect, it } from "vitest";
import { isSameSite } from "@/lib/same-site";

const headers = (h: Record<string, string>) => new Headers(h);

describe("isSameSite (CSRF origin check)", () => {
  describe("with NEXT_PUBLIC_SITE_URL set", () => {
    const site = "https://shop.example.com";
    it("accepts the exact origin", () => {
      expect(isSameSite("https://shop.example.com", headers({ host: "internal:3000" }), site)).toBe(true);
    });
    it("refuses another scheme on the same host", () => {
      expect(isSameSite("http://shop.example.com", headers({ host: "shop.example.com" }), site)).toBe(false);
    });
    it("refuses another site, even if Host matches it", () => {
      expect(isSameSite("https://evil.example", headers({ host: "evil.example" }), site)).toBe(false);
    });
    it("refuses a sibling subdomain", () => {
      expect(isSameSite("https://evil.shop.example.com", headers({}), site)).toBe(false);
    });
  });

  describe("without a configured site", () => {
    it("compares with Host", () => {
      expect(isSameSite("http://localhost:3000", headers({ host: "localhost:3000" }), undefined)).toBe(true);
      expect(isSameSite("https://evil.example", headers({ host: "localhost:3000" }), undefined)).toBe(false);
    });
    it("prefers the first X-Forwarded-Host", () => {
      const h = headers({ host: "app:3000", "x-forwarded-host": "shop.example.com, app:3000" });
      expect(isSameSite("https://shop.example.com", h, undefined)).toBe(true);
    });
    it("requires the forwarded scheme when the proxy sends one", () => {
      const h = headers({ host: "shop.example.com", "x-forwarded-proto": "https" });
      expect(isSameSite("http://shop.example.com", h, undefined)).toBe(false);
      expect(isSameSite("https://shop.example.com", h, undefined)).toBe(true);
    });
  });

  it.each(["null", "::::", ""])("refuses a null or malformed Origin: %j", (origin) => {
    expect(isSameSite(origin, headers({ host: "localhost:3000" }), undefined)).toBe(false);
  });
});
