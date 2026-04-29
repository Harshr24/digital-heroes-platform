import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const winningId = formData.get("winningId") as string | null;

  if (!file || !winningId) {
    return NextResponse.json({ error: "File and winningId are required" }, { status: 400 });
  }

  // Verify this winning belongs to this user
  const { data: winning } = await supabaseAdmin
    .from("winnings")
    .select("id, user_id, status")
    .eq("id", winningId)
    .eq("user_id", user.id)
    .single();

  if (!winning) {
    return NextResponse.json({ error: "Winning not found" }, { status: 404 });
  }

  if (winning.status === "paid") {
    return NextResponse.json({ error: "Already paid out" }, { status: 400 });
  }

  // Upload to Supabase Storage
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `proofs/${user.id}/${winningId}.${ext}`;
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await supabaseAdmin.storage
    .from("winner-proofs")
    .upload(path, buffer, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL
  const { data: { publicUrl } } = supabaseAdmin.storage
    .from("winner-proofs")
    .getPublicUrl(path);

  // Update winning record with proof URL and set status to pending
  const { error: updateError } = await supabaseAdmin
    .from("winnings")
    .update({ proof_url: publicUrl, status: "pending" })
    .eq("id", winningId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, proofUrl: publicUrl });
}
