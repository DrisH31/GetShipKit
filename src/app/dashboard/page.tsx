import DashboardHome from "@/components/dashboard/DashboardHome";
import { paidLinks } from "@/config/paid-content";
import { requirePaidAccess } from "@/lib/entitlement";

// Checked on the server for every request; never prerendered.
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await requirePaidAccess();
  return <DashboardHome links={paidLinks()} />;
}
