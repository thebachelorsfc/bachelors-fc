import { NextResponse } from "next/server"; import { verifyPlayer } from "@/lib/playerAuth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
// Called right after a player signs up / logs in: creates their player_accounts
// row (status "pending") if it doesn't exist yet. Admin approves + links it later.
export async function POST(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  if (account) return NextResponse.json(account);
  const w = supabaseWrite(); if (!w) return NextResponse.json({ error: "Player accounts are not set up yet" }, { status: 501 });
  const row = { id: user.id, email: user.email, status: "pending" };
  const { error } = await w.from("player_accounts").insert(row);
  if (error) return NextResponse.json({ error: "Could not create your player account — has the Step 4 SQL been run in Supabase?" }, { status: 500 });
  return NextResponse.json(row);
}
