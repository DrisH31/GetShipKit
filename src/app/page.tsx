//
// The landing page, built like OpenShipKit's (DESIGN.md): sections in the order
// of the visitor's questions. What is it → what's wired → what runs where →
// will a payment become access correctly (the peak) → how long to set up → what
// will my customers see → should I self-host instead → last questions → the ask.
// Every section is a server component: the whole page is in the first byte.
//
import { SkipLink } from "@/components/ui/skip-link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Cta } from "@/components/landing/cta";
import { Faq } from "@/components/landing/faq";
import { Features } from "@/components/landing/features";
import { Hero } from "@/components/landing/hero";
import { Logos } from "@/components/landing/logos";
import { Payments } from "@/components/landing/payments";
import { Pricing } from "@/components/landing/pricing";
import { Sibling } from "@/components/landing/sibling";
import { Stack } from "@/components/landing/stack";
import { Steps } from "@/components/landing/steps";

export default function Home() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main">
        <Hero />
        <Logos />
        <Stack />
        <Features />
        <Payments />
        <Steps />
        <Pricing />
        <Sibling />
        <Faq />
        <Cta />
      </main>
      <SiteFooter />
    </>
  );
}
