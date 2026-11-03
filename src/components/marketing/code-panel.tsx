/* Standards (web-design): COL-1 Text contrast · PAGE-1 Content in the first byte */
import { FileTextIcon, TerminalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { CopyLineButton } from "./copy-line-button";

/* A terminal or file excerpt, as proof of how something works. Same look as
   OpenShipKit's CodePanel (window chrome, a muted `$` prompt that can't be
   copied), without its highlighter: GetShipKit's snippets are short. Lines never
   wrap; a long one scrolls inside the panel, never the page. */
export function CodePanel({
  title,
  lines,
  kind = "terminal",
  className,
}: {
  title: string;
  lines: readonly string[];
  /** "terminal": commands after a prompt, copyable. "file"/"log": plain lines. */
  kind?: "terminal" | "file" | "log";
  className?: string;
}) {
  const Icon = kind === "terminal" ? TerminalIcon : FileTextIcon;
  const copy = kind === "terminal" ? lines.join("\n") : kind === "file" ? lines.map((l) => l.replace(/=.*$/, "=")).join("\n") : "";
  return (
    <figure
      data-mockup
      className={cn("overflow-hidden rounded-xl border border-line-strong bg-card shadow-[0_1px_0_0_var(--line)]", className)}
    >
      <figcaption className="flex min-h-10 items-center gap-3 border-b border-line bg-[color-mix(in_oklab,var(--card),var(--ink)_3%)] py-1 pr-1.5 pl-3.5">
        <span aria-hidden className="flex shrink-0 gap-1.5">
          {[0, 1, 2].map((i) => <span key={i} className="size-2.5 rounded-full bg-line-strong" />)}
        </span>
        <span className="flex min-w-0 flex-1 items-center gap-1.5 font-mono text-caption text-ink-3">
          <Icon aria-hidden className="size-3.5 shrink-0" />
          <span className="truncate">{title}</span>
        </span>
        {copy && <CopyLineButton value={copy} label={`Copy: ${title}`} className="shrink-0" />}
      </figcaption>
      <pre
        tabIndex={0}
        role="region"
        aria-label={title}
        className="overflow-x-auto p-4 font-mono text-small leading-7 focus-visible:outline-offset-[-2px]"
      >
        <code>
          {lines.map((line, i) => (
            <span key={i} className={cn("block whitespace-pre", kind === "terminal" ? "text-ink" : "text-ink-2")}>
              {kind === "terminal" && <span aria-hidden className="text-ink-faint select-none">$ </span>}
              {line}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}
