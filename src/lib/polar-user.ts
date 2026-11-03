import "server-only";
import { clerkClient } from "@clerk/nextjs/server";

type PolarCustomerLike = { external_id?: string | null; email?: string | null };
type PolarObjectLike = {
  metadata?: Record<string, unknown> | null;
  customer?: PolarCustomerLike | null;
};

/** The Clerk user's primary email, only if Clerk has verified it; null if the user does not exist. */
export async function verifiedClerkEmail(userId: string): Promise<{ exists: boolean; email: string | null }> {
  try {
    const user = await (await clerkClient()).users.getUser(userId);
    const primary = user.primaryEmailAddress;
    const verified = primary?.verification?.status === "verified";
    return { exists: true, email: verified ? primary!.emailAddress.toLowerCase() : null };
  } catch (error) {
    if ((error as { status?: number })?.status === 404) return { exists: false, email: null };
    throw error; // Clerk unreachable: let the webhook fail so Polar retries
  }
}

/**
 * Which user does a Polar order or subscription seen for the FIRST time belong
 * to? (One already stored keeps its owner: see src/lib/polar-sync.ts.)
 *
 * Accepted only when the Polar customer is provably this user's:
 *  - from a checkout (metadata names the user): the customer's external_id, if
 *    set, names the same user, AND the customer's email equals that user's
 *    VERIFIED Clerk email (a buyer can type someone else's email at checkout);
 *  - otherwise: the customer's external_id is the Clerk user id.
 * Never a bare email match, and never a user Clerk no longer has.
 */
export async function resolvePolarUserId(data: PolarObjectLike): Promise<string | null> {
  const rawMetadata = data.metadata?.clerk_user_id;
  const metadataId = typeof rawMetadata === "string" && rawMetadata.startsWith("user_") ? rawMetadata : null;
  const rawExternal = data.customer?.external_id;
  const externalId = typeof rawExternal === "string" && rawExternal.startsWith("user_") ? rawExternal : null;

  if (externalId && metadataId && externalId !== metadataId) return null;

  const candidate = externalId ?? metadataId;
  if (!candidate) return null;

  const clerk = await verifiedClerkEmail(candidate);
  if (!clerk.exists) return null;

  // Bound by a previous checkout and no metadata on this object: trust the binding.
  if (externalId && !metadataId) return externalId;

  // This object came from a checkout. The buyer can type any email there, and
  // Polar may attach the order to an existing customer with that email (and
  // possibly bind it to the buyer). /api/checkout pre-fills the user's own
  // verified email, so the customer's email must still be exactly that.
  const customerEmail = data.customer?.email?.trim().toLowerCase() ?? null;
  return customerEmail && clerk.email && customerEmail === clerk.email ? candidate : null;
}
