import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const JADUAL = {
  Isnin: ["BM","Matematik","Sains","REHAT","Pend. Islam","Bhs. Inggeris","ERT"],
  Selasa:["Matematik","BM","Bhs. Inggeris","REHAT","Sains","Sejarah","PJ"],
  Rabu:  ["Sains","Bhs. Inggeris","BM","REHAT","Matematik","Pend. Islam","Muzik"],
  Khamis:["Pend. Islam","Sains","Matematik","REHAT","BM","Bhs. Inggeris","Moral"],
  Jumaat:["PJ","BM","Sains","REHAT","Matematik","Bhs. Inggeris","Kokurikulum"],
};
const MASA = ["7:30","8:10","8:50","9:30","10:10","11:10","11:50"];
const SUBJ_META = {
  "BM":{emoji:"📖",color:"#1A56DB",bg:"#EFF6FF"},"Matematik":{emoji:"🔢",color:"#FF8C00",bg:"#FFF4E0"},
  "Sains":{emoji:"🔬",color:"#06B77A",bg:"#E6FAF3"},"Bhs. Inggeris":{emoji:"🌍",color:"#8B5CF6",bg:"#F5F3FF"},
  "Pend. Islam":{emoji:"☪️",color:"#9333EA",bg:"#F5F3FF"},"Sejarah":{emoji:"📜",color:"#B45309",bg:"#FFF8ED"},
  "PJ":{emoji:"⚽",color:"#0891B2",bg:"#ECFEFF"},"ERT":{emoji:"🧵",color:"#EC4899",bg:"#FDF2F8"},
  "Muzik":{emoji:"🎵",color:"#6366F1",bg:"#EEF2FF"},"Moral":{emoji:"🌱",color:"#CA8A04",bg:"#FEFCE8"},
  "Kokurikulum":{emoji:"🏅",color:"#16A34A",bg:"#F0FDF4"},"REHAT":{emoji:"🍱",color:"#94A3B8",bg:"#F8FAFC"},
};

function Ava({ nama, jantina, size = 48 }) {
  const ini = nama.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();
  const g   = jantina === "P"
    ? "linear-gradient(135deg,#8B5CF6,#C4B5FD)"
    : "linear-gradient(135deg,#1A56DB,#60A5FA)";
  return (
    <div style={{ width: size, height: size, minWidth: size, borderRadius: "50%", background: g, border: "3px solid #0F172A", boxShadow: "2px 2px 0 #0F172A", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: size * .34, fontFamily: "Fredoka,sans-serif" }}>
      {ini}
    </div>
  );
}

function StatCard({ icon, val, label, color, bg, border }) {
  return (
    <div style={{ background: bg, border: `3px solid ${border}`, borderRadius: 18, boxShadow: "3px 3px 0 #0F172A", padding: "14px 10px", textAlign: "center" }}>
      <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontFamily: "Fredoka,sans-serif", fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 10, fontWeight: 800, color: "#475569", marginTop: 4 }}>{label}</div>
    </div>
  );
}

const netMerit = m => (m?.merit || 0) - (m?.demerit || 0);

const TABS = [
  { id: "profil",   emoji: "👤", label: "Profil"   },
  { id: "hadir",    emoji: "📋", label: "Kehadiran" },
  { id: "merit",    emoji: "🏆", label: "Merit"     },
  { id: "jadual",   emoji: "📅", label: "Jadual"    },
  { id: "objektif", emoji: "🎯", label: "Objektif"  },
];

export default function ParentPortal({ studentId, waliName, onLogout }) {
  const [murid,    setMurid]    = useState(null);
  const [objektif, setObjektif] = useState([]);
  const [tab,      setTab]      = useState("profil");
  const [loading,  setLoading]  = useState(true);
  const [hariJadual, setHariJadual] = useState("Isnin");

  useEffect(() => {
    const load = async () => {
      const [{ data: m }, { data: obj }] = await Promise.all([
        supabase.from("murid").select("*").eq("id", studentId).single(),
        supabase.from("objektif_pp").select("*").order("created_at", { ascending: false }),
      ]);
      setMurid(m);
      setObjektif(obj || []);
      setLoading(false);
    };
    load();
  }, [studentId]);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F0F7FF", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "Nunito,sans-serif" }}>
      <div style={{ fontSize: 40 }}>⏳</div>
      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, color: "#1A56DB", fontWeight: 700 }}>Memuatkan maklumat anak…</p>
    </div>
  );

  if (!murid) return (
    <div style={{ minHeight: "100vh", background: "#F0F7FF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito,sans-serif" }}>
      <p style={{ color: "#EF4444", fontWeight: 700 }}>Data tidak dijumpai.</p>
    </div>
  );

  const net = netMerit(murid);
  const pct = Math.max(0, Math.min(100, (net / 150) * 100));
  const netColor = net >= 100 ? "#06B77A" : net < 50 ? "#1A56DB" : "#F59E0B";

  return (
    <div style={{ minHeight: "100vh", background: "#F0F7FF", display: "flex", flexDirection: "column", maxWidth: 540, margin: "0 auto", fontFamily: "Nunito,sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#1A56DB", borderBottom: "3px solid #0F172A", boxShadow: "0 4px 0 #0F172A", padding: "16px 16px 12px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px" }}>PORTAL WALI · SK DARAU</p>
            <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 2 }}>Selamat datang, {waliName?.split(" ")[0] || murid.wali?.split(" ")[0]}!</p>
          </div>
          <div style={{ background: "#FFD166", border: "2px solid #0F172A", borderRadius: 10, padding: "4px 10px", fontSize: 10, fontWeight: 900, color: "#0F172A" }}>BACA SAHAJA</div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.4)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontFamily: "Nunito,sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
            Keluar
          </button>
        </div>
      </div>

      {/* Child banner */}
      <div style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 20, margin: "14px 14px 0", boxShadow: "4px 4px 0 #0F172A", padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
        <Ava nama={murid.nama} jantina={murid.jantina} size={56}/>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{murid.nama}</p>
          <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginTop: 2 }}>
            No. {murid.no} · {murid.jantina === "L" ? "Lelaki" : "Perempuan"} · Tahun 4 Bestari
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 22, fontWeight: 700, color: netColor, lineHeight: 1 }}>{net}</p>
          <p style={{ fontSize: 9, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Net Merit</p>
        </div>
      </div>

      {/* Tabs content */}
      <div style={{ flex: 1, padding: "14px 14px 80px", overflowY: "auto" }}>

        {/* Profil */}
        {tab === "profil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { l: "No. IC",    v: murid.ic     || "-", mono: true },
                { l: "ID Delima", v: murid.delima || "-", mono: true },
                { l: "Nama Wali", v: murid.wali   || "-" },
                { l: "Tel Wali",  v: murid.tel    || "-", mono: true },
              ].map(f => (
                <div key={f.l} style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 16, boxShadow: "3px 3px 0 #0F172A", padding: "12px 14px" }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".4px" }}>{f.l}</p>
                  <p style={{ fontSize: 13, fontWeight: 800, marginTop: 6, color: "#0F172A", fontFamily: f.mono ? "JetBrains Mono,monospace" : "Nunito,sans-serif", wordBreak: "break-all" }}>{f.v}</p>
                </div>
              ))}
            </div>
            {murid.catatan ? (
              <div style={{ background: "#FFFBEC", border: "3px solid #C09010", borderRadius: 16, boxShadow: "3px 3px 0 #9A7008", padding: "12px 14px" }}>
                <p style={{ fontSize: 11, fontWeight: 900, color: "#B45309", marginBottom: 4 }}>📝 Catatan Guru</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", fontStyle: "italic", lineHeight: 1.6 }}>{murid.catatan}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Kehadiran */}
        {tab === "hadir" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <StatCard icon="✅" val={murid.hadir}  label="Hari Hadir" color="#06B77A" bg="#E6FAF3" border="#06B77A"/>
              <StatCard icon="❌" val={murid.absen}  label="Hari Absen" color="#1A56DB" bg="#EFF6FF" border="#1A56DB"/>
              <StatCard icon="📊" val={`${Math.round((murid.hadir/(murid.hadir+murid.absen||1))*100)}%`} label="Kadar Hadir" color="#B45309" bg="#FFFBEC" border="#C09010"/>
            </div>
            <div style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 16, boxShadow: "3px 3px 0 #0F172A", padding: "14px" }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: "#0F172A", marginBottom: 10 }}>📊 Nisbah Kehadiran</p>
              <div style={{ display: "flex", gap: 6, height: 28, borderRadius: 12, overflow: "hidden", border: "2px solid #0F172A" }}>
                <div style={{ width: `${Math.round((murid.hadir/(murid.hadir+murid.absen||1))*100)}%`, background: "#06B77A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{murid.hadir}H</span>
                </div>
                <div style={{ flex: 1, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#1A56DB" }}>{murid.absen}A</span>
                </div>
              </div>
              {murid.absen >= 7 && (
                <p style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", marginTop: 10, background: "#FEF2F2", padding: "8px 10px", borderRadius: 8, border: "2px solid #FCA5A5" }}>
                  ⚠️ Kehadiran memerlukan perhatian. Sila bincang dengan guru kelas.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Merit */}
        {tab === "merit" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <StatCard icon="✅" val={murid.merit}   label="Merit"    color="#06B77A" bg="#E6FAF3" border="#06B77A"/>
              <StatCard icon="⚠️" val={murid.demerit} label="Demerit"  color="#1A56DB" bg="#EFF6FF" border="#1A56DB"/>
              <StatCard icon="🏅" val={net}           label="Net Merit" color={netColor} bg="#FFFBEC" border="#C09010"/>
            </div>
            <div style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 16, boxShadow: "3px 3px 0 #0F172A", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: "#0F172A" }}>📈 Progres Merit</p>
                <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12, fontWeight: 700, color: netColor }}>{net} / 150</p>
              </div>
              <div style={{ height: 14, background: "#BFDBFE", borderRadius: 99, border: "2px solid #0F172A", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: netColor, borderRadius: 99, transition: "width .6s" }}/>
              </div>
              <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 8, lineHeight: 1.6 }}>
                {net >= 100 ? "⭐ Cemerlang! Tahniah atas pencapaian anak anda."
                  : net >= 50 ? "👍 Prestasi baik. Teruskan usaha!"
                  : "💪 Masih ada ruang untuk meningkat. Jom usaha lagi!"}
              </p>
            </div>
          </div>
        )}

        {/* Jadual */}
        {tab === "jadual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {["Isnin","Selasa","Rabu","Khamis","Jumaat"].map(h => (
                <button key={h} onClick={() => setHariJadual(h)} style={{
                  whiteSpace: "nowrap", padding: "8px 16px", border: "3px solid #0F172A",
                  borderRadius: 14, background: hariJadual === h ? "#1A56DB" : "#fff",
                  color: hariJadual === h ? "#fff" : "#0F172A", fontSize: 12, fontWeight: 900,
                  cursor: "pointer", flexShrink: 0, boxShadow: hariJadual === h ? "3px 3px 0 #1E40AF" : "3px 3px 0 #0F172A",
                  fontFamily: "Nunito,sans-serif",
                }}>{h}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {JADUAL[hariJadual].map((subj, i) => {
                const isR = subj === "REHAT";
                const meta = SUBJ_META[subj] || { emoji: "📚", color: "#1A56DB", bg: "#EFF6FF" };
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: isR ? "#F8FAFC" : meta.bg, border: `3px solid ${isR ? "#CBD5E1" : "#0F172A"}`, borderRadius: 16, padding: "11px 14px", boxShadow: isR ? "none" : "3px 3px 0 #0F172A", opacity: isR ? .6 : 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isR ? "#CBD5E1" : meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `2px solid ${isR ? "#94A3B8" : "#0F172A"}`, flexShrink: 0 }}>{meta.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: isR ? 600 : 900, color: isR ? "#64748B" : "#0F172A", fontStyle: isR ? "italic" : "normal" }}>{isR ? "— Waktu Rehat —" : subj}</p>
                      {!isR && <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 1 }}>40 minit</p>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12, fontWeight: 700, color: isR ? "#94A3B8" : meta.color }}>{MASA[i]}</p>
                      {i < 6 && !isR && <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "#94A3B8" }}>→{MASA[i + 1]}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Objektif P&P */}
        {tab === "objektif" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {objektif.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontWeight: 700 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                <p>Tiada objektif pelajaran direkodkan lagi.</p>
              </div>
            )}
            {objektif.map(e => {
              const meta = SUBJ_META[e.subjek] || { emoji: "📚", color: "#1A56DB", bg: "#EFF6FF" };
              return (
                <div key={e.id} style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 16, boxShadow: "3px 3px 0 #0F172A", overflow: "hidden" }}>
                  <div style={{ background: meta.color, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 18 }}>{meta.emoji}</span>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 900, color: "#fff" }}>{e.subjek}{e.tajuk ? " · " + e.tajuk : ""}</p>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,.8)", fontWeight: 700 }}>📅 {e.hari}, {e.tarikh} · 🕐 {e.masa}</p>
                    </div>
                  </div>
                  <div style={{ padding: "12px 14px" }}>
                    <p style={{ fontSize: 11, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 4 }}>Objektif Pembelajaran</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.6, marginBottom: e.bbm ? 10 : 0 }}>{e.objektif}</p>
                    {e.bbm && (
                      <div style={{ background: "#FFFBEC", border: "2px solid #C09010", borderRadius: 10, padding: "6px 10px" }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#B45309" }}>📎 BBM: <span style={{ fontWeight: 600, color: "#0F172A" }}>{e.bbm}</span></p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom tab nav */}
      <div style={{ position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 540, background: "#fff", borderTop: "3px solid #0F172A", boxShadow: "0 -3px 0 #0F172A", display: "flex", zIndex: 20 }}>
        {TABS.map(t => {
          const sel = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: "10px 4px 8px", background: sel ? "#EFF6FF" : "none",
              border: "none", borderTop: `3px solid ${sel ? "#1A56DB" : "transparent"}`,
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}>
              <span style={{ fontSize: 18 }}>{t.emoji}</span>
              <span style={{ fontSize: 9, fontWeight: 900, color: sel ? "#1A56DB" : "#475569", fontFamily: "Nunito,sans-serif" }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
