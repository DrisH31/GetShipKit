//
// The landing page's first screen, built like OpenShipKit's: centred on the
// stage (the design system's fine grid under a pool of light), the eyebrow, the
// claim (the page's one H1, rank 1), the lead, three highlights, one solid
// primary (rank 2) and an outline second, the clone command, then the product
// full width beneath. The words are never hidden: `.arrive` settles them from
// 85 % opacity, readable from the first frame (motion.css).
//
// A claim with a comma breaks after it ("Your SaaS, / without a server to run"):
// the first half a step quieter, so the eye lands on the promise.
//
import Link from "next/link";
import { ArrowRightIcon, CheckIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/marketing/layout";
import { Display, Lead } from "@/components/marketing/type";
import { ToolMarkIcon } from "@/components/sections/tool-mark-icon";
import { CONTENT } from "@/config/content";
import { isShowcase } from "@/config/site";
import { cn } from "@/lib/utils";
import { CloneCommand } from "./clone-command";
import { HeroPreview } from "./hero-preview";

function Claim({ text }: { text: string }) {
  const at = text.indexOf(", ");
  if (at < 8 || text.length - at - 2 < 8) return <>{text}</>;
  return (
    <>
      <span className="block text-ink-3">{text.slice(0, at + 1)}</span> {text.slice(at + 2)}
    </>
  );
}

const isGitHub = (href: string) => /^https:\/\/github\.com\//.test(href);

function previewAddress(): string {
  try {
    return `${new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://your-domain.com").host}/dashboard/billing`;
  } catch {
    return "your-domain.com/dashboard/billing";
  }
}

export function Hero() {
  const hero = CONTENT.hero;
  const primaryIsGitHub = isGitHub(hero.primary.href);
  return (
    <section aria-labelledby="hero-title" className="stage pt-12 pb-16 sm:pt-16 sm:pb-20 lg:pt-20">
      <Container>
        <div className="mx-auto flex max-w-[56rem] flex-col items-center text-center">
          <p className="arrive mb-7 inline-flex items-center gap-2.5 font-sans text-eyebrow font-semibold text-ink-2 uppercase">
            <span aria-hidden className="size-2 shrink-0 rounded-full bg-[linear-gradient(135deg,var(--brand-mark-from),var(--brand-mark-to))]" />
            {hero.eyebrow}
          </p>
          <Display id="hero-title" data-rank="1" className="arrive max-w-[18ch] text-balance">
            <Claim text={hero.title} />
          </Display>
          <Lead className="arrive mt-7 max-w-[52ch] text-pretty">{hero.subtitle}</Lead>
          <ul className="arrive mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-body text-ink-2">
            {hero.highlights.map((point) => (
              <li key={point} className="inline-flex items-center gap-2">
                <CheckIcon aria-hidden strokeWidth={2.5} className="size-4 shrink-0 text-ink-3" />
                {point}
              </li>
            ))}
          </ul>
          <div className="arrive mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={hero.primary.href}
              data-rank="2"
              {...(primaryIsGitHub ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={cn(buttonVariants({ size: "lg" }), "group")}
            >
              {primaryIsGitHub && <ToolMarkIcon name="GitHub" data-icon="inline-start" className="size-[1.125rem]" />}
              {hero.primary.label}
              {!primaryIsGitHub && (
                <ArrowRightIcon aria-hidden data-icon="inline-end" className="transition-transform duration-(--dur-hover) ease-out-quart group-hover:translate-x-0.5" />
              )}
            </Link>
            <Link href={hero.secondary.href} className={buttonVariants({ variant: "outline", size: "lg" })}>
              {hero.secondary.label}
            </Link>
          </div>
          {isShowcase && (
            <div className="arrive mt-6 flex max-w-full flex-col items-center gap-3 text-small text-balance text-ink-3">
              <CloneCommand />
            </div>
          )}
        </div>
        {/* No glow behind the product: the page stays on the system's true greys. */}
        <div className="arrive relative mt-12 sm:mt-14" style={{ animationDelay: "280ms" }}>
          <p className="sr-only">A sample billing screen: the Pro plan is active because Polar&apos;s signed webhook events said so, and the checkout redirect was ignored.</p>
          <HeroPreview url={previewAddress()} />
        </div>
      </Container>
    </section>
  );
}
