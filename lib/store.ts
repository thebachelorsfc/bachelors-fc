// Local JSON store — used until Supabase keys are set in .env.local.
// Same shapes as the Supabase tables in supabase/migrations/001_phase1_core.sql,
// so switching to Supabase later is only a data-layer change, no page changes.
import { promises as fs } from "fs"; import path from "path"; import { SEED_PLAYERS, type Player } from "./players";
const FILE = path.join(process.cwd(), "data", "store.json");
export type Application = { id:string; full_name:string; location:string; email:string; mobile:string; whatsapp?:string; educational_background:string; marital_status?:string; age:number; occupation?:string; why_join?:string; preferred_position?:string; blood_group?:string; photo_url?:string; status:"pending"|"trial"|"approved"|"rejected"; created_at:string };
export type Session = { id:string; title:string; session_date?:string; session_time?:string; ground?:string; opponent?:string; created_at:string };
export type Ground = { id:string; name:string; area?:string; maps_url?:string };
type Store = { players:(Player&{id:string})[]; applications:Application[]; sessions:Session[]; grounds:Ground[] };
async function read(): Promise<Store> {
  try { return JSON.parse(await fs.readFile(FILE, "utf8")); }
  catch { const seed: Store = { players: SEED_PLAYERS.map((p,i)=>({ ...p, id:`seed-${i+1}` })), applications: [], sessions: [], grounds: [] }; await write(seed); return seed; }
}
async function write(s: Store) { await fs.mkdir(path.dirname(FILE), { recursive:true }); await fs.writeFile(FILE, JSON.stringify(s, null, 2)); }
export const store = {
  async players() { return (await read()).players; },
  async addPlayer(p: Player&{id:string}) { const s=await read(); s.players.push(p); await write(s); return p; },
  async updatePlayer(id:string, patch: Partial<Player>) { const s=await read(); const i=s.players.findIndex(x=>x.id===id); if(i<0) return null; s.players[i]={...s.players[i],...patch}; await write(s); return s.players[i]; },
  async deletePlayer(id:string) { const s=await read(); s.players=s.players.filter(x=>x.id!==id); await write(s); },
  async applications() { return (await read()).applications; },
  async addApplication(a: Application) { const s=await read(); s.applications.unshift(a); await write(s); return a; },
  async setApplicationStatus(id:string, status: Application["status"]) { const s=await read(); const a=s.applications.find(x=>x.id===id); if(!a) return null; a.status=status; await write(s); return a; },
  async sessions() { return (await read()).sessions; },
  async addSession(x: Session) { const s=await read(); s.sessions.unshift(x); await write(s); return x; },
  async grounds() { return (await read()).grounds; },
};
export const newId = () => Math.random().toString(36).slice(2,10) + Date.now().toString(36);
