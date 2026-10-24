"use client";
import { useCallback, useEffect, useState } from "react";
const input: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #ffffff2a", background:"#0a1633", color:"#f7f5ef" };
export default function AdminApp(){
  const [authed,setAuthed]=useState<boolean|null>(null); const [pw,setPw]=useState(""); const [tab,setTab]=useState("applications");
  const [apps,setApps]=useState<any[]>([]); const [players,setPlayers]=useState<any[]>([]); const [msg,setMsg]=useState("");
  const [np,setNp]=useState({name:"",jersey_no:"",position:"",position_code:"FWD",joined_year:"2026"});
  const [ns,setNs]=useState({title:"",session_date:"",session_time:"",ground:"",opponent:""});
  const load=useCallback(async()=>{ const a=await fetch("/api/applications"); if(a.status===401){ setAuthed(false); return; } setAuthed(true); setApps(await a.json()); const p=await fetch("/api/players"); setPlayers(await p.json()); },[]);
  useEffect(()=>{ load(); },[load]);
  async function login(){ const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})}); if(r.ok){ setMsg(""); load(); } else setMsg("Wrong password"); }
  async function setStatus(id:string,status:string){ await fetch(`/api/applications/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); load(); }
  async function addPlayer(){ const r=await fetch("/api/players",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...np,jersey_no:Number(np.jersey_no),joined_year:Number(np.joined_year)})}); const j=await r.json(); setMsg(r.ok?`Player added: ${j.name} #${j.jersey_no}`:(j.error||"Failed")); if(r.ok){ setNp({name:"",jersey_no:"",position:"",position_code:"FWD",joined_year:"2026"}); load(); } }
  async function delPlayer(id:string){ if(!confirm("Delete this player?")) return; await fetch(`/api/players/${id}`,{method:"DELETE"}); load(); }
  async function addSession(){ const r=await fetch("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ns)}); setMsg(r.ok?"Session saved — it now shows as Next Session on the homepage.":"Failed to save session"); if(r.ok) setNs({title:"",session_date:"",session_time:"",ground:"",opponent:""}); }
  if(authed===null) return <p style={{color:"var(--muted)"}}>Loading…</p>;
  if(!authed) return <div className="card" style={{maxWidth:420}}><h3>Admin Login</h3>{msg&&<p style={{color:"#ff9d9d"}}>{msg}</p>}<input style={input} type="password" placeholder="Admin password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/><button className="btn" style={{marginTop:12}} onClick={login}>Log in</button></div>;
  return(<div>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{["applications","players","sessions"].map(t=><button key={t} className="btn" style={tab===t?{}:{background:"transparent",color:"#f7f5ef",border:"1px solid #ffffff33"}} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)} {t==="applications"&&apps.length?`(${apps.length})`:""}</button>)}
    <button className="btn ghost" style={{marginLeft:"auto"}} onClick={async()=>{await fetch("/api/admin/login",{method:"DELETE"}); setAuthed(false);}}>Log out</button></div>
    {msg&&<p style={{color:"var(--gold)"}}>{msg}</p>}
    {tab==="applications" && (apps.length===0 ? <div className="card">No applications yet. New applications from the Join form will appear here as Pending.</div> :
      <div className="grid">{apps.map(a=><div className="card" key={a.id}><div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}><strong>{a.full_name}</strong><span className="eyebrow">{a.status}</span><span style={{color:"var(--muted)",fontSize:13}}>{new Date(a.created_at).toLocaleString()}</span></div>
      <p style={{color:"var(--muted)",fontSize:14}}>{a.mobile}{a.whatsapp?` · WhatsApp ${a.whatsapp}`:""} · {a.email} · Age {a.age} · {a.location}<br/>{a.educational_background}{a.occupation?` · ${a.occupation}`:""}{a.marital_status?` · ${a.marital_status}`:""}{a.blood_group?` · Blood ${a.blood_group}`:""}{a.preferred_position?` · Wants: ${a.preferred_position}`:""}{a.why_join?`<br/>“${a.why_join}”`:""}</p>
      {a.photo_url && <p><a href={a.photo_url} target="_blank">View photo</a></p>}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["pending","trial","approved","rejected"].map(s=><button key={s} className="btn ghost" style={{padding:".45rem .9rem"}} onClick={()=>setStatus(a.id,s)}>{s}</button>)}</div></div>)}</div>)}
    {tab==="players" && <div><div className="grid" style={{marginBottom:16}}>{players.map(p=><div className="card" key={p.id||p.jersey_no} style={{display:"flex",gap:10,alignItems:"center"}}><strong>#{p.jersey_no} {p.name}</strong><span style={{color:"var(--muted)"}}>{p.position} ({p.position_code})</span><button className="btn ghost" style={{marginLeft:"auto",padding:".4rem .8rem"}} onClick={()=>delPlayer(p.id)}>Delete</button></div>)}</div>
      <div className="card"><h3>Add player</h3><div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
      <input style={input} placeholder="Name" value={np.name} onChange={e=>setNp({...np,name:e.target.value})}/>
      <input style={input} placeholder="Jersey #" type="number" value={np.jersey_no} onChange={e=>setNp({...np,jersey_no:e.target.value})}/>
      <input style={input} placeholder="Position (e.g. Defender)" value={np.position} onChange={e=>setNp({...np,position:e.target.value})}/>
      <select style={input} value={np.position_code} onChange={e=>setNp({...np,position_code:e.target.value})}><option>FWD</option><option>MID</option><option>DEF</option><option>GK</option></select>
      <input style={input} placeholder="Joined year" type="number" value={np.joined_year} onChange={e=>setNp({...np,joined_year:e.target.value})}/></div>
      <button className="btn" style={{marginTop:12}} onClick={addPlayer}>Add player</button></div></div>}
    {tab==="sessions" && <div className="card"><h3>Set Next Session</h3><div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
      <input style={input} placeholder="Title (e.g. Training Session)" value={ns.title} onChange={e=>setNs({...ns,title:e.target.value})}/>
      <input style={input} type="date" value={ns.session_date} onChange={e=>setNs({...ns,session_date:e.target.value})}/>
      <input style={input} type="time" value={ns.session_time} onChange={e=>setNs({...ns,session_time:e.target.value})}/>
      <input style={input} placeholder="Ground / turf" value={ns.ground} onChange={e=>setNs({...ns,ground:e.target.value})}/>
      <input style={input} placeholder="Opponent (optional)" value={ns.opponent} onChange={e=>setNs({...ns,opponent:e.target.value})}/></div>
      <button className="btn" style={{marginTop:12}} onClick={addSession}>Save session</button></div>}
  </div>);
}
