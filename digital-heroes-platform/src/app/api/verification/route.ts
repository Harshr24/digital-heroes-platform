import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  let userId: string;

  try {
    const user = await requireUser();
    userId = user.id;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { winningId?: string; proofUrl?: string };

    if (!body.winningId || !body.proofUrl) {
      return NextResponse.json({ error: "winningId and proofUrl are required" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("verification_submissions")
      .insert({
        winning_id: body.winningId,
        user_id: userId,
        proof_url: body.proofUrl,
      })
      .select("*")
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Verification already submitted for this winning." },
          { status: 409 },
        );
      }

      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `Failed to submit verification: ${error.message}`
            : "Failed to submit verification",
      },
      { status: 500 },
    );
  }
}
