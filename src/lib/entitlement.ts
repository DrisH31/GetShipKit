import "server-only";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";

const ACCESS_STATUSES = ["active", "ending", "trial", "past_due"];

/** Does this user have paid access right now? Read on the server, every request. */
export async function hasPaidAccess(userId: string): Promise<boolean> {
  const { data, error } = await createAdminSupabaseClient()
    .from("subscriptions")
    .select("current_period_end")
    .eq("user_id", userId)
    .in("status", ACCESS_STATUSES);
  if (error) throw new Error(`entitlement check failed: ${error.message}`);
  const now = Date.now();
  // No end date = a one-time ("lifetime") purchase.
  return (data ?? []).some((row) => !row.current_period_end || new Date(row.current_period_end).getTime() > now);
}

/** Signed in, or off to sign-in (coming back to `returnTo` afterwards). */
export async function requireUser(returnTo = "/dashboard"): Promise<string> {
  const { userId } = await auth();
  if (!userId) redirect(`/sign-in?redirect=${encodeURIComponent(returnTo)}`);
  return userId;
}

/**
 * The paywall. Call it at the top of every paid page or route, before any paid
 * data is read. A client-side check is only UI: anything sent to the browser
 * before a server check is already given away.
 */
export async function requirePaidAccess(): Promise<string> {
  const userId = await requireUser("/dashboard");
  if (!(await hasPaidAccess(userId))) redirect("/dashboard/billing");
  return userId;
}
