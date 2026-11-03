-- =============================================================================
-- GetShipKit security fix — 2026-11-03
--
-- RUN THIS ON EVERY EXISTING DEPLOYMENT: paste it into the Supabase SQL Editor
-- (which runs as `postgres`) and run it once. Safe to run more than once.
-- Read the NOTICE lines it prints at the end.
--
-- What was wrong (reported responsibly by an independent researcher):
--   * PostgreSQL grants EXECUTE on every new function to PUBLIC, and Supabase's
--     default privileges also grant it to `anon` and `authenticated`. Two
--     SECURITY DEFINER functions in the template therefore answered anyone
--     holding the public anon key:
--       - debug_find_user_by_email()         every user's email and user id
--       - find_user_subscriptions_by_email()  every subscription, with names
--   * profiles: every signed-in user could read every profile, and could edit
--     the email on their own (which payment matching relied on).
--   * email_list: anyone with the anon key could read the newsletter list.
--
-- What this does:
--   1. Drops the template's unsafe and unused functions.
--   2. Stops Supabase granting EXECUTE to anon/authenticated on functions that
--      `postgres` creates from now on (the root cause).
--   3. Revokes EXECUTE from anon/authenticated on the template's functions and
--      grants back only the two the app needs.
--   4. Turns row-level security on for the template's tables and replaces the
--      over-broad policies. Profiles become server-written only.
--   5. Lists anything still reachable with the anon key, for you to review.
-- None of the dropped functions is called by the application code.
-- =============================================================================

BEGIN;

-- 1. Unsafe or unused template functions -----------------------------------------
DROP FUNCTION IF EXISTS public.debug_find_user_by_email(text);
DROP FUNCTION IF EXISTS public.find_user_subscriptions_by_email(text);
DROP FUNCTION IF EXISTS public.update_subscription_status(text, text, boolean);
DROP FUNCTION IF EXISTS public.cleanup_old_transactions(integer);
-- These take ANY user id; the app never calls them. Row-level security limited
-- them, but nothing should invite probing other users.
DROP FUNCTION IF EXISTS public.get_subscription_by_clerk_id(text);
DROP FUNCTION IF EXISTS public.get_active_subscription(text);
DROP FUNCTION IF EXISTS public.get_user_subscription_history(text);

-- Tolerate a missing or empty JWT claim (returns NULL instead of erroring).
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public, extensions, pg_temp
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true), '')::json->>'sub'
$$;

-- 2. The root cause: default privileges ----------------------------------------
-- Functions created by `postgres` (the SQL Editor, Studio, migrations) no longer
-- become callable by anon/authenticated automatically. Grant explicitly instead.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 3. The template's own functions ------------------------------------------------
-- Only these signatures are touched; your own functions are reported in step 5,
-- not changed. A function this deployment lacks is skipped.
DO $$
DECLARE
  sig text;
  template_functions text[] := ARRAY[
    'public.requesting_user_id()',
    'public.has_active_subscription(text)',
    'public.has_active_subscription_for_auth()',
    'public.handle_profile_update()',
    'public.update_updated_at_column()',
    'public.log_subscription_update()',
    'public.trigger_set_timestamp()'
  ];
BEGIN
  FOREACH sig IN ARRAY template_functions LOOP
    IF to_regprocedure(sig) IS NULL THEN CONTINUE; END IF;
    BEGIN
      EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions, pg_temp', sig);
      EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', sig);
      EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', sig);
    EXCEPTION WHEN insufficient_privilege THEN
      RAISE WARNING 'Could not change % (owned by another role). Run: REVOKE EXECUTE ON FUNCTION % FROM PUBLIC, anon, authenticated;  as its owner.', sig, sig;
    END;
  END LOOP;

  -- Grant back what the app and its policies use. Both answer only for the
  -- caller: requesting_user_id() returns the caller's own JWT subject, and
  -- has_active_subscription_for_auth() checks the caller's own subscription.
  -- anon keeps requesting_user_id() so policies written without "TO
  -- authenticated" still evaluate (to no user) instead of erroring.
  IF to_regprocedure('public.requesting_user_id()') IS NOT NULL THEN
    GRANT EXECUTE ON FUNCTION public.requesting_user_id() TO anon, authenticated;
  END IF;
  IF to_regprocedure('public.has_active_subscription_for_auth()') IS NOT NULL THEN
    GRANT EXECUTE ON FUNCTION public.has_active_subscription_for_auth() TO authenticated;
  END IF;
END $$;

-- 4. Tables and policies -----------------------------------------------------------
ALTER TABLE public.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_list    ENABLE ROW LEVEL SECURITY;

-- profiles: a user reads only their own row. Writes come only from the server
-- (the Clerk webhook and /api/auth/sync-user, with the secret key), so nobody
-- can change the email that payments are matched against.
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;
CREATE POLICY "Users can read their own profile"
ON public.profiles FOR SELECT
TO authenticated
USING (user_id = public.requesting_user_id());

-- email_list: visitors may add an address; nobody but the server reads it.
DROP POLICY IF EXISTS "Allow anon to read emails they insert" ON public.email_list;
DROP POLICY IF EXISTS "Allow anonymous to insert emails" ON public.email_list;
CREATE POLICY "Allow anonymous to insert emails"
ON public.email_list FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- The helper view runs with the caller's rights, so RLS applies to it.
DO $$ BEGIN
  IF to_regclass('public.my_subscription_status') IS NOT NULL THEN
    ALTER VIEW public.my_subscription_status SET (security_invoker = true);
    REVOKE ALL ON public.my_subscription_status FROM anon;
  END IF;
END $$;

COMMIT;

-- 5. What is still reachable with the anon key ------------------------------------
-- The result table below is the report: the SQL Editor shows it after the run.
-- A single OK row means nothing here is reachable by a visitor or by any
-- signed-in account beyond their own rows (as far as these checks can tell).
-- Any other row is something YOU added: decide whether a stranger, with or
-- without an account, should reach it. Then also run Supabase's Security Advisor
-- (Database → Advisors).
WITH findings AS (
  SELECT 'function' AS kind,
         p.oid::regprocedure::text AS name,
         CASE WHEN p.prosecdef THEN 'anon can call it, and it is SECURITY DEFINER (bypasses RLS)'
              ELSE 'anon can call it' END AS detail
  FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
  WHERE ns.nspname = 'public' AND p.prokind = 'f'
    AND has_function_privilege('anon', p.oid, 'EXECUTE')
    AND p.proname <> 'requesting_user_id'
    AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')
  UNION ALL
  SELECT 'table', c.relname, 'row-level security is OFF and anon has SELECT'
  FROM pg_class c JOIN pg_namespace ns ON ns.oid = c.relnamespace
  WHERE ns.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
    AND has_table_privilege('anon', c.oid, 'SELECT')
  UNION ALL
  SELECT 'policy', pol.tablename || ': ' || pol.policyname,
         'applies to anon/public for ' || pol.cmd
  FROM pg_policies pol
  WHERE pol.schemaname = 'public'
    AND (pol.roles && ARRAY['anon', 'public']::name[])
    -- the template's own newsletter sign-up (insert-only, reads nothing)
    AND NOT (pol.tablename = 'email_list' AND pol.policyname = 'Allow anonymous to insert emails')
  -- Anyone can create an account, so "signed in" is not a privacy boundary:
  -- also list what ANY signed-in user can reach.
  UNION ALL
  SELECT 'policy', pol.tablename || ': ' || pol.policyname,
         'signed-in users, ' || pol.cmd || ', and the condition never checks whose row it is'
  FROM pg_policies pol
  WHERE pol.schemaname = 'public'
    AND (pol.roles && ARRAY['authenticated']::name[])
    AND pol.cmd IN ('SELECT', 'ALL', 'UPDATE', 'DELETE')
    AND coalesce(pol.qual, '') !~ '(requesting_user_id|auth\.uid|auth\.jwt|request\.jwt)'
    AND coalesce(pol.qual, '') <> 'false'   -- a policy that matches nothing (e.g. "Prevent deletion")
  UNION ALL
  SELECT 'function', p.oid::regprocedure::text,
         'signed-in users can call it, and it is SECURITY DEFINER (bypasses RLS)'
  FROM pg_proc p JOIN pg_namespace ns ON ns.oid = p.pronamespace
  WHERE ns.nspname = 'public' AND p.prokind = 'f' AND p.prosecdef
    AND has_function_privilege('authenticated', p.oid, 'EXECUTE')
    AND NOT has_function_privilege('anon', p.oid, 'EXECUTE')   -- already listed above
    -- the template's own: answers only for the caller's JWT
    AND p.oid::regprocedure::text <> 'has_active_subscription_for_auth()'
  UNION ALL
  SELECT 'view', c.relname,
         'runs with its owner''s rights (no security_invoker), so RLS does not apply, and visitors or signed-in users can read it'
  FROM pg_class c JOIN pg_namespace ns ON ns.oid = c.relnamespace
  WHERE ns.nspname = 'public' AND c.relkind IN ('v', 'm')
    AND NOT coalesce(c.reloptions::text[] && ARRAY['security_invoker=true', 'security_invoker=on'], false)
    AND (has_table_privilege('anon', c.oid, 'SELECT') OR has_table_privilege('authenticated', c.oid, 'SELECT'))
)
SELECT kind, name, detail FROM findings
UNION ALL
SELECT 'OK', 'nothing reachable by visitors or by other accounts',
       'only requesting_user_id(), which returns the caller''s own id'
WHERE NOT EXISTS (SELECT 1 FROM findings)
ORDER BY 1, 2;
