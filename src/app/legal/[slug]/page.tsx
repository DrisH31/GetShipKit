import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LEGAL_PAGES } from "@/config/legal";
import { SkipLink } from "@/components/ui/skip-link";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

type Params = { params: Promise<{ slug: string }> };

function pageFor(slug: string) {
  return slug === "terms" || slug === "privacy" ? LEGAL_PAGES[slug] : null;
}

export function generateStaticParams() {
  return [{ slug: "terms" }, { slug: "privacy" }];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = pageFor((await params).slug);
  if (!page) return {};
  // An unfinished draft stays out of search results.
  return { title: page.title, robots: page.ready ? undefined : { index: false, follow: true } };
}

export default async function LegalPageView({ params }: Params) {
  const page = pageFor((await params).slug);
  if (!page) notFound();

  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main" className="mx-auto w-full max-w-measure px-gutter py-section">
        <h1 className="font-display text-h1 font-bold text-ink">{page.title}</h1>
        {page.updated && <p className="mt-3 text-small text-ink-3">Last updated {page.updated}</p>}
        {!page.ready && (
          <p role="note" className="mt-8 rounded-xl border border-line-strong bg-warning-soft p-4 text-small text-ink">
            This is a draft outline, not the final text. Replace it in <code className="font-mono">src/config/legal.ts</code> before launch.
          </p>
        )}
        <div className="mt-10 flex flex-col gap-8">
          {page.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-display text-h3 font-bold text-ink">{section.heading}</h2>
              <p className="mt-2 text-reading text-ink-2">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
