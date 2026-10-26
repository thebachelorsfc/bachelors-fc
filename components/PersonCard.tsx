import Image from "next/image";
const waLink = (n?: string | null) => { if (!n) return null; let d = String(n).replace(/\D/g, ""); if (!d) return null; if (d.startsWith("0")) d = "880" + d.slice(1); return `https://wa.me/${d}`; };
export default function PersonCard({ p }: { p: any }) {
  const wa = waLink(p.whatsapp);
  return (<article className="card person-card">
    {p.photo_url ? (<div className="person-photo"><img className="person-img" src={p.photo_url} alt={p.name} loading="lazy" decoding="async" /></div>) : (<div className="person-photo person-noimg"><Image src="/assets/logo-transparent.png" alt="" width={84} height={99} style={{ objectFit: "contain", opacity: 0.9 }} /></div>)}
    <div className="person-body">
      {p.role && <div className="eyebrow">{p.role}</div>}
      <h3>{p.name}</h3>
      {p.quote && <blockquote className="person-quote">&ldquo;{String(p.quote).trim().replace(/^["“”]+|["“”]+$/g, "")}&rdquo;</blockquote>}
      {p.speech && <p className="person-speech">{p.speech}</p>}
      {(p.facebook_url || p.instagram_url || p.linkedin_url || wa) && (<div className="person-socials">
        {p.facebook_url && <a className="person-soc" href={p.facebook_url} target="_blank" rel="noreferrer" title={`${p.name} on Facebook`} aria-label={`${p.name} on Facebook`}>f</a>}
        {p.instagram_url && <a className="person-soc" href={p.instagram_url} target="_blank" rel="noreferrer" title={`${p.name} on Instagram`} aria-label={`${p.name} on Instagram`}><svg viewBox="0 0 24 24"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5" /><circle cx="12" cy="12" r="3.8" /><circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" /></svg></a>}
        {p.linkedin_url && <a className="person-soc" href={p.linkedin_url} target="_blank" rel="noreferrer" title={`${p.name} on LinkedIn`} aria-label={`${p.name} on LinkedIn`} style={{ fontSize: 14 }}>in</a>}
        {wa && <a className="person-soc" href={wa} target="_blank" rel="noreferrer" title={`Chat with ${p.name} on WhatsApp`} aria-label={`WhatsApp ${p.name}`}><svg viewBox="0 0 24 24"><path d="M20.5 12a8.5 8.5 0 0 1-12.4 7.5L3.5 20.5l1-4.4A8.5 8.5 0 1 1 20.5 12Z" /></svg></a>}
      </div>)}
    </div>
  </article>);
}
