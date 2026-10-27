"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import Link from "next/link";
const input: React.CSSProperties = { width:"100%", padding:"12px 14px", borderRadius:10, border:"1px solid var(--field-br)", background:"var(--field-bg)", color:"var(--field-tx)" };
const label: React.CSSProperties = { display:"block", fontSize:13, marginBottom:6, color:"var(--label)" };
export default function JoinForm(){
  const [step,setStep]=useState(1); const [f,setF]=useState<Record<string,string>>({}); const [err,setErr]=useState(""); const [done,setDone]=useState(false); const [photo,setPhoto]=useState<File|null>(null);
  const [pw,setPw]=useState(""); const [acct,setAcct]=useState<"none"|"created"|"exists">("none"); const [busy,setBusy]=useState(false);
  const set=(k:string)=>(e:React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>)=>setF({...f,[k]:e.target.value});
  const need=(keys:string[])=>{ const m=keys.filter(k=>!f[k]?.trim()); setErr(m.length?`Fill in: ${m.join(", ").replaceAll("_"," ")}`:""); return !m.length; };
  const next=()=>{ if(step===1 && !need(["full_name","location","email","mobile"])) return; if(step===2 && !need(["educational_background","age"])) return; setErr(""); setStep(step+1); };
  async function submit(){ if(!need(["full_name","location","email","mobile","educational_background","age"])) { setStep(1); return; }
    if(pw.length<6){ setErr("Set a password (min. 6 characters) — it creates your player account together with this application."); return; }
    setBusy(true); setErr("");
    const fd=new FormData(); Object.entries(f).forEach(([k,v])=>fd.append(k,v)); if(photo) fd.append("photo",photo);
    const r=await fetch("/api/applications",{method:"POST",body:fd}); const j=await r.json();
    if(!r.ok){ setBusy(false); setErr(j.error||"Submission failed"); return; }
    // One form, one joining: create the player login account with the same email, right here.
    try { const sb=supabaseBrowser(); if(sb){ const { data, error } = await sb.auth.signUp({ email:f.email, password:pw });
      if(error){ if(/already|registered/i.test(error.message)) setAcct("exists"); }
      else { if(data.session) await fetch("/api/player/register",{method:"POST",headers:{Authorization:`Bearer ${data.session.access_token}`}}); setAcct("created"); } } } catch { /* account step is best-effort — the application is already saved */ }
    setDone(true); }
  if(done) return <div className="card" style={{textAlign:"center"}}><h3>You&apos;re in the queue ✓</h3><p style={{color:"var(--muted)"}}>{acct==="exists" ? "Your application is submitted — and you already had a player login with this email, so there is nothing more to fill in. " : acct==="created" ? "Done in one place: your application AND your player account were created together with this form. " : "Your application is submitted. "}Our team reviews every application privately and will reach out on your mobile/WhatsApp to arrange your trial. Once you are approved and added to the squad, log in any time from Player Login with this email and your password to RSVP for sessions.</p><p style={{marginTop:14}}><Link className="btn ghost" href="/login">Go to Player Login</Link></p></div>;
  return(<div className="card">
    <div style={{display:"flex",gap:8,marginBottom:18}}>{["About you","Background","Football"].map((t,i)=><span key={t} style={{flex:1,textAlign:"center",padding:"8px 4px",borderRadius:999,background:step===i+1?"var(--gold)":"var(--chip-bg)",color:step===i+1?"#111":"var(--chip-tx)",border:"1px solid "+(step===i+1?"transparent":"var(--chip-br)"),fontWeight:700,fontSize:13}}>{i+1} · {t}</span>)}</div>
    {err && <p style={{color:"var(--bad)"}}>{err}</p>}
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
      <div style={{gridColumn:"1/-1",borderTop:"1px solid var(--line)",paddingTop:16}}>
        <span style={label}>Create your player account — set a password *</span>
        <input style={input} type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="Min. 6 characters" autoComplete="new-password"/>
        <p style={{color:"var(--muted)",fontSize:13,margin:"8px 0 0"}}>One form, everything together: this password + the email from step 1 becomes your Player Login for session RSVP after the club approves you. No second sign-up, nowhere else.</p>
      </div>
    </div>}
    <div style={{display:"flex",gap:10,marginTop:20}}>
      {step>1 && <button className="btn ghost" onClick={()=>setStep(step-1)}>Back</button>}
      {step<3 ? <button className="btn" onClick={next}>Continue</button> : <button className="btn" onClick={submit} disabled={busy}>{busy ? "Submitting…" : "Submit — apply + create my account"}</button>}
    </div>
  </div>);
}
