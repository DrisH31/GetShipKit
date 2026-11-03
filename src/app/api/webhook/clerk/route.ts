import { NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getPolar } from "@/lib/polar";

// Clerk → profiles. Keeps each user's email and name in Supabase.
// Signing secret: CLERK_WEBHOOK_SIGNING_SECRET (Clerk's name) or the older
// CLERK_WEBHOOK_SECRET.
export async function POST(req: NextRequest) {
  let evt;
  try {
    evt = await verifyWebhook(req, {
      signingSecret: process.env.CLERK_WEBHOOK_SIGNING_SECRET ?? process.env.CLERK_WEBHOOK_SECRET,
    });
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Signature verified: write with the server-only client.
  const supabase = createAdminSupabaseClient();

  if (evt.type === "user.created" || evt.type === "user.updated") {
    const { id, email_addresses, primary_email_address_id, first_name, last_name } = evt.data;
    const email =
      email_addresses.find((address) => address.id === primary_email_address_id)?.email_address ?? null;

    const { error } = await supabase.from("profiles").upsert(
      {
        user_id: id,
        email,
        first_name: first_name ?? null,
        last_name: last_name ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );
    if (error) {
      console.error("[clerk] profile upsert failed:", error);
      return NextResponse.json({ error: "Database error" }, { status: 500 }); // Clerk retries
    }

    // Keep the Polar customer's email in step with the verified Clerk email, so
    // a later checkout still matches (src/lib/polar-user.ts requires it).
    const primary = email_addresses.find((address) => address.id === primary_email_address_id);
    if (evt.type === "user.updated" && primary?.verification?.status === "verified" && process.env.POLAR_ACCESS_TOKEN) {
      try {
        await getPolar().customers.updateExternal(id, { email: primary.email_address });
      } catch (polarError) {
        // 404: this user has never bought anything, so there is nothing to update.
        const status = (polarError as { statusCode?: number })?.statusCode;
        if (status !== 404) {
          console.error("[clerk] could not update the Polar customer's email:", polarError);
          return NextResponse.json({ error: "Billing error" }, { status: 500 }); // Clerk retries
        }
      }
    }
  }

  if (evt.type === "user.deleted" && evt.data.id) {
    const userId = evt.data.id;

    // Stop billing first: end every live subscription at Polar now. If this
    // fails, answer 500 so Clerk retries rather than deleting the rows that
    // would let us find the subscriptions again.
    const { data: live, error: liveError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", userId)
      .neq("billing_period", "one_time")
      .in("status", ["active", "ending", "trial", "past_due", "paused", "unpaid"]);
    if (liveError) {
      console.error("[clerk] could not list subscriptions:", liveError);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
    for (const { id } of live ?? []) {
      try {
        await getPolar().subscriptions.revoke(id);
      } catch (error) {
        // Already ended at Polar is fine; anything else is retried.
        const status = (error as { statusCode?: number; status?: number })?.statusCode ?? (error as { status?: number })?.status;
        if (status !== 403 && status !== 404) {
          console.error(`[clerk] could not revoke Polar subscription ${id}:`, error);
          return NextResponse.json({ error: "Billing error" }, { status: 500 });
        }
      }
    }

    // Remove the person's data. Polar keeps its own billing records.
    for (const table of ["feedback", "subscriptions", "profiles"] as const) {
      const { error } = await supabase.from(table).delete().eq("user_id", userId);
      if (error) {
        console.error(`[clerk] delete from ${table} failed:`, error);
        return NextResponse.json({ error: "Database error" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
