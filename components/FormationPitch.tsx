import Image from "next/image";
import CapBadge from "@/components/CapBadge";

// "Our Shape" — the live squad arranged on a pitch by position group
// (FWD top → GK bottom). Pure presentation from real squad data: photo or
// shirt-number discs, first name + number, © beside the captain.
const ROWS: { key: string; top: string }[] = [
  { key: "FWD", top: "15%" },
  { key: "MID", top: "40%" },
  { key: "DEF", top: "64%" },
  { key: "GK", top: "88%" },
];

export default function FormationPitch({ players }: { players: any[] }) {
  const groups: Record<string, any[]> = { FWD: [], MID: [], DEF: [], GK: [] };
  for (const p of players) {
    const k = String(p.position_code || "MID");
    (groups[k] ?? groups.MID).push(p);
  }
  return (
    <div className="pitch" role="img" aria-label="The Bachelors FC formation on a pitch">
      <span className="pitch-line pitch-half" />
      <span className="pitch-circle" />
      <span className="pitch-box pitch-box-t" />
      <span className="pitch-box pitch-box-b" />
      {ROWS.map(r => groups[r.key].map((p: any, i: number, arr: any[]) => (
        <span key={p.id || p.jersey_no} className="pitch-p" style={{ top: r.top, left: `${((i + 1) * 100) / (arr.length + 1)}%` }}>
          {p.photo_url
            ? <Image src={p.photo_url} alt="" width={72} height={72} loading="lazy" />
            : <span className="pitch-fb">#{p.jersey_no}</span>}
          <span className="pitch-name">{String(p.name).split(" ")[0]} <b>#{p.jersey_no}</b>{p.is_captain ? <CapBadge /> : null}</span>
        </span>
      )))}
    </div>
  );
}
