# GetShipKit — design note

The decisions behind the landing page, navbar and footer, in the order they were
made (the web-design method: product → experience → one emotion → sensory → test).
Change a decision here before changing it in code.

## 1. Product

**Core.** A Next.js SaaS starter wired to services you don't run: Clerk for
sign-in, Supabase for the database, Polar for payments. Free, MIT.

**Product truth (what it does today, nothing more).** Sign-up and sign-in;
subscriptions and one-time purchases through Polar; a dashboard with billing,
customer portal and feedback; paid pages checked on the server; a database whose
functions visitors can't call; unit tests and CI. It does **not** include a blog,
an admin panel, teams, multiple languages or email of its own.

**One target user.** A solo developer who knows Next.js and wants to charge for a
web product this month, and would rather pay a few services than run a server.
They are reading the page on GitHub's link, deciding in a minute whether this is
the starter to clone.

**Not for.** People who want to own the server and the data → OpenShipKit (linked
in the page and the footer). Teams who need organisations, roles or SSO.

**What they want to know, in order.** What is it? → What's wired for me? → Will
payments and data be handled *correctly*? → How long until it runs? → What will it
cost? → Should I use the self-hosted one instead?

**Transformation.** From "weeks wiring auth, a database and payments, and still
unsure the money path is right" to "cloned, keys pasted, first sandbox payment
landing in my own table today". Gap type: *capability with risk*. The blocking
force is **doubt**: a free template's payment and security code is exactly what
they fear is wrong (and in 1.x, it was). The real competitor is wiring it
themselves from three vendors' docs, or a paid boilerplate.

**Insight / big idea.** The scary part of a SaaS starter isn't the UI; it's money
and data. So the page leads with the parts that must be right and shows *how* they
are right: **"The dangerous parts, already right."**

## 2. Experience — every section is a question

**The owner's direction (3 Nov 2026): follow OpenShipKit's landing page, in
GetShipKit's colours.** The two are siblings, so the same layout, components and
rhythm make them read as one family, and each tells its own story. Sections
OpenShipKit has that GetShipKit doesn't need (the MCP agent, deploy targets, AI
setup, the blog) are replaced by GetShipKit's own: the payment path and the
sibling comparison. The section labels above each heading are kept to match
OpenShipKit (a deliberate exception to PAGE-15's "no eyebrow").

| # | Section (component) | The visitor's question | One thing to see or use |
|---|---|---|---|
| 1 | Hero (`landing/hero.tsx`) | What is this? | "Your SaaS, with payments and data already right": "Get the code", the clone command, the billing screen with sample data |
| 2 | Built on (`landing/logos.tsx`) | What's it made of? | The stack's marks |
| 3 | What runs where (`landing/stack.tsx`) | What do I have to run? | Your app, beside the three hosted services |
| 4 | What's in the box (`landing/features.tsx`) | What's wired for me? | Six cards, each with its product moment |
| 5 | How a payment becomes access (`landing/payments.tsx`) — **the peak** | Will a payment turn into access correctly? | The five-step path |
| 6 | From clone to first payment (`landing/steps.tsx`) | How long until it runs? | Three steps with their commands |
| 7 | Pricing (`landing/pricing.tsx`) | What will my customers see? | The sample plans, wired to checkout |
| 8 | Hosted or self-hosted (`landing/sibling.tsx`) | Should I use OpenShipKit instead? | A four-row comparison and one link |
| 9 | Questions (`landing/faq.tsx`) | The leftovers | Native `<details>`, in the HTML |
| 10 | The close (`landing/cta.tsx`) | Ready? | "Get the code" once more |

Proof (5) sits right after the fear is named (4's "Billing that can't be
faked"). Testimonials, "trusted by thousands", "24/7 support" and invented
numbers from 1.x were **removed**: there are no customers to quote.

## Bridge — the named emotion

> **A solo developer should feel *assured* when they see how a payment becomes access.**

Norman level: reflective (they're judging whether to trust it). Signature moment:
the payment path (section 5) rises step by step as it scrolls in (`.reveal`);
the last step, "Paid page", lands with the accent. Everything else is still.

Competitor feel-inventory: paid boilerplates sell *speed* ("ship in days",
countdowns, hype); vendor docs feel *clinical*. Nobody owns *assured*.

## 3. Sensory

**Design system.** The house "Neutral" system, synced from the design-system
library (`src/styles/DESIGN_SYSTEM_VERSION`), the same one OpenShipKit uses. The
two siblings share bones and greys and differ only in accent, so they read as a
family.

**Colour (60-30-10).** True greys from the system; cards and panels as the second
tone; **teal** as the one action colour (the primary button, focus, the active
plan interval, the last step of the payment path, the mark). Teal because it reads
as *settled / safe*, which is the emotion, and it is GetShipKit's existing brand,
so nothing is lost. OpenShipKit's accent is vermilion ("go, yours"); the two
never meet on one page. In dark mode the button is a deeper teal (#0D8278, white text), with
the bright mint kept for text and focus only. Contrast is measured in `src/styles/brand.css`.

**Type.** Display: **Bricolage Grotesque** (slightly warm, confident without
hype; a grotesque with character for 22 px and up). Text: **Inter**, the system's
text face. Code: **Geist Mono**. Rejected: Space Grotesk (it's OpenShipKit's
display face: the siblings would be twins), Manrope (too neutral for a page that
has to feel sure of itself).

**Imagery.** The product itself, drawn in HTML: the real clone command, the real
payment path with the real route names, the real test output. No stock art, no
fake dashboards.

**Motion.** CSS only, from the design system's motion.css. The hero settles in
(`.arrive`, readable from the first frame); the payment path's steps and the
setup commands rise as they scroll in (`.reveal`); everything else is still.
Reduced motion or no support shows the finished state. framer-motion is gone
from the project.

## Open decisions (for whoever forks it)

- All landing copy lives in `src/config/content.ts`; plans and prices in
  `src/config/plans.ts`; links in `src/config/site.ts`. Replace them with your
  product's.
- The OpenShipKit cross-link shows only while `SITE.name` is "GetShipKit".

## Check results (3 Nov 2026)

| Check | Result |
|---|---|
| Accent contrast (WCAG) | light: white on teal 5.47, teal on page 4.89 · dark: white on #0D8278 4.69, button vs page 3.83, mint text 9.63 (brand.css) |
| `next build` with no environment variables | passes; `/` and `/legal/*` render per request |
| Lint · types · unit tests | 0 errors · clean · 48 passed |
| Landing text in the HTML (first byte) | every section's heading and the FAQ answers |
| 1440 px light and dark, 390 px | looked at section by section; no console errors except Clerk's network calls in the sandbox |
| Horizontal overflow at 390 px | none |
| Hydration | no mismatch in either scheme |

### Design review, round 1 (3 Nov 2026)

Two independent reviews of the running site at 1440 and 390 px, light and dark.

| Chair | Fit | Truth | Craft | Distinction | Verdict |
|---|---|---|---|---|---|
| user (the target developer) | 3 | 2 | 3 | 2 | FIX |
| rival (a competing designer) | 3 | 2 | 3 | 2 | FIX |

**Fixed:** setup step 1 claimed the app runs with no keys (it builds; running needs Clerk's);
the setup steps now count the real work (about ten values, a tunnel for Polar's webhook); the
headline leads with the big idea ("payments and data already right") instead of "no server";
"access only from signed webhooks" made exact (the sync route also reads Polar's API); each
payment step links its file and its test; the webhook log no longer repeats in the feature cards;
the showcase footer links GitHub releases instead of promising emails it can't send; sample plans
no longer promise teams or SSO; the pricing label says "What your customers see", with a sandbox
note; the header action is neutral (one teal primary on the first screen); dark mode uses a deeper
teal (#0D8278) instead of mint; no glow tinting the greys; headings no longer copied word for word
from OpenShipKit; clipped code shortened; a skip link; the preview hidden from screen readers;
Clerk's client off the landing page (265 → 194 KB gzipped); the scheme switch uses one view
transition and follows the OS; broken `#setup` anchors fixed; the hard-coded test count removed.

**Kept, by the owner's direction:** OpenShipKit's layout (the hero's eyebrow and checks row, the
"Built on" row, six feature cards: the reviewers asked to trim these), and the footer's OpenShipKit
link and wordmark (asked for by the owner).

**Not yet run:** `review.py` from the design-system library, LCP/INP/CLS on a deployed build, a
real Polar sandbox checkout, Firefox (no scroll-driven reveals; content shows), 640–1023 px.
