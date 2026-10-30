// Chalk tactics doodle for the homepage hero — a coach's-board sketch that
// draws itself: touchline, an X, an O, the curling chalk arrow, the goal,
// and the ball about to finish the move. Pure SVG + CSS (globals.css
// .doodle rules); gold chalk on the hero's always-dark navy.
export default function TacticsDoodle() {
  return (
    <svg className="doodle on-dark tactics-doodle" viewBox="0 0 340 200" aria-hidden="true" focusable="false">
      {/* touchline */}
      <path className="dl dl-thin draw d1" pathLength={1} d="M14 176 C 110 170, 230 182, 326 174" opacity={0.5} />
      {/* X */}
      <path className="dl draw d1" pathLength={1} d="M40 128 L64 152" />
      <path className="dl draw d1" pathLength={1} d="M64 128 L40 152" />
      {/* O */}
      <circle className="dl draw d2" pathLength={1} cx={128} cy={92} r={12} />
      {/* the curling arrow */}
      <path className="dl draw d3" pathLength={1} d="M70 140 C 130 158, 196 128, 244 84" />
      <path className="dl draw d4" pathLength={1} d="M244 84 L227 83" />
      <path className="dl draw d4" pathLength={1} d="M244 84 L239 67" />
      {/* goal + net */}
      <path className="dl draw d5" pathLength={1} d="M272 36 V120 M272 36 H326 M326 36 V120" />
      <path className="dl dl-thin draw d5" pathLength={1} d="M272 62 C 290 58, 308 66, 326 60" opacity={0.65} />
      <path className="dl dl-thin draw d5" pathLength={1} d="M299 37 V119" opacity={0.65} />
      {/* ball, finishing the move */}
      <circle className="dl draw d6" pathLength={1} cx={252} cy={122} r={13} />
      <path className="pop d6" style={{ fill: "#e8c766" }} d="M252 115 l4.5 5.5 -2 6 h-5 l-2 -6 z" />
    </svg>
  );
}
