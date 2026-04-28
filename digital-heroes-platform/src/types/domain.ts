export type UserRole = "user" | "admin";
export type SubscriptionPlan = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "incomplete";
export type DrawMode = "random" | "algorithmic";
export type WinningStatus = "pending" | "approved" | "rejected" | "paid";

export interface ScoreInput {
  score: number;
  playedOn: string;
}

export interface DrawTierConfig {
  match5: number;
  match4: number;
  match3: number;
}
