import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { stripe } from "@/lib/stripe";
import { syncSubscriptionFromStripe } from "@/lib/services/subscriptions";

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.stripeWebhookSecret,
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid webhook" },
      { status: 400 },
    );
  }

  try {
    if (event.type === "customer.subscription.created") {
      await syncSubscriptionFromStripe((event.data.object as { id: string }).id);
    }

    if (event.type === "customer.subscription.updated") {
      await syncSubscriptionFromStripe((event.data.object as { id: string }).id);
    }

    if (event.type === "customer.subscription.deleted") {
      await syncSubscriptionFromStripe((event.data.object as { id: string }).id);
    }

    // On API 2025-03-31, checkout completion can arrive before subscription exists.
    // Use this event opportunistically only when a subscription id is present.
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as { subscription?: string | null };
      if (session.subscription) {
        await syncSubscriptionFromStripe(session.subscription);
      }
    }
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Failed to sync subscription: ${error.message}`
            : "Failed to sync subscription",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ received: true });
}
