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

export interface DrawParticipant {
  userId: string;
  ticket: number[];
  scoreIds: string[];
}

export interface EvaluatedDrawResult {
  userId: string;
  matchedCount: number;
  scoreIds: string[];
  tier: 3 | 4 | 5 | null;
}

export interface EvaluatedWinning {
  userId: string;
  tier: 3 | 4 | 5;
  amount: number;
}
