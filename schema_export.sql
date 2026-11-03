-- Complete database schema export for saas-boilerplate
-- Generated on: 2025-05-04 · security fix 2026-11-03 (see supabase/migrations/)
-- This file will recreate all tables, functions, triggers, policies, etc.

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Functions are NOT callable by visitors unless granted explicitly below.
-- (PostgreSQL grants EXECUTE to PUBLIC by default, and Supabase also grants it
-- to anon and authenticated. That default is what exposed user data before.)
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Clean up any existing schema (uncomment if needed)
-- DROP TABLE IF EXISTS "subscriptions" CASCADE;
-- DROP TABLE IF EXISTS "profiles" CASCADE;
-- DROP TABLE IF EXISTS "feedback" CASCADE;
-- DROP TABLE IF EXISTS "email_list" CASCADE;

-- Create custom types
DROP TYPE IF EXISTS subscription_status_updated CASCADE;
CREATE TYPE subscription_status_updated AS ENUM (
  'active',
  'ending',
  'canceled',
  'incomplete',
  'incomplete_expired',
  'past_due',
  'trial',
  'paused',
  'unpaid',
  'pending',
  'expired'
);

-- Table: profiles
CREATE TABLE IF NOT EXISTS "profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL UNIQUE,
  "email" text,
  "first_name" text,
  "last_name" text,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- Table: subscriptions
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL REFERENCES "profiles"("user_id"),
  "product_id" text,
  "billing_period" text,
  "status" subscription_status_updated NOT NULL,
  "current_period_start" timestamp with time zone,
  "current_period_end" timestamp with time zone,
  "cancel_at_period_end" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "amount" integer,
  "currency" text,
  "customer_id" uuid,
  "polar_modified_at" timestamp with time zone
);

-- Table: feedback
CREATE TABLE IF NOT EXISTS "feedback" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" text NOT NULL,
  "user_email" text,
  "title" text NOT NULL,
  "description" text NOT NULL,
  "type" text NOT NULL CHECK (type = ANY (ARRAY['bug'::text, 'feature'::text, 'general'::text])),
  "status" text NOT NULL DEFAULT 'open'::text CHECK (status = ANY (ARRAY['open'::text, 'in_progress'::text, 'resolved'::text, 'closed'::text])),
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);

-- Table: email_list
CREATE TABLE IF NOT EXISTS "email_list" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" text NOT NULL UNIQUE,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE "email_list" IS 'Stores email addresses for newsletter subscribers';

-- Function: requesting_user_id()
CREATE OR REPLACE FUNCTION public.requesting_user_id()
RETURNS text
LANGUAGE sql
STABLE
SET search_path = public, extensions, pg_temp
AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true), '')::json->>'sub'
$$;

-- Function: handle_profile_update()
CREATE OR REPLACE FUNCTION handle_profile_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function: update_updated_at_column()
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function: has_active_subscription()
CREATE OR REPLACE FUNCTION has_active_subscription(user_id_param text)
RETURNS boolean
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM subscriptions 
    WHERE user_id = user_id_param 
    AND status IN ('active', 'ending', 'trial', 'past_due') 
    AND (current_period_end > now() OR current_period_end IS NULL)
  );
END;
$$;

-- Function: log_subscription_update()
CREATE OR REPLACE FUNCTION log_subscription_update()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Only log if status has changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    RAISE NOTICE 'Subscription % status changed: % -> %', 
      NEW.id, 
      OLD.status, 
      NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

-- Function: trigger_set_timestamp()
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Create a public version of the auth function to ensure backward compatibility
-- This preserves the exact same functionality but in the public schema
CREATE OR REPLACE FUNCTION public.has_active_subscription_for_auth()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  user_id text;
BEGIN
  -- Get user_id from JWT similar to auth.uid()
  user_id := (current_setting('request.jwt.claims', true)::json->>'sub')::text;
  
  -- Check if user has active subscription using the same logic
  RETURN public.has_active_subscription(user_id);
END;
$$;

-- Create a comment to document the replacement
COMMENT ON FUNCTION public.has_active_subscription_for_auth() IS 
'Replacement for auth.has_active_subscription(). Use this function in RLS policies to check if the current user has an active subscription.';

-- Add a helper view to check subscription status
-- This can be used to easily check subscription status for the current user
CREATE OR REPLACE VIEW my_subscription_status
WITH (security_invoker = true) AS
SELECT 
  s.id,
  s.status,
  s.product_id,
  s.current_period_end,
  s.cancel_at_period_end,
  (s.status IN ('active', 'ending', 'trial', 'past_due') AND 
   (s.current_period_end > now() OR s.current_period_end IS NULL)) as is_active
FROM 
  subscriptions s
WHERE 
  s.user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text
ORDER BY 
  s.created_at DESC
LIMIT 1;

-- Trigger: set_profiles_updated_at
CREATE TRIGGER set_profiles_updated_at 
BEFORE UPDATE ON profiles 
FOR EACH ROW EXECUTE FUNCTION handle_profile_update();

-- Trigger: log_subscription_changes
CREATE TRIGGER log_subscription_changes
AFTER UPDATE ON subscriptions
FOR EACH ROW EXECUTE FUNCTION log_subscription_update();

-- Trigger: update_feedback_updated_at
CREATE TRIGGER update_feedback_updated_at
BEFORE UPDATE ON feedback
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger: set_timestamp (for email_list)
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON email_list
FOR EACH ROW EXECUTE FUNCTION trigger_set_timestamp();

-- RLS Policies: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users read only their own profile. Profiles are written only by the server
-- (Clerk webhook, /api/auth/sync-user) with the secret key, so nobody can edit
-- the email that payment matching relies on.
CREATE POLICY "Users can read their own profile"
ON profiles FOR SELECT
TO authenticated
USING (user_id = requesting_user_id());

CREATE POLICY "Prevent deletion" 
ON profiles FOR DELETE 
TO authenticated 
USING (false);

-- RLS Policies: subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access all subscriptions" 
ON subscriptions FOR ALL 
TO service_role 
USING (true);

CREATE POLICY "Users can view their own subscriptions" 
ON subscriptions FOR SELECT 
TO authenticated 
USING (user_id = requesting_user_id());

-- RLS Policies: feedback
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can access all feedback" 
ON feedback FOR ALL 
TO service_role 
USING (true);

CREATE POLICY "Users can view their own feedback" 
ON feedback FOR SELECT 
TO authenticated 
USING (user_id = requesting_user_id());

CREATE POLICY "Users can submit feedback" 
ON feedback FOR INSERT 
TO authenticated 
WITH CHECK (user_id = requesting_user_id());

-- RLS Policies: email_list
ALTER TABLE email_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow insert for service role"
ON email_list FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Allow select for service role" 
ON email_list FOR SELECT 
TO service_role 
USING (true);

-- Visitors sign up through /api/newsletter (server, secret key); nobody
-- writes to or reads this table with the public key.

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_current_period_end ON subscriptions(current_period_end);
CREATE INDEX IF NOT EXISTS idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at);
CREATE INDEX IF NOT EXISTS idx_email_list_email ON email_list(email);

-- Add comments to tables and columns
COMMENT ON COLUMN subscriptions.customer_id IS 'Stores the Polar customer ID for subscription management';
COMMENT ON COLUMN subscriptions.polar_modified_at IS 'Polar''s modified_at (or created_at) of the last event applied to this row. Older events are ignored.';
COMMENT ON COLUMN subscriptions.status IS '
Status meanings:
1. active - The subscription is currently valid and the customer is being billed according to the subscription cycle.
2. ending - The subscription has been set to not renew at the end of the current billing period. It remains active until the end date.
3. canceled - The subscription has been terminated before the end of the billing period. Depending on settings, access might be revoked immediately.
4. past_due - Payment failed but the system is still attempting to collect payment. The subscription is still considered active during this grace period.
5. unpaid - After multiple failed payment attempts, the subscription enters this state before being canceled.
6. trial - Customer is in a trial period and has not been charged yet.
7. incomplete - Checkout was initiated but not completed.
8. paused - Subscription is temporarily suspended but can be reactivated later.
9. pending - Waiting for an action (like payment confirmation) before becoming active.
10. expired - Subscription has reached its end date and is no longer active.
';
COMMENT ON COLUMN subscriptions.cancel_at_period_end IS 'Indicates if the subscription has been cancelled but remains active until the end of the billing period. When true, the subscription should be displayed with "ending" status even if still technically active.'; 

COMMENT ON COLUMN feedback.type IS 'Type of feedback: bug, feature, or general';
COMMENT ON COLUMN feedback.status IS 'Status of the feedback: open, in_progress, resolved, or closed';


-- Function privileges ---------------------------------------------------------
-- PostgreSQL grants EXECUTE on every new function to PUBLIC, and Supabase also
-- grants it to anon and authenticated. Take all of that away, then grant back
-- only what a signed-in user needs. Each of these answers only for the caller.
-- Keep this block LAST so it covers every function above. Functions you add
-- later start with no visitor access (see the default privileges at the top);
-- grant EXECUTE explicitly only to functions that answer for the caller alone.
DO $$
DECLARE f regprocedure;
BEGIN
  FOR f IN
    SELECT p.oid::regprocedure
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prokind = 'f'
      AND NOT EXISTS (SELECT 1 FROM pg_depend d
                      WHERE d.objid = p.oid AND d.deptype = 'e')
  LOOP
    EXECUTE format('ALTER FUNCTION %s SET search_path = public, extensions, pg_temp', f);
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM PUBLIC, anon, authenticated', f);
    EXECUTE format('GRANT EXECUTE ON FUNCTION %s TO service_role', f);
  END LOOP;
END $$;

-- requesting_user_id() returns only the caller's own JWT subject (anon keeps it
-- so policies without "TO authenticated" evaluate instead of erroring).
GRANT EXECUTE ON FUNCTION requesting_user_id()               TO anon, authenticated;
GRANT EXECUTE ON FUNCTION has_active_subscription_for_auth() TO authenticated;
REVOKE ALL ON my_subscription_status FROM anon;

-- Never add a SECURITY DEFINER function that takes a user id or email as an
-- argument and returns rows: it bypasses row-level security for whoever can
-- call it. Do that work on the server with the service-role key instead.

-- Original auth function (commented out as it requires special permissions)
/*
-- Create auth helper function for checking active subscriptions
CREATE OR REPLACE FUNCTION auth.has_active_subscription()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_id text;
  has_subscription boolean;
BEGIN
  -- Get user_id from JWT
  user_id := (SELECT auth.uid())::text;
  
  -- Check if user has active subscription
  RETURN public.has_active_subscription(user_id);
END;
$$; 
*/

-- NOTE: The auth.has_active_subscription() function requires special permissions in Supabase
-- Instead, use one of the following approaches:
-- 1. Request Supabase support to create the auth function for you
-- 2. Use public.has_active_subscription_for_auth() function as a drop-in replacement
-- 3. For RLS policies, use this pattern instead:
--    USING (EXISTS (
--      SELECT 1 FROM subscriptions 
--      WHERE user_id = (current_setting('request.jwt.claims', true)::json->>'sub')::text
--      AND status IN ('active', 'ending', 'trial', 'past_due') 
--      AND (current_period_end > now() OR current_period_end IS NULL)
--    ))
-- 4. Query the my_subscription_status view to check subscription status 