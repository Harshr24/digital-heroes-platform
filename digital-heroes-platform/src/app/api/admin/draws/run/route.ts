import { NextResponse } from "next/server";

import { createMonthlyDraw } from "@/lib/services/draws";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as { mode?: "random" | "algorithmic" };
    const draw = await createMonthlyDraw(body.mode ?? "random", user.id);

    return NextResponse.json({ data: draw });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? `Draw execution failed: ${error.message}` : "Draw execution failed",
      },
      { status: 500 },
    );
  }
}
