import { NextResponse } from "next/server";

import { requireUser, unauthorizedResponse } from "@/lib/auth";
import { getRecentScores, upsertScoreForUser } from "@/lib/services/scores";
import { scoreSchema } from "@/lib/validators";

export async function GET() {
  try {
    const user = await requireUser();
    const data = await getRecentScores(user.id);
    return NextResponse.json({ data });
  } catch {
    return unauthorizedResponse();
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    try {
      const body = await request.json();
      const parsed = scoreSchema.parse(body);
      const data = await upsertScoreForUser(user.id, parsed.score, parsed.playedOn);
      return NextResponse.json({ data });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Invalid request" },
        { status: 400 },
      );
    }
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
