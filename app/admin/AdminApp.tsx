"use client";
import { useCallback, useEffect, useState } from "react";
const input: React.CSSProperties = { width:"100%", padding:"10px 12px", borderRadius:10, border:"1px solid #ffffff2a", background:"#0a1633", color:"#f7f5ef" };
export default function AdminApp(){
  const [authed,setAuthed]=useState<boolean|null>(null); const [pw,setPw]=useState(""); const [tab,setTab]=useState("applications");
  const [apps,setApps]=useState<any[]>([]); const [players,setPlayers]=useState<any[]>([]); const [msg,setMsg]=useState("");
  const [np,setNp]=useState({name:"",jersey_no:"",position:"",position_code:"FWD",joined_year:"2026"});
  const [ns,setNs]=useState({title:"",session_date:"",session_time:"",ground:"",opponent:""});
  const [gal,setGal]=useState<any[]>([]); const [hls,setHls]=useState<any[]>([]);
  const [gf,setGf]=useState<{caption:string;category:string;taken_on:string;file:File|null}>({caption:"",category:"team",taken_on:"",file:null});
  const [hf,setHf]=useState({title:"",video_url:"",played_on:""});
  const [prods,setProds]=useState<any[]>([]); const [pf,setPf]=useState({name:"",photo_url:"",description:"",price_bdt:"",stock:""});
  const [ords,setOrds]=useState<any[]>([]);
  const load=useCallback(async()=>{ const a=await fetch("/api/applications"); if(a.status===401){ setAuthed(false); return; } setAuthed(true); setApps(await a.json()); const p=await fetch("/api/players"); setPlayers(await p.json()); const g=await fetch("/api/gallery"); setGal(await g.json()); const h=await fetch("/api/highlights"); setHls(await h.json()); const pr=await fetch("/api/products"); setProds(await pr.json()); const or=await fetch("/api/orders"); setOrds(or.ok?await or.json():[]); },[]);
  useEffect(()=>{ load(); },[load]);
  async function login(){ const r=await fetch("/api/admin/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({password:pw})}); if(r.ok){ setMsg(""); load(); } else setMsg("Wrong password"); }
  async function setStatus(id:string,status:string){ await fetch(`/api/applications/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); load(); }
  async function addPlayer(){ const r=await fetch("/api/players",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...np,jersey_no:Number(np.jersey_no),joined_year:Number(np.joined_year)})}); const j=await r.json(); setMsg(r.ok?`Player added: ${j.name} #${j.jersey_no}`:(j.error||"Failed")); if(r.ok){ setNp({name:"",jersey_no:"",position:"",position_code:"FWD",joined_year:"2026"}); load(); } }
  async function delPlayer(id:string){ if(!confirm("Delete this player?")) return; await fetch(`/api/players/${id}`,{method:"DELETE"}); load(); }
  async function addSession(){ const r=await fetch("/api/sessions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(ns)}); setMsg(r.ok?"Session saved — it now shows as Next Session on the homepage.":"Failed to save session"); if(r.ok) setNs({title:"",session_date:"",session_time:"",ground:"",opponent:""}); }
  async function uploadPhoto(){ if(!gf.file){ setMsg("Choose a photo first"); return; } const fd=new FormData(); fd.set("photo",gf.file); fd.set("caption",gf.caption); fd.set("category",gf.category); fd.set("taken_on",gf.taken_on); const r=await fetch("/api/gallery",{method:"POST",body:fd}); const j=await r.json().catch(()=>({})); setMsg(r.ok?"Photo added to the gallery":(j.error||"Upload failed")); if(r.ok){ setGf({caption:"",category:"team",taken_on:"",file:null}); load(); } }
  async function delPhoto(id:string){ if(!confirm("Delete this photo?")) return; await fetch(`/api/gallery/${id}`,{method:"DELETE"}); load(); }
  async function addHighlight(){ const r=await fetch("/api/highlights",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(hf)}); const j=await r.json().catch(()=>({})); setMsg(r.ok?"Highlight added":(j.error||"Failed")); if(r.ok){ setHf({title:"",video_url:"",played_on:""}); load(); } }
  async function delHighlight(id:string){ if(!confirm("Delete this highlight?")) return; await fetch(`/api/highlights/${id}`,{method:"DELETE"}); load(); }
  async function saveProduct(p:any){ const r=await fetch(`/api/products/${p.id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({price_bdt:p.price_bdt,stock:p.stock,is_available:p.is_available})}); setMsg(r.ok?`Saved: ${p.name}${p.price_bdt?" — now on sale at ৳"+p.price_bdt:" — showcase mode (no price)"}`:"Save failed"); if(r.ok) load(); }
  async function delProduct(id:string){ if(!confirm("Delete this product?")) return; await fetch(`/api/products/${id}`,{method:"DELETE"}); load(); }
  async function setOrderStatus(id:string,status:string){ const r=await fetch(`/api/orders/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({status})}); setMsg(r.ok?`Order ${status}`:"Failed"); if(r.ok) load(); }
  async function addProduct(){ const r=await fetch("/api/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(pf)}); const j=await r.json().catch(()=>({})); setMsg(r.ok?`Product added: ${j.name}`:(j.error||"Failed")); if(r.ok){ setPf({name:"",photo_url:"",description:"",price_bdt:"",stock:""}); load(); } }
  if(authed===null) return <p style={{color:"var(--muted)"}}>Loading…</p>;
  if(!authed) return <div className="card" style={{maxWidth:420}}><h3>Admin Login</h3>{msg&&<p style={{color:"#ff9d9d"}}>{msg}</p>}<input style={input} type="password" placeholder="Admin password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/><button className="btn" style={{marginTop:12}} onClick={login}>Log in</button></div>;
  return(<div>
    <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>{["applications","players","sessions","gallery","highlights","store","orders"].map(t=><button key={t} className="btn" style={tab===t?{}:{background:"transparent",color:"#f7f5ef",border:"1px solid #ffffff33"}} onClick={()=>setTab(t)}>{t[0].toUpperCase()+t.slice(1)} {t==="applications"&&apps.length?`(${apps.length})`:""}</button>)}
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
      {ords.map((o:any)=><div className="card" key={o.id}><div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}><strong>{o.product_name}</strong>{o.size&&<span className="eyebrow">Size {o.size}</span>}<span className="eyebrow">৳{o.amount_bdt}</span><span className="eyebrow" style={{color:o.status==="delivered"?"#7be3a0":o.status==="cancelled"?"#ff9d9d":"var(--gold2)"}}>{o.status}</span></div>
      <p style={{color:"var(--muted)",fontSize:14,margin:"8px 0"}}>{o.customer_name} · {o.phone}<br/>{o.address}<br/>Pay: {o.payment_method==="messenger"?"pay on contact":`${o.payment_method} · from ${o.sender_number||"—"} · TrxID: ${o.trx_id||"—"}`}<br/><span style={{fontSize:12}}>{o.created_at?new Date(o.created_at).toLocaleString():""}</span></p>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>{["confirmed","delivered","cancelled","pending"].filter(s=>s!==o.status).map(s=><button key={s} className="btn ghost" style={{padding:".45rem .9rem"}} onClick={()=>setOrderStatus(o.id,s)}>{s}</button>)}</div></div>)}</div>}
  </div>);
}
