import Stripe from "stripe";
import { env } from "@/lib/env";

export const stripe = new Stripe(env.stripeSecretKey, {
  apiVersion: "2024-06-20", // ✅ stable version with those fields
});