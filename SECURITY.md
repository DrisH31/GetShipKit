# Security policy

## Reporting a vulnerability in this template

Please report it privately through GitHub: open the **Security** tab of this
repository and choose **Report a vulnerability**. Do not open a public issue.

Include what you found, where (file and line), and how to reproduce it. You
will get an acknowledgement, and a fix with credit (if you want it) once it is
confirmed.

## Advisories

- **November 2026** — database functions callable with the public Supabase key.
  See the [advisory in the README](README.md#-security-advisory-november-2026).

## If you deploy GetShipKit

Your deployment is yours to secure. Before launch:

- Publish your own security contact at `/.well-known/security.txt`
  (see [securitytxt.org](https://securitytxt.org)).
- Run Supabase's **Security Advisor** (Database → Advisors) and clear it.
- Keep `SUPABASE_SECRET_KEY` and `POLAR_ACCESS_TOKEN` on the server only.
- Grant `EXECUTE` on a database function only if it answers for the caller alone.
