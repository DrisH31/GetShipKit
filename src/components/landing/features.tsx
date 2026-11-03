//
// "What's in the box": a bento of feature cards, each with its product moment
// beneath, on a 6-column grid that repeats wide, narrow / narrow, wide / half,
// half, so the eye zigzags instead of reading a table. Same as OpenShipKit's.
//
import { BadgeCheckIcon, CreditCardIcon, DatabaseIcon, KeyRoundIcon, LayoutDashboardIcon, LockIcon, type LucideIcon } from "lucide-react";
import { Container } from "@/components/marketing/layout";
import { SectionHeader } from "@/components/marketing/section-header";
import { CONTENT } from "@/config/content";
import { cn } from "@/lib/utils";
import { FEATURE_MOMENTS } from "./feature-moments";

const ICONS: Record<string, LucideIcon> = {
  "sign-in": KeyRoundIcon,
  billing: CreditCardIcon,
  paywall: LockIcon,
  data: DatabaseIcon,
  dashboard: LayoutDashboardIcon,
  checks: BadgeCheckIcon,
};

const BENTO_SPANS = ["lg:col-span-4", "lg:col-span-2", "lg:col-span-2", "lg:col-span-4", "lg:col-span-3", "lg:col-span-3"];

export function Features() {
  const f = CONTENT.features;
  return (
    <section id="features" aria-labelledby="features-title" data-tone="page" className="py-section">
      <Container>
        <SectionHeader id="features-title" eyebrow={f.eyebrow} title={f.title} lead={f.lead} className="max-w-3xl" />
        <ul className="mt-12 grid gap-4 sm:mt-14 lg:grid-cols-6 lg:gap-5">
          {f.items.map((item, index) => {
            const Icon = ICONS[item.icon];
            const Moment = FEATURE_MOMENTS[item.icon];
            return (
              <li
                key={item.title}
                className={cn("flex min-w-0 flex-col gap-6 rounded-2xl border border-line bg-card p-5 sm:p-6", BENTO_SPANS[index % BENTO_SPANS.length])}
              >
                <div className="flex flex-col gap-4">
                  <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface text-ink ring-1 ring-line">
                    {Icon && <Icon className="size-[1.125rem]" strokeWidth={1.75} />}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3 className="font-sans text-body leading-snug font-semibold text-ink">{item.title}</h3>
                    <p className="max-w-[48ch] text-small text-ink-2">{item.text}</p>
                  </div>
                </div>
                {Moment && (
                  <div aria-hidden className="mt-auto rounded-xl bg-bg p-3 ring-1 ring-line sm:p-4">
                    <Moment />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
