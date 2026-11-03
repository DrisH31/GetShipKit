//
// The GetShipKit mark and wordmark. The mark is GetShipKit's lightning bolt
// ("ship it now"), white on a rounded square in the mark gradient
// (--brand-mark-from/to in brand.css), never the UI accent. One shape, so it still
// reads at 16 px. Same construction as OpenShipKit's logo (mark + display-face
// name), so the siblings read as a family.
//
// Server-safe: useId only, no state.
//

import { useId } from "react";
import { cn } from "@/lib/utils";

/** The mark alone. Decorative by default; pass `title` when it stands without a wordmark. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  const id = useId();
  const gradient = `gk-mark-${id.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-7 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
    >
      <defs>
        <linearGradient id={gradient} x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="var(--brand-mark-to)" />
          <stop offset="1" stopColor="var(--brand-mark-from)" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill={`url(#${gradient})`} />
      <path d="M17.6 6.5 9.5 17.4h6.2l-1.3 8.1 8.1-10.9h-6.2z" fill="#fff" />
    </svg>
  );
}

/** Mark + wordmark, set in the display face. The visible name is the accessible name. */
export function Logo({ name = "GetShipKit", className }: { name?: string; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-ink", className)}>
      <LogoMark />
      <span className="font-display text-[1.1875rem] leading-none font-bold tracking-[-0.02em]">{name}</span>
    </span>
  );
}
