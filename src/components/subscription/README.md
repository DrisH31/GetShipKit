# Subscription Components

- **SubscriptionStatus**: shows the current subscription and its cancel button.

## Gating paid pages

Do **not** gate paid content with a client component. Anything sent to the
browser before a server check (a bundle, a prop, an API response) can be read
without paying. Check on the server instead, at the top of the page or route:

```tsx
// src/app/dashboard/something/page.tsx
import { requirePaidAccess } from "@/lib/entitlement";

export const dynamic = "force-dynamic";

export default async function Page() {
  await requirePaidAccess(); // redirects to sign-in or billing otherwise
  return <PaidThing />;
}
```

In a route handler, use `hasPaidAccess(userId)` and return 403 when it is false.
