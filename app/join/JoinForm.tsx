"use client";
import { useState } from "react";
const input: React.CSSProperties = { width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid #ffffff2a", background:"#0a1633", color:"#f7f5ef" };
const label: React.CSSProperties = { display:"block", fontSize:13, marginBottom:6, color:"#c8cedb" };
export default function JoinForm(){
  const [step,setStep]=useState(1); const [f,setF]=useState<Record<string,string>>({}); const [err,setErr]=useState(""); const [done,setDone]=useState(false); const [photo,setPhoto]=useState<File|null>(null);
  const set=(k:string)=>(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>setF({...f,[k]:e.target.value});
  const need=(keys:string[])=>{ const m=keys.filter(k=>!f[k]?.trim()); setErr(m.length?`Fill in: ${m.join(", ").replaceAll("_"," ")}`:""); return !m.length; };
  const next=()=>{ if(step===1 && !need(["full_name","location","email","mobile"])) return; if(step===2 && !need(["educational_background","age"])) return; setErr(""); setStep(step+1); };
  async function submit(){ if(!need(["full_name","location","email","mobile","educational_background","age"])) { setStep(1); return; }
    const fd=new FormData(); Object.entries(f).forEach(([k,v])=>fd.append(k,v)); if(photo) fd.append("photo",photo);
    const r=await fetch("/api/applications",{method:"POST",body:fd}); const j=await r.json();
    if(!r.ok){ setErr(j.error||"Submission failed"); return; } setDone(true); }
  if(done) return <div className="card" style={{textAlign:"center"}}><h3>Application received ✓</h3><p style={{color:"var(--muted)"}}>Our team reviews every application privately before adding you to the club. We will reach out on your mobile/WhatsApp to arrange your trial.</p></div>;
  return(<div className="card">
    <div style={{display:"flex",gap:8,marginBottom:18}}>{["About you","Background","Football"].map((t,i)=><span key={t} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRadius:999,background:step===i+1?"var(--gold)":"#ffffff14",color:step===i+1?"#111":"#f7f5ef",fontWeight:700,fontSize:13}}>{i+1} · {t}</span>)}</div>
    {err && <p style={{color:"#ff9d9d"}}>{err}</p>}
    {step===1 && <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
      <div><span style={label}>Full name *</span><input style={input} value={f.full_name||""} onChange={set("full_name")}/></div>
      <div><span style={label}>Location / Address *</span><input style={input} value={f.location||""} onChange={set("location")}/></div>
      <div><span style={label}>Email address *</span><input style={input} type="email" value={f.email||""} onChange={set("email")}/></div>
      <div><span style={label}>Mobile number *</span><input style={input} value={f.mobile||""} onChange={set("mobile")}/></div>
      <div><span style={label}>WhatsApp number</span><input style={input} value={f.whatsapp||""} onChange={set("whatsapp")} placeholder="If different from mobile"/></div>
      <div><span style={label}>Profile photo (clear, front-facing, under 5MB)</span><input style={input} type="file" accept="image/*" onChange={e=>setPhoto(e.target.files?.[0]||null)}/></div>
      <input name="website" tabIndex={-1} autoComplete="off" style={{display:"none"}} onChange={set("website")}/>
    </div>}
    {step===2 && <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
      <div><span style={label}>Educational background *</span><input style={input} value={f.educational_background||""} onChange={set("educational_background")}/></div>
      <div><span style={label}>Age *</span><input style={input} type="number" value={f.age||""} onChange={set("age")}/></div>
      <div><span style={label}>Marital status</span><select style={input} value={f.marital_status||""} onChange={set("marital_status")}><option value="">Select</option><option>Unmarried</option><option>Married</option></select></div>
      <div><span style={label}>Occupation</span><input style={input} value={f.occupation||""} onChange={set("occupation")}/></div>
      <div><span style={label}>Blood group</span><select style={input} value={f.blood_group||""} onChange={set("blood_group")}><option value="">Select</option>{["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}</select></div>
    </div>}
    {step===3 && <div className="grid" style={{gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
      <div><span style={label}>Preferred position</span><select style={input} value={f.preferred_position||""} onChange={set("preferred_position")}><option value="">Select</option>{["Goalkeeper","Defender","Midfielder","Forward","Flexible"].map(p=><option key={p}>{p}</option>)}</select></div>
      <div style={{gridColumn:"1/-1"}}><span style={label}>Why do you want to join The Bachelors FC? (optional)</span><textarea style={{...input,minHeight:90}} value={f.why_join||""} onChange={set("why_join")}/></div>
      <p style={{color:"var(--muted)",gridColumn:"1/-1",margin:0}}>Review: {f.full_name||"—"} · {f.mobile||"—"} · {f.preferred_position||"No position chosen"} — your information is reviewed privately for membership verification only and won&apos;t be shared or posted publicly.</p>
    </div>}
    <div style={{display:"flex",gap:10,marginTop:20}}>
      {step>1 && <button className="btn ghost" onClick={()=>setStep(step-1)}>Back</button>}
      {step<3 ? <button className="btn" onClick={next}>Continue</button> : <button className="btn" onClick={submit}>Submit Application</button>}
    </div>
  </div>);
}
