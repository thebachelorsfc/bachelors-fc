import { NextResponse } from "next/server";
import { verifyPlayer } from "@/lib/playerAuth";
import { supabaseWrite } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// A player's browser subscribes to Web Push (dashboard "Session notifications"
// card) — one row per device, keyed by the push endpoint.
export async function POST(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user || !account) return NextResponse.json({ error: "Login required" }, { status: 401 });
  if (account.status !== "approved" || !account.player_id) return NextResponse.json({ error: "An approved, linked account is required" }, { status: 403 });
  const sb = supabaseWrite();
  if (!sb) return NextResponse.json({ error: "Database unavailable" }, { status: 501 });
  const b = await req.json().catch(() => ({} as any));
  const sub = (b as any)?.subscription ?? b;
  const endpoint = sub?.endpoint, p256dh = sub?.keys?.p256dh, auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) return NextResponse.json({ error: "Bad subscription" }, { status: 400 });
  const { error } = await sb.from("push_subscriptions").upsert(
    { player_id: account.player_id, endpoint, p256dh, auth },
    { onConflict: "endpoint" }
  );
  if (error) return NextResponse.json({ error: "Notifications are not switched on yet — run migration 015 in Supabase (SQL Editor) first.", detail: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const { user, account } = await verifyPlayer(req);
  if (!user || !account) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const sb = supabaseWrite();
  if (!sb) return NextResponse.json({ error: "Database unavailable" }, { status: 501 });
  const b = await req.json().catch(() => ({} as any));
  if (!b?.endpoint) return NextResponse.json({ error: "Endpoint required" }, { status: 400 });
  await sb.from("push_subscriptions").delete().eq("endpoint", b.endpoint).eq("player_id", account.player_id);
  return NextResponse.json({ ok: true });
}
