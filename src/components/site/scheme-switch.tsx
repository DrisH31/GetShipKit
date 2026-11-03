"use client";
/* Standards (web-design): MOT-8 Reduced motion ships less */
//
// One button for the scheme, as OpenShipKit's: a toggle named "Dark mode" whose
// pressed state changes. The new scheme opens as a circle from the button in a
// single View Transition (.scheme-vt in motion.css), so no frame shows half the
// page in each scheme. Under reduced motion, or without View Transitions, it
// simply changes. The icon waits for the browser, which knows the scheme.
//
import { useContext, useRef } from "react";
import { flushSync } from "react-dom";
import { MoonIcon, SunIcon } from "lucide-react";
import { ThemeContext } from "@/app/providers";
import { buttonVariants } from "@/components/ui/button";
import { useIsClient } from "@/lib/hooks/use-is-client";
import { cn } from "@/lib/utils";

export function SchemeSwitch({ className }: { className?: string }) {
  const { theme, setTheme } = useContext(ThemeContext);
  const ready = useIsClient();
  const button = useRef<HTMLButtonElement>(null);
  const dark = ready && theme === "dark";

  const flip = () => {
    const root = document.documentElement;
    const next = root.classList.contains("dark") ? "light" : "dark";
    if (!document.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTheme(next);
      return;
    }
    const r = button.current!.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    root.style.setProperty("--vt-x", `${x}px`);
    root.style.setProperty("--vt-y", `${y}px`);
    root.style.setProperty("--vt-r", `${Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))}px`);
    root.classList.add("scheme-vt");
    const vt = document.startViewTransition(() => {
      flushSync(() => setTheme(next));
    });
    vt.finished.finally(() => root.classList.remove("scheme-vt"));
  };

  return (
    <button
      ref={button}
      type="button"
      onClick={flip}
      aria-label="Dark mode"
      aria-pressed={ready ? dark : undefined}
      className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "text-ink-2 hover:text-ink", className)}
    >
      {ready ? (
        dark ? <SunIcon aria-hidden className="size-[1.125rem]" /> : <MoonIcon aria-hidden className="size-[1.125rem]" />
      ) : (
        <span aria-hidden className="size-[1.125rem]" />
      )}
    </button>
  );
}
