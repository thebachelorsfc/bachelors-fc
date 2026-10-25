import { NextResponse } from "next/server"; import { store, type Application } from "@/lib/store"; import { isAdmin } from "@/lib/auth"; import { supabaseWrite } from "@/lib/supabase/admin";
export const dynamic = "force-dynamic";
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  if (!isAdmin()) return NextResponse.json({ error: "Admin login required" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const patch: Record<string, unknown> = {};
  if (b.status !== undefined) { if (!["pending", "trial", "approved", "rejected"].includes(b.status)) return NextResponse.json({ error: "Bad status" }, { status: 400 }); patch.status = b.status; }
  // Admin can correct an applicant's contact numbers (e.g. they got a new SIM)
  if (typeof b.mobile === "string") { const m = b.mobile.trim(); if (!/^01\d{9}$/.test(m.replace(/[\s-]/g, ""))) return NextResponse.json({ error: "Mobile must look like 01XXXXXXXXX" }, { status: 400 }); patch.mobile = m; }
  if (typeof b.whatsapp === "string") patch.whatsapp = b.whatsapp.trim() || null;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  const sb = supabaseWrite();
  if (sb) { const { error } = await sb.from("applications").update(patch).eq("id", params.id); if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 }); return NextResponse.json({ ok: true }); }
  if (patch.status) { const a = await store.setApplicationStatus(params.id, patch.status as Application["status"]); return a ? NextResponse.json(a) : NextResponse.json({ error: "Not found" }, { status: 404 }); }
  return NextResponse.json({ ok: true });
}
