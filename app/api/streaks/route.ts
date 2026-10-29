import { NextResponse } from "next/server";
import { computeStreaks } from "@/lib/streaks";

export const dynamic = "force-dynamic";

// Public Iron Man aggregates (player id → streak / total IN) for the
// Leaderboard's Iron Man tab. No personal data — counts only.
export async function GET() {
  return NextResponse.json(await computeStreaks());
}
