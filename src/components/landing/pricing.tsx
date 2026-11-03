import { Section } from "@/components/marketing/layout";
import { SectionHeader } from "@/components/marketing/section-header";
import { PricingCards } from "@/components/pricing";
import { CONTENT } from "@/config/content";
import { polarEnvironment } from "@/lib/polar";

/** "Billing that works on day one": the sample plans, wired to Polar checkout. */
export function Pricing() {
  const p = CONTENT.plans;
  return (
    <Section id="plans" aria-labelledby="plans-title">
      <SectionHeader id="plans-title" eyebrow={p.eyebrow} title={p.title} lead={p.lead} className="mb-12 max-w-3xl sm:mb-14" />
      <PricingCards headingLevel={3} />
      <p className="mt-8 text-small text-ink-3">
        {p.note}
        {polarEnvironment === "sandbox" && <> {p.sandboxNote}</>}
      </p>
    </Section>
  );
}
