import { useState, useEffect } from "react";
import { supabase } from "../supabase";

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

const RANK_TITLE = ["👑 Merit Master","⭐ Champion","🌟 Star Scholar","💪 Rising Star","🎯 Achiever"];
const RANK_BG    = ["#FEF9C3","#F0FDF4","#FFF7ED","#fff","#fff"];
const RANK_BC    = ["#CA8A04","#16A34A","#EA580C","#CBD5E1","#CBD5E1"];
const DAYS       = ["Monday","Tuesday","Wednesday","Thursday","Friday"];

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
  { id: "profil",   emoji: "👤", label: "Profil"    },
  { id: "hadir",    emoji: "📋", label: "Kehadiran" },
  { id: "merit",    emoji: "🏆", label: "Merit"     },
  { id: "jadual",   emoji: "📅", label: "Jadual"    },
  { id: "objektif", emoji: "🎯", label: "Objektif"  },
  { id: "mesej",    emoji: "📨", label: "Mesej"     },
];

export default function ParentPortal({ studentId, waliName, onLogout }) {
  const [murid,      setMurid]      = useState(null);
  const [classmates, setClassmates] = useState([]);
  const [objektif,   setObjektif]   = useState([]);
  const [jadual,     setJadual]     = useState([]);
  const [myMesej,    setMyMesej]    = useState([]);
  const [tab,        setTab]        = useState("profil");
  const [loading,    setLoading]    = useState(true);
  const [dayTab,     setDayTab]     = useState("Monday");

  // Mesej form state
  const [jenis,        setJenis]        = useState("makluman");
  const [mesej,        setMesej]        = useState("");
  const [sending,      setSending]      = useState(false);
  const [sent,         setSent]         = useState(false);
  const [mesejEnabled, setMesejEnabled] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [{ data: m }, { data: obj }, { data: jd }, { data: st }] = await Promise.all([
        supabase.from("murid").select("*").eq("id", studentId).single(),
        supabase.from("objektif_pp").select("*").order("created_at", { ascending: false }),
        supabase.from("jadual").select("*").order("urutan"),
        supabase.from("settings").select("value").eq("key","mesej_ibu_bapa").single(),
      ]);
      if (st) setMesejEnabled(st.value === "on");
      setMurid(m);
      setObjektif(obj || []);
      setJadual(jd || []);
      if (m?.kelas) {
        const { data: mates } = await supabase.from("murid").select("*").eq("kelas", m.kelas).order("no");
        setClassmates(mates || []);
      }
      // Load this parent's messages
      if (m?.nama) {
        const { data: msgs } = await supabase
          .from("log_ibu_bapa")
          .select("*")
          .eq("murid", m.nama)
          .order("created_at", { ascending: true });
        setMyMesej(msgs || []);
      }
      setLoading(false);
    };
    load();
  }, [studentId]);

  // Real-time: sync timetable changes from admin instantly
  useEffect(() => {
    const channel = supabase
      .channel("jadual_realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "jadual" }, payload => {
        setJadual(prev => [...prev, payload.new].sort((a, b) => a.urutan - b.urutan));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "jadual" }, payload => {
        setJadual(prev => prev.map(s => s.id === payload.new.id ? payload.new : s).sort((a, b) => a.urutan - b.urutan));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "jadual" }, payload => {
        setJadual(prev => prev.filter(s => s.id !== payload.old.id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Real-time: pick up admin replies to this parent's messages instantly
  useEffect(() => {
    const channel = supabase
      .channel("log_parent_realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "log_ibu_bapa" }, payload => {
        setMyMesej(prev => prev.map(m => m.id === payload.new.id ? payload.new : m));
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "log_ibu_bapa" }, payload => {
        // only add if it belongs to this student (admin-created notices)
        if (payload.new.murid === murid?.nama) {
          setMyMesej(prev => [...prev, payload.new]);
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [murid?.nama]);

  // Real-time: admin toggles mesej on/off → parent sees instantly
  useEffect(() => {
    const channel = supabase
      .channel("settings_realtime")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "settings" }, payload => {
        if (payload.new.key === "mesej_ibu_bapa") {
          setMesejEnabled(payload.new.value === "on");
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#F0F7FF", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, fontFamily: "Nunito,sans-serif" }}>
      <div style={{ fontSize: 40 }}>⏳</div>
      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, color: "#1A56DB", fontWeight: 700 }}>Memuatkan maklumat murid…</p>
    </div>
  );

  if (!murid) return (
    <div style={{ minHeight: "100vh", background: "#F0F7FF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Nunito,sans-serif" }}>
      <p style={{ color: "#EF4444", fontWeight: 700 }}>Data murid tidak dijumpai.</p>
    </div>
  );

  const net = netMerit(murid);
  const pct = Math.max(0, Math.min(100, (net / 150) * 100));
  const netColor = net >= 100 ? "#06B77A" : net < 50 ? "#1A56DB" : "#F59E0B";

  const ranked = [...classmates].sort((a, b) => netMerit(b) - netMerit(a));
  const myRank = ranked.findIndex(m => m.id === murid.id);

  // Group jadual by hari
  const jadualByHari = {};
  DAYS.forEach(d => { jadualByHari[d] = jadual.filter(j => j.hari === d).sort((a, b) => a.urutan - b.urutan); });

  const today = new Date();
  const todayStr = `${today.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][today.getMonth()]} ${today.getFullYear()}`;

  const sendMesej = async () => {
    if (!mesej.trim()) return;
    setSending(true);
    const { data: row } = await supabase.from("log_ibu_bapa").insert({
      murid: murid.nama,
      wali:  murid.wali || waliName,
      tel:   murid.tel  || "",
      jenis,
      mesej: mesej.trim(),
      tarikh: todayStr,
      status: "unanswered",
      balasan: "",
    }).select().single();
    if (row) setMyMesej(prev => [...prev, row]);
    setSent(true);
    setMesej("");
    setSending(false);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F0F7FF", display: "flex", flexDirection: "column", maxWidth: 540, margin: "0 auto", fontFamily: "Nunito,sans-serif" }}>

      {/* Header */}
      <div style={{ background: "#1A56DB", borderBottom: "3px solid #0F172A", boxShadow: "0 4px 0 #0F172A", padding: "16px 16px 12px", position: "sticky", top: 0, zIndex: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,.7)", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".4px" }}>PORTAL IBU BAPA · SK BUKIT LALANG, SEMPORNA</p>
            <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", marginTop: 2 }}>Selamat datang, {waliName?.split(" ")[0] || murid.wali?.split(" ")[0]}!</p>
          </div>
          <div style={{ background: "#FFD166", border: "2px solid #0F172A", borderRadius: 10, padding: "4px 10px", fontSize: 10, fontWeight: 900, color: "#0F172A" }}>BACA SAHAJA</div>
          <button onClick={onLogout} style={{ background: "rgba(255,255,255,.2)", border: "2px solid rgba(255,255,255,.4)", borderRadius: 10, padding: "8px 12px", color: "#fff", fontFamily: "Nunito,sans-serif", fontWeight: 800, fontSize: 12, cursor: "pointer" }}>
            Log Keluar
          </button>
        </div>
      </div>

      {/* Child banner */}
      <div style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 20, margin: "14px 14px 0", boxShadow: "4px 4px 0 #0F172A", padding: "16px", display: "flex", alignItems: "center", gap: 14 }}>
        <Ava nama={murid.nama} jantina={murid.jantina} size={56}/>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, fontWeight: 700, color: "#0F172A" }}>{murid.nama}</p>
          <p style={{ fontSize: 12, color: "#475569", fontWeight: 600, marginTop: 2 }}>
            No. {murid.no} · {murid.jantina === "L" ? "Lelaki" : "Perempuan"} · {murid.kelas}
          </p>
          {myRank >= 0 && (
            <p style={{ fontSize: 11, fontWeight: 800, color: myRank < 3 ? RANK_BC[myRank] : "#475569", marginTop: 3 }}>
              {myRank === 0 ? "🥇" : myRank === 1 ? "🥈" : myRank === 2 ? "🥉" : `#${myRank+1}`} {RANK_TITLE[Math.min(myRank,4)]} · Ranking kelas
            </p>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 22, fontWeight: 700, color: netColor, lineHeight: 1 }}>{net}</p>
          <p style={{ fontSize: 9, fontWeight: 800, color: "#475569", textTransform: "uppercase" }}>Net Merit</p>
        </div>
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, padding: "14px 14px 80px" }}>

        {/* Profile */}
        {tab === "profil" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { l: "No. IC",     v: murid.ic     || "-", mono: true },
                { l: "ID Delima",  v: murid.delima || "-", mono: true },
                { l: "Wali",       v: murid.wali   || "-" },
                { l: "Tel Wali",   v: murid.tel    || "-", mono: true },
              ].map(f => (
                <div key={f.l} style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 16, boxShadow: "3px 3px 0 #0F172A", padding: "12px 14px" }}>
                  <p style={{ fontSize: 10, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".4px" }}>{f.l}</p>
                  <p style={{ fontSize: 13, fontWeight: 800, marginTop: 6, color: "#0F172A", fontFamily: f.mono ? "JetBrains Mono,monospace" : "Nunito,sans-serif", wordBreak: "break-all" }}>{f.v}</p>
                </div>
              ))}
            </div>
            {murid.catatan ? (
              <div style={{ background: "#FFFBEC", border: "3px solid #C09010", borderRadius: 16, boxShadow: "3px 3px 0 #9A7008", padding: "12px 14px" }}>
                <p style={{ fontSize: 11, fontWeight: 900, color: "#B45309", marginBottom: 4 }}>📝 Nota Guru</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", fontStyle: "italic", lineHeight: 1.6 }}>{murid.catatan}</p>
              </div>
            ) : null}
          </div>
        )}

        {/* Attendance */}
        {tab === "hadir" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <StatCard icon="✅" val={murid.hadir}  label="Hari Hadir" color="#06B77A" bg="#E6FAF3" border="#06B77A"/>
              <StatCard icon="❌" val={murid.absen}  label="Hari Absen" color="#1A56DB" bg="#EFF6FF" border="#1A56DB"/>
              <StatCard icon="📊" val={`${Math.round((murid.hadir/(murid.hadir+murid.absen||1))*100)}%`} label="Kadar" color="#B45309" bg="#FFFBEC" border="#C09010"/>
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
                  ⚠️ Kehadiran perlu diberi perhatian. Sila berbincang dengan guru kelas.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Merit */}
        {tab === "merit" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              <StatCard icon="✅" val={murid.merit}   label="Merit"     color="#06B77A" bg="#E6FAF3" border="#06B77A"/>
              <StatCard icon="⚠️" val={murid.demerit} label="Demerit"   color="#DC2626" bg="#FEF2F2" border="#DC2626"/>
              <StatCard icon="🏅" val={net}            label="Net Merit" color={netColor} bg="#FFFBEC" border="#C09010"/>
            </div>
            <div style={{ background: "#fff", border: "3px solid #0F172A", borderRadius: 16, boxShadow: "3px 3px 0 #0F172A", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 900, color: "#0F172A" }}>📈 Merit Progress</p>
                <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12, fontWeight: 700, color: netColor }}>{net} / 150</p>
              </div>
              <div style={{ height: 16, background: "#BFDBFE", borderRadius: 99, border: "2px solid #0F172A", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: netColor, borderRadius: 99, transition: "width .6s" }}/>
              </div>
              <p style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginTop: 10, lineHeight: 1.6 }}>
                {net >= 100 ? "⭐ Cemerlang! Tahniah atas pencapaian anak anda."
                  : net >= 50 ? "👍 Prestasi baik. Teruskan usaha!"
                  : "💪 Masih ada ruang untuk berkembang. Semangat!"}
              </p>
            </div>
            {/* Class leaderboard — full list */}
            <div style={{ border: "3px solid #0F172A", borderRadius: 20, boxShadow: "4px 4px 0 #0F172A", overflow: "hidden" }}>
              {/* Header */}
              <div style={{ background: "linear-gradient(135deg,#F59E0B 0%,#FBBF24 60%,#FDE68A 100%)", padding: "14px 16px", borderBottom: "3px solid #0F172A" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 26 }}>🏆</span>
                  <div>
                    <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 17, fontWeight: 700, color: "#78350F", lineHeight: 1.1 }}>Ranking Kelas {murid.kelas}</p>
                    <p style={{ fontSize: 10, fontWeight: 800, color: "#92400E", marginTop: 2 }}>{ranked.length} MURID · SCROLL UNTUK LIHAT SEMUA</p>
                  </div>
                  {myRank >= 0 && (
                    <div style={{ marginLeft: "auto", background: "#fff", border: "2px solid #B45309", borderRadius: 12, padding: "4px 10px", textAlign: "center" }}>
                      <p style={{ fontSize: 9, fontWeight: 800, color: "#92400E", textTransform: "uppercase" }}>Kedudukan anda</p>
                      <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 18, fontWeight: 700, color: "#B45309", lineHeight: 1 }}>#{myRank + 1}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top 3 podium */}
              {ranked.length >= 3 && (
                <div style={{ background: "linear-gradient(180deg,#FFFBEB,#fff)", borderBottom: "2px solid #E2E8F0", padding: "16px 12px 12px", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8 }}>
                  {/* 2nd */}
                  {(() => { const m2 = ranked[1]; const isMe2 = m2?.id === murid.id; return m2 ? (
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
                        <Ava nama={m2.nama} jantina={m2.jantina} size={44}/>
                        {isMe2 && <div style={{ position: "absolute", top: -6, right: -6, background: "#1A56DB", borderRadius: "50%", width: 16, height: 16, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 8, color: "#fff", fontWeight: 900 }}>★</span></div>}
                      </div>
                      <p style={{ fontSize: 22 }}>🥈</p>
                      <p style={{ fontSize: 10, fontWeight: 900, color: isMe2 ? "#1A56DB" : "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80, margin: "0 auto" }}>{m2.nama.split(" ")[0]}</p>
                      <div style={{ background: isMe2 ? "#1A56DB" : "#94A3B8", borderRadius: 8, marginTop: 4, padding: "2px 6px" }}>
                        <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 11, fontWeight: 700, color: "#fff" }}>{netMerit(m2)}</p>
                      </div>
                      <div style={{ height: 36, background: isMe2 ? "#1A56DB" : "#94A3B8", borderRadius: "8px 8px 0 0", marginTop: 4, border: "2px solid #0F172A", borderBottom: "none" }}/>
                    </div>
                  ) : null; })()}
                  {/* 1st */}
                  {(() => { const m1 = ranked[0]; const isMe1 = m1?.id === murid.id; return m1 ? (
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
                        <Ava nama={m1.nama} jantina={m1.jantina} size={52}/>
                        {isMe1 && <div style={{ position: "absolute", top: -6, right: -6, background: "#1A56DB", borderRadius: "50%", width: 18, height: 18, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 9, color: "#fff", fontWeight: 900 }}>★</span></div>}
                      </div>
                      <p style={{ fontSize: 28 }}>🥇</p>
                      <p style={{ fontSize: 11, fontWeight: 900, color: isMe1 ? "#1A56DB" : "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 90, margin: "0 auto" }}>{m1.nama.split(" ")[0]}</p>
                      <div style={{ background: isMe1 ? "#1A56DB" : "#CA8A04", borderRadius: 8, marginTop: 4, padding: "2px 8px" }}>
                        <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12, fontWeight: 700, color: "#fff" }}>{netMerit(m1)}</p>
                      </div>
                      <div style={{ height: 56, background: isMe1 ? "#1A56DB" : "#CA8A04", borderRadius: "8px 8px 0 0", marginTop: 4, border: "2px solid #0F172A", borderBottom: "none" }}/>
                    </div>
                  ) : null; })()}
                  {/* 3rd */}
                  {(() => { const m3 = ranked[2]; const isMe3 = m3?.id === murid.id; return m3 ? (
                    <div style={{ textAlign: "center", flex: 1 }}>
                      <div style={{ position: "relative", display: "inline-block", marginBottom: 6 }}>
                        <Ava nama={m3.nama} jantina={m3.jantina} size={40}/>
                        {isMe3 && <div style={{ position: "absolute", top: -6, right: -6, background: "#1A56DB", borderRadius: "50%", width: 16, height: 16, border: "2px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 8, color: "#fff", fontWeight: 900 }}>★</span></div>}
                      </div>
                      <p style={{ fontSize: 20 }}>🥉</p>
                      <p style={{ fontSize: 10, fontWeight: 900, color: isMe3 ? "#1A56DB" : "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 80, margin: "0 auto" }}>{m3.nama.split(" ")[0]}</p>
                      <div style={{ background: isMe3 ? "#1A56DB" : "#EA580C", borderRadius: 8, marginTop: 4, padding: "2px 6px" }}>
                        <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 11, fontWeight: 700, color: "#fff" }}>{netMerit(m3)}</p>
                      </div>
                      <div style={{ height: 24, background: isMe3 ? "#1A56DB" : "#EA580C", borderRadius: "8px 8px 0 0", marginTop: 4, border: "2px solid #0F172A", borderBottom: "none" }}/>
                    </div>
                  ) : null; })()}
                </div>
              )}

              {/* Full ranked list */}
              <div style={{ background: "#fff" }}>
                {ranked.map((m, i) => {
                  const isMe = m.id === murid.id;
                  const medalEmoji = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                  const rankBadgeBg = i === 0 ? "#FEF9C3" : i === 1 ? "#F1F5F9" : i === 2 ? "#FFF7ED" : isMe ? "#EFF6FF" : "#F8FAFC";
                  const rankBadgeColor = i === 0 ? "#B45309" : i === 1 ? "#475569" : i === 2 ? "#C2410C" : isMe ? "#1A56DB" : "#64748B";
                  const leftBorder = isMe ? "#1A56DB" : i === 0 ? "#CA8A04" : i === 1 ? "#94A3B8" : i === 2 ? "#EA580C" : "#E2E8F0";
                  const nm = netMerit(m);
                  return (
                    <div key={m.id} style={{
                      display: "flex", alignItems: "center", gap: 10, padding: "11px 14px",
                      background: isMe ? "#EFF6FF" : rankBadgeBg,
                      borderBottom: i < ranked.length - 1 ? `2px solid ${isMe ? "#BFDBFE" : "#F1F5F9"}` : "none",
                      borderLeft: `4px solid ${leftBorder}`,
                      transition: "background .15s",
                    }}>
                      {/* Rank badge */}
                      <div style={{ width: 32, height: 32, borderRadius: 10, background: rankBadgeBg, border: `2px solid ${rankBadgeColor}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {medalEmoji
                          ? <span style={{ fontSize: 16 }}>{medalEmoji}</span>
                          : <span style={{ fontFamily: "Fredoka,sans-serif", fontSize: 13, fontWeight: 700, color: rankBadgeColor }}>{i + 1}</span>
                        }
                      </div>
                      <Ava nama={m.nama} jantina={m.jantina} size={34}/>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <p style={{ fontSize: 13, fontWeight: 900, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: isMe ? "#1A56DB" : "#0F172A" }}>
                            {m.nama.split(" ").slice(0, 2).join(" ")}
                          </p>
                          {isMe && <span style={{ background: "#1A56DB", color: "#fff", fontSize: 9, fontWeight: 900, padding: "1px 5px", borderRadius: 6, flexShrink: 0 }}>ANDA</span>}
                        </div>
                        <p style={{ fontSize: 10, fontWeight: 700, color: rankBadgeColor, marginTop: 1 }}>
                          {RANK_TITLE[Math.min(i, 4)]}
                        </p>
                      </div>
                      {/* Merit/demerit pills */}
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3, flexShrink: 0 }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <span style={{ background: "#E6FAF3", border: "1.5px solid #06B77A", borderRadius: 6, padding: "1px 5px", fontFamily: "JetBrains Mono,monospace", fontSize: 10, fontWeight: 700, color: "#06B77A" }}>+{m.merit}</span>
                          {m.demerit > 0 && <span style={{ background: "#FEF2F2", border: "1.5px solid #EF4444", borderRadius: 6, padding: "1px 5px", fontFamily: "JetBrains Mono,monospace", fontSize: 10, fontWeight: 700, color: "#DC2626" }}>-{m.demerit}</span>}
                        </div>
                        <span style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 14, fontWeight: 900, color: nm >= 0 ? "#0F172A" : "#DC2626" }}>{nm}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer legend */}
              <div style={{ background: "#F8FAFC", borderTop: "2px solid #E2E8F0", padding: "8px 14px", display: "flex", gap: 14, flexWrap: "wrap" }}>
                {[["#06B77A","+ = Merit"],["#DC2626","- = Demerit"],["#0F172A","Jumlah Net"]].map(([c,l]) => (
                  <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }}/>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "#475569" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Timetable — from DB */}
        {tab === "jadual" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {jadual.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 16px", color: "#94A3B8", fontWeight: 700 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📅</div>
                <p>Jadual belum dimasukkan oleh guru.</p>
              </div>
            ) : (
              <>
                <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
                  {DAYS.map(d => (
                    <button key={d} onClick={() => setDayTab(d)} style={{
                      whiteSpace: "nowrap", padding: "8px 16px", border: "3px solid #0F172A",
                      borderRadius: 14, background: dayTab === d ? "#1A56DB" : "#fff",
                      color: dayTab === d ? "#fff" : "#0F172A", fontSize: 12, fontWeight: 900,
                      cursor: "pointer", flexShrink: 0,
                      boxShadow: dayTab === d ? "3px 3px 0 #1E40AF" : "3px 3px 0 #0F172A",
                      fontFamily: "Nunito,sans-serif",
                    }}>{d}</button>
                  ))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {jadualByHari[dayTab].length === 0 ? (
                    <div style={{ textAlign: "center", padding: "32px", color: "#94A3B8", fontWeight: 700, fontSize: 13 }}>
                      Tiada kelas pada hari ini.
                    </div>
                  ) : jadualByHari[dayTab].map((slot, i) => {
                    const isB = slot.subjek === "BREAK";
                    const meta = SUBJ_META[slot.subjek] || { emoji: "📚", color: "#1A56DB", bg: "#EFF6FF" };
                    return (
                      <div key={slot.id} style={{ display: "flex", alignItems: "center", gap: 12, background: isB ? "#F8FAFC" : meta.bg, border: `3px solid ${isB ? "#CBD5E1" : "#0F172A"}`, borderRadius: 16, padding: "11px 14px", boxShadow: isB ? "none" : "3px 3px 0 #0F172A", opacity: isB ? .6 : 1 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: isB ? "#CBD5E1" : meta.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, border: `2px solid ${isB ? "#94A3B8" : "#0F172A"}`, flexShrink: 0 }}>{meta.emoji}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: isB ? 600 : 900, color: isB ? "#64748B" : "#0F172A", fontStyle: isB ? "italic" : "normal" }}>{isB ? "— Rehat —" : slot.subjek}</p>
                          {!isB && <p style={{ fontSize: 11, color: "#475569", fontWeight: 600, marginTop: 1 }}>40 minit</p>}
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontFamily: "JetBrains Mono,monospace", fontSize: 12, fontWeight: 700, color: isB ? "#94A3B8" : meta.color }}>{slot.masa}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Lesson Objectives */}
        {tab === "objektif" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {objektif.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#94A3B8", fontWeight: 700 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
                <p>Tiada objektif pembelajaran direkodkan lagi.</p>
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

        {/* Mesej — conversation thread + send form */}
        {tab === "mesej" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

            {/* Thread history */}
            {myMesej.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#475569", textTransform: "uppercase", letterSpacing: ".4px" }}>📬 Sejarah Mesej</p>
                {myMesej.map(m => {
                  const jenisInfo = {makluman:{e:"📢",c:"#06B77A",bg:"#E6FAF3",bc:"#06B77A"},pertanyaan:{e:"❓",c:"#1A56DB",bg:"#EFF6FF",bc:"#1A56DB"},aduan:{e:"⚠️",c:"#DC2626",bg:"#FEF2F2",bc:"#DC2626"},notice:{e:"📋",c:"#06B77A",bg:"#E6FAF3",bc:"#06B77A"},enquiry:{e:"❓",c:"#1A56DB",bg:"#EFF6FF",bc:"#1A56DB"},complaint:{e:"⚠️",c:"#DC2626",bg:"#FEF2F2",bc:"#DC2626"}}[m.jenis] || {e:"📨",c:"#475569",bg:"#F8FAFC",bc:"#CBD5E1"};
                  const replied = m.status === "replied" && m.balasan;
                  return (
                    <div key={m.id} style={{ border: `3px solid ${replied ? "#1A56DB" : "#0F172A"}`, borderRadius: 18, overflow: "hidden", boxShadow: `3px 3px 0 ${replied ? "#1E40AF" : "#0F172A"}` }}>
                      {/* Parent message */}
                      <div style={{ background: jenisInfo.bg, padding: "12px 14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 16 }}>{jenisInfo.e}</span>
                          <span style={{ fontSize: 10, fontWeight: 900, color: jenisInfo.c, textTransform: "uppercase", background: "#fff", border: `1.5px solid ${jenisInfo.bc}`, borderRadius: 6, padding: "1px 6px" }}>{m.jenis}</span>
                          <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, marginLeft: "auto" }}>{m.tarikh}</span>
                        </div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.6 }}>{m.mesej}</p>
                        {!replied && (
                          <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F59E0B" }}/>
                            <span style={{ fontSize: 10, fontWeight: 700, color: "#92400E" }}>Menunggu balasan guru…</span>
                          </div>
                        )}
                      </div>
                      {/* Admin reply */}
                      {replied && (
                        <div style={{ background: "#EFF6FF", borderTop: "2px solid #BFDBFE", padding: "12px 14px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <img src="/cikgu-anna.jpg" alt="" style={{ width: 24, height: 24, borderRadius: "50%", objectFit: "cover", objectPosition: "top", border: "2px solid #1A56DB" }}/>
                            <span style={{ fontSize: 11, fontWeight: 900, color: "#1A56DB" }}>Cikgu Anna</span>
                            <span style={{ fontSize: 10, color: "#94A3B8", fontWeight: 600, marginLeft: "auto" }}>Dibalas ✓</span>
                          </div>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.6 }}>{m.balasan}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {myMesej.length === 0 && (
              <div style={{ textAlign: "center", padding: "24px 0", color: "#94A3B8" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
                <p style={{ fontSize: 13, fontWeight: 700 }}>Tiada mesej lagi. Hantar mesej pertama anda!</p>
              </div>
            )}

            {/* Divider */}
            <div style={{ borderTop: "2px dashed #BFDBFE", paddingTop: 14 }}>
              {mesejEnabled ? (
                <>
                  <p style={{ fontSize: 11, fontWeight: 800, color: "#1E40AF", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".4px" }}>📨 Hantar Mesej Baru</p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 12 }}>
                    {[["makluman","📢","Makluman"],["pertanyaan","❓","Pertanyaan"],["aduan","⚠️","Aduan"]].map(([v,e,l]) => (
                      <button key={v} onClick={() => setJenis(v)} style={{
                        padding: "10px 6px", border: `3px solid ${jenis===v?"#1A56DB":"#E2E8F0"}`,
                        borderRadius: 14, background: jenis===v?"#EFF6FF":"#fff",
                        cursor: "pointer", textAlign: "center", transition: "all .15s",
                      }}>
                        <p style={{ fontSize: 18 }}>{e}</p>
                        <p style={{ fontSize: 11, fontWeight: 800, color: jenis===v?"#1A56DB":"#475569", marginTop: 2 }}>{l}</p>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={mesej}
                    onChange={e => setMesej(e.target.value)}
                    placeholder="Taip mesej anda di sini…"
                    rows={3}
                    style={{ width: "100%", padding: "12px 14px", border: "3px solid #0F172A", borderRadius: 14, fontFamily: "Nunito,sans-serif", fontSize: 14, fontWeight: 600, outline: "none", boxShadow: "2px 2px 0 #0F172A", resize: "none", color: "#0F172A", boxSizing: "border-box", marginBottom: 10 }}
                  />

                  {sent && (
                    <div style={{ background: "#E6FAF3", border: "2px solid #06B77A", borderRadius: 12, padding: "10px 14px", marginBottom: 10 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: "#06B77A" }}>✅ Mesej berjaya dihantar!</p>
                    </div>
                  )}

                  <button
                    onClick={sendMesej}
                    disabled={sending || !mesej.trim()}
                    style={{
                      width: "100%", padding: "14px", border: "3px solid #0F172A", borderRadius: 14,
                      background: sending || !mesej.trim() ? "#94A3B8" : "#1A56DB",
                      color: "#fff", fontFamily: "Nunito,sans-serif", fontWeight: 900,
                      fontSize: 15, cursor: sending || !mesej.trim() ? "not-allowed" : "pointer",
                      boxShadow: sending || !mesej.trim() ? "none" : "4px 4px 0 #0F172A",
                    }}
                  >
                    {sending ? "⏳ Menghantar…" : "📨 Hantar Mesej"}
                  </button>
                </>
              ) : (
                <div style={{ textAlign: "center", padding: "24px 16px", background: "#FFF7ED", border: "3px solid #C09010", borderRadius: 18, boxShadow: "3px 3px 0 #9A7008" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>😴</div>
                  <p style={{ fontFamily: "Fredoka,sans-serif", fontSize: 17, fontWeight: 700, color: "#92400E", marginBottom: 6 }}>Cikgu Anna sedang berehat</p>
                  <p style={{ fontSize: 12, fontWeight: 600, color: "#B45309", lineHeight: 1.6 }}>
                    Fungsi hantar mesej ditutup buat sementara.<br/>Sila cuba lagi kemudian.
                  </p>
                </div>
              )}
            </div>
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
