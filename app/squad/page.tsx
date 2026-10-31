import type { Metadata } from "next"; import { SEED_PLAYERS, openNumbers } from "@/lib/players"; import { getPlayers } from "@/lib/data"; import PlayerCard, { OpenShirt } from "@/components/PlayerCard"; import SquadCarousel from "@/components/SquadCarousel"; import FormationPitch from "@/components/FormationPitch";
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Squad | The Bachelors FC", alternates: { canonical: "/squad" } };
export default async function Squad() {
  const players = (await getPlayers()) ?? SEED_PLAYERS;
  const order: Record<string, number> = { FWD: 0, MID: 1, DEF: 2, GK: 3 };
  const sorted = [...players].sort((a: any, b: any) => ((order[a.position_code] ?? 9) - (order[b.position_code] ?? 9)) || (a.jersey_no - b.jersey_no));
  return (<main className="wrap"><section><p className="eyebrow">The Lineup</p><h1>Meet the Squad</h1>
    <p className="copy">The faces of The Bachelors FC — {players.length} players and counting.</p>
    <h2 style={{ fontSize: 22, marginTop: 30 }}>Our Shape</h2>
    <p className="copy" style={{marginTop: 4}}>How the brotherhood lines up — the live squad, by position.</p>
    <FormationPitch players={sorted} />
    <SquadCarousel>{sorted.map((p: any) => <PlayerCard key={p.jersey_no} p={p} />)}</SquadCarousel>
    {openNumbers(players).length > 0 && (<><h2 style={{ fontSize: 22, marginTop: 28 }}>Open shirts</h2>
    <SquadCarousel auto={false}>{openNumbers(players).map(n => <OpenShirt key={n} n={n} />)}</SquadCarousel></>)}
  </section></main>);
}
