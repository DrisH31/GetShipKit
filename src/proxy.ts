import { NextResponse } from "next/server";
import { clerkMiddleware } from "@clerk/nextjs/server";
import { isSameSite } from "@/lib/same-site";

// A first, optimistic gate: signed-out visitors to anything not listed here are
// sent to sign-in. It is NOT the access check. Every page and route checks for
// itself on the server (requireUser / requirePaidAccess in src/lib/entitlement.ts,
// auth() in route handlers, signatures in webhooks), so a path this list gets
// wrong never exposes data.
const PUBLIC_PATHS: RegExp[] = [
  /^\/$/,
  /^\/sign-in(\/.*)?$/,
  /^\/sign-up(\/.*)?$/,
  /^\/api\/webhook\/(polar|clerk)$/, // verified by their signatures
  /^\/api\/newsletter$/,
  /^\/legal\/(terms|privacy)$/,
  /^\/api\/health$/,
];
const isPublic = (pathname: string) => PUBLIC_PATHS.some((re) => re.test(pathname));

// Webhooks come from other servers and carry their own signature.
const isWebhook = (pathname: string) => pathname.startsWith("/api/webhook/");

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export default clerkMiddleware(async (auth, req) => {
  // Refuse state-changing API calls sent from another site (CSRF), on top of
  // Clerk's SameSite cookies.
  if (UNSAFE_METHODS.has(req.method) && req.nextUrl.pathname.startsWith("/api/") && !isWebhook(req.nextUrl.pathname)) {
    const origin = req.headers.get("origin");
    if (origin !== null && !isSameSite(origin, req.headers)) {
      return NextResponse.json({ error: "Cross-site request refused" }, { status: 403 });
    }
  }

  if (!isPublic(req.nextUrl.pathname)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
