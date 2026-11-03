import FeedbackForm from "@/components/dashboard/FeedbackForm";
import { requirePaidAccess } from "@/lib/entitlement";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  await requirePaidAccess();
  return <FeedbackForm />;
}
