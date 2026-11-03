import "server-only";
import { createPolar } from "@polar-sh/sdk/2026-10";

// The Polar API version is pinned by the import path above. When you move to a
// newer version, change the path here AND set the same version on your webhook
// endpoint in the Polar dashboard, then re-run the sandbox checklist (README).

export const polarEnvironment: "production" | "sandbox" =
  process.env.POLAR_MODE === "production" ? "production" : "sandbox";

export function polarAccessToken(): string {
  const token = process.env.POLAR_ACCESS_TOKEN;
  if (!token) throw new Error("POLAR_ACCESS_TOKEN is not set");
  return token;
}

export function getPolar() {
  return createPolar({ accessToken: polarAccessToken(), environment: polarEnvironment });
}
