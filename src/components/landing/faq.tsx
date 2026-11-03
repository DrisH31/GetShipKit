import { FAQ } from "@/components/marketing/faq";
import { Container } from "@/components/marketing/layout";
import { Heading } from "@/components/marketing/type";
import { CONTENT } from "@/config/content";

/** Questions on native <details>: every answer is in the HTML. Heading left, list right, as OpenShipKit's. */
export function Faq() {
  const f = CONTENT.faq;
  return (
    <section id="faq" aria-labelledby="faq-title" data-tone="page" className="py-section">
      <Container>
        <div className="grid-12 gap-x-8 gap-y-10">
          <div className="col-span-4 sm:col-span-12 lg:col-span-4">
            <Heading id="faq-title" className="max-w-[16ch]">{f.title}</Heading>
            <p className="mt-6 max-w-[36ch] text-small text-ink-2">{f.aside}</p>
          </div>
          <div className="col-span-4 sm:col-span-12 lg:col-span-8">
            <FAQ items={f.items.map((q) => ({ q: q.question, a: <p>{q.answer}</p> }))} />
          </div>
        </div>
      </Container>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: f.items.map((q) => ({ "@type": "Question", name: q.question, acceptedAnswer: { "@type": "Answer", text: q.answer } })),
          }).replace(/</g, "\\u003c"),
        }}
      />
    </section>
  );
}
