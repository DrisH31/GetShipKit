import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getPolar } from '@/lib/polar';
import { saveSubscription } from '@/lib/polar-sync';
import { createAdminSupabaseClient } from '@/lib/supabase-admin';

// Cancel the signed-in user's subscription at the end of the current period.
// The local row only changes after Polar confirms, so the app never shows
// "cancelled" while Polar keeps charging the customer.
export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createAdminSupabaseClient();

    const { data: subscription, error: subError } = await adminClient
      .from('subscriptions')
      .select('id, current_period_end, billing_period')
      .eq('user_id', userId)
      .neq('billing_period', 'one_time')
      .in('status', ['active', 'trial'])
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subError) {
      console.error("Error finding active subscription:", subError);
      return NextResponse.json({ error: "Failed to find active subscription" }, { status: 500 });
    }
    if (!subscription) {
      return NextResponse.json({ error: "No active subscription found" }, { status: 404 });
    }

    // The row's id is the Polar subscription id (the webhook stores it that way).
    let updated;
    try {
      updated = await getPolar().subscriptions.update(subscription.id, { cancel_at_period_end: true });
    } catch (polarError) {
      console.error("Polar refused the cancellation:", polarError);
      return NextResponse.json(
        { error: "Could not cancel the subscription with the payment provider. Please try again or use the billing portal." },
        { status: 502 }
      );
    }

    // Store Polar's answer the same way the webhook does (with its modified_at),
    // so an older event delivered late cannot flip the row back to "active".
    try {
      await saveSubscription(updated);
    } catch (saveError) {
      // Polar has it; the subscription.updated webhook will bring the row in line.
      console.error("Cancelled in Polar but the local update failed:", saveError);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription has been cancelled. You will have access until the end of your current billing period.",
      subscription: {
        id: subscription.id,
        status: 'ending',
        current_period_end: updated.current_period_end,
      },
    });
  } catch (error) {
    console.error("Error in cancel subscription route:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
