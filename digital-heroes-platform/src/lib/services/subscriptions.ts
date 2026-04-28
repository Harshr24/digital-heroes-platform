export async function syncSubscriptionFromStripe(stripeSubscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(stripeSubscriptionId);
  const userId = subscription.metadata.userId;

  if (!userId) return;

  // ✅ Cast to any — Stripe's TS types for 2025-03-31.basil are incomplete
  const sub = subscription as any;
  const item = sub.items?.data?.[0];

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