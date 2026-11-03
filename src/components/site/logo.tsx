//
// The GetShipKit mark and wordmark. The mark is GetShipKit's icon, the green
// shipping box on black: the same image as the favicon (src/app/icon.png), so
// the tab, the home-screen icon and the page all show one mark. Same
// construction as OpenShipKit's logo (mark + display-face name), so the
// siblings read as a family.
//
// A static import: next/image serves it hashed, sized and cached.
//

import Image from "next/image";
import { cn } from "@/lib/utils";
import mark from "./getshipkit-mark.png";

/** The mark alone. Decorative by default; give it a `title` when it stands without a wordmark. */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <Image
      src={mark}
      alt={title ?? ""}
      aria-hidden={title ? undefined : true}
      width={28}
      height={28}
      priority
      className={cn("size-7 shrink-0 rounded-[8px] ring-1 ring-black/5 dark:ring-white/10", className)}
    />
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
