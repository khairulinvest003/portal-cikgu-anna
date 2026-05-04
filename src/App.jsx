import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabase";

const makeCSS = (dark) => `
@import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,400;0,600;0,700;0,800;0,900;1,600;1,700&family=Fredoka:wght@400;500;600;700&family=JetBrains+Mono:wght@500;700&display=swap');

:root {
  --p:   #1A56DB;
  --p2:  #1E40AF;
  --ps:  ${dark?"#0a1628":"#EFF6FF"};
  --pm:  ${dark?"#1e3a5f":"#BFDBFE"};
  --y:   #FFD166;
  --ys:  ${dark?"#2A2000":"#FFFBEC"};
  --g:   #06B77A;
  --gs:  ${dark?"#002A1A":"#E6FAF3"};
  --b:   #3A86FF;
  --bs:  ${dark?"#001A3A":"#EBF3FF"};
  --ink: ${dark?"#E8F0FF":"#0F172A"};
  --i2:  ${dark?"#93C5FD":"#1E40AF"};
  --i3:  ${dark?"#60A5FA":"#475569"};
  --bg:  ${dark?"#0d1117":"#F0F7FF"};
  --wh:  ${dark?"#161d2e":"#FFFFFF"};
  --bdc: ${dark?"#1e3a5f":"#0F172A"};
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
body{font-family:'Nunito','Fredoka',sans-serif;background:var(--bg);color:var(--ink);-webkit-font-smoothing:antialiased;overflow-x:hidden;transition:background .25s,color .25s;}
.ccard{background:var(--wh);border:3px solid var(--bdc);border-radius:20px;box-shadow:4px 4px 0 var(--bdc);padding:16px;}
.ccard-blue  {background:var(--ps);border-color:var(--p);box-shadow:4px 4px 0 var(--p2);}
.ccard-green {background:var(--gs);border-color:var(--g);box-shadow:4px 4px 0 #04855A;}
.ccard-yellow{background:var(--ys);border-color:#C09010;box-shadow:4px 4px 0 #9A7008;}
.cbtn{font-family:'Nunito',sans-serif;font-weight:800;font-size:14px;border:3px solid var(--bdc);border-radius:14px;padding:13px 20px;cursor:pointer;transition:transform .1s,box-shadow .1s;box-shadow:4px 4px 0 var(--bdc);width:100%;letter-spacing:.3px;}
.cbtn:active{transform:translate(3px,3px);box-shadow:1px 1px 0 var(--bdc);}
.cbtn-blue  {background:var(--p);color:#fff;border-color:var(--p2);box-shadow:4px 4px 0 var(--p2);}
.cbtn-green {background:var(--g);color:#fff;box-shadow:4px 4px 0 #04855A;border-color:#04855A;}
.cbtn-white {background:var(--wh);color:var(--ink);}
.cbtn-yellow{background:var(--y);color:#1C0608;border-color:#9A7008;box-shadow:4px 4px 0 #9A7008;}
.cpill{display:inline-flex;align-items:center;font-weight:800;font-size:11px;padding:4px 10px;border-radius:999px;border:2px solid currentColor;letter-spacing:.2px;}
input,select,textarea{font-family:'Nunito',sans-serif;font-size:14px;font-weight:600;border:3px solid var(--bdc);border-radius:14px;padding:11px 14px;width:100%;background:var(--wh);color:var(--ink);outline:none;box-shadow:2px 2px 0 var(--bdc);transition:box-shadow .12s,transform .12s;}
input:focus,select:focus,textarea:focus{border-color:var(--p);box-shadow:4px 4px 0 var(--p);transform:translate(-1px,-1px);}
select option{background:var(--wh);color:var(--ink);}
@keyframes bounceIn{0%{transform:scale(.8) translateY(10px);opacity:0;}60%{transform:scale(1.04) translateY(-3px);opacity:1;}100%{transform:scale(1) translateY(0);}}
@keyframes slideRight{from{transform:translateX(110%);}to{transform:translateX(0);}}
@keyframes fadeUp{from{transform:translateY(14px);opacity:0;}to{transform:translateY(0);opacity:1;}}
@keyframes slideUp{from{transform:translateY(100%);}to{transform:translateY(0);}}
.bounce-in{animation:bounceIn .35s cubic-bezier(.34,1.56,.64,1) both;}
.slide-rt  {animation:slideRight .28s cubic-bezier(.22,.68,0,1.2) both;}
.fade-up   {animation:fadeUp .22s ease both;}
.slide-up  {animation:slideUp .3s cubic-bezier(.22,.68,0,1.2) both;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-thumb{background:var(--pm);border-radius:99px;}
@media print{.no-print{display:none!important;}body{background:#fff!important;color:#000!important;}.ccard{box-shadow:none!important;border:1px solid #ccc!important;}}
`;

/* ── DATA ── */
const INIT_MURID = [
  {id:1,no:"01",nama:"Ahmad Haziq bin Rosli",      delima:"2024010001",jantina:"L",ic:"140512-12-1234",wali:"Rosli bin Ahmad",     tel:"0128881234",hadir:82,absen:3, merit:92, demerit:5, catatan:""},
  {id:2,no:"02",nama:"Nur Aisyah binti Kamal",      delima:"2024010002",jantina:"P",ic:"140701-12-5678",wali:"Kamal bin Hassan",   tel:"0137772345",hadir:85,absen:0, merit:110,demerit:0, catatan:""},
  {id:3,no:"03",nama:"Muhammad Izzat Hakimi",       delima:"2024010003",jantina:"L",ic:"140320-12-9012",wali:"Hafiz bin Sulaiman", tel:"0194443456",hadir:78,absen:7, merit:65, demerit:15,catatan:"Perlu pemantauan kehadiran."},
  {id:4,no:"04",nama:"Siti Nurfatihah binti Zain",  delima:"2024010004",jantina:"P",ic:"140815-12-3456",wali:"Zain bin Ibrahim",   tel:"0111114567",hadir:84,absen:1, merit:98, demerit:2, catatan:""},
  {id:5,no:"05",nama:"Luqmanul Hakim bin Daud",     delima:"2024010005",jantina:"L",ic:"140223-12-7890",wali:"Daud bin Yusof",     tel:"0165555678",hadir:75,absen:10,merit:45, demerit:25,catatan:"Sering ponteng. Hubungi wali."},
  {id:6,no:"06",nama:"Alya Damia binti Rashid",     delima:"2024010006",jantina:"P",ic:"141103-12-2345",wali:"Rashid bin Omar",    tel:"0106666789",hadir:85,absen:0, merit:125,demerit:0, catatan:"Calon murid terbaik."},
  {id:7,no:"07",nama:"Haikal Amsyar bin Noor",      delima:"2024010007",jantina:"L",ic:"141205-12-6789",wali:"Noor bin Azman",     tel:"0171234567",hadir:80,absen:5, merit:70, demerit:8, catatan:""},
  {id:8,no:"08",nama:"Safiyya Zahra binti Mustafa", delima:"2024010008",jantina:"P",ic:"140410-12-3210",wali:"Mustafa bin Idris",  tel:"0189876543",hadir:85,absen:0, merit:105,demerit:0, catatan:""},
];

const INIT_LOG = [
  {id:1,murid:"Ahmad Haziq",   wali:"Rosli bin Ahmad", tel:"0128881234",jenis:"pertanyaan",mesej:"Boleh tahu jadual peperiksaan bulan Jun?",          tarikh:"28 Apr",status:"belum balas",balasan:""},
  {id:2,murid:"Nur Aisyah",    wali:"Kamal bin Hassan",tel:"0137772345",jenis:"makluman",  mesej:"Aisyah akan ponteng 2 hari kerana kenduri keluarga.",tarikh:"27 Apr",status:"diterima",   balasan:""},
  {id:3,murid:"Luqmanul Hakim",wali:"Daud bin Yusof",  tel:"0165555678",jenis:"aduan",     mesej:"Anak saya kata ada masalah dengan rakan sekelas.",   tarikh:"26 Apr",status:"dibalas",   balasan:"Terima kasih. Saya akan pantau dan hubungi semula."},
  {id:4,murid:"Alya Damia",    wali:"Rashid bin Omar", tel:"0106666789",jenis:"makluman",  mesej:"Alya ada latihan sukan petang Isnin ini.",           tarikh:"25 Apr",status:"diterima",   balasan:""},
];

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
const MERIT_SEBAB  = ["Cemerlang peperiksaan","Aktif kokurikulum","Membantu guru","Kelas bersih","Disiplin baik","Lain-lain"];
const DEMERIT_SEBAB= ["Ponteng","Lewat","Bising dalam kelas","Tidak siap kerja rumah","Melanggar peraturan","Lain-lain"];
const INIT_KH = {1:"hadir",2:"hadir",3:"hadir",4:"hadir",5:"tidak hadir",6:"hadir",7:"hadir",8:"hadir"};

const netMerit = m => m.merit - m.demerit;
const muridStatus = m => {
  if (netMerit(m) >= 100) return {label:"⭐ Cemerlang",color:"var(--g)",  bg:"var(--gs)",bc:"var(--g)"};
  if (m.absen >= 7 || m.demerit >= 15) return {label:"🚨 Pantau",color:"var(--p)",bg:"var(--ps)",bc:"var(--p)"};
  return {label:"👍 Baik",color:"#B45309",bg:"var(--ys)",bc:"#B45309"};
};
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return {t:"Selamat Pagi",   e:"🌤️"};
  if (h < 15) return {t:"Selamat Tengah Hari",e:"☀️"};
  if (h < 19) return {t:"Selamat Petang", e:"🌇"};
  return      {t:"Selamat Malam",  e:"🌙"};
};
const getDateInfo = () => {
  const days   = ["Ahad","Isnin","Selasa","Rabu","Khamis","Jumaat","Sabtu"];
  const months = ["Jan","Feb","Mac","Apr","Mei","Jun","Jul","Ogos","Sep","Okt","Nov","Dis"];
  const d = new Date();
  return {
    hari:   days[d.getDay()],
    tarikh: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    masa:   d.toLocaleTimeString("ms-MY",{hour:"2-digit",minute:"2-digit"}),
  };
};

/* ── LIVE CLOCK ── */
function LiveClock() {
  const [info, setInfo] = useState(getDateInfo());
  useEffect(() => {
    const t = setInterval(() => setInfo(getDateInfo()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,.18)",border:"2px solid rgba(255,255,255,.35)",borderRadius:12,padding:"5px 10px"}}>
      <span style={{fontSize:13}}>🕐</span>
      <div>
        <p style={{fontSize:11,fontWeight:900,color:"rgba(255,255,255,.95)",fontFamily:"JetBrains Mono,monospace",lineHeight:1.2}}>{info.masa}</p>
        <p style={{fontSize:9,fontWeight:700,color:"rgba(255,255,255,.7)",lineHeight:1.2}}>{info.hari}, {info.tarikh}</p>
      </div>
    </div>
  );
}

/* ── AVATAR ── */
function Ava({nama,jantina,size=42}) {
  const ini = nama.split(" ").slice(0,2).map(w=>w[0]).join("").toUpperCase();
  const g   = jantina==="P"
    ? "linear-gradient(135deg,#8B5CF6,#C4B5FD)"
    : "linear-gradient(135deg,#1A56DB,#60A5FA)";
  return (
    <div style={{width:size,height:size,minWidth:size,borderRadius:"50%",background:g,border:"2.5px solid var(--bdc)",boxShadow:"2px 2px 0 var(--bdc)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:900,fontSize:size*.34,fontFamily:"Fredoka,sans-serif"}}>
      {ini}
    </div>
  );
}

/* ── STAT BLOB ── */
function Blob({icon,val,label,bg,color,border}) {
  return (
    <div style={{background:bg,border:`3px solid ${border||"var(--bdc)"}`,borderRadius:22,boxShadow:"4px 4px 0 var(--bdc)",padding:"14px 12px",textAlign:"center",display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
      <span style={{fontSize:26}}>{icon}</span>
      <span style={{fontFamily:"Fredoka,sans-serif",fontSize:27,fontWeight:700,color,lineHeight:1}}>{val}</span>
      <span style={{fontSize:11,fontWeight:700,color:"var(--i2)"}}>{label}</span>
    </div>
  );
}

/* ── LOGO ── */
function Logo({size=38}) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" style={{filter:"drop-shadow(2px 2px 0 rgba(0,0,0,.3))"}}>
      <path d="M40 4 L72 18 L72 46 Q72 66 40 76 Q8 66 8 46 L8 18 Z" fill="#fff" stroke="rgba(0,0,0,.25)" strokeWidth="1.5"/>
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

/* ── SEARCH ── */
function Search({murid,log,nav,onClose}) {
  const [q,setQ] = useState("");
  const ref = useRef();
  useEffect(()=>{ ref.current?.focus(); },[]);
  const res = q.length < 2 ? [] : [
    ...murid
      .filter(m=>m.nama.toLowerCase().includes(q.toLowerCase())||m.wali.toLowerCase().includes(q.toLowerCase())||m.no.includes(q)||(m.delima||"").includes(q))
      .map(m=>({type:"murid",label:m.nama,sub:`No.${m.no} · ID Delima: ${m.delima||"-"}`})),
    ...log
      .filter(l=>l.murid.toLowerCase().includes(q.toLowerCase())||l.mesej.toLowerCase().includes(q.toLowerCase()))
      .map(l=>({type:"log",label:l.murid,sub:l.mesej.slice(0,50)+"…"})),
  ];
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:300,background:"rgba(10,22,40,.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-start",justifyContent:"center",padding:"52px 16px 0"}}>
      <div className="bounce-in" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:420,background:"var(--wh)",border:"3px solid var(--bdc)",borderRadius:24,boxShadow:"6px 6px 0 var(--bdc)",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"14px 16px",borderBottom:"3px solid var(--bdc)",background:"var(--ps)"}}>
          <span style={{fontSize:20}}>🔍</span>
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Cari murid, ID Delima, wali, mesej…" style={{border:"none",boxShadow:"none",padding:0,background:"transparent",fontSize:15,fontWeight:700,flex:1,borderRadius:0,transform:"none"}}/>
          <button onClick={onClose} style={{background:"var(--p)",color:"#fff",border:"none",borderRadius:10,padding:"5px 12px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>✕</button>
        </div>
        <div style={{maxHeight:340,overflowY:"auto"}}>
          {q.length<2 && <div style={{padding:"32px 16px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>✨</div><p style={{fontFamily:"Fredoka,sans-serif",fontSize:17,color:"var(--p)",fontWeight:600}}>Taip untuk mencari…</p><p style={{fontSize:12,color:"var(--i3)",marginTop:4,fontWeight:600}}>Nama murid, ID Delima, wali, atau mesej</p></div>}
          {q.length>=2 && res.length===0 && <div style={{padding:"28px 16px",textAlign:"center",color:"var(--i3)",fontWeight:700}}>😔 Tiada hasil untuk "{q}"</div>}
          {res.map((r,i)=>(
            <button key={i} onClick={()=>{nav(r.type==="murid"?"murid":"log");onClose();}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"none",border:"none",borderBottom:"2px solid var(--pm)",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:22,background:r.type==="murid"?"var(--ps)":"var(--bs)",border:"2px solid var(--bdc)",borderRadius:12,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center"}}>{r.type==="murid"?"👤":"📩"}</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--ink)"}}>{r.label}</p>
                <p style={{fontSize:11,color:"var(--i3)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sub}</p>
              </div>
              <span style={{fontSize:10,fontWeight:800,color:"var(--p)",background:"var(--ps)",border:"2px solid var(--p)",borderRadius:99,padding:"2px 8px"}}>{r.type==="murid"?"MURID":"LOG"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MENU ── */
const MENU = [
  {id:"dashboard", emoji:"🏠",label:"Dashboard",      sub:"Ringkasan harian"},
  {id:"objektif",  emoji:"🎯",label:"Objektif P&P",   sub:"Lesson Objective"},
  {id:"kehadiran", emoji:"📋",label:"Kehadiran",      sub:"Rekod hadir murid"},
  {id:"merit",     emoji:"🏆",label:"Merit & Demerit",sub:"Sistem ganjaran"},
  {id:"murid",     emoji:"👥",label:"Senarai Murid",  sub:"Profil & maklumat"},
  {id:"jadual",    emoji:"📅",label:"Jadual Waktu",   sub:"P&P mingguan"},
  {id:"log",       emoji:"📩",label:"Log Ibu Bapa",   sub:"Mesej & makluman"},
  {id:"laporan",   emoji:"📊",label:"Laporan & PDF",  sub:"Export & statistik"},
];

/* ── DRAWER ── */
function Drawer({active,nav,onClose,notif,dark,setDark}) {
  return (
    <>
      <div style={{position:"fixed",inset:0,zIndex:100,background:"rgba(10,22,40,.55)",backdropFilter:"blur(5px)"}} onClick={onClose}/>
      <div className="slide-rt" style={{position:"fixed",top:0,right:0,bottom:0,width:295,zIndex:101,background:"var(--wh)",borderLeft:"3px solid var(--bdc)",boxShadow:"-6px 0 0 var(--bdc)",display:"flex",flexDirection:"column"}}>
        <div style={{background:"var(--p)",padding:"48px 20px 24px",borderBottom:"3px solid var(--bdc)",position:"relative"}}>
          <svg style={{position:"absolute",bottom:-1,left:0,right:0,width:"100%",height:16}} viewBox="0 0 300 16" preserveAspectRatio="none">
            <path d="M0,0 C50,16 100,0 150,10 C200,20 250,4 300,10 L300,16 L0,16 Z" fill="var(--wh)"/>
          </svg>
          <button onClick={onClose} style={{position:"absolute",top:14,right:14,background:"rgba(255,255,255,.25)",border:"2px solid rgba(255,255,255,.4)",borderRadius:10,width:34,height:34,cursor:"pointer",fontSize:15,color:"#fff",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>✕</button>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:48,height:48,borderRadius:"50%",background:"rgba(255,255,255,.25)",border:"3px solid rgba(255,255,255,.5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24}}>👩‍🏫</div>
            <div>
              <p style={{color:"rgba(255,255,255,.7)",fontSize:11,fontWeight:700}}>GURU KELAS</p>
              <p style={{color:"#fff",fontSize:17,fontWeight:900,fontFamily:"Fredoka,sans-serif"}}>Cikgu Anna</p>
              <p style={{color:"rgba(255,255,255,.7)",fontSize:11,fontWeight:600}}>Tahun 4 Bestari · SK Darau</p>
            </div>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"16px 0 8px"}}>
          {MENU.map(m=>{
            const sel = active===m.id;
            return (
              <button key={m.id} onClick={()=>{nav(m.id);onClose();}} style={{width:"100%",display:"flex",alignItems:"center",gap:14,padding:"12px 20px",background:sel?"var(--ps)":"none",border:"none",borderLeft:`4px solid ${sel?"var(--p)":"transparent"}`,cursor:"pointer",textAlign:"left"}}>
                <div style={{width:42,height:42,borderRadius:14,background:sel?"var(--p)":"var(--bg)",border:`2.5px solid ${sel?"var(--p)":"var(--bdc)"}`,boxShadow:sel?"2px 2px 0 var(--p2)":"2px 2px 0 var(--bdc)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>{m.emoji}</div>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,fontWeight:900,color:sel?"var(--p)":"var(--ink)"}}>{m.label}</p>
                  <p style={{fontSize:11,color:"var(--i3)",fontWeight:600,marginTop:1}}>{m.sub}</p>
                </div>
                {m.id==="log"&&notif>0&&<span style={{background:"var(--p)",color:"#fff",fontSize:11,fontWeight:900,borderRadius:99,width:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid var(--bdc)"}}>{notif}</span>}
              </button>
            );
          })}
        </div>
        <div style={{padding:"14px 20px",borderTop:"3px solid var(--bdc)",background:"var(--ys)"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontSize:18}}>{dark?"🌙":"☀️"}</span>
              <p style={{fontSize:13,fontWeight:800,color:"var(--ink)"}}>Mod {dark?"Gelap":"Cerah"}</p>
            </div>
            <button onClick={()=>setDark(!dark)} style={{width:50,height:28,borderRadius:99,border:"3px solid var(--bdc)",background:dark?"var(--p)":"var(--i3)",cursor:"pointer",position:"relative",boxShadow:"2px 2px 0 var(--bdc)",transition:"background .2s"}}>
              <div style={{position:"absolute",top:3,left:dark?24:3,width:18,height:18,borderRadius:"50%",background:"#fff",border:"2px solid var(--bdc)",transition:"left .2s"}}/>
            </button>
          </div>
          <p style={{fontSize:11,fontWeight:700,color:"var(--i2)",fontStyle:"italic"}}>✏️ "Mendidik itu memberi cahaya"</p>
          <p style={{fontSize:10,color:"var(--i3)",marginTop:2,fontWeight:600}}>Portal Cikgu Anna v1.0 · 2026</p>
        </div>
      </div>
    </>
  );
}

/* ── OBJEKTIF P&P ── */
function Objektif() {
  const d = getDateInfo();
  const [entries, setEntries] = useState([
    {id:1,tarikh:"3 Mei 2026",hari:"Ahad",masa:"8:00 AM",subjek:"Matematik",tajuk:"Pecahan Perpuluhan",objektif:"Murid dapat menukar pecahan kepada nombor perpuluhan dengan tepat.",bbm:"Buku teks ms. 45, lembaran kerja"},
    {id:2,tarikh:"2 Mei 2026",hari:"Sabtu",masa:"9:00 AM",subjek:"BM",tajuk:"Karangan Deskriptif",objektif:"Murid dapat menulis karangan deskriptif tentang kawasan sekolah sekurang-kurangnya 80 patah perkataan.",bbm:"Gambar sekolah, kamus"},
  ]);
  const [form, setForm] = useState({tarikh:d.tarikh,hari:d.hari,masa:d.masa,subjek:"",tajuk:"",objektif:"",bbm:""});
  const [tunjuk, setTunjuk] = useState(false);
  const [editId, setEditId] = useState(null);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const simpan = () => {
    if (!form.subjek || !form.objektif) return;
    if (editId) {
      setEntries(p=>p.map(e=>e.id===editId?{...form,id:editId}:e));
      setEditId(null);
    } else {
      setEntries(p=>[{...form,id:Date.now()},...p]);
    }
    setForm({tarikh:d.tarikh,hari:d.hari,masa:d.masa,subjek:"",tajuk:"",objektif:"",bbm:""});
    setTunjuk(false);
  };

  const startEdit = e => { setForm({...e}); setEditId(e.id); setTunjuk(true); };
  const padam     = id => setEntries(p=>p.filter(e=>e.id!==id));

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>🎯 Objektif <span style={{color:"var(--p)"}}>P&P</span></p>
          <p style={{fontSize:12,fontWeight:700,color:"var(--i3)",marginTop:2}}>Lesson Objective harian</p>
        </div>
        <button onClick={()=>{setTunjuk(!tunjuk);setEditId(null);setForm({tarikh:d.tarikh,hari:d.hari,masa:d.masa,subjek:"",tajuk:"",objektif:"",bbm:""});}}
          style={{background:"var(--p)",color:"#fff",border:"3px solid var(--bdc)",borderRadius:14,padding:"10px 14px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:"3px 3px 0 var(--bdc)"}}>
          {tunjuk?"✕ Tutup":"+ Baru"}
        </button>
      </div>

      {/* Date/Time banner */}
      <div style={{background:"var(--p)",border:"3px solid var(--bdc)",borderRadius:20,boxShadow:"4px 4px 0 var(--bdc)",padding:"14px 16px",display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:30}}>📅</span>
        <div>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:18,fontWeight:700,color:"#fff"}}>{d.hari}, {d.tarikh}</p>
          <p style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.8)"}}>🕐 {d.masa} · SK Darau, Kota Kinabalu</p>
        </div>
      </div>

      {/* Form */}
      {tunjuk && (
        <div className="ccard ccard-blue bounce-in">
          <p style={{fontSize:12,fontWeight:900,color:"var(--p)",marginBottom:12,textTransform:"uppercase"}}>
            {editId?"✏️ Edit Objektif":"📝 Rekod Objektif Baru"}
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Hari</p>
                <select value={form.hari} onChange={e=>set("hari",e.target.value)}>
                  {["Isnin","Selasa","Rabu","Khamis","Jumaat"].map(h=><option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Tarikh</p>
                <input value={form.tarikh} onChange={e=>set("tarikh",e.target.value)} placeholder="1 Jan 2026"/>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Masa</p>
                <input value={form.masa} onChange={e=>set("masa",e.target.value)} placeholder="8:00 AM"/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Subjek *</p>
                <select value={form.subjek} onChange={e=>set("subjek",e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {["BM","Matematik","Sains","Bhs. Inggeris","Pend. Islam","Sejarah","PJ","ERT","Muzik","Moral","Kokurikulum"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Tajuk Pelajaran</p>
                <input value={form.tajuk} onChange={e=>set("tajuk",e.target.value)} placeholder="Tajuk…"/>
              </div>
            </div>
            <div>
              <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Objektif Pembelajaran *</p>
              <p style={{fontSize:10,color:"var(--i3)",fontWeight:600,marginBottom:6}}>Pada akhir pelajaran, murid dapat…</p>
              <textarea rows={3} value={form.objektif} onChange={e=>set("objektif",e.target.value)} placeholder="Murid dapat…" style={{resize:"none"}}/>
            </div>
            <div>
              <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>BBM / Bahan Bantu Mengajar</p>
              <input value={form.bbm} onChange={e=>set("bbm",e.target.value)} placeholder="Buku teks, kad imbasan, projektor…"/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="cbtn cbtn-blue" onClick={simpan}>{editId?"💾 Kemaskini":"✅ Simpan Objektif"}</button>
              <button className="cbtn cbtn-white" style={{width:"auto",padding:"13px 18px"}} onClick={()=>{setTunjuk(false);setEditId(null);}}>Batal</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {entries.length===0 && <div style={{textAlign:"center",padding:"32px 0",color:"var(--i3)",fontWeight:700}}>📭 Tiada objektif lagi. Tambah baru!</div>}
        {entries.map(e=>{
          const meta = SUBJ_META[e.subjek]||{emoji:"📚",color:"var(--p)",bg:"var(--ps)"};
          return (
            <div key={e.id} className="ccard" style={{padding:0,overflow:"hidden"}}>
              <div style={{background:meta.color,padding:"10px 14px",display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:20}}>{meta.emoji}</span>
                <div style={{flex:1}}>
                  <p style={{fontSize:14,fontWeight:900,color:"#fff"}}>{e.subjek}{e.tajuk?" · "+e.tajuk:""}</p>
                  <p style={{fontSize:11,color:"rgba(255,255,255,.8)",fontWeight:700}}>📅 {e.hari}, {e.tarikh} · 🕐 {e.masa}</p>
                </div>
              </div>
              <div style={{padding:"12px 14px"}}>
                <p style={{fontSize:11,fontWeight:900,color:"var(--i2)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:4}}>Objektif Pembelajaran</p>
                <p style={{fontSize:13,fontWeight:600,color:"var(--ink)",lineHeight:1.6,marginBottom:e.bbm?10:0}}>{e.objektif}</p>
                {e.bbm && (
                  <div style={{background:"var(--ys)",border:"2px solid #C09010",borderRadius:10,padding:"6px 10px"}}>
                    <p style={{fontSize:11,fontWeight:800,color:"#B45309"}}>📎 BBM: <span style={{fontWeight:600,color:"var(--ink)"}}>{e.bbm}</span></p>
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:8,padding:"0 14px 12px"}}>
                <button onClick={()=>startEdit(e)} style={{flex:1,padding:"8px",background:"var(--ys)",border:"2px solid #9A7008",borderRadius:10,color:"#B45309",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:12,cursor:"pointer"}}>✏️ Edit</button>
                <button onClick={()=>padam(e.id)}  style={{flex:1,padding:"8px",background:"var(--ps)",border:"2px solid var(--p)",borderRadius:10,color:"var(--p)",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:12,cursor:"pointer"}}>🗑️ Padam</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── TAMBAH/EDIT MURID MODAL ── */
function MuridModal({data,onSave,onClose,count}) {
  const isEdit = !!data?.id;
  const [f,setF] = useState(data||{nama:"",delima:"",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:""});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(10,22,40,.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div className="slide-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"var(--wh)",border:"3px solid var(--bdc)",borderRadius:"24px 24px 0 0",boxShadow:"0 -6px 0 var(--bdc)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{padding:"12px 16px 0",display:"flex",justifyContent:"center"}}><div style={{width:40,height:5,borderRadius:99,background:"var(--pm)"}}/></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 8px",borderBottom:"3px solid var(--bdc)"}}>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:18,fontWeight:700,color:"var(--ink)"}}>{isEdit?"✏️ Edit Murid":"➕ Tambah Murid Baru"}</p>
          <button onClick={onClose} style={{background:"var(--ps)",border:"2px solid var(--p)",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:14,color:"var(--p)",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>✕</button>
        </div>
        <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
          <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Nama Penuh *</p><input value={f.nama} onChange={e=>set("nama",e.target.value)} placeholder="Nama penuh murid…"/></div>
          <div>
            <p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>ID Delima</p>
            <input value={f.delima} onChange={e=>set("delima",e.target.value)} placeholder="Contoh: 2024010001" style={{fontFamily:"JetBrains Mono,monospace"}}/>
          </div>
          <div>
            <p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Jantina *</p>
            <div style={{display:"flex",gap:8}}>
              {["L","P"].map(j=>(
                <button key={j} onClick={()=>set("jantina",j)} style={{flex:1,padding:"10px",border:`3px solid ${f.jantina===j?"var(--p)":"var(--bdc)"}`,borderRadius:14,background:f.jantina===j?"var(--p)":"var(--wh)",color:f.jantina===j?"#fff":"var(--ink)",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:f.jantina===j?"3px 3px 0 var(--p2)":"3px 3px 0 var(--bdc)"}}>
                  {j==="L"?"👦 Lelaki":"👧 Perempuan"}
                </button>
              ))}
            </div>
          </div>
          <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>No. IC</p><input value={f.ic} onChange={e=>set("ic",e.target.value)} placeholder="XXXXXX-XX-XXXX"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Nama Wali *</p><input value={f.wali} onChange={e=>set("wali",e.target.value)} placeholder="Nama wali…"/></div>
            <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Tel Wali *</p><input value={f.tel} onChange={e=>set("tel",e.target.value)} placeholder="01XXXXXXXX"/></div>
          </div>
          {isEdit && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["hadir","Hari Hadir"],["absen","Hari Absen"],["merit","Merit"],["demerit","Demerit"]].map(([k,l])=>(
                <div key={k}><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>{l}</p><input type="number" value={f[k]} onChange={e=>set(k,+e.target.value)} min="0"/></div>
              ))}
            </div>
          )}
          <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Catatan Guru</p><textarea rows={2} value={f.catatan} onChange={e=>set("catatan",e.target.value)} placeholder="Catatan…" style={{resize:"none"}}/></div>
          <div style={{display:"flex",gap:10,paddingBottom:8}}>
            <button className="cbtn cbtn-blue" onClick={()=>{
              if(!f.nama||!f.wali||!f.tel){alert("Sila isi nama, wali dan tel.");return;}
              onSave({...f,id:data?.id||Date.now(),no:data?.no||String(count+1).padStart(2,"0")});
            }}>{isEdit?"💾 Simpan":"➕ Tambah Murid"}</button>
            <button className="cbtn cbtn-white" style={{width:"auto",padding:"13px 18px"}} onClick={onClose}>Batal</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── WHATSAPP MODAL ── */
function WAModal({murid,onClose}) {
  const [pilih,setPilih] = useState([]);
  const [teks,setTeks]   = useState("Assalamualaikum. Makluman daripada Cikgu Anna, Guru Kelas Tahun 4 Bestari, SK Darau.");
  const toggle = id => setPilih(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const openWA = m => {
    const msg = encodeURIComponent(`${teks}\n\nKepada: ${m.wali}\nMurid: ${m.nama} (No.${m.no})\n\nTerima kasih. 🙏`);
    window.open(`https://wa.me/60${m.tel.replace(/^0/,"")}?text=${msg}`,"_blank");
  };
  const templates = [
    ["Peringatan kehadiran","Kehadiran anak anda memerlukan perhatian. Sila pastikan kehadiran yang konsisten ke sekolah."],
    ["Amaran demerit","Anak anda telah menerima demerit. Sila bincang bersama anak tentang tingkah laku di sekolah."],
    ["Jemputan PIBG","Jemputan mesyuarat PIBG pada Sabtu ini jam 9 pagi. Kehadiran ibu bapa amat dialu-alukan."],
    ["Peperiksaan akan datang","Peperiksaan akan berlangsung minggu hadapan. Sila pastikan anak anda bersedia."],
  ];
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(10,22,40,.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div className="slide-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"var(--wh)",border:"3px solid var(--bdc)",borderRadius:"24px 24px 0 0",boxShadow:"0 -6px 0 var(--bdc)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{padding:"12px 16px 0",display:"flex",justifyContent:"center"}}><div style={{width:40,height:5,borderRadius:99,background:"var(--pm)"}}/></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 8px",borderBottom:"3px solid var(--bdc)"}}>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:18,fontWeight:700,color:"var(--ink)"}}>📬 Notifikasi WhatsApp</p>
          <button onClick={onClose} style={{background:"var(--ps)",border:"2px solid var(--p)",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:14,color:"var(--p)",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>✕</button>
        </div>
        <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14}}>
          <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>📝 Teks Mesej</p><textarea rows={3} value={teks} onChange={e=>setTeks(e.target.value)} style={{resize:"none",fontSize:13}}/></div>
          <div>
            <p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:8}}>Template cepat:</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {templates.map(([l,t])=><button key={l} onClick={()=>setTeks(t)} style={{padding:"6px 12px",border:"2px solid var(--bdc)",borderRadius:99,background:"var(--bg)",color:"var(--ink)",fontSize:11,fontWeight:700,cursor:"pointer",boxShadow:"2px 2px 0 var(--bdc)"}}>{l}</button>)}
            </div>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <p style={{fontSize:12,fontWeight:800,color:"var(--i2)"}}>Pilih penerima:</p>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setPilih(murid.filter(m=>m.absen>=5).map(m=>m.id))} style={{fontSize:11,fontWeight:800,color:"var(--p)",background:"var(--ps)",border:"2px solid var(--p)",borderRadius:99,padding:"4px 10px",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Absen ≥5</button>
                <button onClick={()=>setPilih(murid.map(m=>m.id))} style={{fontSize:11,fontWeight:800,color:"var(--g)",background:"var(--gs)",border:"2px solid var(--g)",borderRadius:99,padding:"4px 10px",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Semua</button>
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:220,overflowY:"auto"}}>
              {murid.map(m=>{
                const sel = pilih.includes(m.id);
                return (
                  <button key={m.id} onClick={()=>toggle(m.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:sel?"var(--gs)":"var(--wh)",border:`3px solid ${sel?"var(--g)":"var(--bdc)"}`,borderRadius:16,cursor:"pointer",textAlign:"left",boxShadow:sel?"3px 3px 0 #04855A":"3px 3px 0 var(--bdc)"}}>
                    <Ava nama={m.nama} jantina={m.jantina} size={36}/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:800,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.nama.split(" ").slice(0,3).join(" ")}</p>
                      <p style={{fontSize:11,color:"var(--i3)",fontWeight:600}}>📱 {m.tel} · Absen: {m.absen}</p>
                    </div>
                    <div style={{width:22,height:22,borderRadius:6,border:`3px solid ${sel?"var(--g)":"var(--bdc)"}`,background:sel?"var(--g)":"var(--wh)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                      {sel&&<span style={{fontSize:12,color:"#fff",fontWeight:900}}>✓</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          {pilih.length>0&&(
            <div className="ccard-green ccard">
              <p style={{fontSize:12,fontWeight:900,color:"var(--g)",marginBottom:10}}>🤳 Hantar kepada {pilih.length} wali:</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {murid.filter(m=>pilih.includes(m.id)).map(m=>(
                  <button key={m.id} onClick={()=>openWA(m)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"#25D366",border:"3px solid #1DA851",borderRadius:14,cursor:"pointer",boxShadow:"3px 3px 0 #1DA851"}}>
                    <span style={{fontSize:20}}>📬</span>
                    <div style={{flex:1,textAlign:"left"}}><p style={{fontSize:13,fontWeight:900,color:"#fff"}}>{m.wali.split(" ").slice(0,2).join(" ")}</p><p style={{fontSize:10,color:"rgba(255,255,255,.8)",fontWeight:600}}>{m.nama.split(" ")[0]} · {m.tel}</p></div>
                    <span style={{fontSize:11,fontWeight:900,color:"#fff"}}>Buka WA →</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{height:8}}/>
        </div>
      </div>
    </div>
  );
}

/* ── DASHBOARD ── */
function Dashboard({murid,log,kh,setWA}) {
  const hadir  = murid.filter(m=>(kh[m.id]||"hadir")==="hadir").length;
  const notif  = log.filter(l=>l.status==="belum balas").length;
  const cem    = murid.filter(m=>m.merit>=100).length;
  const pantau = murid.filter(m=>m.absen>=7||m.demerit>=15);
  const g = getGreeting();
  const d = getDateInfo();
  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{background:"var(--p)",border:"3px solid var(--bdc)",borderRadius:24,boxShadow:"5px 5px 0 var(--bdc)",padding:"18px 18px 0",overflow:"hidden",position:"relative"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.1)",border:"3px solid rgba(255,255,255,.15)"}}/>
        <p style={{color:"rgba(255,255,255,.8)",fontSize:12,fontWeight:700}}>📅 {d.hari}, {d.tarikh}</p>
        <p style={{fontFamily:"Fredoka,sans-serif",fontSize:24,fontWeight:700,color:"#fff",marginTop:2,lineHeight:1.2}}>{g.e} {g.t}, Cikgu Anna!</p>
        <p style={{color:"rgba(255,255,255,.8)",fontSize:12,fontWeight:600,marginTop:2,marginBottom:14}}>Tahun 4 Bestari · SK Darau</p>
        <svg style={{display:"block",width:"100%",height:18,marginBottom:-1}} viewBox="0 0 300 18" preserveAspectRatio="none">
          <path d="M0,8 C60,0 120,18 180,8 C240,0 280,14 300,8 L300,18 L0,18 Z" fill="var(--bg)"/>
        </svg>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Blob icon="👥" val={murid.length} label="Jumlah Murid"       bg="var(--wh)"  color="var(--ink)"/>
        <Blob icon="✅" val={hadir}         label={`Hadir · ${murid.length-hadir} absen`} bg="var(--gs)" color="var(--g)"  border="var(--g)"/>
        <Blob icon="🏆" val={cem}           label="Murid Cemerlang"   bg="var(--ys)"  color="#B45309"    border="#B45309"/>
        <Blob icon="📩" val={notif}         label="Mesej Belum Balas" bg="var(--ps)"  color="var(--p)"   border="var(--p)"/>
      </div>
      <button className="cbtn" onClick={()=>setWA(true)} style={{background:"#25D366",border:"3px solid #1DA851",color:"#fff",boxShadow:"4px 4px 0 #1DA851"}}>📬 Hantar Notifikasi WhatsApp Wali</button>
      {/* Ranking */}
      <div className="ccard" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--y)",padding:"10px 16px",borderBottom:"3px solid var(--bdc)",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:18}}>🏆</span>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:15,fontWeight:700,color:"var(--ink)"}}>Ranking Merit Kelas</p>
        </div>
        {[...murid].sort((a,b)=>netMerit(b)-netMerit(a)).slice(0,5).map((m,i)=>{
          const medals=["🥇","🥈","🥉","4️⃣","5️⃣"];
          return (
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 16px",background:i===0?"var(--ys)":"var(--wh)",borderBottom:i<4?"2px solid var(--pm)":"none"}}>
              <span style={{fontSize:22,width:28}}>{medals[i]}</span>
              <Ava nama={m.nama} jantina={m.jantina} size={36}/>
              <p style={{flex:1,fontSize:13,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--ink)"}}>{m.nama.split(" ").slice(0,2).join(" ")}</p>
              <div style={{textAlign:"right"}}>
                <span style={{fontFamily:"JetBrains Mono,monospace",fontSize:14,fontWeight:700,color:"var(--g)"}}>+{m.merit}</span>
                {m.demerit>0&&<span style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,color:"var(--p)",marginLeft:4}}>-{m.demerit}</span>}
                <br/><span style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,fontWeight:700,color:"var(--ink)"}}>{netMerit(m)}</span>
              </div>
            </div>
          );
        })}
      </div>
      {pantau.length>0&&(
        <div className="ccard ccard-blue">
          <p style={{fontSize:13,fontWeight:900,color:"var(--p)",marginBottom:12}}>🚨 MURID PERLU PERHATIAN</p>
          {pantau.map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <Ava nama={m.nama} jantina={m.jantina} size={36}/>
              <div><p style={{fontSize:13,fontWeight:800,color:"var(--ink)"}}>{m.nama.split(" ").slice(0,2).join(" ")}</p><p style={{fontSize:11,color:"var(--p)",fontWeight:700}}>Absen {m.absen} hari · Demerit {m.demerit}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── KEHADIRAN ── */
function Kehadiran({murid}) {
  const [kh,setKh]     = useState({...INIT_KH});
  const [q,setQ]       = useState("");
  const [saved,setSaved]= useState(false);
  const cycle = id => setKh(p=>({...p,[id]:p[id]==="hadir"?"tidak hadir":p[id]==="tidak hadir"?"mc":"hadir"}));
  const si = s => ({
    hadir:        {label:"✅ Hadir",       bg:"var(--gs)",color:"var(--g)",bc:"var(--g)"},
    "tidak hadir":{label:"❌ Tidak Hadir", bg:"var(--ps)",color:"var(--p)",bc:"var(--p)"},
    mc:           {label:"🏥 MC/Cuti",     bg:"var(--ys)",color:"#B45309",bc:"#B45309"},
  }[s]||{label:"✅ Hadir",bg:"var(--gs)",color:"var(--g)",bc:"var(--g)"});
  const filtered = murid.filter(m=>m.nama.toLowerCase().includes(q.toLowerCase())||m.no.includes(q));
  const c={hadir:0,"tidak hadir":0,mc:0};
  murid.forEach(m=>{const s=kh[m.id]||"hadir";c[s]=(c[s]||0)+1;});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>📋 Kehadiran <span style={{color:"var(--p)"}}>Harian</span></p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[{k:"hadir",icon:"✅",label:"Hadir",color:"var(--g)",bg:"var(--gs)",bc:"var(--g)"},{k:"tidak hadir",icon:"❌",label:"Absen",color:"var(--p)",bg:"var(--ps)",bc:"var(--p)"},{k:"mc",icon:"🏥",label:"MC",color:"#B45309",bg:"var(--ys)",bc:"#B45309"}].map(ct=>(
          <div key={ct.k} style={{background:ct.bg,border:`3px solid ${ct.bc}`,borderRadius:18,boxShadow:`3px 3px 0 ${ct.bc}`,padding:"12px 8px",textAlign:"center"}}>
            <p style={{fontSize:20}}>{ct.icon}</p>
            <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:22,fontWeight:700,color:ct.color}}>{c[ct.k]||0}</p>
            <p style={{fontSize:10,fontWeight:800,color:"var(--i2)"}}>{ct.label}</p>
          </div>
        ))}
      </div>
      <input placeholder="🔍 Cari nama atau nombor…" value={q} onChange={e=>setQ(e.target.value)}/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(m=>{
          const s=kh[m.id]||"hadir";const info=si(s);
          return (
            <button key={m.id} onClick={()=>cycle(m.id)} style={{display:"flex",alignItems:"center",gap:12,background:"var(--wh)",border:"3px solid var(--bdc)",borderRadius:18,padding:"12px 14px",cursor:"pointer",textAlign:"left",boxShadow:"3px 3px 0 var(--bdc)"}}>
              <Ava nama={m.nama} jantina={m.jantina} size={42}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--ink)"}}>{m.nama}</p>
                <p style={{fontSize:11,color:"var(--i3)",fontWeight:600,marginTop:1}}>No.{m.no} · Tap untuk tukar</p>
              </div>
              <span className="cpill" style={{background:info.bg,color:info.color,borderColor:info.bc,fontSize:10}}>{info.label}</span>
            </button>
          );
        })}
      </div>
      <button className={`cbtn ${saved?"cbtn-green":"cbtn-blue"}`} onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2200);}}>
        {saved?"✅ Berjaya Disimpan!":"💾 Simpan Kehadiran"}
      </button>
    </div>
  );
}

/* ── MERIT ── */
function Merit({murid,updateMerit}) {
  const [mode,setMode]   = useState("merit");
  const [pilih,setPilih] = useState(null);
  const [sebab,setSebab] = useState("");
  const [markah,setMarkah]= useState(5);
  const [ok,setOk]       = useState(false);
  const [q,setQ]         = useState("");
  const submit = async () => {
    if(!pilih||!sebab)return;
    await updateMerit(pilih, mode, markah);
    setOk(true);setTimeout(()=>{setOk(false);setPilih(null);setSebab("");},1800);
  };
  const filtered=[...murid].filter(m=>m.nama.toLowerCase().includes(q.toLowerCase())||m.no.includes(q)).sort((a,b)=>netMerit(b)-netMerit(a));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>🏆 Sistem <span style={{color:"var(--p)"}}>Merit</span></p>
      <div style={{display:"flex",background:"var(--bg)",border:"3px solid var(--bdc)",borderRadius:18,padding:4,boxShadow:"3px 3px 0 var(--bdc)"}}>
        {[["merit","✅ Merit","var(--g)","#04855A"],["demerit","⚠️ Demerit","var(--p)","var(--p2)"]].map(([t,l,bg,sh])=>(
          <button key={t} onClick={()=>setMode(t)} style={{flex:1,padding:"10px",border:mode===t?"3px solid var(--bdc)":"3px solid transparent",borderRadius:14,cursor:"pointer",fontFamily:"Nunito,sans-serif",fontSize:13,fontWeight:900,background:mode===t?bg:"transparent",color:mode===t?"#fff":"var(--i2)",boxShadow:mode===t?`2px 2px 0 ${sh}`:"none",transition:"all .18s"}}>{l}</button>
        ))}
      </div>
      <input placeholder="🔍 Cari murid…" value={q} onChange={e=>setQ(e.target.value)}/>
      <div style={{display:"flex",flexDirection:"column",gap:8,maxHeight:240,overflowY:"auto"}}>
        {filtered.map(m=>{
          const st=muridStatus(m);const sel=pilih===m.id;
          return (
            <button key={m.id} onClick={()=>setPilih(m.id)} style={{display:"flex",alignItems:"center",gap:12,padding:"11px 14px",background:sel?"var(--ps)":"var(--wh)",border:`3px solid ${sel?"var(--p)":"var(--bdc)"}`,borderRadius:18,cursor:"pointer",textAlign:"left",boxShadow:sel?"3px 3px 0 var(--p)":"3px 3px 0 var(--bdc)"}}>
              <Ava nama={m.nama} jantina={m.jantina} size={38}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--ink)"}}>{m.nama.split(" ").slice(0,3).join(" ")}</p>
                <span className="cpill" style={{color:st.color,borderColor:st.bc||st.color,background:st.bg,fontSize:10}}>{st.label}</span>
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:13,fontWeight:700,color:"var(--g)"}}>+{m.merit}</p>
                <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,color:"var(--p)"}}>-{m.demerit}</p>
              </div>
            </button>
          );
        })}
      </div>
      {pilih&&(
        <div className={`ccard ${mode==="merit"?"ccard-green":"ccard-blue"} bounce-in`}>
          <p style={{fontSize:11,fontWeight:900,color:mode==="merit"?"var(--g)":"var(--p)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:4}}>{mode==="merit"?"✅ Merit":"⚠️ Demerit"} untuk:</p>
          <p style={{fontSize:15,fontWeight:900,marginBottom:12,color:"var(--ink)"}}>{murid.find(m=>m.id===pilih)?.nama}</p>
          <select value={sebab} onChange={e=>setSebab(e.target.value)} style={{marginBottom:12}}>
            <option value="">-- Pilih sebab --</option>
            {(mode==="merit"?MERIT_SEBAB:DEMERIT_SEBAB).map(s=><option key={s}>{s}</option>)}
          </select>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[1,3,5,10].map(n=>(
              <button key={n} onClick={()=>setMarkah(n)} style={{flex:1,height:46,border:`3px solid ${markah===n?(mode==="merit"?"var(--g)":"var(--p)"):"var(--bdc)"}`,borderRadius:14,background:markah===n?(mode==="merit"?"var(--g)":"var(--p)"):"var(--wh)",color:markah===n?"#fff":"var(--ink)",fontFamily:"JetBrains Mono,monospace",fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:`3px 3px 0 ${markah===n?(mode==="merit"?"#04855A":"var(--p2)"):"var(--bdc)"}`,transition:"all .15s"}}>{n}</button>
            ))}
          </div>
          <button className={`cbtn ${ok?"cbtn-green":mode==="merit"?"cbtn-green":"cbtn-blue"}`} onClick={submit}>
            {ok?"🎉 Berjaya!":`Rekod +${markah} ${mode==="merit"?"Merit":"Demerit"}`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── SENARAI MURID ── */
function SenaraiMurid({murid,saveMurid,deleteMurid}) {
  const [q,setQ]       = useState("");
  const [pilih,setPilih]= useState(null);
  const [sort,setSort] = useState("no");
  const [modal,setModal]= useState(null);
  const save = async data => {
    await saveMurid(data);
    setModal(null);setPilih(null);
  };
  const hapus = async id=>{if(!confirm("Padam murid ini?"))return;await deleteMurid(id);setPilih(null);};
  const filtered=[...murid].filter(m=>
    m.nama.toLowerCase().includes(q.toLowerCase())||
    m.wali.toLowerCase().includes(q.toLowerCase())||
    m.no.includes(q)||
    (m.delima||"").includes(q)
  ).sort((a,b)=>sort==="no"?a.no.localeCompare(b.no):sort==="merit"?netMerit(b)-netMerit(a):b.hadir-a.hadir);
  const sel = murid.find(m=>m.id===pilih);
  return (
    <>
      {modal&&<MuridModal data={modal==="tambah"?null:modal} onSave={save} onClose={()=>setModal(null)} count={murid.length}/>}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {sel?(
          <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:14}}>
            <button onClick={()=>setPilih(null)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--p)",fontWeight:900,fontSize:13,textAlign:"left"}}>← Kembali</button>
            <div className="ccard" style={{textAlign:"center",padding:"24px 20px"}}>
              <Ava nama={sel.nama} jantina={sel.jantina} size={76}/>
              <p style={{fontFamily:"Fredoka,sans-serif",fontSize:20,fontWeight:700,marginTop:12,color:"var(--ink)"}}>{sel.nama}</p>
              <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:6,flexWrap:"wrap"}}>
                <span className="cpill" style={{color:"var(--i2)",borderColor:"var(--bdc)",background:"var(--bg)"}}>No.{sel.no}</span>
                <span className="cpill" style={{color:"var(--i2)",borderColor:"var(--bdc)",background:"var(--bg)"}}>{sel.jantina==="L"?"👦 Lelaki":"👧 Perempuan"}</span>
                {(()=>{const st=muridStatus(sel);return <span className="cpill" style={{color:st.color,borderColor:st.bc||st.color,background:st.bg}}>{st.label}</span>;})()}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {l:"No. IC",     v:sel.ic||"-",           m:true},
                {l:"ID Delima",  v:sel.delima||"-",        m:true},
                {l:"Wali",       v:sel.wali.split(" ").slice(0,3).join(" ")},
                {l:"Tel Wali",   v:sel.tel,                m:true},
              ].map(f=>(
                <div key={f.l} className="ccard" style={{padding:"10px 12px"}}>
                  <p style={{fontSize:10,fontWeight:800,color:"var(--i3)",textTransform:"uppercase",letterSpacing:".4px"}}>{f.l}</p>
                  <p style={{fontSize:13,fontWeight:800,marginTop:4,color:"var(--ink)",fontFamily:f.m?"JetBrains Mono,monospace":"Nunito,sans-serif"}}>{f.v}</p>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <Blob icon="📗" val={sel.hadir}    label="Hari Hadir" bg="var(--gs)" color="var(--g)"  border="var(--g)"/>
              <Blob icon="📕" val={sel.absen}    label="Hari Absen" bg="var(--ps)" color="var(--p)"  border="var(--p)"/>
              <Blob icon="🏅" val={netMerit(sel)} label="Net Merit"  bg="var(--ys)" color="#B45309"   border="#B45309"/>
            </div>
            {sel.catatan&&(
              <div className="ccard ccard-yellow">
                <p style={{fontSize:11,fontWeight:900,color:"#B45309",marginBottom:4}}>📝 Catatan</p>
                <p style={{fontSize:13,fontStyle:"italic",fontWeight:600,color:"var(--ink)"}}>{sel.catatan}</p>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button className="cbtn cbtn-yellow" style={{flex:2,padding:"12px"}} onClick={()=>setModal(sel)}>✏️ Edit</button>
              <button onClick={()=>{const msg=encodeURIComponent(`Assalamualaikum ${sel.wali}, makluman daripada Cikgu Anna, Guru Kelas Thn 4 Bestari SK Darau berkaitan ${sel.nama}.`);window.open(`https://wa.me/60${sel.tel.replace(/^0/,"")}?text=${msg}`,"_blank");}}
                style={{flex:2,padding:"12px",background:"#25D366",border:"3px solid #1DA851",borderRadius:14,color:"#fff",fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:13,cursor:"pointer",boxShadow:"3px 3px 0 #1DA851"}}>📬 WA</button>
              <button className="cbtn" style={{flex:1,padding:"12px",background:"var(--ps)",color:"var(--p)",borderColor:"var(--p)",boxShadow:"3px 3px 0 var(--p2)"}} onClick={()=>hapus(sel.id)}>🗑️</button>
            </div>
          </div>
        ):(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>👥 Senarai <span style={{color:"var(--p)"}}>Murid</span></p>
                <p style={{fontSize:12,fontWeight:700,color:"var(--i3)",marginTop:2}}>{murid.length} murid · Tahun 4 Bestari</p>
              </div>
              <button onClick={()=>setModal("tambah")} style={{background:"var(--p)",color:"#fff",border:"3px solid var(--bdc)",borderRadius:14,padding:"10px 14px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:"3px 3px 0 var(--bdc)"}}>+ Tambah</button>
            </div>
            <input placeholder="🔍 Cari nama, ID Delima, wali…" value={q} onChange={e=>setQ(e.target.value)}/>
            <div style={{display:"flex",gap:6}}>
              {[["no","# No"],["merit","Merit"],["hadir","Hadir"]].map(([k,l])=>(
                <button key={k} onClick={()=>setSort(k)} style={{padding:"7px 14px",borderRadius:99,border:`3px solid ${sort===k?"var(--p)":"var(--bdc)"}`,background:sort===k?"var(--p)":"var(--wh)",color:sort===k?"#fff":"var(--ink)",fontSize:11,fontWeight:900,cursor:"pointer",boxShadow:`2px 2px 0 ${sort===k?"var(--p2)":"var(--bdc)"}`}}>{l}</button>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {filtered.map(m=>{
                const st=muridStatus(m);
                return (
                  <button key={m.id} onClick={()=>setPilih(m.id)} style={{display:"flex",alignItems:"center",gap:12,background:"var(--wh)",border:"3px solid var(--bdc)",borderRadius:20,padding:"12px 14px",cursor:"pointer",textAlign:"left",boxShadow:"3px 3px 0 var(--bdc)"}}>
                    <Ava nama={m.nama} jantina={m.jantina} size={44}/>
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{fontSize:13,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--ink)"}}>{m.nama}</p>
                      <p style={{fontSize:11,color:"var(--i3)",fontWeight:600,marginTop:2}}>
                        {m.wali.split(" ").slice(0,2).join(" ")}
                        {m.delima&&<span style={{marginLeft:6,fontFamily:"JetBrains Mono,monospace",color:"var(--p)",fontSize:10}}>· {m.delima}</span>}
                      </p>
                    </div>
                    <div style={{textAlign:"right"}}>
                      <span className="cpill" style={{color:st.color,borderColor:st.bc||st.color,background:st.bg,fontSize:10}}>{st.label}</span>
                      <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,color:"var(--i3)",marginTop:4}}>{netMerit(m)} merit</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ── JADUAL ── */
function Jadual() {
  const hari=["Isnin","Selasa","Rabu","Khamis","Jumaat"];
  const [aktif,setAktif]=useState("Jumaat");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>📅 Jadual <span style={{color:"var(--p)"}}>Waktu</span></p>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
        {hari.map(h=>(
          <button key={h} onClick={()=>setAktif(h)} style={{whiteSpace:"nowrap",padding:"8px 16px",border:"3px solid var(--bdc)",borderRadius:14,background:aktif===h?"var(--p)":"var(--wh)",color:aktif===h?"#fff":"var(--ink)",fontSize:12,fontWeight:900,cursor:"pointer",flexShrink:0,boxShadow:aktif===h?"3px 3px 0 var(--p2)":"3px 3px 0 var(--bdc)"}}>{h}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {JADUAL[aktif].map((subj,i)=>{
          const isR=subj==="REHAT";const meta=SUBJ_META[subj]||{emoji:"📚",color:"var(--p)",bg:"var(--ps)"};
          return (
            <div key={i} style={{display:"flex",alignItems:"center",gap:12,background:isR?"var(--bg)":meta.bg,border:`3px solid ${isR?"var(--pm)":"var(--bdc)"}`,borderRadius:18,padding:"12px 14px",boxShadow:isR?"none":"3px 3px 0 var(--bdc)",opacity:isR?.55:1}}>
              <div style={{width:44,height:44,borderRadius:14,background:isR?"var(--pm)":meta.color,border:isR?"2px dashed var(--i3)":"3px solid var(--bdc)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:isR?"none":"2px 2px 0 var(--bdc)",flexShrink:0}}>{meta.emoji}</div>
              <div style={{flex:1}}>
                <p style={{fontSize:14,fontWeight:isR?600:900,color:isR?"var(--i3)":"var(--ink)",fontStyle:isR?"italic":"normal"}}>{isR?"— Waktu Rehat —":subj}</p>
                {!isR&&<p style={{fontSize:11,color:"var(--i3)",fontWeight:600,marginTop:1}}>40 minit</p>}
              </div>
              <div style={{textAlign:"right"}}>
                <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,fontWeight:700,color:isR?"var(--i3)":meta.color}}>{MASA[i]}</p>
                {i<6&&!isR&&<p style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,color:"var(--i3)"}}>→{MASA[i+1]}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── LOG IBU BAPA ── */
function Log({log,addLog,updateLog}) {
  const [filter,setFilter]=useState("semua");
  const [balas,setBalas]  =useState(null);
  const [teks,setTeks]    =useState("");
  const [baru,setBaru]    =useState(false);
  const [form,setForm]    =useState({murid:"",wali:"",tel:"",jenis:"makluman",mesej:""});
  const jW={pertanyaan:{bg:"var(--bs)",c:"var(--b)"},makluman:{bg:"var(--gs)",c:"var(--g)"},aduan:{bg:"var(--ps)",c:"var(--p)"}};
  const sW={"belum balas":{bg:"var(--ps)",c:"var(--p)"},diterima:{bg:"var(--gs)",c:"var(--g)"},dibalas:{bg:"var(--bs)",c:"var(--b)"}};
  const shown=filter==="semua"?log:log.filter(l=>l.status===filter||l.jenis===filter);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>📩 Log <span style={{color:"var(--p)"}}>Ibu Bapa</span></p>
          <p style={{fontSize:12,fontWeight:700,color:"var(--i3)",marginTop:2}}>Komunikasi & makluman wali</p>
        </div>
        <button onClick={()=>setBaru(true)} style={{background:"var(--p)",color:"#fff",border:"3px solid var(--bdc)",borderRadius:14,padding:"9px 14px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:"3px 3px 0 var(--bdc)"}}>+ Baru</button>
      </div>
      {baru&&(
        <div className="ccard ccard-blue bounce-in">
          <p style={{fontSize:12,fontWeight:900,color:"var(--p)",marginBottom:12,textTransform:"uppercase"}}>📢 Makluman Baru</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <input placeholder="Nama murid" value={form.murid} onChange={e=>setForm(p=>({...p,murid:e.target.value}))}/>
            <input placeholder="Nama wali"  value={form.wali}  onChange={e=>setForm(p=>({...p,wali:e.target.value}))}/>
            <input placeholder="Tel wali (01XXXXXXXX)" value={form.tel} onChange={e=>setForm(p=>({...p,tel:e.target.value}))}/>
            <select value={form.jenis} onChange={e=>setForm(p=>({...p,jenis:e.target.value}))}><option value="makluman">Makluman</option><option value="pertanyaan">Pertanyaan</option><option value="aduan">Aduan</option></select>
            <textarea rows={3} placeholder="Isi mesej…" value={form.mesej} onChange={e=>setForm(p=>({...p,mesej:e.target.value}))} style={{resize:"none"}}/>
            <div style={{display:"flex",gap:8}}>
              <button className="cbtn cbtn-blue" style={{padding:"11px"}} onClick={async()=>{if(!form.murid||!form.mesej)return;const d=getDateInfo();await addLog({...form,tarikh:`${d.tarikh}`,status:"diterima",balasan:""});setBaru(false);setForm({murid:"",wali:"",tel:"",jenis:"makluman",mesej:""});}}>Hantar</button>
              <button className="cbtn cbtn-white" style={{padding:"11px"}} onClick={()=>setBaru(false)}>Batal</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
        {["semua","belum balas","diterima","dibalas","aduan"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{whiteSpace:"nowrap",padding:"7px 12px",border:"3px solid var(--bdc)",borderRadius:99,background:filter===f?"var(--p)":"var(--wh)",color:filter===f?"#fff":"var(--ink)",fontSize:11,fontWeight:900,cursor:"pointer",flexShrink:0,boxShadow:filter===f?"2px 2px 0 var(--p2)":"2px 2px 0 var(--bdc)",textTransform:"capitalize"}}>{f}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {shown.map(l=>{
          const sw=sW[l.status]||{};const jw=jW[l.jenis]||{};
          return (
            <div key={l.id} className="ccard">
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                <p style={{fontSize:15,fontWeight:900,color:"var(--ink)"}}>{l.murid}</p>
                <span className="cpill" style={{background:sw.bg,color:sw.c,borderColor:sw.c}}>{l.status}</span>
              </div>
              <p style={{fontSize:11,color:"var(--i3)",fontWeight:600,marginBottom:8}}>{l.wali} · {l.tarikh}</p>
              <div style={{display:"flex",gap:6,alignItems:"flex-start",marginBottom:8}}>
                <span className="cpill" style={{background:jw.bg,color:jw.c,borderColor:jw.c,flexShrink:0}}>{l.jenis}</span>
                <p style={{fontSize:13,fontWeight:600,lineHeight:1.5,color:"var(--ink)"}}>{l.mesej}</p>
              </div>
              {l.balasan&&(
                <div style={{background:"var(--bs)",border:"2px solid var(--b)",borderRadius:12,padding:"8px 12px",marginBottom:8}}>
                  <p style={{fontSize:11,fontWeight:800,color:"var(--b)"}}>📬 Balasan:</p>
                  <p style={{fontSize:12,fontWeight:600,color:"var(--ink)",marginTop:2}}>{l.balasan}</p>
                </div>
              )}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {l.status==="belum balas"&&(balas===l.id?(
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                    <textarea rows={2} placeholder="Tulis balasan…" value={teks} onChange={e=>setTeks(e.target.value)} style={{resize:"none",fontSize:13}}/>
                    <div style={{display:"flex",gap:6}}>
                      <button className="cbtn cbtn-blue" style={{padding:"9px"}} onClick={async()=>{await updateLog(l.id,{status:"dibalas",balasan:teks});setBalas(null);setTeks("");}}>Hantar</button>
                      <button className="cbtn cbtn-white" style={{padding:"9px"}} onClick={()=>setBalas(null)}>Batal</button>
                    </div>
                  </div>
                ):(
                  <button onClick={()=>setBalas(l.id)} style={{background:"none",border:"none",color:"var(--p)",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",padding:0}}>📬 Balas →</button>
                ))}
                {l.tel&&<button onClick={()=>window.open(`https://wa.me/60${l.tel.replace(/^0/,"")}?text=${encodeURIComponent(`Assalamualaikum ${l.wali}, berkaitan mesej anda.`)}`,"_blank")} style={{marginLeft:"auto",background:"#25D366",border:"2px solid #1DA851",borderRadius:10,padding:"7px 12px",color:"#fff",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>📬 WA</button>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── LAPORAN ── */
function Laporan({murid}) {
  const avg = arr=>arr.length?Math.round(arr.reduce((s,v)=>s+v,0)/arr.length):0;
  const avgH   = avg(murid.map(m=>m.hadir));
  const avgM   = avg(murid.map(m=>netMerit(m)));
  const top    = [...murid].sort((a,b)=>netMerit(b)-netMerit(a))[0];
  const cem    = murid.filter(m=>m.merit>=100).length;
  const pantau = murid.filter(m=>m.absen>=7||m.demerit>=15).length;
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>📊 Laporan <span style={{color:"var(--p)"}}>Kelas</span></p>
        <button onClick={()=>window.print()} style={{background:"var(--p)",color:"#fff",border:"3px solid var(--bdc)",borderRadius:14,padding:"10px 14px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:"3px 3px 0 var(--bdc)"}}>🖨️ PDF</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Blob icon="📗" val={`${avgH}`} label="Purata Hadir"  bg="var(--gs)" color="var(--g)"  border="var(--g)"/>
        <Blob icon="🏅" val={avgM}       label="Purata Merit"  bg="var(--ys)" color="#B45309"    border="#B45309"/>
        <Blob icon="⭐" val={cem}         label="Cemerlang"     bg="var(--ps)" color="var(--p)"   border="var(--p)"/>
        <Blob icon="⚠️" val={pantau}      label="Perlu Pantau"  bg="var(--bs)" color="var(--b)"   border="var(--b)"/>
      </div>
      {/* Rekod lengkap dengan Delima ID */}
      <div className="ccard" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--p)",padding:"10px 16px",borderBottom:"3px solid var(--bdc)",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:16}}>📋</span>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:15,fontWeight:700,color:"#fff"}}>Rekod Lengkap Murid</p>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"24px 1fr 56px 38px 38px 44px 50px",gap:3,padding:"8px 10px",background:"var(--ys)",borderBottom:"2px solid var(--bdc)"}}>
          {["#","Nama","Delima","H","A","Merit","Demerit"].map(h=>(
            <p key={h} style={{fontSize:9,fontWeight:900,color:"var(--i2)",textTransform:"uppercase",letterSpacing:".3px",textAlign:h==="Nama"?"left":"center"}}>{h}</p>
          ))}
        </div>
        {[...murid].sort((a,b)=>a.no.localeCompare(b.no)).map((m,i)=>{
          const st=muridStatus(m);
          return (
            <div key={m.id} style={{display:"grid",gridTemplateColumns:"24px 1fr 56px 38px 38px 44px 50px",gap:3,padding:"9px 10px",background:i%2===0?"var(--wh)":"var(--bg)",borderBottom:"1px solid var(--pm)"}}>
              <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:10,fontWeight:700,color:"var(--i3)",textAlign:"center",paddingTop:2}}>{m.no}</p>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.nama.split(" ").slice(0,3).join(" ")}</p>
                <span className="cpill" style={{color:st.color,borderColor:st.bc||st.color,background:st.bg,fontSize:9,padding:"2px 5px"}}>{st.label}</span>
              </div>
              <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:9,fontWeight:700,color:"var(--p)",textAlign:"center",paddingTop:2}}>{m.delima||"-"}</p>
              <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,fontWeight:700,color:"var(--g)",textAlign:"center",paddingTop:2}}>{m.hadir}</p>
              <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,fontWeight:700,color:m.absen>=5?"var(--p)":"var(--i3)",textAlign:"center",paddingTop:2}}>{m.absen}</p>
              <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,fontWeight:700,color:"var(--g)",textAlign:"center",paddingTop:2}}>+{m.merit}</p>
              <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,fontWeight:700,color:m.demerit>0?"var(--p)":"var(--i3)",textAlign:"center",paddingTop:2}}>{m.demerit>0?`-${m.demerit}`:"-"}</p>
            </div>
          );
        })}
      </div>
      {/* Bar chart */}
      <div className="ccard" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--p)",padding:"10px 16px",borderBottom:"3px solid var(--bdc)",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:16}}>📈</span>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:15,fontWeight:700,color:"#fff"}}>Net Merit Per Murid</p>
        </div>
        <div style={{padding:"14px 16px",display:"flex",flexDirection:"column",gap:10}}>
          {[...murid].sort((a,b)=>netMerit(b)-netMerit(a)).map(m=>{
            const pct=Math.max(0,Math.min(100,(netMerit(m)/150)*100));
            const clr=netMerit(m)>=100?"var(--g)":netMerit(m)<50?"var(--p)":"#F59E0B";
            return (
              <div key={m.id}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                  <p style={{fontSize:12,fontWeight:800,color:"var(--ink)"}}>{m.nama.split(" ")[0]} {m.nama.split(" ").slice(-1)[0]}</p>
                  <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,fontWeight:700,color:clr}}>{netMerit(m)}</p>
                </div>
                <div style={{height:10,background:"var(--pm)",borderRadius:99,border:"2px solid var(--bdc)",overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:clr,borderRadius:99,transition:"width .6s cubic-bezier(.34,1.56,.64,1)"}}/>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {top&&(
        <div style={{background:"var(--p)",border:"3px solid var(--bdc)",borderRadius:22,boxShadow:"5px 5px 0 var(--bdc)",padding:"18px",position:"relative",overflow:"hidden"}}>
          <div style={{position:"absolute",top:-16,right:-16,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.12)",border:"3px solid rgba(255,255,255,.2)"}}/>
          <p style={{fontSize:11,fontWeight:900,color:"rgba(255,255,255,.8)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:8}}>🏆 MURID TERBAIK KELAS</p>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <Ava nama={top.nama} jantina={top.jantina} size={56}/>
            <div>
              <p style={{fontFamily:"Fredoka,sans-serif",fontSize:19,fontWeight:700,color:"#fff"}}>{top.nama.split(" ").slice(0,3).join(" ")}</p>
              <p style={{color:"rgba(255,255,255,.85)",fontSize:13,fontWeight:700}}>Net Merit: <span style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700}}>{netMerit(top)}</span></p>
            </div>
          </div>
        </div>
      )}
      <button onClick={()=>window.print()} className="cbtn cbtn-blue" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>🖨️ Export Laporan sebagai PDF</button>
    </div>
  );
}

/* ── ROOT APP ── */
export default function App() {
  const [tab,setTab]       = useState("dashboard");
  const [drawer,setDrawer] = useState(false);
  const [search,setSearch] = useState(false);
  const [waModal,setWaModal]=useState(false);
  const [dark,setDark]     = useState(false);
  const [murid,setMurid]   = useState([]);
  const [log,setLog]       = useState([]);
  const [loading,setLoading]= useState(true);
  const [kh]               = useState(INIT_KH);

  /* ── LOAD FROM SUPABASE ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: mData }, { data: lData }] = await Promise.all([
      supabase.from("murid").select("*").order("no"),
      supabase.from("log_ibu_bapa").select("*").order("created_at", { ascending: false }),
    ]);
    if (mData?.length) {
      setMurid(mData);
    } else {
      /* seed default data on first run */
      const { data: seeded } = await supabase.from("murid").insert(
        INIT_MURID.map(({ id: _id, ...m }) => m)
      ).select();
      if (seeded) setMurid(seeded);
    }
    if (lData?.length) {
      setLog(lData);
    } else {
      const { data: seeded } = await supabase.from("log_ibu_bapa").insert(
        INIT_LOG.map(({ id: _id, ...l }) => l)
      ).select();
      if (seeded) setLog(seeded);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  /* ── MURID CRUD ── */
  const saveMurid = async (data) => {
    const { id, created_at: _c, ...fields } = data;
    if (id && murid.find(m => m.id === id)) {
      await supabase.from("murid").update(fields).eq("id", id);
      setMurid(p => p.map(m => m.id === id ? { ...m, ...fields } : m));
    } else {
      const { data: row } = await supabase.from("murid").insert(fields).select().single();
      if (row) setMurid(p => [...p, row]);
    }
  };

  const deleteMurid = async (id) => {
    await supabase.from("murid").delete().eq("id", id);
    setMurid(p => p.filter(m => m.id !== id));
  };

  const updateMerit = async (id, field, amount) => {
    const target = murid.find(m => m.id === id);
    if (!target) return;
    const newVal = target[field] + amount;
    await supabase.from("murid").update({ [field]: newVal }).eq("id", id);
    setMurid(p => p.map(m => m.id === id ? { ...m, [field]: newVal } : m));
  };

  /* ── LOG CRUD ── */
  const addLog = async (entry) => {
    const { data: row } = await supabase.from("log_ibu_bapa").insert(entry).select().single();
    if (row) setLog(p => [row, ...p]);
  };

  const updateLog = async (id, fields) => {
    await supabase.from("log_ibu_bapa").update(fields).eq("id", id);
    setLog(p => p.map(l => l.id === id ? { ...l, ...fields } : l));
  };

  const notif      = log.filter(l=>l.status==="belum balas").length;
  const hadirCount = murid.filter(m=>(kh[m.id]||"hadir")==="hadir").length;
  const g = getGreeting();

  if (loading) return (
    <>
      <style>{makeCSS(dark)}</style>
      <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
        <Logo size={56}/>
        <p style={{fontFamily:"Fredoka,sans-serif",fontSize:18,color:"var(--p)",fontWeight:700}}>Memuatkan Portal Cikgu Anna…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{makeCSS(dark)}</style>
      {search  && <Search murid={murid} log={log} nav={t=>{setTab(t);setSearch(false);}} onClose={()=>setSearch(false)}/>}
      {drawer  && <Drawer active={tab} nav={t=>{setTab(t);}} onClose={()=>setDrawer(false)} notif={notif} dark={dark} setDark={setDark}/>}
      {waModal && <WAModal murid={murid} onClose={()=>setWaModal(false)}/>}

      <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto"}}>

        {/* ── HEADER ── */}
        <div style={{position:"sticky",top:0,zIndex:20,background:"var(--p)",overflow:"hidden",borderBottom:"3px solid var(--bdc)",boxShadow:"0 4px 0 var(--bdc)"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,.1) 1px,transparent 1px)",backgroundSize:"16px 16px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:-28,right:-28,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.08)",border:"2px solid rgba(255,255,255,.1)",pointerEvents:"none"}}/>
          {/* Row 1 */}
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"36px 12px 8px",position:"relative"}}>
            <div style={{flexShrink:0,background:"rgba(255,255,255,.18)",border:"2.5px solid rgba(255,255,255,.45)",borderRadius:14,padding:5,boxShadow:"2px 2px 0 rgba(0,0,0,.18)"}}>
              <Logo size={38}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontFamily:"Fredoka,sans-serif",fontSize:16,fontWeight:700,color:"#fff",lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Portal Cikgu Anna</p>
              <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.72)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.e} {g.t} · {hadirCount}/{murid.length} hadir</p>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}>
              <LiveClock/>
              <button onClick={()=>setDark(!dark)} style={{background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.4)",borderRadius:11,width:34,height:34,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>{dark?"☀️":"🌙"}</button>
              {notif>0&&(
                <button onClick={()=>setTab("log")} style={{position:"relative",background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.4)",borderRadius:11,width:34,height:34,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  📩<span style={{position:"absolute",top:2,right:2,width:15,height:15,background:"var(--y)",color:"var(--ink)",fontSize:8,fontWeight:900,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid var(--bdc)"}}>{notif}</span>
                </button>
              )}
              <button onClick={()=>setDrawer(true)} style={{background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.4)",borderRadius:11,width:34,height:34,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
                {[0,1,2].map(i=><span key={i} style={{display:"block",width:14,height:2,background:"#fff",borderRadius:99}}/>)}
              </button>
            </div>
          </div>
          {/* Search row */}
          <div style={{padding:"0 12px 10px",position:"relative"}}>
            <button onClick={()=>setSearch(true)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.38)",borderRadius:12,padding:"9px 12px",cursor:"pointer",textAlign:"left",boxShadow:"2px 2px 0 rgba(0,0,0,.12)"}}>
              <span style={{fontSize:14}}>🔍</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.8)",fontFamily:"Nunito,sans-serif",fontWeight:700,flex:1}}>Cari murid, ID Delima, wali, mesej…</span>
              <span style={{fontSize:9,fontWeight:900,color:"rgba(255,255,255,.55)",background:"rgba(255,255,255,.12)",borderRadius:6,padding:"2px 6px",border:"1.5px solid rgba(255,255,255,.2)"}}>⌘K</span>
            </button>
          </div>
          {/* Wavy */}
          <svg style={{display:"block",width:"100%",height:14,marginBottom:-1}} viewBox="0 0 430 14" preserveAspectRatio="none">
            <path d="M0,2 C80,14 160,0 215,8 C270,16 350,2 430,7 L430,14 L0,14 Z" fill="var(--bg)"/>
            <path d="M0,2 C80,14 160,0 215,8 C270,16 350,2 430,7" fill="none" stroke="var(--bdc)" strokeWidth="2"/>
          </svg>
        </div>

        {/* ── CONTENT ── */}
        <div style={{flex:1,padding:"14px 14px 40px",overflowY:"auto"}} key={tab} className="fade-up">
          {tab==="dashboard" && <Dashboard murid={murid} log={log} kh={kh} setWA={setWaModal}/>}
          {tab==="objektif"  && <Objektif/>}
          {tab==="kehadiran" && <Kehadiran murid={murid}/>}
          {tab==="merit"     && <Merit murid={murid} updateMerit={updateMerit}/>}
          {tab==="murid"     && <SenaraiMurid murid={murid} saveMurid={saveMurid} deleteMurid={deleteMurid}/>}
          {tab==="jadual"    && <Jadual/>}
          {tab==="log"       && <Log log={log} addLog={addLog} updateLog={updateLog}/>}
          {tab==="laporan"   && <Laporan murid={murid}/>}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{position:"sticky",bottom:0,background:"var(--wh)",borderTop:"3px solid var(--bdc)",boxShadow:"0 -3px 0 var(--bdc)",display:"flex",zIndex:20}}>
          {[
            {id:"dashboard", emoji:"🏠",label:"Home"},
            {id:"objektif",  emoji:"🎯",label:"Objektif"},
            {id:"kehadiran", emoji:"📋",label:"Hadir"},
            {id:"murid",     emoji:"👥",label:"Murid"},
            {id:"laporan",   emoji:"📊",label:"Laporan"},
          ].map(item=>{
            const sel=tab===item.id;
            return (
              <button key={item.id} onClick={()=>setTab(item.id)} style={{flex:1,padding:"10px 4px 8px",background:sel?"var(--ps)":"none",border:"none",borderTop:`3px solid ${sel?"var(--p)":"transparent"}`,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                <span style={{fontSize:20}}>{item.emoji}</span>
                <span style={{fontSize:9,fontWeight:900,color:sel?"var(--p)":"var(--i3)",fontFamily:"Nunito,sans-serif"}}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
