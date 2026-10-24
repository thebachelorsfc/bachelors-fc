export type Player = { id?: string; name: string; jersey_no: number; position: string; position_code: string; photo_url: string | null; joined_year: number; status: "active" | "tba"; };
// Seed = ONLY verified real players from the live site. Open shirts are NOT people.
export const SEED_PLAYERS: Player[] = [
  { name: "Atikur Jr.", jersey_no: 10, position: "Left Wing Forward", position_code: "FWD", photo_url: "/assets/players/atikur.jpg", joined_year: 2026, status: "active" },
  { name: "Parvez", jersey_no: 18, position: "Defender", position_code: "DEF", photo_url: "/assets/players/parvez.jpg", joined_year: 2026, status: "active" },
  { name: "Chowdhury", jersey_no: 99, position: "Goalkeeper", position_code: "GK", photo_url: "/assets/players/mostafa.png", joined_year: 2026, status: "active" },
];
export const OPEN_NUMBERS = [5, 7, 9, 11, 19, 26, 28];
