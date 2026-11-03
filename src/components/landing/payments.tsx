//
// The peak (DESIGN.md): how a payment becomes access. Five steps in one line,
// each a card; the last, "Paid page", is the only one in the accent, because it is
// where the visitor's doubt ends. The signature motion: the steps rise in turn as
// they scroll in (.reveal, CSS only); with reduced motion or no support they are
// simply there.
//
import Link from "next/link";
import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import { Section } from "@/components/marketing/layout";
import { SectionHeader } from "@/components/marketing/section-header";
import { CONTENT } from "@/config/content";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";

export function Payments() {
  const p = CONTENT.payments;
  const last = p.steps.length - 1;
  return (
    <Section tone="band" id="payments" aria-labelledby="payments-title">
      <SectionHeader id="payments-title" eyebrow={p.eyebrow} title={p.title} lead={p.lead} className="max-w-3xl" />
      <ol className="mt-12 grid gap-3 sm:mt-14 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
        {p.steps.map((step, i) => (
          <li key={step.title} className="reveal flex items-stretch">
            <div
              className={cn(
                "flex w-full flex-col gap-3 rounded-xl border bg-card p-5",
                i === last ? "border-action shadow-[0_0_0_1px_var(--accent)]" : "border-line",
              )}
            >
              <span aria-hidden className={cn("figure text-h3 leading-none", i === last ? "text-action-text" : "text-ink-faint")}>
                {i + 1}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="font-sans text-body font-semibold text-ink">
                  <span className="sr-only">Step {i + 1}: </span>
                  {step.title}
                </h3>
                <p className="font-mono text-caption break-all text-ink-3">{step.detail}</p>
              </div>
              <p className="text-small text-ink-2">{step.text}</p>
              {(step.file || step.test) && (
                <div className="mt-auto flex flex-col gap-1 border-t border-line pt-3 font-mono text-caption">
                  {step.file && (
                    <a
                      href={`${SITE.repo}/blob/main/${step.file}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-all text-ink-2 underline decoration-line-strong underline-offset-2 hover:text-ink"
                    >
                      {step.file.replace(/^src\//, "")}
                    </a>
                  )}
                  {step.test && (
                    <span className="inline-flex items-center gap-1.5 text-ink-3">
                      <span aria-hidden className="size-1.5 rounded-full bg-positive" />
                      {step.test}, passing
                    </span>
                  )}
                </div>
              )}
            </div>
            {i < last && (
              <ChevronRightIcon aria-hidden className="mx-1 hidden size-4 shrink-0 self-center text-ink-faint lg:block" />
            )}
          </li>
        ))}
      </ol>
      <Link
        href={p.link.href}
        className="group mt-8 inline-flex min-h-11 items-center gap-1.5 text-small font-semibold text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink"
      >
        {p.link.label}
        <ArrowRightIcon aria-hidden className="size-4 transition-transform duration-(--dur-hover) ease-out-quart group-hover:translate-x-0.5" />
      </Link>
    </Section>
  );
}
