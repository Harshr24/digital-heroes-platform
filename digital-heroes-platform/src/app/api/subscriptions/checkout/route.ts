import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { createCheckoutSession } from "@/lib/services/subscriptions";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { subscriptionSchema } from "@/lib/validators";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = subscriptionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.message }, { status: 400 });
    }

    const priceId =
      parsed.data.plan === "monthly"
        ? env.stripeMonthlyPriceId
        : env.stripeYearlyPriceId;

    const session = await createCheckoutSession(
      user.id,
      user.email,
      priceId,
      env.appUrl,
    );

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Checkout session failed: ${error.message}`
            : "Checkout session failed",
      },
      { status: 500 },
    );
  }
}
