import "server-only";

// What paying customers get on /dashboard. Server-only: these values are sent
// only in pages that have already checked paid access (src/lib/entitlement.ts),
// never in a JavaScript bundle a free visitor can download.
// Set them in your environment, or edit the defaults.

export type PaidLinks = {
  repository: string;
  quickStart: string;
  documentation: string;
  social: string;
  website: string;
};

export function paidLinks(): PaidLinks {
  return {
    repository: process.env.PAID_REPOSITORY_URL ?? "",
    quickStart: process.env.PAID_QUICK_START_URL ?? "#",
    documentation: process.env.PAID_DOCS_URL ?? "#",
    social: process.env.SOCIAL_URL ?? "#",
    website: process.env.WEBSITE_URL ?? "#",
  };
}
