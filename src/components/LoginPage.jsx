import { useState } from "react";

function Logo({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{ filter: "drop-shadow(3px 3px 0 rgba(0,0,0,.25))" }}>
      <path d="M40 4 L72 18 L72 46 Q72 66 40 76 Q8 66 8 46 L8 18 Z" fill="#fff" stroke="rgba(0,0,0,.2)" strokeWidth="1.5"/>
      <path d="M40 10 L66 22 L66 46 Q66 62 40 70 Q14 62 14 46 L14 22 Z" fill="#1A56DB"/>
      <polygon points="40,14 42,20 48,20 43,24 45,30 40,26 35,30 37,24 32,20 38,20" fill="#FFD166"/>
      <rect x="28" y="34" width="24" height="16" rx="2" fill="#fff" opacity=".95"/>
      <line x1="40" y1="34" x2="40" y2="50" stroke="#1A56DB" strokeWidth="1.5"/>
      <line x1="29" y1="38" x2="39" y2="38" stroke="#1A56DB" strokeWidth="1"/>
      <line x1="29" y1="42" x2="39" y2="42" stroke="#1A56DB" strokeWidth="1"/>
      <line x1="41" y1="38" x2="51" y2="38" stroke="#1A56DB" strokeWidth="1"/>
      <line x1="41" y1="42" x2="51" y2="42" stroke="#1A56DB" strokeWidth="1"/>
      <path d="M22 62 Q40 68 58 62 L56 70 Q40 75 24 70 Z" fill="#FFD166"/>
      <text x="40" y="68" textAnchor="middle" fontSize="6" fontWeight="800" fontFamily="Nunito" fill="#0F172A">ILMU</text>
    </svg>
  );
}

export default function LoginPage({ login, authLoading, authError }) {
  const [tab, setTab]     = useState("admin");
  const [user, setUser]   = useState("");
  const [pass, setPass]   = useState("");
  const [show, setShow]   = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    await login(user, pass);
  };

  return (
    <div style={{
      minHeight: "100vh", background: "linear-gradient(135deg,#1A56DB 0%,#1E40AF 50%,#1e3a8a 100%)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      fontFamily: "'Nunito','Fredoka',sans-serif",
    }}>
      {/* Background decoration */}
      <div style={{ position: "fixed", inset: 0, backgroundImage: "radial-gradient(circle,rgba(255,255,255,.08) 1px,transparent 1px)", backgroundSize: "24px 24px", pointerEvents: "none" }}/>
      <div style={{ position: "fixed", top: -60, right: -60, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,.06)", pointerEvents: "none" }}/>
      <div style={{ position: "fixed", bottom: -80, left: -80, width: 300, height: 300, borderRadius: "50%", background: "rgba(255,255,255,.04)", pointerEvents: "none" }}/>

      <div style={{
        width: "100%", maxWidth: 420, position: "relative", zIndex: 1,
        background: "#fff", borderRadius: 28, border: "3px solid #0F172A",
        boxShadow: "8px 8px 0 #0F172A", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#1A56DB,#1E40AF)", padding: "32px 28px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,.1)" }}/>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
            <div style={{ background: "rgba(255,255,255,.2)", border: "3px solid rgba(255,255,255,.4)", borderRadius: 20, padding: 10 }}>
              <Logo size={48}/>
            </div>
          </div>
          <p style={{ fontFamily: "'Fredoka',sans-serif", fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>Portal Cikgu Anna</p>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,.75)", fontWeight: 600, marginTop: 4 }}>Tahun 4 Bestari · SK Darau, Kota Kinabalu</p>
        </div>

        {/* Tab switcher */}
        <div style={{ display: "flex", background: "#F0F7FF", borderBottom: "3px solid #0F172A" }}>
          {[["admin","👩‍🏫 Guru / Admin"],["parent","👨‍👩‍👧 Ibu Bapa"]].map(([t, l]) => (
            <button key={t} onClick={() => { setTab(t); setUser(""); setPass(""); }} style={{
              flex: 1, padding: "13px 8px", border: "none",
              borderBottom: `3px solid ${tab === t ? "#1A56DB" : "transparent"}`,
              background: tab === t ? "#fff" : "transparent",
              color: tab === t ? "#1A56DB" : "#475569",
              fontFamily: "'Nunito',sans-serif", fontWeight: 900, fontSize: 13,
              cursor: "pointer", transition: "all .15s",
            }}>{l}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ padding: "24px 28px 28px", display: "flex", flexDirection: "column", gap: 14 }}>

          {tab === "admin" ? (
            <>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#1E40AF", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".4px" }}>Nama Pengguna</p>
                <input value={user} onChange={e => setUser(e.target.value)} placeholder="teacheranna"
                  style={{ width: "100%", padding: "12px 14px", border: "3px solid #0F172A", borderRadius: 14, fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 600, outline: "none", boxShadow: "2px 2px 0 #0F172A", background: "#fff", color: "#0F172A" }}
                  autoComplete="username"/>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#1E40AF", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".4px" }}>Kata Laluan</p>
                <div style={{ position: "relative" }}>
                  <input value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••"
                    type={show ? "text" : "password"}
                    style={{ width: "100%", padding: "12px 44px 12px 14px", border: "3px solid #0F172A", borderRadius: 14, fontFamily: "'Nunito',sans-serif", fontSize: 14, fontWeight: 600, outline: "none", boxShadow: "2px 2px 0 #0F172A", background: "#fff", color: "#0F172A" }}
                    autoComplete="current-password"/>
                  <button type="button" onClick={() => setShow(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{show ? "🙈" : "👁️"}</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{ background: "#EFF6FF", border: "2px solid #BFDBFE", borderRadius: 12, padding: "10px 14px" }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: "#1E40AF", margin: 0 }}>📋 Cara log masuk:</p>
                <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 4, lineHeight: 1.6, margin: "4px 0 0" }}>
                  • <b>Nombor Murid:</b> No. murid anak (cth: 01, 02)<br/>
                  • <b>Kata Laluan:</b> No. telefon wali (cth: 0128881234)
                </p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#1E40AF", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".4px" }}>Nombor Murid</p>
                <input value={user} onChange={e => setUser(e.target.value)} placeholder="Contoh: 01"
                  style={{ width: "100%", padding: "12px 14px", border: "3px solid #0F172A", borderRadius: 14, fontFamily: "'JetBrains Mono',monospace", fontSize: 16, fontWeight: 700, outline: "none", boxShadow: "2px 2px 0 #0F172A", background: "#fff", color: "#0F172A" }}/>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#1E40AF", marginBottom: 6, textTransform: "uppercase", letterSpacing: ".4px" }}>No. Telefon Wali</p>
                <div style={{ position: "relative" }}>
                  <input value={pass} onChange={e => setPass(e.target.value)} placeholder="Contoh: 0128881234"
                    type={show ? "text" : "password"}
                    style={{ width: "100%", padding: "12px 44px 12px 14px", border: "3px solid #0F172A", borderRadius: 14, fontFamily: "'JetBrains Mono',monospace", fontSize: 14, fontWeight: 700, outline: "none", boxShadow: "2px 2px 0 #0F172A", background: "#fff", color: "#0F172A" }}/>
                  <button type="button" onClick={() => setShow(p => !p)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>{show ? "🙈" : "👁️"}</button>
                </div>
              </div>
            </>
          )}

          {authError && (
            <div style={{ background: "#FEF2F2", border: "2px solid #EF4444", borderRadius: 12, padding: "10px 14px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", margin: 0 }}>⚠️ {authError}</p>
            </div>
          )}

          <button type="submit" disabled={authLoading || !user || !pass} style={{
            padding: "14px", border: "3px solid #0F172A", borderRadius: 14,
            background: authLoading || !user || !pass ? "#94A3B8" : "#1A56DB",
            color: "#fff", fontFamily: "'Nunito',sans-serif", fontWeight: 900,
            fontSize: 15, cursor: authLoading || !user || !pass ? "not-allowed" : "pointer",
            boxShadow: authLoading || !user || !pass ? "none" : "4px 4px 0 #0F172A",
            transition: "all .15s", letterSpacing: ".3px",
          }}>
            {authLoading ? "⏳ Mengesahkan…" : "🔐 Log Masuk"}
          </button>

          <p style={{ textAlign: "center", fontSize: 11, color: "#94A3B8", fontWeight: 600, margin: 0 }}>
            Portal Cikgu Anna v1.0 · 2026
          </p>
        </form>
      </div>
    </div>
  );
}
