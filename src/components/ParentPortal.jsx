import { useState, useEffect } from "react";
import { supabase } from "../supabase";

const TIMETABLE = {
  Monday:    ["Malay","Maths","Science","BREAK","Islamic Studies","English","Home Ec"],
  Tuesday:   ["Maths","Malay","English","BREAK","Science","History","PE"],
  Wednesday: ["Science","English","Malay","BREAK","Maths","Islamic Studies","Music"],
  Thursday:  ["Islamic Studies","Science","Maths","BREAK","Malay","English","Moral Ed"],
  Friday:    ["PE","Malay","Science","BREAK","Maths","English","Co-Curricular"],
};
const TIMES = ["7:30","8:10","8:50","9:30","10:10","11:10","11:50"];
const SUBJ_META = {
  "Malay":          {emoji:"📖",color:"#1A56DB",bg:"#EFF6FF"},
  "Maths":          {emoji:"🔢",color:"#FF8C00",bg:"#FFF4E0"},
  "Science":        {emoji:"🔬",color:"#06B77A",bg:"#E6FAF3"},
  "English":        {emoji:"🌍",color:"#8B5CF6",bg:"#F5F3FF"},
  "Islamic Studies":{emoji:"☪️",color:"#9333EA",bg:"#F5F3FF"},
  "History":        {emoji:"📜",color:"#B45309",bg:"#FFF8ED"},
  "PE":             {emoji:"⚽",color:"#0891B2",bg:"#ECFEFF"},
  "Home Ec":        {emoji:"🧵",color:"#EC4899",bg:"#FDF2F8"},
  "Music":          {emoji:"🎵",color:"#6366F1",bg:"#EEF2FF"},
  "Moral Ed":       {emoji:"🌱",color:"#CA8A04",bg:"#FEFCE8"},
  "Co-Curricular":  {emoji:"🏅",color:"#16A34A",bg:"#F0FDF4"},
  "BREAK":          {emoji:"🍱",color:"#94A3B8",bg:"#F8FAFC"},
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
  { id: "profil",   emoji: "👤", label: "Profile"    },
  { id: "hadir",    emoji: "📋", label: "Attendance"  },
  { id: "merit",    emoji: "🏆", label: "Merit"       },
  { id: "jadual",   emoji: "📅", label: "Timetable"   },
  { id: "objektif", emoji: "🎯", label: "Objectives"  },
];

export default function ParentPortal({ studentId, waliName, onLogout }) {
  const [murid,    setMurid]    = useState(null);
  const [objektif, setObjektif] = useState([]);
  const [tab,      setTab]      = useState("profil");
  const [loading,  setLoading]  = useState(true);
  const [dayTab,   setDayTab]   = useState("Monday");

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
      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, color: "#1A56DB", fontWeight: 700 }}>Loading student information…</p>
    </div>
  );

  if (!murid) return (
    <div style={{ minHeight: "100vh", background: "#F0F7FF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito,sans-serif" }}>
      <p style={{ color: "#EF4444", fontWeight: 700 }}>Student data not found.</p>
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
            <p style={{ fontSize: 10, color: "rgba(255,255,255,.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px" }}>PARENT PORTAL · SK DARAU</p>
            <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 2 }}>Welcome, {waliName?.split(" ")[0] || murid.wali?.split(" ")[0]}!</p>
          </div>
          <div style={{ background: "#FFD166", border: "2px solid #0F172A", borderRadius: 10, padding: "4px 10px", fontSize: 10, fontWeight: 900, color: "#0F172A" }}>READ ONLY</div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.4)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontFamily: "Nunito,sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
            Log Out
          </button>
        </div>
      </div>

      {/* Child banner */}
      <div style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 20, margin: "14px 14px 0", boxShadow: "4px 4px 0 #0F172A", padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
        <Ava nama={murid.nama} jantina={murid.jantina} size={56}/>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{murid.nama}</p>
          <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginTop: 2 }}>
            No. {murid.no} · {murid.jantina === "L" ? "Male" : "Female"} · Year 4 Bestari
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 22, fontWeight: 700, color: netColor, lineHeight: 1 }}>{net}</p>
          <p style={{ fontSize: 9, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Net Merit</p>
        </div>
      </div>

      {/* Tabs content */}
      <div style={{ flex: 1, padding: "14px 14px 80px", overflowY: "auto" }}>

        {/* Profile */}
        {tab === "profil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { l: "IC No.",       v: murid.ic     || "-", mono: true },
                { l: "Delima ID",    v: murid.delima || "-", mono: true },
                { l: "Guardian",     v: murid.wali   || "-" },
                { l: "Guardian Tel", v: murid.tel    || "-", mono: true },
              ].map(f => (
                <div key={f.l} style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 16, boxShadow: "3px 3px 0 #0F172A", padding: "12px 14px" }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".4px" }}>{f.l}</p>
                  <p style={{ fontSize: 13, fontWeight: 800, marginTop: 6, color: "#0F172A", fontFamily: f.mono ? "JetBrains Mono,monospace" : "Nunito,sans-serif", wordBreak: "break-all" }}>{f.v}</p>
                </div>
              ))}
            </div>
            {murid.catatan ? (
              <div style={{ background: "#FFFBEC", border: "3px solid #C09010", borderRadius: 16, boxShadow: "3px 3px 0 #9A7008", padding: "12px 14px" }}>
                <p style={{ fontSize: 11, fontWeight: 900, color: "#B45309", marginBottom: 4 }}>📝 Teacher's Note</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", fontStyle: "italic", lineHeight: 1.6 }}>{murid.catatan}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Attendance */}
        {tab === "hadir" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <StatCard icon="✅" val={murid.hadir}  label="Days Present" color="#06B77A" bg="#E6FAF3" border="#06B77A"/>
              <StatCard icon="❌" val={murid.absen}  label="Days Absent"  color="#1A56DB" bg="#EFF6FF" border="#1A56DB"/>
              <StatCard icon="📊" val={`${Math.round((murid.hadir/(murid.hadir+murid.absen||1))*100)}%`} label="Rate" color="#B45309" bg="#FFFBEC" border="#C09010"/>
            </div>
            <div style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 16, boxShadow: "3px 3px 0 #0F172A", padding: "14px" }}>
              <p style={{ fontSize: 12, fontWeight: 900, color: "#0F172A", marginBottom: 10 }}>📊 Attendance Ratio</p>
              <div style={{ display: "flex", gap: 6, height: 28, borderRadius: 12, overflow: "hidden", border: "2px solid #0F172A" }}>
                <div style={{ width: `${Math.round((murid.hadir/(murid.hadir+murid.absen||1))*100)}%`, background: "#06B77A", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#fff" }}>{murid.hadir}P</span>
                </div>
                <div style={{ flex: 1, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 10, fontWeight: 900, color: "#1A56DB" }}>{murid.absen}A</span>
                </div>
              </div>
              {murid.absen >= 7 && (
                <p style={{ fontSize: 12, fontWeight: 700, color: "#DC2626", marginTop: 10, background: "#FEF2F2", padding: "8px 10px", borderRadius: 8, border: "2px solid #FCA5A5" }}>
                  ⚠️ Attendance needs attention. Please discuss with the class teacher.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Merit */}
        {tab === "merit" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <StatCard icon="✅" val={murid.merit}   label="Merit"     color="#06B77A" bg="#E6FAF3" border="#06B77A"/>
              <StatCard icon="⚠️" val={murid.demerit} label="Demerit"   color="#1A56DB" bg="#EFF6FF" border="#1A56DB"/>
              <StatCard icon="🏅" val={net}           label="Net Merit"  color={netColor} bg="#FFFBEC" border="#C09010"/>
            </div>
            <div style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 16, boxShadow: "3px 3px 0 #0F172A", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: "#0F172A" }}>📈 Merit Progress</p>
                <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12, fontWeight: 700, color: netColor }}>{net} / 150</p>
              </div>
              <div style={{ height: 14, background: "#BFDBFE", borderRadius: 99, border: "2px solid #0F172A", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: netColor, borderRadius: 99, transition: "width .6s" }}/>
              </div>
              <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 8, lineHeight: 1.6 }}>
                {net >= 100 ? "⭐ Excellent! Congratulations on your child's achievement."
                  : net >= 50 ? "👍 Good performance. Keep it up!"
                  : "💪 Room to improve. Let's work harder!"}
              </p>
            </div>
          </div>
        )}

        {/* Timetable */}
        {tab === "jadual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
              {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(d => (
                <button key={d} onClick={() => setDayTab(d)} style={{
                  whiteSpace: "nowrap", padding: "8px 16px", border: "3px solid #0F172A",
                  borderRadius: 14, background: dayTab === d ? "#1A56DB" : "#fff",
                  color: dayTab === d ? "#fff" : "#0F172A", fontSize: 12, fontWeight: 900,
                  cursor: "pointer", flexShrink: 0, boxShadow: dayTab === d ? "3px 3px 0 #1E40AF" : "3px 3px 0 #0F172A",
                  fontFamily: "Nunito,sans-serif",
                }}>{d}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {TIMETABLE[dayTab].map((subj, i) => {
                const isB = subj === "BREAK";
                const meta = SUBJ_META[subj] || { emoji: "📚", color: "#1A56DB", bg: "#EFF6FF" };
                return (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: isB ? "#F8FAFC" : meta.bg, border: `3px solid ${isB ? "#CBD5E1" : "#0F172A"}`, borderRadius: 16, padding: "11px 14px", boxShadow: isB ? "none" : "3px 3px 0 #0F172A", opacity: isB ? .6 : 1 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: isB ? "#CBD5E1" : meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `2px solid ${isB ? "#94A3B8" : "#0F172A"}`, flexShrink: 0 }}>{meta.emoji}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: isB ? 600 : 900, color: isB ? "#64748B" : "#0F172A", fontStyle: isB ? "italic" : "normal" }}>{isB ? "— Break Time —" : subj}</p>
                      {!isB && <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 1 }}>40 mins</p>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12, fontWeight: 700, color: isB ? "#94A3B8" : meta.color }}>{TIMES[i]}</p>
                      {i < 6 && !isB && <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 10, color: "#94A3B8" }}>→{TIMES[i + 1]}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lesson Objectives */}
        {tab === "objektif" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {objektif.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontWeight: 700 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                <p>No lesson objectives recorded yet.</p>
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
                    <p style={{ fontSize: 11, fontWeight: 900, color: "#475569", textTransform: "uppercase", letterSpacing: ".4px", marginBottom: 4 }}>Learning Objective</p>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.6, marginBottom: e.bbm ? 10 : 0 }}>{e.objektif}</p>
                    {e.bbm && (
                      <div style={{ background: "#FFFBEC", border: "2px solid #C09010", borderRadius: 10, padding: "6px 10px" }}>
                        <p style={{ fontSize: 11, fontWeight: 800, color: "#B45309" }}>📎 Teaching Aids: <span style={{ fontWeight: 600, color: "#0F172A" }}>{e.bbm}</span></p>
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
