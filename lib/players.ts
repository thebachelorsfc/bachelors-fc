export type Player = { id?: string; name: string; jersey_no: number; position: string; position_code: string; photo_url: string | null; joined_year: number; status: "active" | "tba";
  // Card-back fields (migration 009; owner fills them in Admin → Players)
  matches_played?: number; goals?: number; assists?: number; passing?: number; passion?: number;
  clean_sheets?: number; saves?: number; // goalkeeper card-back stats (migration 010)
  motm?: number; yellow_cards?: number; red_cards?: number; penalties_saved?: number; // stat pack (migration 011)
  speed?: number; preferred_foot?: string | null;
  is_captain?: boolean; // club captain flag (migration 013; set in Admin → Players)
  facebook_url?: string | null; instagram_url?: string | null; };
// Seed = ONLY verified real players from the live site. Open shirts are NOT people.
export const SEED_PLAYERS: Player[] = [
  { name: "Atikur Jr.", jersey_no: 10, position: "Left Wing Forward", position_code: "FWD", photo_url: "/assets/players/atikur.jpg", joined_year: 2026, status: "active" },
  { name: "Parvez", jersey_no: 18, position: "Defender", position_code: "DEF", photo_url: "/assets/players/parvez.jpg", joined_year: 2026, status: "active" },
  { name: "Chowdhury", jersey_no: 99, position: "Goalkeeper", position_code: "GK", photo_url: "/assets/players/mostafa.png", joined_year: 2026, status: "active" },
];
export const OPEN_NUMBERS = [5, 7, 9, 11, 19, 26, 28];
// Truly-open shirts = the candidate pool minus numbers the live squad already wears.
// Always render through this helper so a taken shirt can never be advertised as open
// (the unfiltered list went stale as players joined — fixed 2026-10-28).
export function openNumbers(players: { jersey_no: number }[]): number[] {
  return OPEN_NUMBERS.filter(n => !players.some(p => p.jersey_no === n));
}
