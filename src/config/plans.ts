// The plans your customers see: names come from NEXT_PUBLIC_PRODUCTS (your Polar
// products), prices and features from here. Keep these prices equal to the ones
// in Polar: Polar charges what Polar says, whatever this file shows.
// These are EXAMPLES. Replace them with your own product's plans.
import { PRODUCT_IDS } from "./productIds";

export type Plan = {
  key: "starter" | "pro" | "enterprise";
  name: string;
  monthly: number; // whole currency units
  annual: number;
  features: string[];
  recommended?: boolean;
};

export const CURRENCY = "USD";

export const PLANS: Plan[] = [
  {
    key: "starter",
    name: PRODUCT_IDS.starter.displayName,
    monthly: 29,
    annual: 290,
    features: ["5 projects", "10,000 requests a month", "Email support"],
  },
  {
    key: "pro",
    name: PRODUCT_IDS.pro.displayName,
    monthly: 89,
    annual: 890,
    features: ["50 projects", "1 million requests a month", "Priority email support", "API access"],
    recommended: true,
  },
  {
    key: "enterprise",
    name: PRODUCT_IDS.enterprise.displayName,
    monthly: 199,
    annual: 1990,
    features: ["Unlimited projects", "Custom limits", "Invoices and a contract", "A named contact"],
  },
];

export const ONE_TIME = {
  key: PRODUCT_IDS.oneTime,
  name: PRODUCT_IDS.displayNames.one_time_payment,
  price: 129,
  features: ["Every feature", "Updates for life", "No recurring fees"],
};

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 }).format(amount);
}
