import { supabase } from "./supabase/client";
import { supabaseWrite } from "./supabase/admin";

// Verify a player's Supabase Auth access token (sent as "Authorization: Bearer …")
// and load their player_accounts row. Returns nulls when anything is missing/invalid.
export async function verifyPlayer(req: Request) {
  const token = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return { user: null, account: null, token: "" };
  const sb = supabase();
  if (!sb) return { user: null, account: null, token };
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return { user: null, account: null, token };
  const w = supabaseWrite();
  let account: any = null;
  if (w) { const { data: rows } = await w.from("player_accounts").select("*").eq("id", data.user.id).limit(1); account = rows?.[0] ?? null; }
  return { user: data.user, account, token };
}
