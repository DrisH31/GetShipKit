import { Webhooks } from "@polar-sh/nextjs";
import { saveOneTimeOrder, saveSubscription } from "@/lib/polar-sync";

// Polar → your database. This route is the ONLY place access is granted or
// removed: never from the checkout redirect, the client, or a query string.
// @polar-sh/nextjs verifies the signature (old- and new-format webhook secrets)
// before any handler runs; a handler that throws makes Polar retry.

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",

  // Every subscription event carries the full, current subscription.
  onSubscriptionCreated: async ({ data }) => saveSubscription(data),
  onSubscriptionUpdated: async ({ data }) => saveSubscription(data),
  onSubscriptionActive: async ({ data }) => saveSubscription(data),
  onSubscriptionCanceled: async ({ data }) => saveSubscription(data),
  onSubscriptionUncanceled: async ({ data }) => saveSubscription(data),
  onSubscriptionRevoked: async ({ data }) => saveSubscription(data),
  onSubscriptionPastDue: async ({ data }) => saveSubscription(data),
  onSubscriptionPaused: async ({ data }) => saveSubscription(data),
  onSubscriptionResumed: async ({ data }) => saveSubscription(data),
  onSubscriptionCycled: async ({ data }) => saveSubscription(data),

  // Grant one-time purchases only once they are paid (order.created fires earlier).
  onOrderPaid: async ({ data }) => saveOneTimeOrder(data, "active"),
  // A full refund removes access; a partial refund keeps it.
  onOrderRefunded: async ({ data }) => {
    if (data.status === "refunded") await saveOneTimeOrder(data, "canceled");
  },
});
