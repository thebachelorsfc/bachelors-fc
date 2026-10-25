import { NextResponse } from "next/server"; import { verifyPlayer } from "@/lib/playerAuth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  let player: any = null;
  const w = supabaseWrite();
  if (w && account?.player_id) { const { data } = await w.from("players").select("*").eq("id", account.player_id).limit(1); player = data?.[0] ?? null; }
  return NextResponse.json({ email: user.email, account, player });
}
