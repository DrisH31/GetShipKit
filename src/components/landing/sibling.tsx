//
// The cross-reference to OpenShipKit, GetShipKit's self-hosted sibling: one
// table, two columns, one link. Only on the showcase (isShowcase), so a product
// built from this template never advertises another one.
//
import { ArrowUpRightIcon } from "lucide-react";
import { Section } from "@/components/marketing/layout";
import { SectionHeader } from "@/components/marketing/section-header";
import { buttonVariants } from "@/components/ui/button";
import { CONTENT } from "@/config/content";
import { SIBLING, SITE, isShowcase } from "@/config/site";
import { cn } from "@/lib/utils";

export function Sibling() {
  if (!isShowcase) return null;
  const s = CONTENT.sibling;
  return (
    <Section tone="band" id="self-hosted" aria-labelledby="self-hosted-title">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col items-start gap-8 lg:col-span-5">
          <SectionHeader id="self-hosted-title" eyebrow={s.eyebrow} title={s.title} lead={s.lead} />
          <a
            href={SIBLING.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "group")}
          >
            See {SIBLING.name}
            <ArrowUpRightIcon aria-hidden data-icon="inline-end" className="transition-transform duration-(--dur-hover) ease-out-quart group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-card lg:col-span-7">
          <table className="w-full border-collapse text-left text-small">
            <thead>
              <tr className="border-b border-line">
                <th scope="col" className="w-[24%] px-3 py-4 font-normal text-ink-3 sm:px-5">
                  <span className="sr-only">Compare</span>
                </th>
                <th scope="col" className="px-3 py-4 sm:px-5 font-display text-body font-bold text-ink">
                  {SITE.name}
                  <span className="ml-2 hidden align-middle text-caption font-semibold text-ink-3 sm:inline">this one</span>
                </th>
                <th scope="col" className="px-3 py-4 sm:px-5 font-display text-body font-bold text-ink">{SIBLING.name}</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((r) => (
                <tr key={r.label} className="border-b border-line last:border-b-0">
                  <th scope="row" className="px-3 py-3.5 sm:px-5 font-semibold text-ink-2">{r.label}</th>
                  <td className="px-3 py-3.5 sm:px-5 text-ink">{r.get}</td>
                  <td className="px-3 py-3.5 sm:px-5 text-ink">{r.open}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Section>
  );
}
