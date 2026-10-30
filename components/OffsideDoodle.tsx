// "Offside!" doodle for the 404 page — a chalk ball curving WIDE of the
// goal and off the pitch. Pure SVG + CSS (.doodle rules in globals.css);
// stroke follows --gold-text so it reads on both themes.
export default function OffsideDoodle() {
  return (
    <svg className="doodle" viewBox="0 0 420 250" style={{ width: "min(420px, 88vw)", height: "auto", display: "block", margin: "10px auto 0" }} aria-hidden="true" focusable="false">
      <text className="pop d5" x={196} y={40} textAnchor="middle" transform="rotate(-3 196 40)" style={{ fill: "var(--gold-text)", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 34, letterSpacing: ".14em" }}>OFFSIDE!</text>
      {/* ground line */}
      <path className="dl dl-thin draw d1" pathLength={1} d="M16 200 C 140 192, 300 204, 404 196" opacity={0.5} />
      {/* the shot — curving wide of the far post */}
      <path className="dl draw d2" pathLength={1} d="M94 164 C 180 118, 262 96, 332 92 C 362 90, 388 98, 404 120" opacity={0.8} />
      {/* ball */}
      <circle className="dl draw d1" pathLength={1} cx={70} cy={172} r={15} />
      <path className="pop d3" style={{ fill: "var(--gold-text)" }} d="M70 164 l5 6 -2.2 6.8 h-5.6 l-2.2 -6.8 z" />
      {/* goal it missed */}
      <path className="dl draw d3" pathLength={1} d="M300 56 V192 M300 56 H378 M378 56 V192" />
      <path className="dl dl-thin draw d4" pathLength={1} d="M300 84 C 320 79, 356 88, 378 82" opacity={0.65} />
      <path className="dl dl-thin draw d4" pathLength={1} d="M339 57 V191" opacity={0.65} />
      {/* chalk cross where it flew past */}
      <path className="dl draw d5" pathLength={1} d="M392 52 l15 15" />
      <path className="dl draw d5" pathLength={1} d="M407 52 l-15 15" />
    </svg>
  );
}
