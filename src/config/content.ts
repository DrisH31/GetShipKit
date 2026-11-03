// Every word on the landing page, in one place. When you fork GetShipKit, replace
// this file with your own product's copy (and src/config/plans.ts, src/config/site.ts).
// Only write what your product does today: no invented users, numbers or quotes.
import { SITE } from "./site";

export const CONTENT = {
  meta: {
    siteName: SITE.name,
    title: "GetShipKit: a Next.js SaaS starter on Clerk, Supabase and Polar",
    description:
      "Sign-in, a database, payments and a dashboard, wired together on hosted services, with the payment and data parts already right. Free and MIT.",
  },

  hero: {
    eyebrow: "Free Next.js SaaS starter",
    // A comma splits the claim into two lines; the second half is the promise.
    title: "Your SaaS, with payments and data already right",
    subtitle:
      "Next.js with Clerk sign-in, a Supabase database and Polar payments, wired together, tested, and checked on the server where it counts.",
    highlights: ["Access only from Polar, never the redirect", "Paywall checked on the server", "Free and MIT licensed"],
    primary: { label: "Get the code", href: SITE.repo },
    secondary: { label: "Read the setup", href: `${SITE.repo}#setup-service-by-service` },
    command: `git clone ${SITE.repo}.git my-saas`,
  },

  logos: {
    title: "Built on",
    items: ["Next.js", "React", "Clerk", "Supabase", "Polar", "Tailwind CSS"],
  },

  stack: {
    eyebrow: "What runs where",
    title: "Every layer is a service you don't have to run",
    lead: "Your app is the only thing you deploy. Sign-in, the database and payments are hosted, and each one sits behind a single small module in the code.",
    app: {
      name: "Your app",
      tech: "Next.js 16 · React 19",
      text: "The landing page, the dashboard and the API. Deploy it to Vercel or any Node.js host.",
      hosts: "Vercel · any Node.js host",
    },
    services: [
      { name: "Sign-in", tech: "Clerk", text: "Sign-up, social logins and two-factor. Clerk sends the sign-in emails.", env: "CLERK_SECRET_KEY" },
      { name: "Your data", tech: "Supabase · Postgres", text: "Row-level security keyed to the Clerk user; visitors can't call its functions.", env: "SUPABASE_SECRET_KEY" },
      { name: "Payments", tech: "Polar", text: "Checkout, tax and receipts as merchant of record, plus a customer portal.", env: "POLAR_ACCESS_TOKEN" },
    ],
    absent: ["No server to patch", "No database server to run", "No tracking script"],
  },

  features: {
    eyebrow: "What's wired",
    title: "Six parts you'd otherwise wire yourself",
    lead: "Each one already talks to the others, reads plainly and is yours to change. Keep what you need, delete what you don't.",
    items: [
      { icon: "sign-in", title: "Sign-in that reaches your data", text: "Clerk's sign-in, with the user's id carried into every Supabase query, so row-level security knows who is asking." },
      { icon: "billing", title: "Billing that can't be faked", text: "Subscriptions and one-time purchases through Polar. Access comes only from Polar's signed webhook or its API, never from a redirect." },
      { icon: "paywall", title: "A paywall on the server", text: "Paid pages call requirePaidAccess() before anything paid is sent, so nothing leaks through a JavaScript bundle." },
      { icon: "data", title: "Your data, closed by default", text: "Each user reads only their own rows, and new database functions start with no visitor access." },
      { icon: "dashboard", title: "A dashboard to start from", text: "Billing, the Polar customer portal and a feedback form, ready for your product's own pages." },
      { icon: "checks", title: "Checked on every push", text: "Unit tests for the money and security paths, type checks, lint and a build with no secrets, in CI." },
    ],
  },

  payments: {
    eyebrow: "How a payment becomes access",
    title: "Only Polar can grant access",
    lead: "The redirect after checkout grants nothing. Access comes from Polar's signed webhook (or a server-side read of Polar's API when you sync), lands on the provable buyer, and a late event can't undo a newer one.",
    // Each step names the file that does it and, where there is one, the test that proves it.
    steps: [
      { title: "Checkout", detail: "/api/checkout", text: "Ties the purchase to the signed-in user.", file: "src/app/api/checkout/route.ts", test: null },
      { title: "Polar", detail: "merchant of record", text: "Takes the payment and the tax.", file: null, test: null },
      { title: "Signed webhook", detail: "/api/webhook/polar", text: "Checks Polar's signature, then who the buyer provably is.", file: "src/lib/polar-user.ts", test: "polar-user.test.ts" },
      { title: "Your database", detail: "subscriptions", text: "One row per purchase; a late event can't undo a newer one.", file: "src/lib/polar-sync.ts", test: "polar-status.test.ts" },
      { title: "Paid page", detail: "requirePaidAccess()", text: "Reads that row on the server, every request.", file: "src/lib/entitlement.ts", test: null },
    ],
    link: { label: "Read the security advisory", href: `${SITE.repo}#-security-advisory-november-2026` },
  },

  setup: {
    eyebrow: "From clone to first payment",
    title: "Three steps to your first test payment",
    steps: [
      {
        title: "Clone and install",
        text: "It installs and builds with no keys at all, so you can read the code first. To run it, it needs your Clerk keys (step 2).",
        panel: "terminal",
        lines: [`git clone ${SITE.repo}.git my-saas`, "cd my-saas && npm install", "cp .env.example .env.local"],
      },
      {
        title: "Fill in three services",
        text: "About ten values from Clerk, Supabase and Polar's sandbox go into .env.local, and the schema into Supabase's SQL editor. Then npm run dev.",
        panel: "env file",
        lines: [
          "CLERK_SECRET_KEY=sk_test_…",
          "SUPABASE_SECRET_KEY=sb_secret_…",
          "POLAR_ACCESS_TOKEN=polar_oat_…",
          "POLAR_WEBHOOK_SECRET=whsec_…",
          "# …and six more: see .env.example",
        ],
      },
      {
        title: "Buy your own plan",
        text: "Point Polar's sandbox webhook at a tunnel to your machine (ngrok, for example), buy with a test card, and watch the webhook grant access.",
        panel: "polar webhook",
        lines: ["subscription.created  → signature verified", "subscription.active   → Pro, active"],
      },
    ],
  },

  plans: {
    eyebrow: "What your customers see",
    title: "Plans, wired to checkout",
    lead: "GetShipKit itself is free. These are sample plans for your product, sold through Polar: set your own names, prices and limits in one file.",
    note: "Prices in USD. Sample plans: edit them in src/config/plans.ts.",
    sandboxNote: "These buttons open Polar's sandbox: pay with a test card, nothing is charged.",
  },

  sibling: {
    eyebrow: "Hosted or self-hosted",
    title: "Rather own the server?",
    lead: "OpenShipKit is GetShipKit's sibling: the same idea, with sign-in and your users' data in your own Postgres, on a server you run.",
    rows: [
      { label: "You run", get: "Nothing", open: "One server with Postgres" },
      { label: "Sign-in", get: "Clerk (hosted)", open: "Better Auth, inside the app" },
      { label: "Database", get: "Supabase (hosted)", open: "Your own Postgres 18" },
      { label: "Pick it if", get: "You'd rather not run a server", open: "You want your data in your own hands" },
    ],
  },

  faq: {
    title: "Before you clone it",
    aside: "Not answered here? The README covers setup, every variable and each service.",
    items: [
      {
        question: "Is GetShipKit really free?",
        answer: "Yes. It's MIT licensed: use it for personal or commercial work, change it, and sell what you build. Keep the copyright notice in the code.",
      },
      {
        question: "What do I pay for to run it?",
        answer: "Whatever the services charge you. Clerk and Supabase have free tiers; Polar charges a fee per sale. Host it on Vercel or any Node.js host.",
      },
      {
        question: "Why Polar instead of Stripe?",
        answer: "Polar is the merchant of record, so it collects and pays sales tax and VAT for you. Using Stripe means rewriting checkout and the webhook.",
      },
      {
        question: "Do I need to run a server?",
        answer: "No. Sign-in and the database are hosted. If you'd rather run everything yourself, use OpenShipKit.",
      },
      {
        question: "Is my users' data safe?",
        answer: "Visitors can't call database functions, each user reads only their own rows, and paid pages are checked on the server. The security advisory in the README explains what changed in 2.0.",
      },
      {
        question: "Can I change how it looks?",
        answer: "Yes. It uses a token-based design system: change the accent in src/styles/brand.css and the words in src/config/content.ts.",
      },
    ],
  },

  cta: {
    title: "Payments and data, already right. Yours to build on.",
    subtitle: "Clone it, fill in three services, and take your first test payment. Free and MIT licensed.",
    primary: { label: "Get the code", href: SITE.repo },
    secondary: { label: "Read the setup", href: `${SITE.repo}#setup-service-by-service` },
  },

  footer: {
    tagline: "The SaaS starter on hosted services: Clerk, Supabase and Polar.",
  },
} as const;
