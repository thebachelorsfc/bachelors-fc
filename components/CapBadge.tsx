// Club Captain sign — a gold-ringed © rendered inline right after the captain's
// name. Fully driven by players.is_captain: Admin crowns a new captain (the API
// clears the old flag), and every name on the site moves the sign automatically.
export default function CapBadge() {
  return <span className="cap-badge" title="Club Captain" aria-label="Club Captain">©</span>;
}
