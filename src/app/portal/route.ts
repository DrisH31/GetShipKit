import { CustomerPortal } from "@polar-sh/nextjs";
import { auth } from "@clerk/nextjs/server";
import { createAdminSupabaseClient } from "@/lib/supabase-admin";
import { getPolar, polarEnvironment } from "@/lib/polar";
import { verifiedClerkEmail } from "@/lib/polar-user";

// GET /portal → Polar's customer portal for the signed-in user (invoices,
// payment method, cancel / resume). Signed-in only (src/proxy.ts).
export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN ?? "",
  environment: polarEnvironment,
  getCustomerId: async () => {
    const { userId } = await auth();
    if (!userId) return "";

    // Any status: a former customer can still reach their invoices.
    const { data } = await createAdminSupabaseClient()
      .from("subscriptions")
      .select("customer_id")
      .eq("user_id", userId)
      .not("customer_id", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (!data?.customer_id) return "";

    // Open the portal only if Polar agrees this customer is this user: bound to
    // their Clerk id, or (older customers) carrying their verified email.
    try {
      const customer = await getPolar().customers.get(data.customer_id);
      if (customer.external_id === userId) return customer.id;
      if (!customer.external_id) {
        const { email } = await verifiedClerkEmail(userId);
        if (email && customer.email?.toLowerCase() === email) return customer.id;
      }
      console.error(`[portal] customer ${data.customer_id} does not belong to ${userId}`);
    } catch (error) {
      console.error("[portal] could not verify the Polar customer:", error);
    }
    return "";
  },
});
