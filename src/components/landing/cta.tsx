import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Section } from "@/components/marketing/layout";
import { Heading, Lead } from "@/components/marketing/type";
import { ToolMarkIcon } from "@/components/sections/tool-mark-icon";
import { CONTENT } from "@/config/content";
import { cn } from "@/lib/utils";

/** The close: the one inverse band on the page, the ask after the value. As OpenShipKit's. */
export function Cta() {
  const c = CONTENT.cta;
  return (
    <Section tone="inverse" aria-labelledby="cta-title" className="border-t border-line-strong">
      <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between lg:gap-16">
        <div className="flex max-w-2xl flex-col">
          <Heading id="cta-title">{c.title}</Heading>
          <Lead className="mt-6">{c.subtitle}</Lead>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
          <Link
            href={c.primary.href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "lg" }), "w-full sm:w-auto")}
          >
            <ToolMarkIcon name="GitHub" data-icon="inline-start" className="size-[1.125rem]" />
            {c.primary.label}
          </Link>
          <Link href={c.secondary.href} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full sm:w-auto")}>
            {c.secondary.label}
          </Link>
        </div>
      </div>
    </Section>
  );
}
