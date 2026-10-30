// RSVP celebration toast — when a player taps IN, a chalk ball flies into
// the net and "GOAL!" pops. Shown by the dashboard for ~3s. Always-dark
// card, gold chalk (.doodle.on-dark); motion lives in globals.css.
export default function GoalDoodle() {
  return (
    <div className="goal-toast" role="status" aria-label="Goal! You're in.">
      <svg className="doodle on-dark" viewBox="0 0 300 168" style={{ width: 264, height: "auto", display: "block" }} aria-hidden="true" focusable="false">
        <text className="pop goal-text" x={86} y={62} textAnchor="middle" transform="rotate(-4 86 62)" style={{ fill: "#e8c766", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 42, letterSpacing: ".06em" }}>GOAL!</text>
        <text className="pop goal-sub" x={86} y={92} textAnchor="middle" style={{ fill: "#f7f5ef", fontFamily: "var(--font-display)", fontWeight: 600, fontSize: 16, letterSpacing: ".3em" }}>YOU&apos;RE IN</text>
        {/* ground */}
        <path className="dl dl-thin" d="M10 148 C 90 143, 210 152, 292 146" opacity={0.5} />
        {/* net */}
        <g className="goal-net">
          <path className="dl dl-thin" d="M196 44 C 224 39, 254 47, 282 42" opacity={0.6} />
          <path className="dl dl-thin" d="M196 76 C 224 71, 254 79, 282 74" opacity={0.6} />
          <path className="dl dl-thin" d="M218 27 V137" opacity={0.6} />
          <path className="dl dl-thin" d="M260 27 V137" opacity={0.6} />
        </g>
        {/* goal frame */}
        <path className="dl" d="M196 26 V138 M196 26 H282 M282 26 V138" />
        {/* ball — starts left, flies in via CSS */}
        <g className="goal-ball">
          <circle className="dl" cx={52} cy={118} r={14} />
          <path style={{ fill: "#e8c766" }} d="M52 110 l4.8 5.8 -2.1 6.4 h-5.4 l-2.1 -6.4 z" />
        </g>
      </svg>
    </div>
  );
}
