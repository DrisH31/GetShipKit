/**
 * Is this Origin header our own site? When NEXT_PUBLIC_SITE_URL is set
 * (recommended in production) the origin must equal it exactly. Otherwise it is
 * compared with the public host: the first
 * X-Forwarded-Host if a reverse proxy sent one, else Host. A proxy that rewrites
 * Host must pass X-Forwarded-Host, or set NEXT_PUBLIC_SITE_URL.
 * "null" and malformed origins are refused.
 */
export function isSameSite(
  origin: string,
  headers: Headers,
  siteUrl: string | undefined = process.env.NEXT_PUBLIC_SITE_URL
): boolean {
  let parsed: URL;
  try {
    parsed = new URL(origin);
  } catch {
    return false;
  }
  if (siteUrl) {
    try {
      // Configured: scheme and host must both match it exactly.
      return new URL(siteUrl).origin === parsed.origin;
    } catch {
      // A malformed NEXT_PUBLIC_SITE_URL: fall back to the request's own host.
    }
  }
  const forwarded = headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const host = forwarded || headers.get("host");
  if (!host || host !== parsed.host) return false;
  // When the proxy says which scheme it served, require the same one.
  const proto = headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  return !proto || `${proto}:` === parsed.protocol;
}

