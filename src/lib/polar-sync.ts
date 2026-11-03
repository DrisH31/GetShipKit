import "server-only";
import type { models } from "@polar-sh/sdk/2026-10";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { resolvePolarUserId } from "@/lib/polar-user";

// Writes Polar's state into the subscriptions table. Used by the webhook (the
// source of truth) and by /api/subscription/sync (a manual refresh).
//
// - One row per Polar subscription (row id = Polar subscription id), and one
//   row per one-time order (row id = Polar order id).
// - Polar may deliver events out of order and retries failures. Each row keeps
//   Polar's modified_at; an event older than the stored one is ignored.
// - Database errors throw, so the webhook answers 500 and Polar retries.

type Status =
  | "active" | "ending" | "canceled" | "incomplete" | "incomplete_expired"
  | "past_due" | "trial" | "paused" | "unpaid" | "pending" | "expired";

export function subscriptionStatus(sub: models.Subscription): Status {
  switch (sub.status) {
    case "active":
      return sub.cancel_at_period_end ? "ending" : "active";
    case "trialing":
      return sub.cancel_at_period_end ? "ending" : "trial";
    case "past_due":
    case "canceled":
    case "unpaid":
    case "incomplete":
    case "incomplete_expired":
    case "paused":
      return sub.status;
    default:
      // A status this code does not know yet: grant nothing.
      return "pending";
  }
}

export function billingPeriod(interval: string): string {
  if (interval === "month") return "monthly";
  if (interval === "year") return "annual";
  return interval;
}

type Row = {
  id: string;
  user_id: string;
  product_id: string | null;
  billing_period: string;
  status: Status;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  amount: number | null;
  currency: string | null;
  customer_id: string | null;
  polar_modified_at: string;
  updated_at: string;
};

/**
 * Insert the row, or update it only if this event is at least as new as the
 * one already stored. Each step is a single statement, so two deliveries
 * racing each other cannot interleave a read and a write.
 */
async function applyRow(row: Row) {
  const supabase = createAdminSupabaseClient();

  // subscriptions.user_id references profiles.user_id. A payment can arrive
  // before the Clerk webhook has created the profile, so make sure it exists.
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ user_id: row.user_id }, { onConflict: "user_id", ignoreDuplicates: true });
  if (profileError) throw new Error(`profile upsert failed: ${profileError.message}`);

  const { data: inserted, error: insertError } = await supabase
    .from("subscriptions")
    .upsert({ ...row, created_at: row.updated_at }, { onConflict: "id", ignoreDuplicates: true })
    .select("id");
  if (insertError) throw new Error(`subscription insert failed: ${insertError.message}`);
  if (inserted && inserted.length > 0) return;

  // The row exists. Never move it to another user; only refresh its state.
  const { user_id, id, ...changes } = row;
  const { error: updateError } = await supabase
    .from("subscriptions")
    .update(changes)
    .eq("id", id)
    .eq("user_id", user_id)
    .or(`polar_modified_at.is.null,polar_modified_at.lte."${row.polar_modified_at}"`);
  if (updateError) throw new Error(`subscription update failed: ${updateError.message}`);
}

/**
 * Who owns this Polar object? A row we already stored keeps its owner: its
 * events are applied to that user and never re-matched (an email can change,
 * and must not move a paying customer's access to someone else). Only an
 * object seen for the first time is matched, by resolvePolarUserId().
 */
async function ownerOf(id: string, data: models.Subscription | models.Order): Promise<string | null> {
  const supabase = createAdminSupabaseClient();
  const { data: existing, error } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`subscription lookup failed: ${error.message}`);
  if (existing) return existing.user_id as string;
  return resolvePolarUserId(data);
}

export async function saveSubscription(sub: models.Subscription) {
  const userId = await ownerOf(sub.id, sub);
  if (!userId) {
    // Acknowledge rather than retry forever, but leave a loud trail.
    console.error(`[polar] subscription ${sub.id}: no matching user; access not granted`);
    return;
  }

  const ended = sub.status === "canceled" && sub.ended_at;
  await applyRow({
    id: sub.id,
    user_id: userId,
    product_id: sub.product_id,
    billing_period: billingPeriod(sub.recurring_interval),
    status: subscriptionStatus(sub),
    current_period_start: sub.current_period_start,
    current_period_end: ended ? sub.ended_at : sub.current_period_end,
    cancel_at_period_end: sub.cancel_at_period_end,
    amount: sub.amount,
    currency: sub.currency,
    customer_id: sub.customer_id,
    polar_modified_at: sub.modified_at ?? sub.created_at,
    updated_at: new Date().toISOString(),
  });
}

/** One-time purchases ("lifetime" products). Subscriptions are handled above. */
export async function saveOneTimeOrder(order: models.Order, status: "active" | "canceled") {
  if (!order.product || order.product.is_recurring || order.subscription_id) return;

  const userId = await ownerOf(order.id, order);
  if (!userId) {
    console.error(`[polar] order ${order.id}: no matching user; access not granted`);
    return;
  }

  await applyRow({
    id: order.id,
    user_id: userId,
    product_id: order.product_id,
    billing_period: "one_time",
    status,
    current_period_start: order.created_at,
    current_period_end: null, // never expires; access ends only on refund
    cancel_at_period_end: false,
    amount: order.net_amount,
    currency: order.currency,
    customer_id: order.customer_id,
    polar_modified_at: order.modified_at ?? order.created_at,
    updated_at: new Date().toISOString(),
  });
}

