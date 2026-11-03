import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { supabasePublicKey, supabaseUrl } from "./supabase-env";

/**
 * Server client that acts as the signed-in Clerk user, so row-level security
 * applies. Uses Supabase's Clerk third-party auth integration (see README).
 */
export function createServerSupabaseClient() {
  return createClient(supabaseUrl(), supabasePublicKey(), {
    accessToken: async () => (await auth()).getToken(),
  });
}
