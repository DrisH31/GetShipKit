# Changelog

## 2.0.0 — 2026-11-03

**Security** (see the [advisory](README.md#-security-advisory-november-2026))
- The template's database functions are no longer callable with the public Supabase key, and
  functions created later by `postgres` no longer get that access by default. The patch lists any
  of your own objects that visitors can still reach.
- Profiles are written only by the server; users read only their own.
- Payments are tied to the signed-in Clerk user (or, for an unbound older customer, the user's
  verified email); never matched by a partial or unverified email.
- The paywall now runs on the server (`requirePaidAccess()`); `SubscriptionGuard`, which only ran
  in the browser and shipped paid links in the JavaScript bundle, is removed.
- `/portal` checks that the Polar customer belongs to the signed-in user.
- Deleting a Clerk user ends their Polar subscriptions.
- Newsletter sign-up goes through the server and no longer reveals who is subscribed.
- Sign-in/up `?redirect=` only accepts paths on this site, resolved like a browser does
  (was an open redirect).
- State-changing API calls from other sites are refused.

**Payments**
- Polar SDK 1.0 with the API version pinned to 2026-10; works with new-format webhook secrets.
- Webhook rewritten (880 → 30 lines plus a shared module): one row per Polar subscription,
  out-of-order and repeated events handled, revoked subscriptions lose access.
- One-time purchases granted on `order.paid` (was `order.created`, before payment) and removed on a
  full refund (purchases made with 1.x excepted; see Upgrading in the README).
- Cancel calls Polar first and only then marks the subscription as ending.

**Design**
- The landing page is rebuilt on the house design system (the same one OpenShipKit uses), with
  GetShipKit's teal accent and its own display face: light and dark (it was forced dark),
  following the visitor's setting. It follows OpenShipKit's layout: hero with a live billing
  preview, "what runs where", feature cards with product moments, the payment path, setup steps,
  plans, a comparison with OpenShipKit, FAQ and a closing band. Decisions in `DESIGN.md`.
- Every section now renders on the server. Before, 7 of 8 were `ssr: false`, so search engines,
  link previews and visitors without JavaScript got a nearly empty page.
- All landing copy in `src/config/content.ts`; plans and prices in `src/config/plans.ts`, shared by
  the landing and billing pages (they were hardcoded in four card components).
- The new footer has a newsletter card, link columns, the wordmark and a link to OpenShipKit for
  anyone who wants to self-host; OpenShipKit's footer links back. Both only on the showcase.
- Removed invented content: testimonials, "join thousands of developers", "24/7 support", a
  struck-through "original" price and "Most Popular".
- Ten dead `#` links fixed or hidden; Terms and Privacy pages added as clearly marked outlines.
- framer-motion and react-syntax-highlighter removed (CSS motion from the design system instead).
- Clerk's client code loads only on the dashboard and sign-in pages: the landing page ships about
  70 KB (gzipped) less JavaScript; its signed-in state is decided on the server.
- Accessible by default: a skip link, the decorative billing preview hidden from screen readers,
  and a "Dark mode" toggle that swaps schemes in one view transition and follows the system until
  someone chooses.
- Every claim checked against the code after two independent design reviews: the setup steps say
  what running it really needs, the payment path links each step to its file and test, and the
  sample plans promise nothing the kit lacks.

**Platform**
- Next.js 16.4, React 19.3, TypeScript 6, ESLint 9 flat config, Node.js 24.
- Tailwind CSS 4 with the theme in CSS; DaisyUI removed (it was installed but unused).
  The landing page renders identically to 1.x.
- Clerk 7; Clerk webhook verified with Clerk's `verifyWebhook`.
- Supabase's new publishable/secret keys supported (legacy keys still work) and the Clerk
  third-party auth integration used for every signed-in query.
- Unit tests (Vitest) for the money and security paths, and CI on every push: types, lint, tests
  and a build with no environment variables.
- `/api/health`: 200 when the database answers, 503 when it doesn't.
- Clerk 7's deprecated `createRouteMatcher` replaced; the billing page checks sign-in on the server.
- `next build` succeeds with no environment variables (for CI; a deployed build needs the
  `NEXT_PUBLIC_*` values at build time).

**Fixes**
- The feedback form never saved (it used an unauthenticated client).
- The Clerk webhook's database writes were silently blocked.
- Lifetime purchases showed as expired.
- Removed the broken `fix-user-id` route, `.env.local` from git, and files pointing at a retired domain.

## 1.0.0 — 2025-05

First release.
