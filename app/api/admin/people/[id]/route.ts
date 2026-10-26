import { NextResponse } from "next/server"; import { store, newId } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin"; import { promises as fs } from "fs"; import path from "path";
export const dynamic = "force-dynamic";
const FIELDS = ["name", "role", "quote", "speech", "photo_url", "facebook_url", "instagram_url", "linkedin_url", "whatsapp"] as const;
// Upload a photo for a person (replaces the current photo).
export async function POST(req: Request, { params }: { params: { id: string } }) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const fd = await req.formData(); const file = fd.get("photo");
  if (!file || typeof file === "string" || file.size === 0) return NextResponse.json({ error: "Choose a photo file" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Photo must be under 10MB" }, { status: 400 });
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const name = `person-${newId()}.${ext}`; const buf = Buffer.from(await file.arrayBuffer());
  const sb = supabaseWrite(); let photo_url = "";
  if (sb) {
    const up = await sb.storage.from("gallery").upload(`people/${name}`, buf, { contentType: file.type || "image/jpeg" });
    if (up.error) return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    photo_url = sb.storage.from("gallery").getPublicUrl(`people/${name}`).data.publicUrl;
    const { error } = await sb.from("people").update({ photo_url }).eq("id", params.id);
    if (error) return NextResponse.json({ error: "Could not save photo" }, { status: 500 });
  } else {
    await fs.mkdir(path.join(process.cwd(), "public", "uploads", "people"), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), "public", "uploads", "people", name), buf); photo_url = `/uploads/people/${name}`;
    const p = await store.updatePerson(params.id, { photo_url }); if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, photo_url }); }
export async function PATCH(req: Request, { params }: { params: { id: string } }) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const patch: any = {};
  for (const k of FIELDS) if (k in b) patch[k] = b[k] ? String(b[k]) : null;
  if ("sort_order" in b) patch.sort_order = Number.isFinite(+b.sort_order) ? +b.sort_order : 0;
  const sb = supabaseWrite();
  if (sb) { const { error } = await sb.from("people").update(patch).eq("id", params.id); if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 }); return NextResponse.json({ ok: true }); }
  const p = await store.updatePerson(params.id, patch); return p ? NextResponse.json(p) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
export async function DELETE(_: Request, { params }: { params: { id: string } }) { if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const sb = supabaseWrite(); if (sb) { await sb.from("people").delete().eq("id", params.id); } else await store.deletePerson(params.id);
  return NextResponse.json({ ok: true }); }
