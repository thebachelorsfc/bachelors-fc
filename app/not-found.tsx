import Link from "next/link";
import OffsideDoodle from "@/components/OffsideDoodle";

export const metadata = { title: "Offside! — Page Not Found | The Bachelors FC" };

export default function NotFound() {
  return (
    <section className="wrap" style={{ textAlign: "center", paddingTop: 64, paddingBottom: 88 }}>
      <p className="eyebrow">404 · Full time</p>
      <h1 style={{ marginTop: 14 }}>This page is offside</h1>
      <OffsideDoodle />
      <p style={{ color: "var(--muted)", maxWidth: 520, margin: "18px auto 0" }}>
        The page you&apos;re looking for has wandered off the pitch — it may have moved, or it never existed. No harm done; the brotherhood is one tap away.
      </p>
      <p style={{ marginTop: 22, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <Link className="btn" href="/">Back to the homepage</Link>
        <Link className="btn ghost" href="/squad">Meet the Squad</Link>
      </p>
    </section>
  );
}
