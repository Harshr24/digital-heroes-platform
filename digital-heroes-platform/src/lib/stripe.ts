import Stripe from "stripe";
import { env } from "@/lib/env";

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2026-04-22.dahlia", // ✅ matches installed Stripe package
});