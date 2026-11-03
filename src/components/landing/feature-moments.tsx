//
// The small product moments under each feature card: the real thing in
// miniature (real route names, real function names), decorative (aria-hidden on
// the well), drawn in HTML. Same construction as OpenShipKit's feature moments.
//
import { CornerDownRightIcon, CreditCardIcon, HomeIcon, MessageSquareIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Window({ title, className, children }: { title?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("overflow-hidden rounded-lg border border-line-strong bg-card shadow-[0_1px_2px_0_rgb(0_0_0/0.04)]", className)}>
      {title && (
        <div className="flex items-center gap-2 border-b border-line px-3 py-1.5 font-mono text-caption text-ink-3">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => <span key={i} className="size-1.5 rounded-full bg-line-strong" />)}
          </span>
          <span className="truncate">{title}</span>
        </div>
      )}
      {children}
    </div>
  );
}

function Code({ lines }: { lines: string[] }) {
  return (
    <pre className="overflow-x-auto px-3 py-2 font-mono text-caption leading-6 text-ink-2">
      {lines.map((l, i) => (
        <span key={i} className={cn("block whitespace-pre", l.startsWith("--") || l.startsWith("//") ? "text-ink-3" : "text-ink")}>
          {l}
        </span>
      ))}
    </pre>
  );
}

function SignIn() {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:items-end">
      <Window title="/sign-in">
        <div className="flex flex-col gap-2.5 p-3">
          <span className="flex h-8 items-center justify-center rounded-md border border-field text-caption font-semibold text-ink">Continue with Google</span>
          <span className="flex h-8 items-center rounded-md border border-field px-2.5 text-caption text-ink">you@example.com</span>
          <span className="flex h-8 items-center justify-center rounded-full bg-ink text-caption font-semibold text-bg">Continue</span>
        </div>
      </Window>
      <div className="flex min-w-0 flex-col gap-2">
        <span className="inline-flex items-center gap-1.5 pl-1 text-caption text-ink-3">
          <CornerDownRightIcon className="size-3.5 shrink-0" strokeWidth={1.75} />
          Every query knows who
        </span>
        <Window title="supabase · row-level security">
          <Code lines={["select * from feedback;", "-- only rows where", "--   user_id = requesting_user_id()"]} />
        </Window>
      </div>
    </div>
  );
}

function Billing() {
  // Checkout's job, not the webhook log (the payment path section owns that story).
  return (
    <Window title="GET /api/checkout?productId=pro_monthly">
      <Code
        lines={[
          "→ 303 to Polar's checkout",
          "  external_customer_id: user_2x…",
          "  customer_email: you@example.com",
          "// the redirect back grants nothing",
        ]}
      />
    </Window>
  );
}

function Paywall() {
  return (
    <Window title="src/app/dashboard/page.tsx">
      <Code
        lines={[
          "async function Page() {",
          "  await requirePaidAccess();",
          "  // unpaid → /dashboard/billing",
          "  return <Paid />;",
          "}",
        ]}
      />
    </Window>
  );
}

function Data() {
  return (
    <Window title="schema_export.sql">
      <Code
        lines={[
          "alter default privileges for role postgres",
          "  revoke execute on functions from anon;",
          "-- new functions: no visitor access",
        ]}
      />
    </Window>
  );
}

function Dashboard() {
  const nav = [
    { label: "Overview", Icon: HomeIcon },
    { label: "Billing", Icon: CreditCardIcon },
    { label: "Feedback", Icon: MessageSquareIcon },
  ];
  return (
    <Window title="/dashboard">
      <ul className="flex flex-col gap-0.5 p-2">
        {nav.map(({ label, Icon }, i) => (
          <li key={label} className={cn("flex h-7 items-center gap-2 rounded-md px-2 text-caption", i === 1 ? "bg-tonal font-semibold text-ink" : "text-ink-2")}>
            <Icon className="size-3.5 shrink-0 text-ink-3" />
            <span className="truncate">{label}</span>
          </li>
        ))}
      </ul>
    </Window>
  );
}

function Checks() {
  return (
    <Window title="npm run check">
      <Code
        lines={[
          "✓ polar-user     who a purchase belongs to",
          "✓ polar-status   Polar status → access",
          "✓ safe-redirect  no open redirects",
          "✓ all passing in CI",
        ]}
      />
    </Window>
  );
}

export const FEATURE_MOMENTS: Record<string, () => React.ReactElement> = {
  "sign-in": SignIn,
  billing: Billing,
  paywall: Paywall,
  data: Data,
  dashboard: Dashboard,
  checks: Checks,
};
