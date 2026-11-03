'use client';
//
// The plan cards, on the landing page and the billing page alike, so the two
// can't disagree: names from your Polar products, prices and features from
// src/config/plans.ts. Built like OpenShipKit's: a Monthly/Yearly switch, the
// recommended plan raised (a ring and a shadow, never the accent), the accent
// only on the selected interval and the recommended plan's button.
//
// Buying: /api/checkout (which redirects to Polar, or to sign-in first when
// signed out). The billing page passes its own handlers.
//
import { useState } from 'react';
import { CheckIcon } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { ONE_TIME, PLANS, formatPrice, type Plan } from '@/config/plans';
import { isOneTimeModel } from '@/utils/paymentModel';
import { cn } from '@/lib/utils';

type Period = 'monthly' | 'annual';

export interface PricingCardsProps {
  isLoading?: Record<string, boolean>;
  onUpgrade?: (planType: string, period: Period, productId: string) => void;
  onOneTimeUpgrade?: (productId: string) => void;
  /** The signed-in viewer's plan name, to mark "Your plan". */
  currentPlan?: string;
  defaultPeriod?: Period;
  /** Kept for the billing page's call; every action is a button. */
  buttonType?: 'link' | 'button';
  /** Heading level of each plan's name: 3 under a section's h2. */
  headingLevel?: 2 | 3;
}

// Checkout itself sends a signed-out visitor to sign-in first and back again,
// so the cards need no Clerk in the browser (the landing page ships none).
function go(productId: string) {
  window.location.href = `/api/checkout?productId=${encodeURIComponent(productId)}`;
}

export default function PlanCards({
  isLoading = {},
  onUpgrade,
  onOneTimeUpgrade,
  currentPlan,
  defaultPeriod = 'monthly',
  headingLevel = 3,
}: PricingCardsProps) {
  const [period, setPeriod] = useState<Period>(defaultPeriod);
  const Title = `h${headingLevel}` as 'h2' | 'h3';

  if (isOneTimeModel()) {
    const busy = isLoading.onetime;
    return (
      <ul aria-label="Plans" className="grid max-w-md gap-4">
        <li className="flex flex-col gap-6 rounded-2xl border border-line-strong bg-card p-6 shadow-mockup ring-1 ring-ink/15 dark:bg-raised">
          <div className="flex flex-col gap-3">
            <Title className="font-sans text-body font-semibold text-ink">{ONE_TIME.name}</Title>
            <p className="flex items-baseline gap-2">
              <span className="figure text-h2 leading-none text-ink">{formatPrice(ONE_TIME.price)}</span>
              <span className="text-small text-ink-2">one-time</span>
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => (onOneTimeUpgrade ? onOneTimeUpgrade(ONE_TIME.key) : go(ONE_TIME.key))}
              className={cn(buttonVariants({ size: 'lg' }), 'w-full')}
            >
              {busy ? 'Opening checkout…' : 'Buy once'}
            </button>
            <p className="text-center text-caption text-ink-3">No subscription, no renewals.</p>
          </div>
          <Features items={ONE_TIME.features} />
        </li>
      </ul>
    );
  }

  const saving = Math.max(...PLANS.map((p) => Math.round((1 - p.annual / (p.monthly * 12)) * 100)));

  return (
    <div>
      <fieldset className="mb-8 flex flex-wrap items-center gap-3">
        <legend className="sr-only">Billing period</legend>
        <div className="inline-flex rounded-full border border-line-strong bg-surface p-1">
          {(['monthly', 'annual'] as const).map((p) => (
            <label
              key={p}
              className="relative inline-flex min-h-10 cursor-pointer items-center rounded-full px-4 text-small font-semibold text-ink-2 transition-[background-color,color] duration-(--dur-hover) ease-out-quart select-none hover:text-ink has-[:checked]:bg-action has-[:checked]:text-action-ink has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-focus pointer-coarse:min-h-11"
            >
              <input
                type="radio"
                name="plan-period"
                value={p}
                checked={period === p}
                onChange={() => setPeriod(p)}
                className="sr-only"
              />
              {p === 'monthly' ? 'Monthly' : 'Yearly'}
            </label>
          ))}
        </div>
        {saving > 0 && <span className="text-small text-ink-2">Yearly saves up to {saving}%</span>}
      </fieldset>
      <ul aria-label="Plans" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLANS.map((plan) => (
          <PlanCard
            key={plan.key}
            plan={plan}
            period={period}
            mine={Boolean(currentPlan) && currentPlan!.toLowerCase() === plan.name.toLowerCase()}
            busy={Boolean(isLoading[`${plan.key}_${period}`] || isLoading[plan.key])}
            Title={Title}
            onBuy={() => {
              const productId = `${plan.key}_${period}`;
              if (onUpgrade) onUpgrade(plan.key, period, productId);
              else go(productId);
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function PlanCard({
  plan,
  period,
  mine,
  busy,
  Title,
  onBuy,
}: {
  plan: Plan;
  period: Period;
  mine: boolean;
  busy: boolean;
  Title: 'h2' | 'h3';
  onBuy: () => void;
}) {
  const price = period === 'monthly' ? plan.monthly : plan.annual;
  return (
    <li
      className={cn(
        'flex flex-col gap-6 rounded-2xl border p-6',
        plan.recommended ? 'border-line-strong bg-card shadow-mockup ring-1 ring-ink/15 dark:bg-raised' : 'border-line bg-surface',
      )}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <Title className="font-sans text-body font-semibold text-ink">{plan.name}</Title>
          {mine ? (
            <span className="inline-flex h-6 items-center rounded-full bg-tonal px-2.5 text-caption font-semibold text-ink-2">Your plan</span>
          ) : plan.recommended ? (
            <span className="inline-flex h-6 items-center rounded-full border border-line px-2.5 text-caption font-semibold text-ink-2">Recommended</span>
          ) : null}
        </div>
        <p className="flex items-baseline gap-2">
          <span className="figure text-h2 leading-none text-ink">{formatPrice(price)}</span>
          <span className="text-small text-ink-2">{period === 'monthly' ? 'per month' : 'per year'}</span>
        </p>
      </div>
      <button
        type="button"
        disabled={busy || mine}
        onClick={onBuy}
        className={cn(buttonVariants({ variant: plan.recommended ? 'default' : 'outline', size: 'lg' }), 'w-full')}
      >
        {mine ? 'Current plan' : busy ? 'Opening checkout…' : `Choose ${plan.name}`}
      </button>
      <Features items={plan.features} />
    </li>
  );
}

function Features({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-3 border-t border-line pt-6 text-small text-ink-2">
      {items.map((f) => (
        <li key={f} className="flex gap-3">
          <CheckIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-ink" />
          {f}
        </li>
      ))}
    </ul>
  );
}
