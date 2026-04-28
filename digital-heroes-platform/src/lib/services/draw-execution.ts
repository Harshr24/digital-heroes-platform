import { addMonths, startOfMonth } from "date-fns";

import { buildTicketFromScores, evaluateDrawEngine } from "@/lib/draw-engine";
import { generateRandomNumbers } from "@/lib/services/draws";
import { supabaseAdmin } from "@/lib/supabase/admin";

type ScoreRow = { id: string; user_id: string; score: number; created_at: string };

async function upsertRolloverToNextDraw(
  currentDrawMonth: string,
  rolloverAmount: number,
  createdBy: string | null,
) {
  if (rolloverAmount <= 0) return;

  const nextDrawMonth = startOfMonth(addMonths(new Date(currentDrawMonth), 1))
    .toISOString()
    .slice(0, 10);

  const { data: existingNext, error: nextError } = await supabaseAdmin
    .from("draws")
    .select("id, jackpot_carryover")
    .eq("draw_month", nextDrawMonth)
    .maybeSingle();

  if (nextError) throw nextError;

  if (existingNext?.id) {
    const { error } = await supabaseAdmin
      .from("draws")
      .update({
        jackpot_carryover: Number(existingNext.jackpot_carryover ?? 0) + rolloverAmount,
      })
      .eq("id", existingNext.id);
    if (error) throw error;
    return;
  }

  const { error } = await supabaseAdmin.from("draws").insert({
    draw_month: nextDrawMonth,
    mode: "random",
    winning_numbers: generateRandomNumbers(5, 45),
    jackpot_carryover: rolloverAmount,
    prize_pool: 0,
    is_published: false,
    created_by: createdBy,
  });

  if (error) throw error;
}

export async function executeDraw(drawId: string) {
  const { data: draw, error: drawError } = await supabaseAdmin
    .from("draws")
    .select("id, draw_month, winning_numbers, prize_pool, jackpot_carryover, is_published, created_by")
    .eq("id", drawId)
    .single();

  if (drawError) throw drawError;
  if (draw.is_published) {
    throw new Error("Draw is already published.");
  }

  const { data: activeSubscriptions, error: subError } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("status", "active");
  if (subError) throw subError;

  const userIds = [...new Set((activeSubscriptions ?? []).map((s) => s.user_id))];
  if (userIds.length === 0) {
    return {
      drawId,
      participantCount: 0,
      winnerCount: 0,
      rolloverAmount: Number(draw.jackpot_carryover ?? 0),
    };
  }

  const { data: scores, error: scoresError } = await supabaseAdmin
    .from("scores")
    .select("id, user_id, score, created_at")
    .in("user_id", userIds)
    .order("created_at", { ascending: false });
  if (scoresError) throw scoresError;

  const scoresByUser = new Map<string, ScoreRow[]>();
  (scores ?? []).forEach((row) => {
    const current = scoresByUser.get(row.user_id) ?? [];
    if (current.length < 5) current.push(row as ScoreRow);
    scoresByUser.set(row.user_id, current);
  });

  const participants = userIds
    .map((userId) => {
      const userScores = scoresByUser.get(userId) ?? [];
      const ticket = buildTicketFromScores(userScores.map((s) => s.score));
      return {
        userId,
        ticket,
        scoreIds: userScores.map((s) => s.id),
      };
    })
    .filter((p) => p.ticket.length > 0);

  const computed = evaluateDrawEngine({
    participants,
    winningNumbers: draw.winning_numbers as number[],
    prizePool: Number(draw.prize_pool ?? 0),
    jackpotCarryover: Number(draw.jackpot_carryover ?? 0),
  });

  await supabaseAdmin.from("draw_results").delete().eq("draw_id", draw.id);

  if (computed.results.length > 0) {
    const { error: resultsError } = await supabaseAdmin.from("draw_results").insert(
      computed.results.map((result) => ({
        draw_id: draw.id,
        user_id: result.userId,
        matched_count: result.matchedCount,
        score_ids: result.scoreIds,
      })),
    );
    if (resultsError) throw resultsError;
  }

  const { data: persistedResults, error: persistedError } = await supabaseAdmin
    .from("draw_results")
    .select("id, user_id, matched_count")
    .eq("draw_id", draw.id);
  if (persistedError) throw persistedError;

  const resultIdByUser = new Map<string, string>();
  (persistedResults ?? []).forEach((row) => {
    if (row.matched_count >= 3) resultIdByUser.set(row.user_id, row.id);
  });

  if (computed.winnings.length > 0) {
    const { error: winningsError } = await supabaseAdmin.from("winnings").insert(
      computed.winnings
        .map((w) => {
          const drawResultId = resultIdByUser.get(w.userId);
          if (!drawResultId) return null;
          return {
            draw_result_id: drawResultId,
            user_id: w.userId,
            amount: w.amount,
            tier: w.tier,
            status: "pending",
          };
        })
        .filter((v): v is NonNullable<typeof v> => Boolean(v)),
    );
    if (winningsError) throw winningsError;
  }

  await upsertRolloverToNextDraw(
    draw.draw_month,
    computed.rolloverAmount,
    draw.created_by as string | null,
  );

  const { error: updateError } = await supabaseAdmin
    .from("draws")
    .update({ is_published: true })
    .eq("id", draw.id);
  if (updateError) throw updateError;

  return {
    drawId: draw.id,
    participantCount: participants.length,
    winnerCount: computed.winnings.length,
    rolloverAmount: computed.rolloverAmount,
    payoutTotal: computed.winnings.reduce((sum, w) => sum + w.amount, 0),
  };
}
