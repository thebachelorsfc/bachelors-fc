import { NextResponse } from "next/server";
import { getAllSessions } from "@/lib/data";

export const dynamic = "force-dynamic";

// The next upcoming session for the drawer's match scorebug — same rule as
// the homepage Next Match card: earliest session whose Dhaka kick-off is
// still in the future. Public basics only (title/opponent/date/time/ground).
const sessMs = (x: any) => {
  const [Y, M, D] = String(x.session_date).split("-").map(Number);
  const [h, mi] = String(x.session_time || "12:00").slice(0, 5).split(":").map(Number);
  return Date.UTC(Y, (M || 1) - 1, D || 1, (h || 0) - 6, mi || 0);
};

export async function GET() {
  try {
    const all = await getAllSessions();
    const next: any = (all || [])
      .filter((x: any) => x.session_date && sessMs(x) > Date.now())
      .sort((a: any, b: any) => sessMs(a) - sessMs(b))[0] || null;
    if (!next) return NextResponse.json({ next: null });
    const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Dhaka" });
    return NextResponse.json({
      next: {
        title: next.title || null,
        opponent: next.opponent || null,
        session_date: next.session_date,
        session_time: next.session_time || null,
        ground: next.ground || null,
        isToday: next.session_date === today,
      },
    });
  } catch {
    return NextResponse.json({ next: null });
  }
}
