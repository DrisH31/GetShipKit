import "server-only";
import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./supabase-env";

/**
 * Server-only client with the secret key. It BYPASSES row-level security, so
 * every query made with it must be scoped to the right user by the caller.
 * Use it only for webhooks and for server routes that have checked auth().
 */
export function createAdminSupabaseClient() {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!secret) throw new Error("SUPABASE_SECRET_KEY is not set");
  return createClient(supabaseUrl(), secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
