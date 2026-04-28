import type {
  DrawParticipant,
  DrawTierConfig,
  EvaluatedDrawResult,
  EvaluatedWinning,
} from "@/types/domain";

const DEFAULT_TIER_CONFIG: DrawTierConfig = {
  match5: 0.4,
  match4: 0.35,
  match3: 0.25,
};

function toCents(amount: number) {
  return Math.round(amount * 100);
}

function fromCents(cents: number) {
  return cents / 100;
}

function distributeEvenly(totalAmount: number, userIds: string[]) {
  if (userIds.length === 0) return new Map<string, number>();

  const totalCents = toCents(totalAmount);
  const base = Math.floor(totalCents / userIds.length);
  const remainder = totalCents % userIds.length;
  const map = new Map<string, number>();

  userIds.forEach((id, index) => {
    map.set(id, fromCents(base + (index < remainder ? 1 : 0)));
  });

  return map;
}

export function buildTicketFromScores(scores: number[]) {
  return [...new Set(scores)].slice(0, 5);
}

export function calculateMatchedCount(ticket: number[], winningNumbers: number[]) {
  const winningSet = new Set(winningNumbers);
  return ticket.reduce((count, n) => (winningSet.has(n) ? count + 1 : count), 0);
}

export function calculateTier(matchedCount: number): 3 | 4 | 5 | null {
  if (matchedCount >= 5) return 5;
  if (matchedCount === 4) return 4;
  if (matchedCount === 3) return 3;
  return null;
}

export function evaluateDrawEngine(input: {
  participants: DrawParticipant[];
  winningNumbers: number[];
  prizePool: number;
  jackpotCarryover: number;
  tierConfig?: DrawTierConfig;
}) {
  const tierConfig = input.tierConfig ?? DEFAULT_TIER_CONFIG;

  const results: EvaluatedDrawResult[] = input.participants.map((participant) => {
    const matchedCount = calculateMatchedCount(participant.ticket, input.winningNumbers);
    return {
      userId: participant.userId,
      matchedCount,
      scoreIds: participant.scoreIds,
      tier: calculateTier(matchedCount),
    };
  });

  const tier5Users = results.filter((r) => r.tier === 5).map((r) => r.userId);
  const tier4Users = results.filter((r) => r.tier === 4).map((r) => r.userId);
  const tier3Users = results.filter((r) => r.tier === 3).map((r) => r.userId);

  const tier5Pool = input.prizePool * tierConfig.match5 + input.jackpotCarryover;
  const tier4Pool = input.prizePool * tierConfig.match4;
  const tier3Pool = input.prizePool * tierConfig.match3;

  const rolloverAmount = tier5Users.length === 0 ? tier5Pool : 0;
  const tier5Distribution = distributeEvenly(
    tier5Users.length === 0 ? 0 : tier5Pool,
    tier5Users,
  );
  const tier4Distribution = distributeEvenly(tier4Pool, tier4Users);
  const tier3Distribution = distributeEvenly(tier3Pool, tier3Users);

  const winnings: EvaluatedWinning[] = [];
  tier5Users.forEach((userId) =>
    winnings.push({ userId, tier: 5, amount: tier5Distribution.get(userId) ?? 0 }),
  );
  tier4Users.forEach((userId) =>
    winnings.push({ userId, tier: 4, amount: tier4Distribution.get(userId) ?? 0 }),
  );
  tier3Users.forEach((userId) =>
    winnings.push({ userId, tier: 3, amount: tier3Distribution.get(userId) ?? 0 }),
  );

  return { results, winnings, rolloverAmount };
}
