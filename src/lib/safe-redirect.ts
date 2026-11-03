const BASE = "http://same-origin.invalid";

/**
 * Only allow redirects to a page on this site. The value is resolved the way a
 * browser would (which drops tabs and newlines, so "/\t/evil.example" becomes
 * "//evil.example"); anything that lands on another origin is refused.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = "/dashboard/billing"): string {
  if (!value || !value.startsWith("/")) return fallback;
  try {
    const url = new URL(value, BASE);
    if (url.origin !== BASE) return fallback;
    const path = url.pathname + url.search + url.hash;
    // A path like "//evil.example" (e.g. from "/.//evil.example") would be read
    // by the browser as another site.
    if (path.startsWith("//") || path.startsWith("/\\")) return fallback;
    return path;
  } catch {
    return fallback;
  }
}
