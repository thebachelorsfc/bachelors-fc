import { NextResponse } from "next/server"; import { ADMIN_COOKIE, adminPassword } from "@/lib/auth";
export async function POST(req: Request) { const { password } = await req.json();
  if (password !== adminPassword()) return NextResponse.json({ error:"Wrong password" }, { status:401 });
  const res = NextResponse.json({ ok:true }); res.cookies.set(ADMIN_COOKIE, "ok", { httpOnly:true, sameSite:"lax", path:"/", maxAge:60*60*12 }); return res; }
export async function DELETE() { const res = NextResponse.json({ ok:true }); res.cookies.set(ADMIN_COOKIE, "", { path:"/", maxAge:0 }); return res; }
