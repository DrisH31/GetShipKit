// Your Terms and Privacy Policy. These are OUTLINES, not legal text: replace
// each section with your own wording before launch (legal-page-prompts.md has
// prompts for drafting them; have a professional review the result).
// While `ready` is false the page says it is a draft and asks search engines
// not to index it.

export type LegalPage = {
  title: string;
  ready: boolean;
  updated: string; // e.g. "2026-11-03"
  sections: { heading: string; body: string }[];
};

export const LEGAL_PAGES: Record<"terms" | "privacy", LegalPage> = {
  terms: {
    title: "Terms of Service",
    ready: false,
    updated: "",
    sections: [
      { heading: "Who we are", body: "[Your company name, address and contact email.]" },
      { heading: "The service", body: "[What your product does and who may use it.]" },
      { heading: "Accounts", body: "[Account rules, acceptable use, and when you may suspend an account.]" },
      { heading: "Payments and refunds", body: "[Plans, billing periods, cancellation and your refund policy. Payments are processed by Polar as merchant of record; link to Polar's buyer terms.]" },
      { heading: "Liability", body: "[Warranty disclaimer and limitation of liability.]" },
      { heading: "Changes and governing law", body: "[How you announce changes, and which law and courts apply.]" },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    ready: false,
    updated: "",
    sections: [
      { heading: "Who is responsible", body: "[Your company name and contact email for privacy questions.]" },
      { heading: "What we collect", body: "[Account details (name, email) via Clerk; your product data in Supabase; billing details via Polar; newsletter addresses.]" },
      { heading: "Why we use it", body: "[The purpose and legal basis for each kind of data.]" },
      { heading: "Who processes it for us", body: "[List your processors: Clerk (authentication), Supabase (database), Polar (payments), your host, and any others.]" },
      { heading: "How long we keep it", body: "[Retention periods; what happens when an account is deleted.]" },
      { heading: "Your rights", body: "[Access, correction, deletion, export, objection; how to make a request.]" },
    ],
  },
};
