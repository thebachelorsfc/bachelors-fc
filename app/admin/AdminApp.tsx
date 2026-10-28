"use client";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { useCallback, useEffect, useState } from "react";
import PosterGenerator from "@/components/PosterGenerator";
const input: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid var(--field-br)", background:"var(--field-bg)", color:"var(--field-tx)" };
export default function AdminApp(){
  const [authed,setAuthed]=useState<boolean|null>(null); const [pw,setPw]=useState(""); const [tab,setTab]=useState("applications");
  const [apps,setApps]=useState<any[]>([]); const [players,setPlayers]=useState<any[]>([]); const [msg,setMsg]=useState(""); const [grs,setGrs]=useState<any[]>([]); const [ppl,setPpl]=useState<any[]>([]);
  const [np,setNp]=useState({name:"",jersey_no:"",position:"",position_code:"FWD",joined_year:"2026"});
  const [ns,setNs]=useState({title:"",session_date:"",session_time:"",ground:"",opponent:""});
  const [posterFor,setPosterFor]=useState<any>(null);
  const [gal,setGal]=useState<any[]>([]); const [hls,setHls]=useState<any[]>([]);
  const [gf,setGf]=useState<{caption:string;category:string;taken_on:string;file:File|null}>({caption:"",category:"team",taken_on:"",file:null});
  const [hf,setHf]=useState({title:"",video_url:"",played_on:""});
  const [posts,setPosts]=useState<any[]>([]); const [spUrl,setSpUrl]=useState("");
  const [prods,setProds]=useState<any[]>([]); const [pf,setPf]=useState({name:"",photo_url:"",description:"",price_bdt:"",stock:""});
  const [ords,setOrds]=useState<any[]>([]);
  const [accs,setAccs]=useState<any[]>([]); const [rsvpList,setRsvpList]=useState<any[]>([]); const [anthemCustom,setAnthemCustom]=useState<boolean|null>(null); const [anthemKey,setAnthemKey]=useState(0);
  const load=useCallback(async()=>{ const a=await fetch("/api/applications"); if(a.status===401){ setAuthed(false); return; } setAuthed(true); setApps(await a.json()); const p=await fetch("/api/players"); setPlayers(await p.json()); const g=await fetch("/api/gallery"); setGal(await g.json()); const h=await fetch("/api/highlights"); setHls(await h.json()); const sp=await fetch("/api/social-posts"); setPosts(sp.ok?await sp.json():[]); const pr=await fetch("/api/products"); setProds(await pr.json()); const or=await fetch("/api/orders"); setOrds(or.ok?await or.json():[]); const ac=await fetch("/api/admin/player-accounts"); setAccs(ac.ok?await ac.json():[]); const rv=await fetch("/api/admin/rsvps"); setRsvpList(rv.ok?await rv.json():[]); const gr=await fetch("/api/admin/grounds"); setGrs(gr.ok?await gr.json():[]); const pp=await fetch("/api/admin/people"); setPpl(pp.ok?await pp.json():[]); },[]);
  const gv=(id:string)=>(document.getElementById(id) as HTMLInputElement)?.value.trim()||"";
  const createGround=async()=>{ const body={name:gv("ng-name"),area:gv("ng-area"),address:gv("ng-address"),maps_url:gv("ng-maps"),matches_played:Number(gv("ng-matches")||0),last_played:gv("ng-last")||null}; if(!body.name){ setMsg("Ground name is required"); return; } const r=await fetch("/api/admin/grounds",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); const j=await r.json().catch(()=>({})); setMsg(r.ok?`Ground added: ${body.name}`:(j.error||"Failed")); if(r.ok) load(); };
  const saveGround=async(g:any)=>{ const body={name:gv(`g-name-${g.id}`),area:gv(`g-area-${g.id}`),address:gv(`g-address-${g.id}`),maps_url:gv(`g-maps-${g.id}`),photo_url:gv(`g-photo-${g.id}`),matches_played:Number(gv(`g-matches-${g.id}`)||0),last_played:gv(`g-last-${g.id}`)||null}; const r=await fetch(`/api/admin/grounds/${g.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); setMsg(r.ok?`Saved: ${body.name||g.name}`:"Save failed"); if(r.ok) load(); };
  const delGround=async(g:any)=>{ if(!confirm(`Delete ground "${g.name}"?`)) return; await fetch(`/api/admin/grounds/${g.id}`,{method:"DELETE"}); setMsg(`Deleted: ${g.name}`); load(); };
  const PF=["name","role","quote","speech","photo_url","facebook_url","instagram_url","linkedin_url","whatsapp"];
  const createPerson=async()=>{ const body:any={}; for(const k of PF) body[k]=gv(`np-${k}`); body.sort_order=Number(gv("np-sort")||0); if(!body.name){ setMsg("Person name is required"); return; } const r=await fetch("/api/admin/people",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); const j=await r.json().catch(()=>({})); setMsg(r.ok?`Person added: ${body.name} — live on the People page`:(j.error||"Failed")); if(r.ok) load(); };
  const savePerson=async(p:any)=>{ const body:any={}; for(const k of PF) body[k]=gv(`pp-${k}-${p.id}`); body.sort_order=Number(gv(`pp-sort-${p.id}`)||0); const r=await fetch(`/api/admin/people/${p.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); setMsg(r.ok?`Saved: ${body.name||p.name}`:"Save failed"); if(r.ok) load(); };
  const delPerson=async(p:any)=>{ if(!confirm(`Delete "${p.name}" from the People page?`)) return; await fetch(`/api/admin/people/${p.id}`,{method:"DELETE"}); setMsg(`Deleted: ${p.name}`); load(); };
  const upPersonPhoto=async(p:any,file:File|null)=>{ if(!file) return; const fd=new FormData(); fd.set("photo",file); const r=await fetch(`/api/admin/people/${p.id}`,{method:"POST",body:fd}); const j=await r.json().catch(()=>({})); setMsg(r.ok?`Photo updated — ${p.name}`:(j.error||"Upload failed")); if(r.ok) load(); };
  const upGroundPhoto=async(id:string,file:File)=>{ const fd=new FormData(); fd.append("photo",file); const r=await fetch(`/api/admin/grounds/${id}`,{method:"POST",body:fd}); setMsg(r.ok?"Ground photo updated":"Photo upload failed"); if(r.ok) load(); };
  useEffect(()=>{ load(); },[load]);
  useEffect(()=>{ if(tab==="anthem"){ fetch("/api/admin/anthem").then(r=>r.json()).then(j=>setAnthemCustom(!!j.custom)).catch(()=>setAnthemCustom(false)); } },[tab]);
  async function login(){ const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})}); if(r.ok){ setMsg(""); load(); } else setMsg("Wrong password"); }
  async function setStatus(id:string,status:string){ await fetch(`/api/applications/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); load(); }
  async function addPlayer(){ const r=await fetch("/api/players",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...np,jersey_no:Number(np.jersey_no),joined_year:Number(np.joined_year)})}); const j=await r.json(); setMsg(r.ok?`Player added: ${j.name} #${j.jersey_no}${j.photo_url?" — photo auto-set from application 📷":""}`:(j.error||"Failed")); if(r.ok){ setNp({name:"",jersey_no:"",position:"",position_code:"FWD",joined_year:"2026"}); load(); } }
  async function delPlayer(id:string){ if(!confirm("Delete this player?")) return; await fetch(`/api/players/${id}`,{method:"DELETE"}); load(); }
  async function addSession(){ const r=await fetch("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ns)}); setMsg(r.ok?"Session saved — it now shows as Next Session on the homepage.":"Failed to save session"); if(r.ok) setNs({title:"",session_date:"",session_time:"",ground:"",opponent:""}); }
  async function motmAct(s:any,action:string){ const body:any={session_id:s.id,action}; if(action==="award"){ const sel=(document.getElementById(`motm-sel-${s.id}`) as HTMLSelectElement|null)?.value; if(!sel){ setMsg("Pick the winning player first"); return; } body.player_id=sel; } const r=await fetch("/api/admin/motm",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); const j=await r.json().catch(()=>({})); setMsg(r.ok?(action==="open"?`MOTM vote opened for ${s.title} — players can vote from their dashboards 🗳`:action==="close"?`MOTM vote closed for ${s.title}`:`🏆 MOTM awarded for ${s.title}!`):(j.error||"MOTM action failed")); if(r.ok) load(); }
  async function uploadPhoto(){ if(!gf.file){ setMsg("Choose a photo first"); return; } const fd=new FormData(); fd.set("photo",gf.file); fd.set("caption",gf.caption); fd.set("category",gf.category); fd.set("taken_on",gf.taken_on); const r=await fetch("/api/gallery",{method:"POST",body:fd}); const j=await r.json().catch(()=>({})); setMsg(r.ok?"Photo added to the gallery":(j.error||"Upload failed")); if(r.ok){ setGf({caption:"",category:"team",taken_on:"",file:null}); load(); } }
  async function delPhoto(id:string){ if(!confirm("Delete this photo?")) return; await fetch(`/api/gallery/${id}`,{method:"DELETE"}); load(); }
  async function addHighlight(){ const r=await fetch("/api/highlights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(hf)}); const j=await r.json().catch(()=>({})); setMsg(r.ok?"Highlight added":(j.error||"Failed")); if(r.ok){ setHf({title:"",video_url:"",played_on:""}); load(); } }
  async function delHighlight(id:string){ if(!confirm("Delete this highlight?")) return; await fetch(`/api/highlights/${id}`,{method:"DELETE"}); load(); }
  async function addPost(){ const r=await fetch("/api/social-posts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({post_url:spUrl})}); const j=await r.json().catch(()=>({})); setMsg(r.ok?"Post added — it now shows in the homepage carousel":(j.error||"Failed")); if(r.ok){ setSpUrl(""); load(); } }
  async function delPost(id:string){ if(!confirm("Remove this post from the carousel?")) return; await fetch(`/api/social-posts/${id}`,{method:"DELETE"}); load(); }
  async function saveProduct(p:any){ const r=await fetch(`/api/products/${p.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({price_bdt:p.price_bdt,stock:p.stock,is_available:p.is_available})}); setMsg(r.ok?`Saved: ${p.name}${p.price_bdt?" — now on sale at ৳"+p.price_bdt:" — showcase mode (no price)"}`:"Save failed"); if(r.ok) load(); }
  async function delProduct(id:string){ if(!confirm("Delete this product?")) return; await fetch(`/api/products/${id}`,{method:"DELETE"}); load(); }
  async function patchAccount(id:string,patch:any){ const r=await fetch(`/api/admin/player-accounts/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(patch)}); setMsg(r.ok?"Account updated":"Account update failed"); if(r.ok) load(); }
  async function setOrderStatus(id:string,status:string){ const r=await fetch(`/api/orders/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); setMsg(r.ok?`Order ${status}`:"Failed"); if(r.ok) load(); }
  async function addProduct(){ const r=await fetch("/api/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pf)}); const j=await r.json().catch(()=>({})); setMsg(r.ok?`Product added: ${j.name}`:(j.error||"Failed")); if(r.ok){ setPf({name:"",photo_url:"",description:"",price_bdt:"",stock:""}); load(); } }
  if(authed===null) return <p style={{color:"var(--muted)"}}>Loading…</p>;
  if(!authed) return <div className="card" style={{maxWidth:420}}><h3>Admin Login</h3>{msg&&<p style={{color:"var(--bad)"}}>{msg}</p>}<input style={input} type="password" placeholder="Admin password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/><button className="btn" style={{marginTop:12}} onClick={login}>Log in</button></div>;
  return(<div>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{["applications","players","sessions","grounds","people","accounts","gallery","highlights","social","anthem","store","orders"].map(t=><button key={t} className="btn" style={tab===t?{}:{background:"var(--chip-bg)",color:"var(--chip-tx)",border:"1px solid var(--chip-br)"}} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)} {t==="applications"&&apps.length?`(${apps.length})`:""}</button>)}
    <button className="btn ghost" style={{marginLeft:"auto"}} onClick={async()=>{await fetch("/api/admin/login",{method:"DELETE"}); setAuthed(false);}}>Log out</button></div>
    {msg&&<p style={{color:"var(--gold-text)"}}>{msg}</p>}
    {tab==="applications" && (apps.length===0 ? <div className="card">No applications yet. New applications from the Join form will appear here as Pending.</div> :
      <div className="grid">{apps.map(a=><div className="card" key={a.id}><div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>{a.photo_url && <img src={a.photo_url} alt={a.full_name} style={{width:46,height:46,borderRadius:12,objectFit:"cover",border:"1px solid var(--line-gold)"}}/>}<strong>{a.full_name}</strong><span className="eyebrow">{a.status}</span>{(()=>{ const ac=accs.find((x:any)=>x.email&&a.email&&x.email.toLowerCase()===String(a.email).toLowerCase()); return ac ? <span style={{fontSize:12,padding:"3px 9px",borderRadius:99,border:"1px solid var(--line-gold)",color:"var(--gold-text)"}}>Login account ✓ {ac.status}</span> : <span style={{fontSize:12,color:"var(--muted)"}}>No login account yet</span>; })()}<span style={{color:"var(--muted)",fontSize:13}}>{new Date(a.created_at).toLocaleString()}</span></div>
      <p style={{color:"var(--muted)",fontSize:14}}>{a.mobile}{a.whatsapp?` · WhatsApp ${a.whatsapp}`:""} · {a.email} · Age {a.age} · {a.location}<br/>{a.educational_background}{a.occupation?` · ${a.occupation}`:""}{a.marital_status?` · ${a.marital_status}`:""}{a.blood_group?` · Blood ${a.blood_group}`:""}{a.preferred_position?` · Wants: ${a.preferred_position}`:""}{a.why_join && <span style={{display:"block",marginTop:4}}>“{a.why_join}”</span>}</p>
      {a.photo_url && <p><a href={a.photo_url} target="_blank">View photo</a></p>}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}><input style={{...input,flex:"1 1 150px",marginTop:0}} placeholder="Mobile (01XXXXXXXXX)" defaultValue={a.mobile||""} id={`mob-${a.id}`}/><input style={{...input,flex:"1 1 150px",marginTop:0}} placeholder="WhatsApp (optional)" defaultValue={a.whatsapp||""} id={`wa-${a.id}`}/><button className="btn" style={{padding:".45rem .9rem"}} onClick={async()=>{ const mobile=(document.getElementById(`mob-${a.id}`) as HTMLInputElement)?.value.trim(); const whatsapp=(document.getElementById(`wa-${a.id}`) as HTMLInputElement)?.value.trim(); const r=await fetch(`/api/applications/${a.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({mobile,whatsapp})}); const j=await r.json().catch(()=>({})); setMsg(r.ok?`Number updated for ${a.full_name}`:(j.error||"Update failed")); if(r.ok) load(); }}>Save number</button></div>
      {(()=>{ const norm=(s:any)=>String(s||"").toLowerCase().replace(/\s+/g," ").trim(); const ex=players.find((p:any)=>norm(p.name)===norm(a.full_name)); if(ex) return <p style={{fontSize:13,color:"var(--gold-text)",margin:"0 0 10px"}}>In squad ✓ — #{ex.jersey_no} {ex.name}</p>; const pm:Record<string,[string,string]>={Goalkeeper:["Goalkeeper","GK"],Defender:["Defender","DEF"],Midfielder:["Midfielder","MID"],Forward:["Forward","FWD"]}; const d:[string,string]=pm[String(a.preferred_position||"")]||["","FWD"]; return <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10,alignItems:"center"}}><span style={{fontSize:13,color:"var(--muted)"}}>Squad:</span><input style={{...input,flex:"0 1 92px",marginTop:0}} placeholder="Jersey #" type="number" id={`sq-j-${a.id}`}/><input style={{...input,flex:"1 1 130px",marginTop:0}} placeholder="Position" defaultValue={d[0]} id={`sq-pos-${a.id}`}/><select style={{...input,flex:"0 1 96px",marginTop:0}} defaultValue={d[1]} id={`sq-code-${a.id}`}><option>FWD</option><option>MID</option><option>DEF</option><option>GK</option></select><button className="btn" style={{padding:".45rem .9rem"}} onClick={async()=>{ const jersey_no=Number(gv(`sq-j-${a.id}`)); const position=gv(`sq-pos-${a.id}`); const position_code=gv(`sq-code-${a.id}`); if(!jersey_no||!position){ setMsg("Jersey # and position are needed to add to squad"); return; } const r=await fetch("/api/players",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:a.full_name,jersey_no,position,position_code,joined_year:2026,photo_url:a.photo_url||undefined})}); const j=await r.json().catch(()=>({})); setMsg(r.ok?`Added to squad: ${a.full_name} #${jersey_no}${a.photo_url?" — application photo set automatically 📷":""}`:(j.error||"Failed")); if(r.ok) load(); }}>⚽ Add to squad{a.photo_url?" (with photo)":""}</button></div>; })()}
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["pending","trial","approved","rejected"].map(s=><button key={s} className="btn ghost" style={{padding:".45rem .9rem"}} onClick={()=>setStatus(a.id,s)}>{s}</button>)}</div></div>)}</div>)}
    {tab==="players" && <div><div className="grid" style={{marginBottom:16}}>{players.map(p=>{ const appPhoto = !p.photo_url ? apps.find(a=>a.photo_url && String(a.full_name||"").toLowerCase().replace(/\s+/g," ").trim()===String(p.name||"").toLowerCase().replace(/\s+/g," ").trim())?.photo_url : undefined; return <div className="card" key={p.id||p.jersey_no}><div style={{display:"flex",gap:10,alignItems:"center"}}><strong>#{p.jersey_no} {p.name}</strong><span style={{color:"var(--muted)"}}>{p.position} ({p.position_code})</span><button className="btn ghost" style={{marginLeft:"auto",padding:".4rem .8rem"}} onClick={()=>delPlayer(p.id)}>Delete</button></div>
      <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}><input style={{...input,flex:"1 1 220px",marginTop:0}} placeholder="Photo URL (paste link)" defaultValue={p.photo_url||""} id={`photo-${p.id}`}/><button className="btn" style={{padding:".45rem .9rem"}} onClick={async()=>{ const v=(document.getElementById(`photo-${p.id}`) as HTMLInputElement)?.value.trim(); const r=await fetch(`/api/players/${p.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({photo_url:v||null})}); setMsg(r.ok?`Photo saved for ${p.name}`:"Photo save failed"); if(r.ok) load(); }}>Save photo</button>
      {appPhoto && <button className="btn" style={{padding:".45rem .9rem"}} onClick={async()=>{ const r=await fetch(`/api/players/${p.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({photo_url:appPhoto})}); setMsg(r.ok?`Application photo set for ${p.name} 📷`:"Failed"); if(r.ok) load(); }}>📷 Use application photo</button>}
      <label className="btn ghost" style={{padding:".45rem .9rem",cursor:"pointer"}}>⬆ Upload new photo<input type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{ const fileEl=e.target.files?.[0]; if(!fileEl) return; setMsg(`Uploading photo for ${p.name}…`); const fd=new FormData(); fd.append("photo",fileEl); const r=await fetch(`/api/players/${p.id}`,{method:"POST",body:fd}); setMsg(r.ok?`New photo live for ${p.name} 📷`:"Upload failed"); if(r.ok) load(); }}/></label></div>
      <div style={{marginTop:12,borderTop:"1px solid var(--line)",paddingTop:10}}>
        <p style={{margin:"0 0 8px",fontSize:13,color:"var(--muted)"}}>📊 Card-back stats — visitors see these when they flip {p.name}&apos;s card</p>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Matches<input style={{...input,marginTop:4}} type="number" min="0" defaultValue={p.matches_played||0} id={`st-m-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Goals<input style={{...input,marginTop:4}} type="number" min="0" defaultValue={p.goals||0} id={`st-g-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Assists<input style={{...input,marginTop:4}} type="number" min="0" defaultValue={p.assists||0} id={`st-a-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Passing (0–100)<input style={{...input,marginTop:4}} type="number" min="0" max="100" defaultValue={p.passing||0} id={`st-p-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Passion (0–100)<input style={{...input,marginTop:4}} type="number" min="0" max="100" defaultValue={p.passion||0} id={`st-pa-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Clean sheets (GK)<input style={{...input,marginTop:4}} type="number" min="0" defaultValue={p.clean_sheets||0} id={`st-cs-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Saves (GK)<input style={{...input,marginTop:4}} type="number" min="0" defaultValue={p.saves||0} id={`st-sv-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>MOTM awards<input style={{...input,marginTop:4}} type="number" min="0" defaultValue={p.motm||0} id={`st-motm-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Yellow cards<input style={{...input,marginTop:4}} type="number" min="0" defaultValue={p.yellow_cards||0} id={`st-yc-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Red cards<input style={{...input,marginTop:4}} type="number" min="0" defaultValue={p.red_cards||0} id={`st-rc-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Penalties saved (GK)<input style={{...input,marginTop:4}} type="number" min="0" defaultValue={p.penalties_saved||0} id={`st-ps-${p.id}`}/></label>
          <label style={{fontSize:12,color:"var(--muted)",flex:"1 1 76px"}}>Speed (0–100)<input style={{...input,marginTop:4}} type="number" min="0" max="100" defaultValue={p.speed||0} id={`st-sp-${p.id}`}/></label>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8,alignItems:"center"}}>
          <label style={{fontSize:12,color:"var(--muted)"}}>Preferred foot <select style={{...input,marginTop:0,width:"auto"}} defaultValue={p.preferred_foot||""} id={`so-foot-${p.id}`}><option value="">—</option><option>Right</option><option>Left</option><option>Both</option></select></label>
          <button className="btn" style={{padding:".45rem .9rem"}} onClick={async()=>{ const num=(id:string)=>Math.max(0,Number(gv(id)||0)||0); const body={matches_played:num(`st-m-${p.id}`),goals:num(`st-g-${p.id}`),assists:num(`st-a-${p.id}`),passing:Math.min(100,num(`st-p-${p.id}`)),passion:Math.min(100,num(`st-pa-${p.id}`)),clean_sheets:num(`st-cs-${p.id}`),saves:num(`st-sv-${p.id}`),motm:num(`st-motm-${p.id}`),yellow_cards:num(`st-yc-${p.id}`),red_cards:num(`st-rc-${p.id}`),penalties_saved:num(`st-ps-${p.id}`),speed:Math.min(100,num(`st-sp-${p.id}`)),preferred_foot:gv(`so-foot-${p.id}`)||null}; const r=await fetch(`/api/players/${p.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}); setMsg(r.ok?`Stats saved for ${p.name} 📊`:"Stats save failed — has the stats SQL (009 + 010 + 011) been run?"); if(r.ok) load(); }}>Save stats</button>
        </div>
      </div></div>; })}</div>
      <div className="card"><h3>Add player</h3><div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
      <input style={input} placeholder="Name" value={np.name} onChange={e=>setNp({...np,name:e.target.value})}/>
      <input style={input} placeholder="Jersey #" type="number" value={np.jersey_no} onChange={e=>setNp({...np,jersey_no:e.target.value})}/>
      <input style={input} placeholder="Position (e.g. Defender)" value={np.position} onChange={e=>setNp({...np,position:e.target.value})}/>
      <select style={input} value={np.position_code} onChange={e=>setNp({...np,position_code:e.target.value})}><option>FWD</option><option>MID</option><option>DEF</option><option>GK</option></select>
      <input style={input} placeholder="Joined year" type="number" value={np.joined_year} onChange={e=>setNp({...np,joined_year:e.target.value})}/></div>
      <button className="btn" style={{marginTop:12}} onClick={addPlayer}>Add player</button></div></div>}
    {tab==="grounds" && <div>
      <div className="card"><h3>⛳ Add a ground</h3>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
          <input style={input} id="ng-name" placeholder="Ground name * (e.g. Stadium X)"/>
          <input style={input} id="ng-area" placeholder="Area (e.g. Khulshi)"/>
          <input style={input} id="ng-address" placeholder="Full address"/>
          <input style={input} id="ng-maps" placeholder="Google Maps link"/>
          <input style={input} id="ng-matches" type="number" placeholder="Matches played so far"/>
          <input style={input} id="ng-last" type="date" aria-label="Last played date"/>
        </div>
        <button className="btn" style={{marginTop:12}} onClick={createGround}>Add ground</button>
        <p style={{color:"var(--muted)",fontSize:13,marginTop:10}}>“Matches played” and “Last played” here are the ground&apos;s starting record. Sessions you create later (with this ground&apos;s name) add on top automatically — dates that pass increase the count and update Last played by themselves.</p>
      </div>
      {grs.length===0 ? <div className="card">No grounds yet.</div> : grs.map(g=><div className="card" key={g.id}>
        {g.photo_url && <img src={g.photo_url} alt={g.name} style={{width:"100%",height:130,objectFit:"cover",borderRadius:12,marginBottom:10}}/>}
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
          <input style={input} id={`g-name-${g.id}`} defaultValue={g.name||""} placeholder="Ground name"/>
          <input style={input} id={`g-area-${g.id}`} defaultValue={g.area||""} placeholder="Area"/>
          <input style={input} id={`g-address-${g.id}`} defaultValue={g.address||""} placeholder="Full address"/>
          <input style={input} id={`g-maps-${g.id}`} defaultValue={g.maps_url||""} placeholder="Google Maps link"/>
          <input style={input} id={`g-matches-${g.id}`} type="number" defaultValue={g.matches_played??0} placeholder="Matches played (starting record)"/>
          <input style={input} id={`g-last-${g.id}`} type="date" defaultValue={g.last_played?String(g.last_played).slice(0,10):""} aria-label="Last played date"/>
          <input style={input} id={`g-photo-${g.id}`} defaultValue={g.photo_url||""} placeholder="Photo URL (or upload below)"/>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10,alignItems:"center"}}>
          <label className="btn ghost" style={{cursor:"pointer"}}>⬆ Upload photo<input type="file" accept="image/*" style={{display:"none"}} onChange={e=>{ const fl=e.target.files?.[0]; if(fl) upGroundPhoto(g.id,fl); e.target.value=""; }}/></label>
          <button className="btn" onClick={()=>saveGround(g)}>Save changes</button>
          <button className="btn ghost" onClick={()=>delGround(g)}>Delete</button>
        </div>
      </div>)}
    </div>}
    {tab==="sessions" && <div className="card"><h3>Set Next Session</h3><div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
      <input style={input} placeholder="Title (e.g. Training Session)" value={ns.title} onChange={e=>setNs({...ns,title:e.target.value})}/>
      <input style={input} type="date" value={ns.session_date} onChange={e=>setNs({...ns,session_date:e.target.value})}/>
      <input style={input} type="time" value={ns.session_time} onChange={e=>setNs({...ns,session_time:e.target.value})}/>
      <input style={input} placeholder="Ground / turf" value={ns.ground} onChange={e=>setNs({...ns,ground:e.target.value})}/>
      <input style={input} placeholder="Opponent (optional)" value={ns.opponent} onChange={e=>setNs({...ns,opponent:e.target.value})}/></div>
      <button className="btn" style={{marginTop:12}} onClick={addSession}>Save session</button>
      {rsvpList.length>0 && <div style={{marginTop:18}}><h3>Who&apos;s playing — RSVPs</h3>{rsvpList.map((s:any)=><div key={s.id} style={{borderTop:"1px solid var(--line)",padding:"10px 0"}}><strong>{s.title}</strong> <span style={{color:"var(--muted)",fontSize:13}}>{s.session_date||""}</span> <button className="btn" style={{marginLeft:8,padding:".3rem .7rem",fontSize:12.5}} onClick={()=>setPosterFor(s)}>🖼 Poster</button>
      {s.list.length===0 ? <p style={{color:"var(--muted)",fontSize:14,margin:"4px 0"}}>No RSVPs yet.</p> : <p style={{fontSize:14,margin:"4px 0",lineHeight:1.7}}>{["in","maybe","out"].map(st=>(<span key={st} style={{display:"block"}}><strong style={{color:st==="in"?"var(--ok)":st==="out"?"var(--bad)":"var(--gold-text)"}}>{st.toUpperCase()}:</strong> <span style={{color:"var(--muted)"}}>{s.list.filter((r:any)=>r.status===st).map((r:any)=>r.name).join(", ")||"—"}</span></span>))}</p>}<div style={{marginTop:10}}>
        <p style={{margin:"0 0 6px",fontSize:12.5,color:"var(--muted)"}}>👑 Admin set — tap to mark any player for this session (works even if he has no account yet; the player can change it later from his dashboard):</p>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>{(s.players||[]).map((pl:any)=><div key={pl.id} style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}><span style={{flex:"1 1 110px",fontSize:13.5}}>#{pl.jersey_no} {pl.name}</span>{["in","maybe","out"].map((st:string)=><button key={st} className="btn ghost" style={{padding:".28rem .6rem",fontSize:12,...(pl.status===st?{background:st==="in"?"#7be3a0":st==="out"?"#ff9d9d":"var(--gold)",color:"#06060a",borderColor:"transparent",fontWeight:800}:{})}} onClick={async()=>{ const r=await fetch("/api/admin/rsvps",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:s.id,player_id:pl.id,status:st})}); setMsg(r.ok?`${pl.name} marked ${st.toUpperCase()} for ${s.title} ✓`:"RSVP save failed"); if(r.ok) load(); }}>{st.toUpperCase()}</button>)}</div>)}</div>
      </div></div>)}</div>}</div>}
    {tab==="sessions" && rsvpList.length>0 && <div className="card" style={{marginTop:14}}><h3>🏆 Man of the Match</h3>
      <p style={{color:"var(--muted)",fontSize:13.5,margin:"0 0 10px"}}>Open a vote after a session — players pick the MOTM from their dashboards (only those who played can be voted for). Awarding adds +1 to the winner&apos;s MOTM stat and puts him in the homepage spotlight. Needs migration 012.</p>
      {rsvpList.map((s:any)=>{ const counts=s.motm_counts||{}; const top=Object.entries(counts).sort((a:any,b:any)=>b[1]-a[1]); const nameOf=(id:string)=>players.find((p:any)=>p.id===id)?.name||"Player"; return <div key={s.id} style={{borderTop:"1px solid var(--line)",padding:"10px 0"}}>
        <strong>{s.title}</strong> <span style={{color:"var(--muted)",fontSize:13}}>{s.session_date||""}</span>
        {s.motm_player_id ? <p style={{margin:"6px 0 0",fontSize:14}}>🏆 <strong style={{color:"var(--gold-text)"}}>MOTM: {nameOf(s.motm_player_id)}</strong></p>
        : s.motm_open ? <div style={{marginTop:8}}>
            {top.length===0 ? <p style={{color:"var(--muted)",fontSize:14,margin:"0 0 8px"}}>Vote is open — no votes yet.</p> : <p style={{fontSize:14,margin:"0 0 8px",lineHeight:1.7}}>{top.slice(0,5).map(([id,n]:any)=><span key={id} style={{display:"block"}}>{nameOf(id)} — <strong>{n}</strong> {n===1?"vote":"votes"}</span>)}</p>}
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
              <select id={`motm-sel-${s.id}`} style={{...input,width:"auto",maxWidth:230}} defaultValue={top.length?top[0][0]:""}>
                <option value="" disabled>Pick the winner…</option>
                {(s.players||[]).map((pl:any)=><option key={pl.id} value={pl.id}>#{pl.jersey_no} {pl.name}{counts[pl.id]?` (${counts[pl.id]})`:""}</option>)}
              </select>
              <button className="btn" onClick={()=>motmAct(s,"award")}>🏆 Award MOTM</button>
              <button className="btn ghost" onClick={()=>motmAct(s,"close")}>Close vote</button>
            </div>
          </div>
        : <div style={{marginTop:8}}><button className="btn ghost" onClick={()=>motmAct(s,"open")}>🗳 Open MOTM vote</button></div>}
      </div>;})}
    </div>}
    {posterFor && <PosterGenerator session={posterFor} grounds={grs} inCount={(posterFor.list||[]).filter((r:any)=>r.status==="in").length} onClose={()=>setPosterFor(null)} />}
    {tab==="people" && <div>
      <div className="card" style={{marginBottom:14}}><strong>👥 People — Founders &amp; Leadership.</strong> <span style={{color:"var(--muted)"}}>These profiles appear on the People page as sliding cards: photo, role, quote, their own message, and social links so visitors can reach them directly. Sort order 0 shows first. If saving fails with a database error, the People SQL (migration 008) has not been run in Supabase yet.</span></div>
      <div className="card"><h3>👤 Add a person</h3>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))"}}>
          <input style={input} id="np-name" placeholder="Full name *"/>
          <input style={input} id="np-role" placeholder="Role — Founder / Manager / Coach / Player / Well-wisher"/>
          <input style={input} id="np-sort" type="number" placeholder="Sort order (0 = first)"/>
          <input style={input} id="np-photo_url" placeholder="Photo URL (or add first, then upload below)"/>
        </div>
        <input style={{...input,marginTop:10}} id="np-quote" placeholder="Quote — one line, e.g. Never Give Up"/>
        <textarea style={{...input,marginTop:10,minHeight:90}} id="np-speech" placeholder="Their message / speech — a few lines in their own words"/>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",marginTop:10}}>
          <input style={input} id="np-facebook_url" placeholder="Facebook profile link"/>
          <input style={input} id="np-instagram_url" placeholder="Instagram profile link"/>
          <input style={input} id="np-linkedin_url" placeholder="LinkedIn profile link"/>
          <input style={input} id="np-whatsapp" placeholder="WhatsApp number (01…) — optional chat button"/>
        </div>
        <button style={{marginTop:12}} onClick={createPerson}>Add person</button>
      </div>
      <div className="grid">{ppl.length===0 && <div className="card">No people yet. Add the founder first — name, role, quote, message, photo and social links.</div>}
      {ppl.map((p:any)=><div className="card" key={p.id}><div style={{display:"flex",gap:12,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>{p.photo_url ? <img src={p.photo_url} alt="" style={{width:64,height:64,objectFit:"cover",borderRadius:"50%",border:"1px solid #c9a22755"}}/> : <span style={{width:64,height:64,borderRadius:"50%",background:"#101a33",display:"grid",placeItems:"center",fontSize:24}}>👤</span>}<div><strong style={{fontSize:17}}>{p.name}</strong><div style={{color:"var(--muted)",fontSize:13.5}}>{p.role||"—"} · order {p.sort_order??0}</div></div><label className="btn ghost" style={{marginLeft:"auto",cursor:"pointer"}}>⬆ Upload photo<input type="file" accept="image/*" style={{display:"none"}} onChange={e=>upPersonPhoto(p,e.target.files?.[0]||null)}/></label></div>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))"}}>
          <input style={input} id={`pp-name-${p.id}`} defaultValue={p.name||""} placeholder="Full name"/>
          <input style={input} id={`pp-role-${p.id}`} defaultValue={p.role||""} placeholder="Role"/>
          <input style={input} id={`pp-sort-${p.id}`} type="number" defaultValue={p.sort_order??0} placeholder="Sort order"/>
          <input style={input} id={`pp-photo_url-${p.id}`} defaultValue={p.photo_url||""} placeholder="Photo URL"/>
        </div>
        <input style={{...input,marginTop:10}} id={`pp-quote-${p.id}`} defaultValue={p.quote||""} placeholder="Quote"/>
        <textarea style={{...input,marginTop:10,minHeight:80}} id={`pp-speech-${p.id}`} defaultValue={p.speech||""} placeholder="Their message / speech"/>
        <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",marginTop:10}}>
          <input style={input} id={`pp-facebook_url-${p.id}`} defaultValue={p.facebook_url||""} placeholder="Facebook profile link"/>
          <input style={input} id={`pp-instagram_url-${p.id}`} defaultValue={p.instagram_url||""} placeholder="Instagram profile link"/>
          <input style={input} id={`pp-linkedin_url-${p.id}`} defaultValue={p.linkedin_url||""} placeholder="LinkedIn profile link"/>
          <input style={input} id={`pp-whatsapp-${p.id}`} defaultValue={p.whatsapp||""} placeholder="WhatsApp number (01…)"/>
        </div>
        <div style={{display:"flex",gap:8,marginTop:12,flexWrap:"wrap"}}><button onClick={()=>savePerson(p)}>Save</button><button className="danger" onClick={()=>delPerson(p)}>Delete</button></div>
      </div>)}
      </div>
    </div>}
    {tab==="accounts" && <div className="grid">{accs.length===0 && <div className="card">No player accounts yet. When a player signs up at /login, their account appears here — link it to a squad player, then Approve.</div>}
      {accs.map((a:any)=><div className="card" key={a.id}><div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}><strong>{a.email}</strong><span className="eyebrow" style={{color:a.status==="approved"?"var(--ok)":a.status==="rejected"?"var(--bad)":"var(--gold-text)"}}>{a.status}</span>{a.player_name&&<span className="eyebrow">→ {a.player_name}</span>}</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:12,alignItems:"center"}}>
      <select value={a.player_id||""} onChange={e=>patchAccount(a.id,{player_id:e.target.value||null})} style={{padding:"9px 10px",borderRadius:10,border:"1px solid var(--field-br)",background:"var(--field-bg)",color:"var(--field-tx)"}}>
        <option value="">— Link to squad player —</option>{players.map((p:any)=><option key={p.id} value={p.id}>#{p.jersey_no} {p.name}</option>)}
      </select>
      {a.status!=="approved"&&<button className="btn" style={{padding:".5rem 1rem"}} onClick={()=>patchAccount(a.id,{status:"approved"})}>Approve</button>}
      {a.status!=="rejected"&&<button className="btn ghost" style={{padding:".5rem 1rem"}} onClick={()=>patchAccount(a.id,{status:"rejected"})}>Reject</button>}
      {a.status!=="pending"&&<button className="btn ghost" style={{padding:".5rem 1rem"}} onClick={()=>patchAccount(a.id,{status:"pending"})}>Set pending</button>}
      </div>{!a.player_id&&<p style={{color:"var(--muted)",fontSize:13,marginTop:8}}>Link a squad player before approving — RSVP needs the link.</p>}</div>)}</div>}
    {tab==="gallery" && <div><div className="grid" style={{gridTemplateColumns:"repeat(auto-fill,minmax(150px,1fr))",marginBottom:16}}>{gal.map(g=><div className="card" key={g.id} style={{padding:10}}><img src={g.photo_url} alt={g.caption||"Gallery photo"} style={{width:"100%",aspectRatio:"4/3",objectFit:"cover",borderRadius:10}}/><p style={{fontSize:13,color:"var(--muted)",margin:"8px 0"}}>{g.caption||"(no caption)"} · {g.category}{g.taken_on?` · ${g.taken_on}`:""}</p><button className="btn ghost" style={{padding:".4rem .8rem"}} onClick={()=>delPhoto(g.id)}>Delete</button></div>)}</div>
      {gal.length===0 && <div className="card" style={{marginBottom:16}}>No photos yet. Upload the first one below — it appears on /gallery right away.</div>}
      <div className="card"><h3>Add photo</h3><div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
      <input style={input} type="file" accept="image/*" onChange={e=>setGf({...gf,file:e.target.files?.[0]||null})}/>
      <input style={input} placeholder="Caption (optional)" value={gf.caption} onChange={e=>setGf({...gf,caption:e.target.value})}/>
      <select style={input} value={gf.category} onChange={e=>setGf({...gf,category:e.target.value})}><option value="match">Match Day</option><option value="training">Training</option><option value="tour">On Tour</option><option value="team">Team</option></select>
      <input style={input} type="date" value={gf.taken_on} onChange={e=>setGf({...gf,taken_on:e.target.value})}/></div>
      <button className="btn" style={{marginTop:12}} onClick={uploadPhoto}>Upload photo</button></div></div>}
    {tab==="highlights" && <div><div className="grid" style={{marginBottom:16}}>{hls.map(h=><div className="card" key={h.id} style={{display:"flex",gap:10,alignItems:"center"}}><strong>{h.title}</strong><span style={{color:"var(--muted)",fontSize:13}}>{h.played_on||""}</span><a href={h.video_url} target="_blank" rel="noreferrer" style={{fontSize:13}}>Open video</a><button className="btn ghost" style={{marginLeft:"auto",padding:".4rem .8rem"}} onClick={()=>delHighlight(h.id)}>Delete</button></div>)}</div>
      {hls.length===0 && <div className="card" style={{marginBottom:16}}>No highlights yet. Paste a YouTube or Facebook video link below.</div>}
      <div className="card"><h3>Add highlight</h3><div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))"}}>
      <input style={input} placeholder="Title (e.g. BFC vs United — Match Highlights)" value={hf.title} onChange={e=>setHf({...hf,title:e.target.value})}/>
      <input style={input} placeholder="YouTube / Facebook video link" value={hf.video_url} onChange={e=>setHf({...hf,video_url:e.target.value})}/>
      <input style={input} type="date" value={hf.played_on} onChange={e=>setHf({...hf,played_on:e.target.value})}/></div>
      <button className="btn" style={{marginTop:12}} onClick={addHighlight}>Add highlight</button></div></div>}
    {tab==="social" && <div><div className="grid" style={{marginBottom:16}}>{posts.map(p=><div className="card" key={p.id} style={{display:"flex",gap:10,alignItems:"center"}}><strong>Facebook post</strong><a href={p.post_url} target="_blank" rel="noreferrer" style={{fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:340}}>{p.post_url}</a><button className="btn ghost" style={{marginLeft:"auto",padding:".4rem .8rem"}} onClick={()=>delPost(p.id)}>Remove</button></div>)}</div>
      {posts.length===0 && <div className="card" style={{marginBottom:16}}>No posts in the carousel yet. On Facebook, open a post → Share → Copy link → paste it below. The newest post shows first.</div>}
      <div className="card"><h3>Add a Facebook post</h3><div className="grid" style={{gridTemplateColumns:"1fr"}}>
      <input style={input} placeholder="Facebook post link (facebook.com/.../posts/...)" value={spUrl} onChange={e=>setSpUrl(e.target.value)}/></div>
      <button className="btn" style={{marginTop:12}} onClick={addPost}>Add to carousel</button></div></div>}
    {tab==="anthem" && <div className="card"><h3>🎵 Club Anthem</h3>
      <p style={{color:"var(--muted)"}}>The anthem plays on the homepage in the &ldquo;Our Anthem&rdquo; section. Upload a new MP3 here and the website switches to it automatically — nothing else to do.</p>
      <p style={{margin:"10px 0"}}>Now live: <strong>{anthemCustom===null?"checking…":anthemCustom?"your uploaded anthem":"the built-in anthem"}</strong></p>
      <audio key={anthemKey} controls preload="metadata" style={{width:"100%"}} src={anthemCustom?`https://gpjkjrvxacgojwmfukdy.supabase.co/storage/v1/object/public/gallery/anthem/anthem.mp3?v=${anthemKey}`:"/assets/anthem.mp3"} />
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:14}}>
        <label className="btn" style={{cursor:"pointer"}}>⬆ Upload new anthem (MP3)<input type="file" accept="audio/*,.mp3" style={{display:"none"}} onChange={async e=>{ const f=e.target.files?.[0]; e.target.value=""; if(!f) return; if(f.size>12*1024*1024){ setMsg("File too large — keep the anthem under 12 MB"); return; } setMsg("Uploading the new anthem…"); const r1=await fetch("/api/admin/anthem",{method:"POST"}); const j1=await r1.json().catch(()=>({})); if(!r1.ok||!j1.token){ setMsg(j1.error||"Anthem upload failed — could not start"); return; } const sb2=supabaseBrowser(); if(!sb2){ setMsg("Anthem upload failed — storage unavailable"); return; } const { error:upErr }=await sb2.storage.from("gallery").uploadToSignedUrl("anthem/anthem.mp3", j1.token, f, { contentType:"audio/mpeg" }); setMsg(upErr?`Anthem upload failed — ${upErr.message}`:"New anthem is live on the homepage ✓ 🎵"); if(!upErr){ setAnthemCustom(true); setAnthemKey(k=>k+1); } }} /></label>
        {anthemCustom && <button className="btn ghost" onClick={async()=>{ const r=await fetch("/api/admin/anthem",{method:"DELETE"}); setMsg(r.ok?"Built-in anthem restored ✓":"Reset failed"); if(r.ok){ setAnthemCustom(false); setAnthemKey(k=>k+1); } }}>↩ Reset to built-in</button>}
      </div>
      <p style={{color:"var(--muted)",fontSize:13,marginTop:12}}>MP3 only, up to 12 MB. A new upload replaces the previous one — the homepage picks it up within a couple of minutes.</p>
    </div>}
    {tab==="store" && <div><div className="grid" style={{marginBottom:16}}>{prods.map((p,i)=><div className="card" key={p.id}><div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><strong>{p.name}</strong>{p.price_bdt?<span className="eyebrow">On sale · ৳{p.price_bdt}</span>:<span className="eyebrow">Showcase</span>}</div>
      <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",marginTop:12}}>
      <label style={{fontSize:13,color:"var(--muted)"}}>Price ৳ (blank = showcase)<input style={input} type="number" value={p.price_bdt??""} onChange={e=>{const c=[...prods]; c[i]={...c[i],price_bdt:e.target.value===""?"":Number(e.target.value)}; setProds(c);}}/></label>
      <label style={{fontSize:13,color:"var(--muted)"}}>Stock (blank = untracked)<input style={input} type="number" value={p.stock??""} onChange={e=>{const c=[...prods]; c[i]={...c[i],stock:e.target.value===""?"":Number(e.target.value)}; setProds(c);}}/></label>
      <label style={{fontSize:13,color:"var(--muted)"}}>Visible on site<br/><input type="checkbox" checked={p.is_available!==false} onChange={e=>{const c=[...prods]; c[i]={...c[i],is_available:e.target.checked}; setProds(c);}} style={{width:20,height:20,marginTop:10}}/></label></div>
      <div style={{display:"flex",gap:8,marginTop:12}}><button className="btn" style={{padding:".5rem 1rem"}} onClick={()=>saveProduct(p)}>Save</button><button className="btn ghost" style={{padding:".5rem 1rem"}} onClick={()=>delProduct(p.id)}>Delete</button></div></div>)}</div>
      {prods.length===0 && <div className="card" style={{marginBottom:16}}>No products yet.</div>}
      <div className="card"><h3>Add product</h3><div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
      <input style={input} placeholder="Name" value={pf.name} onChange={e=>setPf({...pf,name:e.target.value})}/>
      <input style={input} placeholder="Photo URL / path (optional)" value={pf.photo_url} onChange={e=>setPf({...pf,photo_url:e.target.value})}/>
      <input style={input} placeholder="Description (optional)" value={pf.description} onChange={e=>setPf({...pf,description:e.target.value})}/>
      <input style={input} placeholder="Price ৳ (blank = showcase)" type="number" value={pf.price_bdt} onChange={e=>setPf({...pf,price_bdt:e.target.value})}/>
      <input style={input} placeholder="Stock (optional)" type="number" value={pf.stock} onChange={e=>setPf({...pf,stock:e.target.value})}/></div>
      <button className="btn" style={{marginTop:12}} onClick={addProduct}>Add product</button></div></div>}
    {tab==="orders" && <div className="grid">{ords.length===0 && <div className="card">No orders yet. Orders placed on the Store page will appear here.</div>}
      {ords.map((o:any)=><div className="card" key={o.id}><div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}><strong>{o.product_name}</strong>{o.size&&<span className="eyebrow">Size {o.size}</span>}<span className="eyebrow">৳{o.amount_bdt}</span><span className="eyebrow" style={{color:o.status==="delivered"?"var(--ok)":o.status==="cancelled"?"var(--bad)":"var(--gold-text)"}}>{o.status}</span></div>
      <p style={{color:"var(--muted)",fontSize:14,margin:"8px 0"}}>{o.customer_name} · {o.phone}<br/>{o.address}<br/>Pay: {o.payment_method==="messenger"?"pay on contact":`${o.payment_method} · from ${o.sender_number||"—"} · TrxID: ${o.trx_id||"—"}`}<br/><span style={{fontSize:12}}>{o.created_at?new Date(o.created_at).toLocaleString():""}</span></p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["confirmed","delivered","cancelled","pending"].filter(s=>s!==o.status).map(s=><button key={s} className="btn ghost" style={{padding:".45rem .9rem"}} onClick={()=>setOrderStatus(o.id,s)}>{s}</button>)}</div></div>)}</div>}
  </div>);
}
