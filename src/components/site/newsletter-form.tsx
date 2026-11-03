"use client";
//
// The newsletter sign-up, as one card (OpenShipKit's look). Posts to
// /api/newsletter, which answers the same whether or not the address was already
// there, so the form can't reveal who is subscribed.
//
import { useState } from "react";
import { cn } from "@/lib/utils";

type Status = "ok" | "invalid" | "error";

const MESSAGES: Record<Status, string> = {
  ok: "You're on the list.",
  invalid: "Please enter a valid email address.",
  error: "Something went wrong. Please try again.",
};

export function NewsletterForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [sending, setSending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") ?? "");
    setSending(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const next: Status = res.ok ? "ok" : res.status === 400 ? "invalid" : "error";
      setStatus(next);
      if (next === "ok") form.reset();
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("flex flex-col rounded-2xl border border-line-strong bg-surface p-5", className)}>
      <label htmlFor="newsletter-email" className="text-small font-semibold text-ink">
        Get the changelog by email
      </label>
      <p className="mt-1 text-small text-ink-2">One email when a release ships. Nothing else.</p>
      <div
        className={cn(
          "mt-4 flex items-center gap-1 rounded-full border border-field bg-bg p-1 transition-[border-color] duration-(--dur-hover)",
          "focus-within:border-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus",
          status === "invalid" && "border-danger",
        )}
      >
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          aria-invalid={status === "invalid" || undefined}
          aria-describedby="newsletter-status"
          className="h-9 min-w-0 flex-1 bg-transparent pl-3 text-body text-ink outline-none placeholder:text-ink-3 pointer-coarse:h-10 pointer-fine:text-small"
        />
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-9 shrink-0 items-center rounded-full bg-tonal px-4 text-small font-semibold text-ink transition-colors duration-(--dur-hover) hover:bg-tonal-hover disabled:opacity-60 pointer-coarse:h-10"
        >
          {sending ? "Subscribing…" : "Subscribe"}
        </button>
      </div>
      <p id="newsletter-status" role="status" className={cn("mt-3 min-h-5 text-small", status === "ok" ? "text-ink-2" : "text-danger")}>
        {status ? MESSAGES[status] : <span className="text-ink-3">No spam. Unsubscribe from any email.</span>}
      </p>
    </form>
  );
}
