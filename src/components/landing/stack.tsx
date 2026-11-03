//
// "What runs where", OpenShipKit's diagram turned around: here the frame you own
// holds only your app, and the services you rent sit beside it, each switched on
// by one key. The tiles say their state in words, never colour alone.
//
import { CreditCardIcon, DatabaseIcon, KeyRoundIcon, PanelsTopLeftIcon, ServerIcon, CloudIcon, type LucideIcon } from "lucide-react";
import { Section } from "@/components/marketing/layout";
import { SectionHeader } from "@/components/marketing/section-header";
import { CONTENT } from "@/config/content";
import { cn } from "@/lib/utils";

const SERVICE_ICONS: LucideIcon[] = [KeyRoundIcon, DatabaseIcon, CreditCardIcon];

function Tile({
  Icon,
  name,
  tech,
  text,
  status,
  className,
  children,
}: {
  Icon: LucideIcon;
  name: string;
  tech: string;
  text: string;
  status?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border border-line bg-card p-5", className)}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-md bg-tonal text-ink">
          <Icon className="size-[1.125rem]" strokeWidth={1.75} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <h3 className="font-sans text-body leading-snug font-semibold text-ink">{name}</h3>
          <p className="font-mono text-caption text-ink-3">{tech}</p>
        </div>
        {status && (
          <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border border-line px-2 text-caption font-semibold text-ink-2">
            <span aria-hidden className="size-1.5 rounded-full bg-positive" />
            {status}
          </span>
        )}
      </div>
      <p className="text-small text-ink-2">{text}</p>
      {children}
    </div>
  );
}

export function Stack() {
  const s = CONTENT.stack;
  return (
    <Section tone="band" id="stack" aria-labelledby="stack-title">
      <SectionHeader id="stack-title" eyebrow={s.eyebrow} title={s.title} lead={s.lead} className="max-w-3xl" />
      <div className="mt-12 grid gap-4 sm:mt-14 lg:grid-cols-12 lg:gap-6">
        {/* What you deploy: a solid frame, because it's yours */}
        <div className="flex flex-col gap-4 rounded-2xl border border-line-strong bg-bg p-4 sm:p-5 lg:col-span-4">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1">
            <p className="inline-flex items-center gap-2 text-small font-semibold text-ink">
              <ServerIcon aria-hidden className="size-4 text-ink-3" />
              You deploy
            </p>
            <p className="font-mono text-caption text-ink-3">{s.app.hosts}</p>
          </div>
          <Tile Icon={PanelsTopLeftIcon} name={s.app.name} tech={s.app.tech} text={s.app.text} status="Yours" className="flex-1" />
        </div>
        {/* What you rent: a dashed frame, because it lives elsewhere */}
        <div className="flex flex-col gap-4 rounded-2xl border border-dashed border-field/60 p-4 sm:p-5 lg:col-span-8">
          <p className="inline-flex items-center gap-2 px-1 text-small font-semibold text-ink">
            <CloudIcon aria-hidden className="size-4 text-ink-3" />
            Hosted for you
          </p>
          <ul className="grid flex-1 gap-3 sm:auto-rows-fr sm:grid-cols-3" aria-label="Hosted services">
            {s.services.map((svc, i) => (
              <li key={svc.name} className="flex">
                <Tile Icon={SERVICE_ICONS[i]} name={svc.name} tech={svc.tech} text={svc.text} className="w-full">
                  <p className="mt-auto font-mono text-caption break-all text-ink-3">
                    <span className="sr-only">Turns on with </span>
                    {svc.env}=…
                  </p>
                </Tile>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-small text-ink-2" aria-label="Not your job">
        {s.absent.map((a) => (
          <li key={a} className="inline-flex items-center gap-2">
            <span aria-hidden className="h-px w-3 bg-ink-faint" />
            {a}
          </li>
        ))}
      </ul>
    </Section>
  );
}
