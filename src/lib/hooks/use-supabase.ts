"use client";

import { useMemo } from "react";
import { useAuth } from "@clerk/nextjs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabasePublicKey, supabaseUrl } from "@/lib/supabase-env";

/**
 * Browser client that acts as the signed-in Clerk user (row-level security
 * applies). Signed out, requests go as the anonymous role.
 */
export function useSupabase(): SupabaseClient {
  const { getToken } = useAuth();
  return useMemo(
    () =>
      createClient(supabaseUrl(), supabasePublicKey(), {
        accessToken: async () => (await getToken()) ?? null,
      }),
    [getToken]
  );
}
