import assert from "node:assert/strict";
import test from "node:test";

import { evaluateDrawEngine } from "@/lib/draw-engine";

test("rolls over jackpot when no tier-5 winners", () => {
  const result = evaluateDrawEngine({
    participants: [
      { userId: "u1", ticket: [1, 2, 3, 4, 40], scoreIds: ["s1", "s2", "s3", "s4", "s5"] },
      { userId: "u2", ticket: [1, 2, 30, 31, 32], scoreIds: ["s6", "s7", "s8", "s9", "s10"] },
    ],
    winningNumbers: [1, 2, 3, 4, 5],
    prizePool: 1000,
    jackpotCarryover: 250,
  });

  assert.equal(result.rolloverAmount, 650);
  assert.equal(result.winnings.some((w) => w.tier === 5), false);
});

test("distributes payouts evenly with cent-safe split", () => {
  const result = evaluateDrawEngine({
    participants: [
      { userId: "u1", ticket: [1, 2, 3, 4, 5], scoreIds: ["s1"] },
      { userId: "u2", ticket: [1, 2, 3, 4, 5], scoreIds: ["s2"] },
    ],
    winningNumbers: [1, 2, 3, 4, 5],
    prizePool: 1000,
    jackpotCarryover: 1,
  });

  const totalTier5 = result.winnings.filter((w) => w.tier === 5).reduce((s, w) => s + w.amount, 0);
  assert.equal(totalTier5, 401);
});
