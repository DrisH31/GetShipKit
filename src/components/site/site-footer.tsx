//
// The site footer, built like OpenShipKit's: who (the mark, one line, the
// repository), the newsletter card, link columns, the legal line, and the
// product's name edge to edge at the very bottom.
//
// The cross-reference to OpenShipKit (the self-hosted sibling) shows only on the
// GetShipKit showcase (isShowcase), as OpenShipKit's footer shows "Built with
// OpenShipKit" only on renamed sites.
//
import Link from "next/link";
import { ArrowUpRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ToolMarkIcon } from "@/components/sections/tool-mark-icon";
import { CONTENT } from "@/config/content";
import { SIBLING, SITE, SITE_LINKS, TEMPLATE_REPO, isShowcase } from "@/config/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { NewsletterForm } from "./newsletter-form";

type FooterLink = { label: string; href: string };

const isExternal = (href: string) => /^https?:\/\//.test(href);

/** The name's size so it spans the column edge to edge (OpenShipKit's formula). */
function wordmarkSize(name: string): string {
  const chars = Math.max(name.trim().length, 4);
  return `calc(100cqi / ${(chars * 0.52).toFixed(2)})`;
}

export function SiteFooter() {
  const columns: { title: string; links: FooterLink[] }[] = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/#features" },
        { label: "How payments work", href: "/#payments" },
        { label: "Setup", href: "/#setup" },
        { label: "Plans", href: "/#plans" },
        { label: "FAQ", href: "/#faq" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: SITE_LINKS.documentation },
        { label: "Security advisory", href: isShowcase ? `${SITE.repo}#-security-advisory-november-2026` : "" },
        { label: "Blog", href: SITE_LINKS.blog },
        { label: "Contact", href: SITE_LINKS.contact },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "/legal/terms" },
        { label: "Privacy", href: "/legal/privacy" },
      ],
    },
  ]
    // Unset links (src/config/site.ts) are hidden, and so is a column left empty.
    .map((col) => ({ ...col, links: col.links.filter((l) => l.href) }))
    .filter((col) => col.links.length > 0);

  const socials = (Object.entries(SITE_LINKS.social) as [string, string][]).filter(
    ([key, href]) => href && !(isShowcase && key === "github"), // the repo already has its own button
  );
  const year = new Date().getFullYear();

  return (
    <footer className="overflow-hidden border-t border-line-strong bg-bg">
      <div className="mx-auto w-full max-w-[88rem] px-gutter pt-14 sm:pt-16">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between lg:gap-16">
          <div className="flex w-full max-w-md flex-col gap-8">
            <div className="flex flex-col items-start gap-4">
              <Link href="/" aria-label={`${SITE.name} home`} className="-mx-1.5 inline-flex min-h-11 w-fit items-center rounded-full px-1.5">
                <Logo name={SITE.name} />
              </Link>
              <p className="max-w-[36ch] text-small text-pretty text-ink-2">{CONTENT.footer.tagline}</p>
              {isShowcase && (
                <a
                  href={SITE.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "pointer-coarse:h-11")}
                >
                  <ToolMarkIcon name="GitHub" className="size-4" />
                  Star on GitHub
                </a>
              )}
            </div>
            {isShowcase ? (
              // The showcase sends no email, so it collects none: releases are on GitHub.
              <a
                href={`${SITE.repo}/releases`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col gap-1 rounded-2xl border border-line-strong bg-surface p-5 transition-colors duration-(--dur-hover) hover:border-ink"
              >
                <span className="inline-flex items-center gap-2 text-small font-semibold text-ink">
                  <ToolMarkIcon name="GitHub" className="size-4" />
                  Follow releases on GitHub
                </span>
                <span className="text-small text-ink-2">Watch the repository, then choose Custom → Releases. No email list, nothing collected.</span>
              </a>
            ) : (
              <NewsletterForm />
            )}
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-10 sm:grid-cols-3 lg:flex lg:gap-x-16 xl:gap-x-24">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title} className="min-w-[8.5rem]">
                <h2 className="font-sans text-eyebrow font-semibold tracking-[0.08em] text-ink-3 uppercase">{col.title}</h2>
                <ul className="mt-4 flex flex-col gap-1">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        {...(isExternal(l.href) ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                        className="inline-flex min-h-9 items-center text-small text-ink-2 transition-colors duration-(--dur-hover) hover:text-ink pointer-coarse:min-h-11"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {isShowcase && (
          <a
            href={SIBLING.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-14 flex flex-col gap-1 rounded-2xl border border-line bg-surface p-5 transition-colors duration-(--dur-hover) hover:border-line-strong sm:flex-row sm:items-center sm:justify-between sm:gap-6"
          >
            <span className="text-small text-ink-2">
              <span className="font-semibold text-ink">{SIBLING.line}</span>{" "}
              {SIBLING.name} is the self-hosted sibling: sign-in and data in your own Postgres, on your own server.
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 text-small font-semibold text-ink">
              See {SIBLING.name}
              <ArrowUpRightIcon aria-hidden className="size-4 transition-transform duration-(--dur-hover) ease-out-quart group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </span>
          </a>
        )}

        <div className="mt-10 flex flex-col gap-4 border-t border-line pt-6 text-small text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE.name}
            {isShowcase ? " · MIT licensed" : (
              <>
                {" · "}
                <a href={TEMPLATE_REPO} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-4 hover:text-ink">
                  Built with GetShipKit
                </a>
              </>
            )}
          </p>
          {socials.length > 0 && (
            <ul className="-mx-2 flex flex-wrap items-center gap-1" aria-label="Elsewhere">
              {socials.map(([key, href]) => (
                <li key={key}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer me"
                    aria-label={key}
                    className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-ink-2 hover:text-ink")}
                  >
                    <ToolMarkIcon name={key} className="size-[1.125rem]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {/* The last word: the product's name, edge to edge, cut by the page's bottom. Decorative. */}
      <div aria-hidden className="pointer-events-none mx-auto mt-10 w-full max-w-[88rem] px-gutter select-none [container-type:inline-size]">
        <p
          className="translate-y-[6%] text-center font-display leading-[0.8] font-bold tracking-[-0.04em] whitespace-nowrap text-line-strong"
          style={{ fontSize: wordmarkSize(SITE.name) }}
        >
          {SITE.name}
        </p>
      </div>
    </footer>
  );
}
