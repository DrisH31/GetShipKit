import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getPolar } from "@/lib/polar";
import { saveSubscription } from "@/lib/polar-sync";

// POST /api/subscription/sync — re-read the signed-in user's latest
// subscription from Polar and store it. The webhook normally keeps the row
// current; this is a manual refresh for when a webhook was missed.
export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminSupabaseClient();
  // Prefer a live subscription; fall back to the most recent one.
  const latest = (live: boolean) => {
    let query = supabase
      .from("subscriptions")
      .select("id, status")
      .eq("user_id", userId)
      .neq("billing_period", "one_time");
    if (live) query = query.in("status", ["active", "ending", "trial", "past_due", "paused", "unpaid"]);
    return query.order("updated_at", { ascending: false }).limit(1).maybeSingle();
  };
  let { data: row, error } = await latest(true);
  if (!error && !row) ({ data: row, error } = await latest(false));

  if (error) {
    console.error("[sync] could not read subscription:", error);
    return NextResponse.json({ error: "Failed to read subscription" }, { status: 500 });
  }
  if (!row) {
    return NextResponse.json({ message: "No subscription to sync" }, { status: 404 });
  }

  let polarSubscription;
  try {
    polarSubscription = await getPolar().subscriptions.get(row.id);
  } catch (polarError) {
    console.error("[sync] Polar lookup failed:", polarError);
    return NextResponse.json({ error: "Could not reach the payment provider" }, { status: 502 });
  }

  // The row is this user's, but make sure Polar agrees before writing.
  if (polarSubscription.customer.external_id && polarSubscription.customer.external_id !== userId) {
    console.error(`[sync] subscription ${row.id} belongs to another Polar customer`);
    return NextResponse.json({ error: "Subscription mismatch" }, { status: 409 });
  }

  await saveSubscription(polarSubscription);

  const { data: updated } = await supabase
    .from("subscriptions")
    .select("status, cancel_at_period_end, current_period_end")
    .eq("id", row.id)
    .eq("user_id", userId)
    .maybeSingle();

  return NextResponse.json({
    message: "Subscription synced",
    previous_status: row.status,
    new_status: updated?.status ?? row.status,
    cancel_at_period_end: updated?.cancel_at_period_end ?? null,
    current_period_end: updated?.current_period_end ?? null,
  });
}
