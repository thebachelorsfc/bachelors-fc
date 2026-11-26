import type { Metadata } from "next";
import { pageMeta } from "@/lib/meta";

// The login page itself is a client component, so its metadata lives in
// this layout (added 2026-11-26 — before this, /login inherited the
// homepage title and description).
export const metadata: Metadata = pageMeta(
  "Login | The Bachelors FC",
  "Player login for The Bachelors FC — sign in to RSVP for matchdays, see who's playing and download your membership card. Khulshi, Chittagong.",
  "/login"
);

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
