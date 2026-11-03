-- GetShipKit 2.0 — 2026-11-03. Run after 20261103000000_security_lockdown.sql.
-- Polar can deliver webhooks out of order and retries failed ones. The webhook
-- stores Polar's own modified_at here and ignores any event older than what it
-- already saved, so a late "active" can never overwrite a newer "canceled".
-- Run after 20261103000000_security_lockdown.sql. Safe to run more than once.

ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS polar_modified_at timestamptz;

COMMENT ON COLUMN public.subscriptions.polar_modified_at IS
  'Polar''s modified_at (or created_at) of the last event applied to this row. Older events are ignored.';

-- Newsletter sign-ups now go through /api/newsletter (server, secret key), so
-- the form can no longer reveal whether an address is already on the list.
-- Visitors no longer write to email_list directly.
DROP POLICY IF EXISTS "Allow anonymous to insert emails" ON public.email_list;
