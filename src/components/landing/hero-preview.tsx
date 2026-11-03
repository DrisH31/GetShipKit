//
// The product in the hero: GetShipKit's billing screen with SAMPLE data, drawn in
// HTML (server-rendered, so its words are in the first byte). It shows the
// template's promise in one picture: the plan is active because signed webhook
// events said so, and the checkout redirect granted nothing.
//
import {
  CircleCheckIcon,
  CircleMinusIcon,
  CreditCardIcon,
  HomeIcon,
  MessageSquareIcon,
  ShieldCheckIcon,
} from "lucide-react";
import { BrowserChrome } from "@/components/marketing/browser-chrome";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Overview", Icon: HomeIcon },
  { label: "Billing", Icon: CreditCardIcon, current: true },
  { label: "Feedback", Icon: MessageSquareIcon },
];

const EVENTS = [
  { ok: true, what: "subscription.active", result: "signature verified · Pro is active", when: "just now" },
  { ok: true, what: "subscription.created", result: "signature verified · row written", when: "just now" },
  { ok: false, what: "checkout redirect", result: "ignored · a redirect grants nothing", when: "1 min ago" },
];

export function HeroPreview({ url }: { url: string }) {
  return (
    // Decorative: a picture of the billing screen, not a working one. Screen readers skip it.
    <BrowserChrome url={url} aria-hidden="true">
      <div className="grid min-h-[22rem] grid-cols-1 sm:grid-cols-[13rem_minmax(0,1fr)]">
        <div className="hidden flex-col gap-1 border-r border-line bg-surface p-3 sm:flex">
          <p className="px-2 pt-1 pb-3 font-display text-body font-bold text-ink">Your SaaS</p>
          {NAV.map(({ label, Icon, current }) => (
            <span
              key={label}
              className={cn(
                "flex h-9 items-center gap-2.5 rounded-md px-2.5 text-small",
                current ? "bg-tonal font-semibold text-ink" : "text-ink-2",
              )}
            >
              <Icon aria-hidden className="size-4 text-ink-3" />
              {label}
            </span>
          ))}
          <span className="mt-auto px-2 pt-6 text-caption text-ink-3">Sample data</span>
        </div>
        <div className="flex flex-col gap-5 p-5 text-left sm:p-7">
          <div>
            <p className="font-display text-h3 font-bold text-ink">Billing</p>
            <p className="mt-1 text-small text-ink-2">Your plan and the payment events behind it.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="flex flex-col gap-4 rounded-xl border border-line bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-caption font-semibold text-ink-3 uppercase">Current plan</p>
                  <p className="mt-1 font-display text-h2 font-bold text-ink">Pro</p>
                </div>
                <span className="inline-flex h-6 items-center gap-1.5 rounded-full border border-line px-2 text-caption font-semibold text-ink-2">
                  <span aria-hidden className="size-1.5 rounded-full bg-positive" />
                  Active
                </span>
              </div>
              <p className="figure text-ink">
                <span className="text-h3 font-semibold">$89</span>
                <span className="text-small text-ink-2"> / month · renews Dec 3</span>
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex h-9 items-center rounded-full border border-line-strong px-4 text-small font-semibold text-ink">
                  Manage in portal
                </span>
                <span className="inline-flex h-9 items-center px-2 text-small text-ink-2">Cancel</span>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-line bg-card">
              <p className="flex items-center gap-2 border-b border-line px-4 py-2.5 font-mono text-caption text-ink-3">
                <ShieldCheckIcon aria-hidden className="size-3.5" />
                POST /api/webhook/polar
              </p>
              <ul className="divide-y divide-line">
                {EVENTS.map((e) => {
                  const Icon = e.ok ? CircleCheckIcon : CircleMinusIcon;
                  return (
                    <li key={e.what} className="flex items-start gap-3 px-4 py-3">
                      <Icon aria-hidden className={cn("mt-0.5 size-4 shrink-0", e.ok ? "text-positive" : "text-ink-3")} />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-mono text-caption break-all text-ink sm:truncate">{e.what}</span>
                        <span className="text-caption text-ink-2 sm:truncate">{e.result}</span>
                      </span>
                      <span className="shrink-0 text-caption text-ink-3">{e.when}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </BrowserChrome>
  );
}
