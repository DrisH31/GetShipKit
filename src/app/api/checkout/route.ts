import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { POLAR_PRODUCT_IDS } from "@/config/polarProductIds";
import { getPolar } from "@/lib/polar";

// GET /api/checkout?productId=pro_monthly → redirect to a Polar checkout.
// Signed-in only (src/proxy.ts protects it, and it is checked again here).

type ProductKey = keyof typeof POLAR_PRODUCT_IDS;

function isProductKey(key: string | null): key is ProductKey {
  return key !== null && Object.prototype.hasOwnProperty.call(POLAR_PRODUCT_IDS, key);
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in?redirect=/dashboard/billing", request.url));
  }

  const productKey = request.nextUrl.searchParams.get("productId");
  if (!isProductKey(productKey)) {
    return NextResponse.json({ error: "Unknown product" }, { status: 400 });
  }
  const polarProductId = POLAR_PRODUCT_IDS[productKey];
  if (!polarProductId) {
    console.error(`[checkout] no Polar product id configured for "${productKey}" (NEXT_PUBLIC_PRODUCTS)`);
    return NextResponse.json({ error: "This plan is not available yet" }, { status: 500 });
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress;
  const successUrl =
    process.env.POLAR_SUCCESS_URL ?? new URL("/dashboard/billing?success=true", request.url).toString();

  try {
    const checkout = await getPolar().checkouts.create({
      products: [polarProductId],
      success_url: successUrl,
      customer_email: email ?? null,
      // Ties the purchase to this account. The webhook trusts these two fields,
      // so a payment is never credited by guessing from an email address.
      external_customer_id: userId,
      metadata: { clerk_user_id: userId },
    });
    return NextResponse.redirect(checkout.url, 303);
  } catch (error) {
    console.error("[checkout] Polar refused to create a checkout:", error);
    return NextResponse.json({ error: "Could not start checkout. Please try again." }, { status: 502 });
  }
}
