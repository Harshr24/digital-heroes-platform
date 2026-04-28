import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

// ✅ Function 1 — make sure this is still here
export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  priceId: string,
  appUrl: string,
) {
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: userEmail,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      metadata: { userId },
    },
    success_url: `${appUrl}/dashboard?checkout=success`,
    cancel_url: `${appUrl}/dashboard?checkout=cancelled`,
    metadata: { userId },
  });

  return session;
}

// ✅ Function 2
export async function syncSubscriptionFromStripe(stripeSubscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const userId = subscription.metadata.userId;

  if (!userId) return;

  const sub = subscription as any;
  const item = sub.items?.data?.[0];

  const mappedStatus =
    subscription.status === "active"
      ? "active"
      : subscription.status === "canceled"
        ? "cancelled"
        : subscription.status === "incomplete_expired"
          ? "expired"
          : "inactive";

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: String(subscription.customer),
      stripe_subscription_id: subscription.id,
      plan:
        item?.price?.recurring?.interval === "year"
          ? "yearly"
          : "monthly",
      status: mappedStatus,
      period_start: new Date((item?.current_period_start ?? sub.current_period_start) * 1000).toISOString(),
      period_end: new Date((item?.current_period_end ?? sub.current_period_end) * 1000).toISOString(),
      cancel_at_period_end: sub.cancel_at_period_end ?? false,
    },
    { onConflict: "user_id" },
  );
}