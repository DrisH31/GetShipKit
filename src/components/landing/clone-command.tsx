import { CopyLineButton } from "@/components/marketing/copy-line-button";
import { CONTENT } from "@/config/content";
import { cn } from "@/lib/utils";

/** The clone command as a copyable pill (the same part as OpenShipKit's). */
export function CloneCommand({ className }: { className?: string }) {
  const command = CONTENT.hero.command;
  return (
    <div
      className={cn(
        "inline-flex max-w-full items-center gap-2 rounded-full border border-line-strong bg-card py-1 pr-1 pl-4 font-mono text-small text-ink shadow-[0_1px_0_0_var(--line)]",
        className,
      )}
    >
      <span aria-hidden className="text-ink-faint select-none">$</span>
      <code className="max-w-[calc(100vw-8rem)] min-w-0 overflow-x-auto whitespace-nowrap [scrollbar-width:none]">{command}</code>
      <CopyLineButton value={command} label="Copy the clone command" className="shrink-0 rounded-full pointer-coarse:size-11" />
    </div>
  );
}
