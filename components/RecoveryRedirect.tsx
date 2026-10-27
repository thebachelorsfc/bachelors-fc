"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/browser";
// Safety net (2026-10-27): if a password-recovery email link lands on any
// page other than /reset-password (e.g. the Supabase Site URL), forward it
// there — the recovery session persists in storage, so the reset page can
// pick it up and let the player set a new password.
export default function RecoveryRedirect() {
  const router = useRouter(); const pathname = usePathname();
  useEffect(() => {
    if (pathname === "/reset-password") return;
    const sb = supabaseBrowser(); if (!sb) return;
    const { data: sub } = sb.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") router.replace("/reset-password");
    });
    return () => sub.subscription.unsubscribe();
  }, [pathname, router]);
  return null;
}
