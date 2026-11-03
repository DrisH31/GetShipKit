//
// "From clone to first payment": a real sequence, so the numbers carry
// information. Words left, the thing that does it right (a terminal, the env file,
// the webhook log), as in OpenShipKit's steps.
//
import { CodePanel } from "@/components/marketing/code-panel";
import { Container } from "@/components/marketing/layout";
import { SectionHeader } from "@/components/marketing/section-header";
import { Steps as StepList } from "@/components/marketing/steps";
import { CONTENT } from "@/config/content";

export function Steps() {
  const s = CONTENT.setup;
  return (
    <section id="setup" aria-labelledby="setup-title" data-tone="page" className="py-section">
      <Container>
        <SectionHeader id="setup-title" eyebrow={s.eyebrow} title={s.title} className="max-w-3xl" />
        <StepList
          className="mt-14 sm:mt-16"
          items={s.steps.map((step, i) => ({
            title: step.title,
            body: step.text,
            visual: (
              <CodePanel
                className="reveal"
                title={`step ${i + 1} · ${step.panel}`}
                lines={step.lines}
                kind={step.panel === "terminal" ? "terminal" : step.panel === "env file" ? "file" : "log"}
              />
            ),
          }))}
        />
      </Container>
    </section>
  );
}
