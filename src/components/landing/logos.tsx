import { Container } from "@/components/marketing/layout";
import { ToolMarkIcon } from "@/components/sections/tool-mark-icon";
import { CONTENT } from "@/config/content";

/** "Built on": the stack's marks in one quiet row, like OpenShipKit's. A name with no mark shows as type. */
export function Logos() {
  const { title, items } = CONTENT.logos;
  return (
    <section aria-labelledby="logos-title" className="pb-14 sm:pb-20">
      <Container>
        <h2 id="logos-title" className="text-center font-sans text-small font-normal text-ink-3">
          {title}
        </h2>
        <ul className="mx-auto mt-5 grid w-fit grid-cols-2 gap-x-8 gap-y-1 md:flex md:w-auto md:flex-wrap md:items-center md:justify-center md:gap-x-10 lg:gap-x-12">
          {items.map((name) => (
            <li key={name}>
              <span className="inline-flex min-h-11 items-center gap-2.5 text-ink-2">
                <ToolMarkIcon name={name} className="sm:size-[1.375rem]" />
                <span className="font-display text-body font-semibold tracking-[-0.01em] sm:text-lead">{name}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
