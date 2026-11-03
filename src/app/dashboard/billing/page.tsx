import BillingPanel from "@/components/dashboard/BillingPanel";
import { requireUser } from "@/lib/entitlement";

// Open to any signed-in user (this is where people without a plan buy one),
// checked on the server rather than trusting the proxy alone.
export const dynamic = "force-dynamic";

export default async function BillingPage() {
  await requireUser("/dashboard/billing");
  return <BillingPanel />;
}
