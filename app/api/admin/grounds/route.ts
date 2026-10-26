import { NextResponse } from "next/server"; import { store, newId } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const sb = supabaseWrite(); if (sb) { const { data } = await sb.from("grounds").select("*").order("created_at", { ascending: true }); return NextResponse.json(data || []); }
  return NextResponse.json(await store.grounds()); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({})); const name = String(b.name || "").trim();
  if (!name) return NextResponse.json({ error: "Ground name is required" }, { status: 400 });
  const row: any = { name, area: b.area || null, address: b.address || null, maps_url: b.maps_url || null, photo_url: b.photo_url || null, matches_played: Number.isFinite(+b.matches_played) ? +b.matches_played : 0, last_played: b.last_played || null };
  const sb = supabaseWrite();
  if (sb) { const { data, error } = await sb.from("grounds").insert(row).select().single(); if (error) return NextResponse.json({ error: "Could not add ground" }, { status: 500 }); return NextResponse.json(data); }
  return NextResponse.json(await store.addGround({ id: newId(), ...row })); }
