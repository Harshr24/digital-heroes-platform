import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";

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

export async function syncSubscriptionFromStripe(stripeSubscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const userId = subscription.metadata.userId;

  if (!userId) return;

  const mappedStatus =
    subscription.status === "active"
      ? "active"
      : subscription.status === "canceled"
        ? "cancelled"
        : subscription.status === "incomplete_expired"
          ? "expired"
          : "incomplete";

  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      stripe_customer_id: String(subscription.customer),
      stripe_subscription_id: subscription.id,
      plan:
        subscription.items.data[0]?.price?.recurring?.interval === "year"
          ? "yearly"
          : "monthly",
      status: mappedStatus,
      period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { onConflict: "user_id" },
  );
}
