import { NextResponse } from "next/server"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const w = supabaseWrite(); if (!w) return NextResponse.json([]);
  const { data, error } = await w.from("player_accounts").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json([]);
  const { data: players } = await w.from("players").select("id,name,jersey_no");
  const nameOf = new Map((players ?? []).map((p: any) => [p.id, p.name]));
  return NextResponse.json((data ?? []).map((a: any) => ({ ...a, player_name: a.player_id ? nameOf.get(a.player_id) ?? null : null }))); }
