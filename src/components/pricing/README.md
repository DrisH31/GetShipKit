# Pricing components

- **PlanCards** (exported as `PricingCards`): the plan cards with a Monthly/Yearly
  switch, used by the landing page and the billing page, so the two can't show
  different prices.

Plans, prices and features live in `src/config/plans.ts`; plan names come from
your Polar products (`NEXT_PUBLIC_PRODUCTS`). Keep the prices equal to Polar's:
Polar charges what Polar says.
