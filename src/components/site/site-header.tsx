//
// The site header, built like OpenShipKit's: the mark left, the section links
// centred, the actions right. Neutral chrome (the page tone, a hairline once
// content scrolls under it: .header-edge in motion.css). Sticky from 768 px; on a
// phone it scrolls away so it never covers a focused field.
//
// Auth-aware on the server: a signed-in visitor sees "Dashboard" instead of
// "Sign in" and the CTA. If Clerk can't be reached the signed-out header renders,
// so a sign-in outage never takes the marketing page down.
//
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { buttonVariants } from "@/components/ui/button";
import { ToolMarkIcon } from "@/components/sections/tool-mark-icon";
import { SITE, isShowcase } from "@/config/site";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { SchemeSwitch } from "./scheme-switch";
import { MobileMenu, NavLinks, type NavLink } from "./site-nav";

const LINKS: NavLink[] = [
  { label: "Features", href: "/#features" },
  { label: "Payments", href: "/#payments" },
  { label: "Setup", href: "/#setup" },
  { label: "Plans", href: "/#plans" },
  { label: "FAQ", href: "/#faq" },
];

async function signedIn(): Promise<boolean> {
  try {
    return Boolean((await auth()).userId);
  } catch (error) {
    // Next.js signals (dynamic rendering, redirects) pass through; only real failures fall back.
    unstable_rethrow(error);
    console.error("[site-header] auth unavailable; rendering the signed-out header", error);
    return false;
  }
}

export async function SiteHeader() {
  const user = await signedIn();
  // The header's one action: the dashboard once signed in; otherwise the code (the showcase) or sign-up (your product).
  const cta = user
    ? { label: "Dashboard", href: "/dashboard", github: false }
    : isShowcase
      ? { label: "Get the code", href: SITE.repo, github: true }
      : { label: "Get started", href: "/sign-up", github: false };

  return (
    <header className="header-edge relative z-(--z-header) bg-bg md:sticky md:top-0">
      <div className="mx-auto grid h-16 w-full max-w-[88rem] grid-cols-[1fr_auto] items-center gap-4 px-gutter md:h-[4.5rem] md:pointer-coarse:h-20 lg:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          aria-label={`${SITE.name} home`}
          className="-mx-1.5 inline-flex min-h-11 items-center justify-self-start rounded-full px-1.5"
        >
          <Logo name={SITE.name} />
        </Link>
        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks links={LINKS} />
        </nav>
        <div className="flex items-center justify-self-end gap-1.5 sm:gap-2">
          <SchemeSwitch />
          {!user && (
            <Link href="/sign-in" className={cn(buttonVariants({ variant: "ghost" }), "hidden sm:inline-flex")}>
              Sign in
            </Link>
          )}
          <Link
            href={cta.href}
            data-rank="2"
            {...(cta.github ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={cn(buttonVariants({ variant: "outline" }), "hidden sm:inline-flex")}
          >
            {cta.github && <ToolMarkIcon name="GitHub" data-icon="inline-start" className="size-4" />}
            {cta.label}
          </Link>
          <MobileMenu links={LINKS}>
            <Link href={cta.href} className={cn(buttonVariants({ variant: "default", size: "lg" }), "w-full")}>
              {cta.github && <ToolMarkIcon name="GitHub" data-icon="inline-start" className="size-4" />}
              {cta.label}
            </Link>
            {!user && (
              <Link href="/sign-in" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}>
                Sign in
              </Link>
            )}
          </MobileMenu>
        </div>
      </div>
    </header>
  );
}
