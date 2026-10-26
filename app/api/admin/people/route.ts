import { NextResponse } from "next/server"; import { store, newId } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
const FIELDS = ["name", "role", "quote", "speech", "photo_url", "facebook_url", "instagram_url", "linkedin_url", "whatsapp"] as const;
export async function GET() { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const sb = supabaseWrite(); if (sb) { const { data } = await sb.from("people").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: true }); return NextResponse.json(data || []); }
  return NextResponse.json(await store.people()); }
export async function POST(req: Request) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({})); const name = String(b.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
  const row: any = { sort_order: Number.isFinite(+b.sort_order) ? +b.sort_order : 0 };
  for (const k of FIELDS) row[k] = b[k] ? String(b[k]) : null;
  row.name = name;
  const sb = supabaseWrite();
  if (sb) { const { data, error } = await sb.from("people").insert(row).select().single(); if (error) return NextResponse.json({ error: "Could not add person (has the People SQL been run?)" }, { status: 500 }); return NextResponse.json(data); }
  return NextResponse.json(await store.addPerson({ id: newId(), created_at: new Date().toISOString(), ...row })); }
