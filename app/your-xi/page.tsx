import type { Metadata } from "next";
import YourXi from "@/components/YourXi";
import { getPlayers } from "@/lib/data";

export const metadata: Metadata = {
  title: "Build Your XI | The Bachelors FC",
  description: "Pick your formation and build your dream XI from the real Bachelors FC squad — then download your XI card and share it.",
  alternates: { canonical: "/your-xi" },
};
export const dynamic = "force-dynamic";

export default async function YourXiPage() {
  const players = (await getPlayers()) as any[];
  const slim = players.map(p => ({
    id: p.id, name: p.name, jersey_no: p.jersey_no, position: p.position,
    position_code: p.position_code, photo_url: p.photo_url, is_captain: !!p.is_captain,
    goals: p.goals ?? 0, assists: p.assists ?? 0, motm: p.motm ?? 0, matches_played: p.matches_played ?? 0,
  }));
  return (
    <main className="wrap">
      <section>
        <p className="eyebrow">Fan Zone</p>
        <h1>Build Your XI</h1>
        <p className="copy" style={{ maxWidth: 640 }}>
          Think you can pick a better team? Choose a formation, tap a spot on the pitch and build
          your eleven from the real squad — then download your XI card and show the group chat
          how it should be done. One rule of the house: this club has exactly one goalkeeper,
          so every XI starts with him.
        </p>
        <YourXi players={slim} />
      </section>
    </main>
  );
}
