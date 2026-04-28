import { addMonths, startOfMonth } from "date-fns";

import { supabaseAdmin } from "@/lib/supabase/admin";
import type { DrawMode } from "@/types/domain";

export function generateRandomNumbers(length: number, max: number) {
  const numbers = new Set<number>();
  while (numbers.size < length) {
    numbers.add(Math.floor(Math.random() * max) + 1);
  }
  return [...numbers].sort((a, b) => a - b);
}

export async function createMonthlyDraw(mode: DrawMode, userId: string) {
  const drawMonth = startOfMonth(addMonths(new Date(), 1)).toISOString().slice(0, 10);
  const winningNumbers = generateRandomNumbers(5, 45);

  const { data, error } = await supabaseAdmin
    .from("draws")
    .upsert(
      {
        draw_month: drawMonth,
        mode,
        winning_numbers: winningNumbers,
        created_by: userId,
      },
      { onConflict: "draw_month" },
    )
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
