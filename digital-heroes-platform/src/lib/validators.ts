import { z } from "zod";

export const scoreSchema = z.object({
  score: z.coerce.number().int().min(1).max(45),
  playedOn: z.string().min(1),
});

export const charitySchema = z.object({
  charityId: z.string().uuid(),
  charityPercentage: z.coerce.number().min(10).max(100),
});

export const subscriptionSchema = z.object({
  plan: z.enum(["monthly", "yearly"]),
});
