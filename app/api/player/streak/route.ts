import { NextResponse } from "next/server";
import { verifyPlayer } from "@/lib/playerAuth";
import { computeStreaks } from "@/lib/streaks";

export const dynamic = "force-dynamic";

// The signed-in player's own Iron Man numbers for the dashboard chip.
export async function GET(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user || !account?.player_id) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const all = await computeStreaks();
  return NextResponse.json(all[account.player_id] ?? { streak: 0, totalIn: 0 });
}
