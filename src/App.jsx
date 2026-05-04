import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./hooks/useAuth";
import LoginPage from "./components/LoginPage";
import ParentPortal from "./components/ParentPortal";

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
@media(min-width:768px){
  .app-wrap{flex-direction:row!important;max-width:none!important;margin:0!important;}
  .app-sidebar{display:flex!important;width:260px;min-height:100vh;flex-shrink:0;flex-direction:column;background:var(--wh);border-right:3px solid var(--bdc);position:sticky;top:0;height:100vh;overflow-y:auto;}
  .app-main{flex:1;display:flex;flex-direction:column;min-width:0;max-width:700px;}
  .bottom-nav{display:none!important;}
  .hdr-hamburger{display:none!important;}
}
@media(max-width:767px){
  .app-sidebar{display:none!important;}
}
`;

/* ── DATA ── */
const KELAS_LIST = ["6 Adil","6 Amanah","6 Arif"];

const INIT_MURID = [
  // === 6 ADIL ===
  {id:1, no:"01",nama:"ABBY SHARLIEYA BINTI ARMAN",                  delima:"m-13915981@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:2, no:"02",nama:"AEIRIS NAURATUL AERISSA BINTI AWANG",           delima:"m-13915983@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:3, no:"03",nama:"AISYAH MADINA BINTI MUHAMMAD RIDZUAN",          delima:"m-13915984@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:4, no:"04",nama:"ALIFF ALI IMRAN BIN ASRUL HISHAM",              delima:"m-13916146@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:5, no:"06",nama:"MOHAMAD AMIN BIN MOHD AZMAN",                   delima:"m-13916091@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:6, no:"07",nama:"MOHAMMAD AMIR HAIKAL BIN MAHADI",               delima:"m-13916092@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:7, no:"08",nama:"MOHAMMAD HANAFIA BIN ABDULLAH",                 delima:"m-13916093@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:8, no:"09",nama:"MUHAMAD ADAM DANIAL RIZQIN BIN AZIM",           delima:"m-14126640@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:9, no:"10",nama:"MUHAMMAD ADIB MUHADAR BIN HARIS",               delima:"m-13916399@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:10,no:"11",nama:"MUHAMMAD FAIZ RAYYAN BIN MOHD FAIZAL",          delima:"m-13916129@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:11,no:"12",nama:"MUHAMMAD FIKRI BIN MOHAMMAD HASANAN",           delima:"m-13701087@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:12,no:"13",nama:"MUHAMMAD HERMAN BIN USNIN",                     delima:"m-13916130@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:13,no:"14",nama:"MUHAMMAD RAYYAN BIN ADRIAN",                    delima:"m-14071710@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:14,no:"15",nama:"MUHAMMAD SA'ID EUSOFF BIN MOHD SHAFIEE",        delima:"m-13916453@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:15,no:"16",nama:"MUHAMMAD SYAKIR BIN ADJIJI",                    delima:"m-13916156@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:16,no:"17",nama:"MUMTAZAH BINTI MOHAMMAD ILHAM @ GERLAND",       delima:"m-13916132@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:17,no:"18",nama:"MUZAFFAR BIN OSMAN",                            delima:"m-13917514@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:18,no:"19",nama:"NAZHAN BIN NABIL",                              delima:"m-13923336@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:19,no:"20",nama:"NOVIANA BINTI ABDUL MOMIN",                     delima:"m-14103541@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:20,no:"21",nama:"NUR AISYAH BINTI MOHAMMAD DARUS",               delima:"m-13923337@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:21,no:"22",nama:"NUR IFFAH AQILAH BINTI MOHAMMAD RIZWAN",        delima:"m-13985554@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:22,no:"23",nama:"NUR IMAN SAFIYYAH BINTI JULMEN",                delima:"m-13916193@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:23,no:"24",nama:"NUR IZYAN RADHIYYAH BINTI RUDIANSAH",           delima:"m-13916194@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:24,no:"25",nama:"NURUL ALIS ALISHA MAISARAH BINTI MOHD NOOR",    delima:"m-14074386@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:25,no:"26",nama:"RABIATUL BASARIAH BINTI AMIR HAJIB",            delima:"m-13916195@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:26,no:"27",nama:"ROFAZIRAH",                                      delima:"m-13923528@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:27,no:"28",nama:"SAFIYA BINTI SABRI",                            delima:"m-13916198@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  {id:28,no:"29",nama:"SHAAZZAMRISHA BIN SAARI",                       delima:"m-13916200@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Adil"},
  // === 6 AMANAH ===
  {id:29,no:"01",nama:"ADAM ATIQ BIN MOHAMAD YUNUS",                   delima:"m-13918609@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:30,no:"02",nama:"AHMAD AMMAR ZULWAQAR BIN NASRUN",               delima:"m-13916388@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:31,no:"03",nama:"AHMAD FATHI AMMAR BIN ABDUL FATTAH",            delima:"m-13916389@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:32,no:"04",nama:"AJMAL ABID MAKRAM BIN MASRAN",                  delima:"m-13815350@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:33,no:"05",nama:"ALBOYED SHELTON ALLBERT ALBRHAM",               delima:"m-13915985@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:34,no:"06",nama:"ANDI MOHAMAD WAFEEQ BIN MOHAMAD SADEED",        delima:"m-13916390@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:35,no:"07",nama:"ANISAH NAZIHA BINTI DATU MOHAMAD FAIZAL",       delima:"m-13916391@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:36,no:"08",nama:"AQEEL RAEFFY BIN MOHD REZELY",                  delima:"m-13916392@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:37,no:"09",nama:"ARMANSHAH BIN ASMAN",                           delima:"m-13874782@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:38,no:"10",nama:"ASRAF DANIEL BIN ABDULLAH",                     delima:"m-13917239@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:39,no:"11",nama:"AWANG FAAEQ ZUHRI BIN ABDULLAH",                delima:"m-251202630588@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:40,no:"12",nama:"HERNITA RISCA HIDLEY",                          delima:"m-13751819@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:41,no:"13",nama:"MOHAMAD WAFIDANI BIN JUMAADIL",                 delima:"m-13744700@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:42,no:"14",nama:"MUHAMMAD ADAM BIN ASHAARI",                     delima:"m-13916396@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:43,no:"15",nama:"MUHAMMAD KHAIRY KAZIM BIN JAMIL",               delima:"m-13916450@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:44,no:"16",nama:"MUHAMMAD RAIZ DANIEL BIN RAFIE",                delima:"m-13916451@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:45,no:"17",nama:"MUHAMMAD RAYQAL ARIAN BIN MOHAMMAD FIRDAUS",    delima:"m-13916452@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:46,no:"18",nama:"NUR AINA DAMIA BINTI MD ZAIDY",                 delima:"m-13916382@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:47,no:"19",nama:"NUR AISYSAFIYAH BINTI SAFHRY",                  delima:"m-13916383@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:48,no:"20",nama:"NUR ALEESYA DHANIYAH BINTI MOHD SHAH",          delima:"m-13916384@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:49,no:"21",nama:"NUR ALEESYA SOFEA BINTI SUPIAN",                delima:"m-13916385@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:50,no:"22",nama:"NUR AYU FARYSHA BINTI RUDY",                    delima:"m-13797714@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:51,no:"23",nama:"NUR IZZAH NADHILAH BINTI AB RAUP",              delima:"m-13916546@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:52,no:"24",nama:"NUR KHAIRA MAISARAH BINTI ISAMUDIN",            delima:"m-13916547@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:53,no:"25",nama:"NUR NATASHA ZAHRA BINTI MOHD.KHAIRUDDIN",       delima:"m-14113692@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:54,no:"26",nama:"NUR SURYANA BINTI ABD.SAMAN",                   delima:"m-13916549@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:55,no:"27",nama:"NURUL ADAWIYAH AQILAH BINTI ABDUL HABI",        delima:"m-13948319@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:56,no:"28",nama:"QAISARAH QAREENA BINTI MOHD FEZALY",            delima:"m-13836344@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:57,no:"29",nama:"SYAFISYAH BINTI ABDULLAH",                      delima:"m-13916613@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:58,no:"30",nama:"VIVI NURSYAH VIDONA BINTI SYED FAZRY",          delima:"m-13801842@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  {id:59,no:"31",nama:"ZUBAIR BIN SHARIFUL FADZLI",                    delima:"m-15749040@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Amanah"},
  // === 6 ARIF ===
  {id:60,no:"01",nama:"ADAM HAKIMI BIN MOHD FIRDAUS",                  delima:"m-13915982@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:61,no:"02",nama:"AHMAD AMMAR BIN MOHAMMAD SAPRI",                delima:"m-13775593@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:62,no:"03",nama:"AHMAD FURQAN MULTAZAM BIN AHMAD",               delima:"m-13917236@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:63,no:"04",nama:"AHMAD KHAN AQHARI BIN AL HADZ",                 delima:"m-13917237@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:64,no:"05",nama:"AHMAD UWAIS SYAMIL BIN MOHD ZAINUDDIN",         delima:"m-13889700@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:65,no:"06",nama:"AIN MEDINA BINTI OMAR",                         delima:"m-13917238@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:66,no:"07",nama:"ANNURSYADIQAH AFIFAH BINTI ABDULLAH",           delima:"m-13782099@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:67,no:"08",nama:"AWANG QUE AZNIN BIN AWANG ZANY",               delima:"m-13917241@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:68,no:"09",nama:"AYRIS QHAISARAH BINTI MOHD.YUSUP",             delima:"m-13917242@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:69,no:"10",nama:"DANIEL KHUZAIRI",                               delima:"m-13923362@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:70,no:"11",nama:"FIRDAUS BIN ABDULLAH",                          delima:"m-13923364@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:71,no:"12",nama:"HAWA SOFEA BINTI ABDULLAH",                     delima:"m-13817734@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:72,no:"13",nama:"LUKMAN ALHAKIM BIN TUSMAN",                     delima:"m-13923387@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:73,no:"14",nama:"MOHAMMAD RAYYAN ADIF BIN ROSTAM",               delima:"m-13916094@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:74,no:"15",nama:"MOHAMMAD REZMAN BIN MADUSIN",                   delima:"m-13916095@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:75,no:"16",nama:"MUHAMMAD ALI ARFA BIN MOHD RUZAIMI",            delima:"m-13917244@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:76,no:"17",nama:"MUHAMMAD AZKA ZUHAYR BIN SUZAIMIE",             delima:"m-13917511@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:77,no:"18",nama:"MUHAMMAD RAIMI FIRDAUS BIN MUHAMMAD ZULHISHAM", delima:"m-13844887@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:78,no:"19",nama:"MUHAMMAD SHAH RAMDHAN BIN RAMLEE",              delima:"m-13742030@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:79,no:"20",nama:"MUHAMMAD TAUFIQ ISMAIL BIN ABDULLAH",           delima:"m-13917512@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:80,no:"21",nama:"MUHAMMAD UZAYR BIN BURARI",                     delima:"m-13917513@moe-dl.edu.my",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:81,no:"22",nama:"NUR AMANINA BINTI HARIS",                       delima:"m-13917634@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:82,no:"23",nama:"NUR DHIA ZAHRA BINTI ABDUL WAFI",               delima:"m-13917637@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:83,no:"24",nama:"NUR ELLYSAH BINTI RIZWAN",                      delima:"m-13917638@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:84,no:"25",nama:"NUR FATEHAH ADRIANA BINTI MARAMIN",             delima:"m-13917675@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:85,no:"26",nama:"NUR HAZNIRAH HANI BINTI ABDULLAH",              delima:"m-13917829@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:86,no:"27",nama:"NUR HUMAIRAH BINTI MOHD.SAH",                   delima:"m-13946130@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:87,no:"28",nama:"NUR IRDINA PUTRY BINTI MORBA",                  delima:"m-13917831@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:88,no:"29",nama:"NUR SYAFAZALYA BINTI ABDULLAH",                 delima:"m-13917833@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:89,no:"30",nama:"NUR SYARYANA BINTI AHMAD",                      delima:"m-13917836@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:90,no:"31",nama:"SYARIFAH AYESHA BINTI JAMAL",                   delima:"m-13916615@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:91,no:"32",nama:"SYASYA ADELIA BINTI BADRI",                     delima:"m-13916617@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
  {id:92,no:"33",nama:"WARDAH QHALIESHA BINTI AZMI",                   delima:"m-13916621@moe-dl.edu.my",jantina:"P",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:"6 Arif"},
];

const INIT_LOG = [
  {id:1,murid:"Ahmad Haziq",   wali:"Rosli bin Ahmad", tel:"0128881234",jenis:"enquiry",  mesej:"Could you share the exam schedule for June?",              tarikh:"28 Apr",status:"unanswered",balasan:""},
  {id:2,murid:"Nur Aisyah",    wali:"Kamal bin Hassan",tel:"0137772345",jenis:"notice",   mesej:"Aisyah will be absent for 2 days due to a family event.",   tarikh:"27 Apr",status:"received",   balasan:""},
  {id:3,murid:"Luqmanul Hakim",wali:"Daud bin Yusof",  tel:"0165555678",jenis:"complaint",mesej:"My child mentioned having an issue with a classmate.",       tarikh:"26 Apr",status:"replied",    balasan:"Thank you. I will monitor the situation and follow up."},
  {id:4,murid:"Alya Damia",    wali:"Rashid bin Omar", tel:"0106666789",jenis:"notice",   mesej:"Alya has sports training this Monday afternoon.",            tarikh:"25 Apr",status:"received",   balasan:""},
];

const JADUAL = {
  Monday:    ["Malay","Maths","Science","BREAK","Islamic Studies","English","Home Ec"],
  Tuesday:   ["Maths","Malay","English","BREAK","Science","History","PE"],
  Wednesday: ["Science","English","Malay","BREAK","Maths","Islamic Studies","Music"],
  Thursday:  ["Islamic Studies","Science","Maths","BREAK","Malay","English","Moral Ed"],
  Friday:    ["PE","Malay","Science","BREAK","Maths","English","Co-Curricular"],
};
const MASA = ["7:30","8:10","8:50","9:30","10:10","11:10","11:50"];
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
const MERIT_SEBAB  = ["Exam excellence","Active in co-curricular","Helping the teacher","Clean classroom","Good discipline","Others"];
const DEMERIT_SEBAB= ["Truancy","Late to class","Noisy in class","Incomplete homework","Broke school rules","Others"];
const INIT_KH = {};

const netMerit = m => m.merit - m.demerit;
const muridStatus = m => {
  if (netMerit(m) >= 100) return {label:"⭐ Excellent",color:"var(--g)",  bg:"var(--gs)",bc:"var(--g)"};
  if (m.absen >= 7 || m.demerit >= 15) return {label:"🚨 Monitor",color:"var(--p)",bg:"var(--ps)",bc:"var(--p)"};
  return {label:"👍 Good",color:"#B45309",bg:"var(--ys)",bc:"#B45309"};
};
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return {t:"Good Morning",   e:"🌤️"};
  if (h < 15) return {t:"Good Afternoon", e:"☀️"};
  if (h < 19) return {t:"Good Evening",   e:"🌇"};
  return      {t:"Good Night",            e:"🌙"};
};
const getDateInfo = () => {
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const d = new Date();
  return {
    hari:   days[d.getDay()],
    tarikh: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`,
    masa:   d.toLocaleTimeString("en-MY",{hour:"2-digit",minute:"2-digit"}),
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
          <input ref={ref} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search student, Delima ID, guardian, message…" style={{border:"none",boxShadow:"none",padding:0,background:"transparent",fontSize:15,fontWeight:700,flex:1,borderRadius:0,transform:"none"}}/>
          <button onClick={onClose} style={{background:"var(--p)",color:"#fff",border:"none",borderRadius:10,padding:"5px 12px",fontSize:12,fontWeight:800,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>✕</button>
        </div>
        <div style={{maxHeight:340,overflowY:"auto"}}>
          {q.length<2 && <div style={{padding:"32px 16px",textAlign:"center"}}><div style={{fontSize:36,marginBottom:8}}>✨</div><p style={{fontFamily:"Fredoka,sans-serif",fontSize:17,color:"var(--p)",fontWeight:600}}>Type to search…</p><p style={{fontSize:12,color:"var(--i3)",marginTop:4,fontWeight:600}}>Student name, Delima ID, guardian, or message</p></div>}
          {q.length>=2 && res.length===0 && <div style={{padding:"28px 16px",textAlign:"center",color:"var(--i3)",fontWeight:700}}>😔 No results for "{q}"</div>}
          {res.map((r,i)=>(
            <button key={i} onClick={()=>{nav(r.type==="murid"?"murid":"log");onClose();}} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"12px 16px",background:"none",border:"none",borderBottom:"2px solid var(--pm)",cursor:"pointer",textAlign:"left"}}>
              <span style={{fontSize:22,background:r.type==="murid"?"var(--ps)":"var(--bs)",border:"2px solid var(--bdc)",borderRadius:12,width:38,height:38,display:"flex",alignItems:"center",justifyContent:"center"}}>{r.type==="murid"?"👤":"📩"}</span>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--ink)"}}>{r.label}</p>
                <p style={{fontSize:11,color:"var(--i3)",fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{r.sub}</p>
              </div>
              <span style={{fontSize:10,fontWeight:800,color:"var(--p)",background:"var(--ps)",border:"2px solid var(--p)",borderRadius:99,padding:"2px 8px"}}>{r.type==="murid"?"STUDENT":"LOG"}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MENU ── */
const MENU = [
  {id:"dashboard", emoji:"🏠",label:"Dashboard",       sub:"Daily overview"},
  {id:"objektif",  emoji:"🎯",label:"Lesson Objectives",sub:"Lesson objectives"},
  {id:"kehadiran", emoji:"📋",label:"Attendance",       sub:"Daily student records"},
  {id:"merit",     emoji:"🏆",label:"Merit & Demerit",  sub:"Reward system"},
  {id:"murid",     emoji:"👥",label:"Student List",     sub:"Profiles & details"},
  {id:"jadual",    emoji:"📅",label:"Timetable",        sub:"Weekly schedule"},
  {id:"log",       emoji:"📩",label:"Parent Log",       sub:"Messages & notices"},
  {id:"laporan",   emoji:"📊",label:"Reports & PDF",    sub:"Export & statistics"},
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
            <img src="/cikgu-anna.jpg" style={{width:48,height:48,borderRadius:"50%",objectFit:"cover",objectPosition:"top",border:"3px solid rgba(255,255,255,.6)",flexShrink:0}} alt="Cikgu Anna"/>
            <div>
              <p style={{color:"rgba(255,255,255,.7)",fontSize:11,fontWeight:700}}>CLASS TEACHER</p>
              <p style={{color:"#fff",fontSize:17,fontWeight:900,fontFamily:"Fredoka,sans-serif"}}>Teacher Anna</p>
              <p style={{color:"rgba(255,255,255,.7)",fontSize:11,fontWeight:600}}>SK Bukit Lalang, Semporna</p>
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
              <p style={{fontSize:13,fontWeight:800,color:"var(--ink)"}}>{dark?"Dark":"Light"} Mode</p>
            </div>
            <button onClick={()=>setDark(!dark)} style={{width:50,height:28,borderRadius:99,border:"3px solid var(--bdc)",background:dark?"var(--p)":"var(--i3)",cursor:"pointer",position:"relative",boxShadow:"2px 2px 0 var(--bdc)",transition:"background .2s"}}>
              <div style={{position:"absolute",top:3,left:dark?24:3,width:18,height:18,borderRadius:"50%",background:"#fff",border:"2px solid var(--bdc)",transition:"left .2s"}}/>
            </button>
          </div>
          <p style={{fontSize:11,fontWeight:700,color:"var(--i2)",fontStyle:"italic"}}>✏️ "Education is the kindling of a flame"</p>
          <p style={{fontSize:10,color:"var(--i3)",marginTop:2,fontWeight:600}}>Teacher Anna's Portal v1.0 · 2026</p>
        </div>
      </div>
    </>
  );
}

/* ── OBJEKTIF P&P ── */
function Objektif({objektif:entries, addObjektif, updateObjektif, deleteObjektif}) {
  const d = getDateInfo();
  const [form, setForm] = useState({tarikh:d.tarikh,hari:d.hari,masa:d.masa,subjek:"",tajuk:"",objektif:"",bbm:""});
  const [tunjuk, setTunjuk] = useState(false);
  const [editId, setEditId] = useState(null);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const simpan = async () => {
    if (!form.subjek || !form.objektif) return;
    const {id:_id, created_at:_c, ...fields} = form;
    if (editId) {
      await updateObjektif(editId, fields);
      setEditId(null);
    } else {
      await addObjektif(fields);
    }
    setForm({tarikh:d.tarikh,hari:d.hari,masa:d.masa,subjek:"",tajuk:"",objektif:"",bbm:""});
    setTunjuk(false);
  };

  const startEdit = e => { setForm({...e}); setEditId(e.id); setTunjuk(true); };
  const padam     = async id => { if(!confirm("Delete this objective?")) return; await deleteObjektif(id); };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>🎯 Lesson <span style={{color:"var(--p)"}}>Objectives</span></p>
          <p style={{fontSize:12,fontWeight:700,color:"var(--i3)",marginTop:2}}>Daily lesson objectives</p>
        </div>
        <button onClick={()=>{setTunjuk(!tunjuk);setEditId(null);setForm({tarikh:d.tarikh,hari:d.hari,masa:d.masa,subjek:"",tajuk:"",objektif:"",bbm:""});}}
          style={{background:"var(--p)",color:"#fff",border:"3px solid var(--bdc)",borderRadius:14,padding:"10px 14px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:"3px 3px 0 var(--bdc)"}}>
          {tunjuk?"✕ Close":"+ New"}
        </button>
      </div>

      {/* Date/Time banner */}
      <div style={{background:"var(--p)",border:"3px solid var(--bdc)",borderRadius:20,boxShadow:"4px 4px 0 var(--bdc)",padding:"14px 16px",display:"flex",alignItems:"center",gap:14}}>
        <span style={{fontSize:30}}>📅</span>
        <div>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:18,fontWeight:700,color:"#fff"}}>{d.hari}, {d.tarikh}</p>
          <p style={{fontSize:13,fontWeight:700,color:"rgba(255,255,255,.8)"}}>🕐 {d.masa} · SK Bukit Lalang, Semporna</p>

        </div>
      </div>

      {/* Form */}
      {tunjuk && (
        <div className="ccard ccard-blue bounce-in">
          <p style={{fontSize:12,fontWeight:900,color:"var(--p)",marginBottom:12,textTransform:"uppercase"}}>
            {editId?"✏️ Edit Objective":"📝 New Lesson Objective"}
          </p>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Day</p>
                <select value={form.hari} onChange={e=>set("hari",e.target.value)}>
                  {["Monday","Tuesday","Wednesday","Thursday","Friday"].map(h=><option key={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Date</p>
                <input value={form.tarikh} onChange={e=>set("tarikh",e.target.value)} placeholder="1 Jan 2026"/>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Time</p>
                <input value={form.masa} onChange={e=>set("masa",e.target.value)} placeholder="8:00 AM"/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Subject *</p>
                <select value={form.subjek} onChange={e=>set("subjek",e.target.value)}>
                  <option value="">-- Select --</option>
                  {["Malay","Maths","Science","English","Islamic Studies","History","PE","Home Ec","Music","Moral Ed","Co-Curricular"].map(s=><option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Lesson Topic</p>
                <input value={form.tajuk} onChange={e=>set("tajuk",e.target.value)} placeholder="Topic…"/>
              </div>
            </div>
            <div>
              <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Learning Objective *</p>
              <p style={{fontSize:10,color:"var(--i3)",fontWeight:600,marginBottom:6}}>By the end of the lesson, students can…</p>
              <textarea rows={3} value={form.objektif} onChange={e=>set("objektif",e.target.value)} placeholder="Students can…" style={{resize:"none"}}/>
            </div>
            <div>
              <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:5}}>Teaching Aids / Resources</p>
              <input value={form.bbm} onChange={e=>set("bbm",e.target.value)} placeholder="Textbook, flashcards, projector…"/>
            </div>
            <div style={{display:"flex",gap:8}}>
              <button className="cbtn cbtn-blue" onClick={simpan}>{editId?"💾 Update":"✅ Save Objective"}</button>
              <button className="cbtn cbtn-white" style={{width:"auto",padding:"13px 18px"}} onClick={()=>{setTunjuk(false);setEditId(null);}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{display:"flex",flexDirection:"column",gap:12}}>
        {entries.length===0 && <div style={{textAlign:"center",padding:"32px 0",color:"var(--i3)",fontWeight:700}}>📭 No objectives yet. Add one!</div>}
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
                <p style={{fontSize:11,fontWeight:900,color:"var(--i2)",textTransform:"uppercase",letterSpacing:".4px",marginBottom:4}}>Learning Objective</p>
                <p style={{fontSize:13,fontWeight:600,color:"var(--ink)",lineHeight:1.6,marginBottom:e.bbm?10:0}}>{e.objektif}</p>
                {e.bbm && (
                  <div style={{background:"var(--ys)",border:"2px solid #C09010",borderRadius:10,padding:"6px 10px"}}>
                    <p style={{fontSize:11,fontWeight:800,color:"#B45309"}}>📎 Teaching Aids: <span style={{fontWeight:600,color:"var(--ink)"}}>{e.bbm}</span></p>
                  </div>
                )}
              </div>
              <div style={{display:"flex",gap:8,padding:"0 14px 12px"}}>
                <button onClick={()=>startEdit(e)} style={{flex:1,padding:"8px",background:"var(--ys)",border:"2px solid #9A7008",borderRadius:10,color:"#B45309",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:12,cursor:"pointer"}}>✏️ Edit</button>
                <button onClick={()=>padam(e.id)}  style={{flex:1,padding:"8px",background:"var(--ps)",border:"2px solid var(--p)",borderRadius:10,color:"var(--p)",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:12,cursor:"pointer"}}>🗑️ Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── TAMBAH/EDIT MURID MODAL ── */
function MuridModal({data,onSave,onClose,count,activeKelas}) {
  const isEdit = !!data?.id;
  const [f,setF] = useState(data||{nama:"",delima:"",jantina:"L",ic:"",wali:"",tel:"",hadir:0,absen:0,merit:0,demerit:0,catatan:"",kelas:activeKelas||"6 Adil"});
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(10,22,40,.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div className="slide-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"var(--wh)",border:"3px solid var(--bdc)",borderRadius:"24px 24px 0 0",boxShadow:"0 -6px 0 var(--bdc)",maxHeight:"90vh",display:"flex",flexDirection:"column"}}>
        {/* Header — fixed */}
        <div style={{flexShrink:0}}>
          <div style={{padding:"12px 16px 0",display:"flex",justifyContent:"center"}}><div style={{width:40,height:5,borderRadius:99,background:"var(--pm)"}}/></div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 8px",borderBottom:"3px solid var(--bdc)"}}>
            <p style={{fontFamily:"Fredoka,sans-serif",fontSize:18,fontWeight:700,color:"var(--ink)"}}>{isEdit?"✏️ Edit Student":"➕ Add New Student"}</p>
            <button onClick={onClose} style={{background:"var(--ps)",border:"2px solid var(--p)",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:14,color:"var(--p)",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>✕</button>
          </div>
        </div>
        {/* Scrollable content */}
        <div style={{flex:1,overflowY:"auto",padding:"16px",display:"flex",flexDirection:"column",gap:12}}>
          <div>
            <p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Class / Kelas *</p>
            <div style={{display:"flex",gap:6}}>
              {KELAS_LIST.map(k=>(
                <button key={k} onClick={()=>set("kelas",k)} style={{flex:1,padding:"9px 4px",border:`3px solid ${f.kelas===k?"var(--p)":"var(--bdc)"}`,borderRadius:12,background:f.kelas===k?"var(--p)":"var(--wh)",color:f.kelas===k?"#fff":"var(--ink)",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:12,cursor:"pointer",boxShadow:f.kelas===k?"3px 3px 0 var(--p2)":"3px 3px 0 var(--bdc)"}}>
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Full Name *</p><input value={f.nama} onChange={e=>set("nama",e.target.value)} placeholder="Student's full name…"/></div>
          <div>
            <p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Delima ID</p>
            <input value={f.delima} onChange={e=>set("delima",e.target.value)} placeholder="m-XXXXXXXX@moe-dl.edu.my" style={{fontFamily:"JetBrains Mono,monospace"}}/>
          </div>
          <div>
            <p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Gender *</p>
            <div style={{display:"flex",gap:8}}>
              {["L","P"].map(j=>(
                <button key={j} onClick={()=>set("jantina",j)} style={{flex:1,padding:"10px",border:`3px solid ${f.jantina===j?"var(--p)":"var(--bdc)"}`,borderRadius:14,background:f.jantina===j?"var(--p)":"var(--wh)",color:f.jantina===j?"#fff":"var(--ink)",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:14,cursor:"pointer",boxShadow:f.jantina===j?"3px 3px 0 var(--p2)":"3px 3px 0 var(--bdc)"}}>
                  {j==="L"?"👦 Male":"👧 Female"}
                </button>
              ))}
            </div>
          </div>
          <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>IC No.</p><input value={f.ic} onChange={e=>set("ic",e.target.value)} placeholder="XXXXXX-XX-XXXX"/></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Guardian Name *</p><input value={f.wali} onChange={e=>set("wali",e.target.value)} placeholder="Guardian name…"/></div>
            <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Guardian Tel *</p><input value={f.tel} onChange={e=>set("tel",e.target.value)} placeholder="01XXXXXXXX"/></div>
          </div>
          {isEdit && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[["hadir","Days Present"],["absen","Days Absent"],["merit","Merit"],["demerit","Demerit"]].map(([k,l])=>(
                <div key={k}><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>{l}</p><input type="number" value={f[k]} onChange={e=>set(k,+e.target.value)} min="0"/></div>
              ))}
            </div>
          )}
          <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>Teacher's Note</p><textarea rows={2} value={f.catatan} onChange={e=>set("catatan",e.target.value)} placeholder="Notes…" style={{resize:"none"}}/></div>
        </div>
        {/* Buttons — always visible at bottom */}
        <div style={{flexShrink:0,borderTop:"3px solid var(--bdc)",padding:"12px 16px",display:"flex",gap:10,background:"var(--wh)"}}>
          <button className="cbtn cbtn-blue" onClick={()=>{
            if(!f.nama||!f.wali||!f.tel){alert("Please fill in name, guardian, and phone number.");return;}
            onSave({...f,id:data?.id||Date.now(),no:data?.no||String(count+1).padStart(2,"0")});
          }}>{isEdit?"💾 Save":"➕ Add Student"}</button>
          <button className="cbtn cbtn-white" style={{width:"auto",padding:"13px 18px"}} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ── WHATSAPP MODAL ── */
function WAModal({murid,onClose}) {
  const [pilih,setPilih] = useState([]);
  const [teks,setTeks]   = useState("Dear parent, this is a notice from Teacher Anna, SK Bukit Lalang, Semporna.");
  const toggle = id => setPilih(p=>p.includes(id)?p.filter(x=>x!==id):[...p,id]);
  const openWA = m => {
    const msg = encodeURIComponent(`${teks}\n\nTo: ${m.wali}\nStudent: ${m.nama} (No.${m.no})\n\nThank you. 🙏`);
    window.open(`https://wa.me/60${m.tel.replace(/^0/,"")}?text=${msg}`,"_blank");
  };
  const templates = [
    ["Attendance reminder","Your child's attendance needs attention. Please ensure consistent school attendance."],
    ["Demerit warning","Your child has received demerit points. Please discuss school behaviour with your child."],
    ["PIBG invitation","You are invited to the PIBG meeting this Saturday at 9am. Your presence is most welcome."],
    ["Upcoming exam","The exam will take place next week. Please ensure your child is prepared."],
  ];
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,zIndex:400,background:"rgba(10,22,40,.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"flex-end",justifyContent:"center"}}>
      <div className="slide-up" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:430,background:"var(--wh)",border:"3px solid var(--bdc)",borderRadius:"24px 24px 0 0",boxShadow:"0 -6px 0 var(--bdc)",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{padding:"12px 16px 0",display:"flex",justifyContent:"center"}}><div style={{width:40,height:5,borderRadius:99,background:"var(--pm)"}}/></div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 16px 8px",borderBottom:"3px solid var(--bdc)"}}>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:18,fontWeight:700,color:"var(--ink)"}}>📬 WhatsApp Notification</p>
          <button onClick={onClose} style={{background:"var(--ps)",border:"2px solid var(--p)",borderRadius:10,width:32,height:32,cursor:"pointer",fontSize:14,color:"var(--p)",fontWeight:800,fontFamily:"Nunito,sans-serif"}}>✕</button>
        </div>
        <div style={{padding:"16px",display:"flex",flexDirection:"column",gap:14}}>
          <div><p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:6}}>📝 Message Text</p><textarea rows={3} value={teks} onChange={e=>setTeks(e.target.value)} style={{resize:"none",fontSize:13}}/></div>
          <div>
            <p style={{fontSize:12,fontWeight:800,color:"var(--i2)",marginBottom:8}}>Quick templates:</p>
            <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
              {templates.map(([l,t])=><button key={l} onClick={()=>setTeks(t)} style={{padding:"6px 12px",border:"2px solid var(--bdc)",borderRadius:99,background:"var(--bg)",color:"var(--ink)",fontSize:11,fontWeight:700,cursor:"pointer",boxShadow:"2px 2px 0 var(--bdc)"}}>{l}</button>)}
            </div>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <p style={{fontSize:12,fontWeight:800,color:"var(--i2)"}}>Select recipients:</p>
              <div style={{display:"flex",gap:6}}>
                <button onClick={()=>setPilih(murid.filter(m=>m.absen>=5).map(m=>m.id))} style={{fontSize:11,fontWeight:800,color:"var(--p)",background:"var(--ps)",border:"2px solid var(--p)",borderRadius:99,padding:"4px 10px",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>Absent ≥5</button>
                <button onClick={()=>setPilih(murid.map(m=>m.id))} style={{fontSize:11,fontWeight:800,color:"var(--g)",background:"var(--gs)",border:"2px solid var(--g)",borderRadius:99,padding:"4px 10px",cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>All</button>
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
              <p style={{fontSize:12,fontWeight:900,color:"var(--g)",marginBottom:10}}>🤳 Send to {pilih.length} guardian(s):</p>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {murid.filter(m=>pilih.includes(m.id)).map(m=>(
                  <button key={m.id} onClick={()=>openWA(m)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 14px",background:"#25D366",border:"3px solid #1DA851",borderRadius:14,cursor:"pointer",boxShadow:"3px 3px 0 #1DA851"}}>
                    <span style={{fontSize:20}}>📬</span>
                    <div style={{flex:1,textAlign:"left"}}><p style={{fontSize:13,fontWeight:900,color:"#fff"}}>{m.wali.split(" ").slice(0,2).join(" ")}</p><p style={{fontSize:10,color:"rgba(255,255,255,.8)",fontWeight:600}}>{m.nama.split(" ")[0]} · {m.tel}</p></div>
                    <span style={{fontSize:11,fontWeight:900,color:"#fff"}}>Open WA →</span>
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
function Dashboard({murid,log,kh,setWA,activeKelas}) {
  const hadir  = murid.filter(m=>(kh[m.id]||"hadir")==="hadir").length;
  const notif  = log.filter(l=>l.status==="belum balas").length;
  const cem    = murid.filter(m=>m.merit>=100).length;
  const pantau = murid.filter(m=>m.absen>=7||m.demerit>=15);
  const g = getGreeting();
  const d = getDateInfo();
  return (
    <div style={{display:"flex",flexDirection:"column",gap:18}}>
      <div style={{background:"var(--p)",border:"3px solid var(--bdc)",borderRadius:24,boxShadow:"5px 5px 0 var(--bdc)",padding:"18px 18px 0",overflow:"hidden",position:"relative"}}>
        <img src="/cikgu-anna.jpg" style={{position:"absolute",top:-10,right:-8,width:110,height:110,borderRadius:"50%",objectFit:"cover",objectPosition:"top",border:"3px solid rgba(255,255,255,.3)",opacity:.9,pointerEvents:"none"}} alt="Cikgu Anna"/>
        <p style={{color:"rgba(255,255,255,.8)",fontSize:12,fontWeight:700}}>📅 {d.hari}, {d.tarikh}</p>
        <p style={{fontFamily:"Fredoka,sans-serif",fontSize:24,fontWeight:700,color:"#fff",marginTop:2,lineHeight:1.2}}>{g.e} {g.t}, Teacher Anna!</p>
        <p style={{color:"rgba(255,255,255,.8)",fontSize:12,fontWeight:600,marginTop:2,marginBottom:14}}>Tahun {activeKelas} · SK Bukit Lalang, Semporna</p>
        <svg style={{display:"block",width:"100%",height:18,marginBottom:-1}} viewBox="0 0 300 18" preserveAspectRatio="none">
          <path d="M0,8 C60,0 120,18 180,8 C240,0 280,14 300,8 L300,18 L0,18 Z" fill="var(--bg)"/>
        </svg>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Blob icon="👥" val={murid.length} label="Total Students"       bg="var(--wh)"  color="var(--ink)"/>
        <Blob icon="✅" val={hadir}         label={`Present · ${murid.length-hadir} absent`} bg="var(--gs)" color="var(--g)"  border="var(--g)"/>
        <Blob icon="🏆" val={cem}           label="Excellent Students"  bg="var(--ys)"  color="#B45309"    border="#B45309"/>
        <Blob icon="📩" val={notif}         label="Unanswered Messages" bg="var(--ps)"  color="var(--p)"   border="var(--p)"/>
      </div>
      <button className="cbtn" onClick={()=>setWA(true)} style={{background:"#25D366",border:"3px solid #1DA851",color:"#fff",boxShadow:"4px 4px 0 #1DA851"}}>📬 Send WhatsApp Notification to Guardians</button>
      {/* Ranking */}
      <div className="ccard" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--y)",padding:"10px 16px",borderBottom:"3px solid var(--bdc)",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:18}}>🏆</span>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:15,fontWeight:700,color:"var(--ink)"}}>Class Merit Ranking</p>
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
          <p style={{fontSize:13,fontWeight:900,color:"var(--p)",marginBottom:12}}>🚨 STUDENTS NEEDING ATTENTION</p>
          {pantau.map(m=>(
            <div key={m.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
              <Ava nama={m.nama} jantina={m.jantina} size={36}/>
              <div><p style={{fontSize:13,fontWeight:800,color:"var(--ink)"}}>{m.nama.split(" ").slice(0,2).join(" ")}</p><p style={{fontSize:11,color:"var(--p)",fontWeight:700}}>Absent {m.absen} days · Demerit {m.demerit}</p></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── KEHADIRAN ── */
function Kehadiran({murid}) {
  const [kh,setKh]     = useState({});
  const [q,setQ]       = useState("");
  const [saved,setSaved]= useState(false);
  const todayStr = (() => { const d=new Date(); return `${d.getDate()} ${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][d.getMonth()]} ${d.getFullYear()}`; })();

  useEffect(()=>{
    supabase.from("kehadiran").select("*").eq("tarikh",todayStr).then(({data})=>{
      if(data?.length){ const m={}; data.forEach(r=>{m[r.murid_id]=r.status;}); setKh(m); }
    });
  },[todayStr]);

  const cycle = id => setKh(p=>({...p,[id]:p[id]==="present"?"absent":p[id]==="absent"?"mc":"present"}));
  const si = s => ({
    present:{label:"✅ Present", bg:"var(--gs)",color:"var(--g)",bc:"var(--g)"},
    absent: {label:"❌ Absent",  bg:"var(--ps)",color:"var(--p)",bc:"var(--p)"},
    mc:     {label:"🏥 MC/Leave",bg:"var(--ys)",color:"#B45309",bc:"#B45309"},
  }[s]||{label:"✅ Present",bg:"var(--gs)",color:"var(--g)",bc:"var(--g)"});
  const filtered = murid.filter(m=>m.nama.toLowerCase().includes(q.toLowerCase())||m.no.includes(q));
  const c={present:0,absent:0,mc:0};
  murid.forEach(m=>{const s=kh[m.id]||"present";c[s]=(c[s]||0)+1;});
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>📋 Daily <span style={{color:"var(--p)"}}>Attendance</span></p>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[{k:"present",icon:"✅",label:"Present",color:"var(--g)",bg:"var(--gs)",bc:"var(--g)"},{k:"absent",icon:"❌",label:"Absent",color:"var(--p)",bg:"var(--ps)",bc:"var(--p)"},{k:"mc",icon:"🏥",label:"MC",color:"#B45309",bg:"var(--ys)",bc:"#B45309"}].map(ct=>(
          <div key={ct.k} style={{background:ct.bg,border:`3px solid ${ct.bc}`,borderRadius:18,boxShadow:`3px 3px 0 ${ct.bc}`,padding:"12px 8px",textAlign:"center"}}>
            <p style={{fontSize:20}}>{ct.icon}</p>
            <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:22,fontWeight:700,color:ct.color}}>{c[ct.k]||0}</p>
            <p style={{fontSize:10,fontWeight:800,color:"var(--i2)"}}>{ct.label}</p>
          </div>
        ))}
      </div>
      <input placeholder="🔍 Search name or number…" value={q} onChange={e=>setQ(e.target.value)}/>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(m=>{
          const s=kh[m.id]||"hadir";const info=si(s);
          return (
            <button key={m.id} onClick={()=>cycle(m.id)} style={{display:"flex",alignItems:"center",gap:12,background:"var(--wh)",border:"3px solid var(--bdc)",borderRadius:18,padding:"12px 14px",cursor:"pointer",textAlign:"left",boxShadow:"3px 3px 0 var(--bdc)"}}>
              <Ava nama={m.nama} jantina={m.jantina} size={42}/>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:800,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:"var(--ink)"}}>{m.nama}</p>
                <p style={{fontSize:11,color:"var(--i3)",fontWeight:600,marginTop:1}}>No.{m.no} · Tap to change</p>
              </div>
              <span className="cpill" style={{background:info.bg,color:info.color,borderColor:info.bc,fontSize:10}}>{info.label}</span>
            </button>
          );
        })}
      </div>
      <button className={`cbtn ${saved?"cbtn-green":"cbtn-blue"}`} onClick={async()=>{
        const rows = murid.map(m=>({murid_id:m.id, tarikh:todayStr, status:kh[m.id]||"present"}));
        await supabase.from("kehadiran").upsert(rows,{onConflict:"murid_id,tarikh"});
        setSaved(true); setTimeout(()=>setSaved(false),2200);
      }}>
        {saved?"✅ Saved!":"💾 Save Attendance"}
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
      <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>🏆 Merit <span style={{color:"var(--p)"}}>System</span></p>
      <div style={{display:"flex",background:"var(--bg)",border:"3px solid var(--bdc)",borderRadius:18,padding:4,boxShadow:"3px 3px 0 var(--bdc)"}}>
        {[["merit","✅ Merit","var(--g)","#04855A"],["demerit","⚠️ Demerit","var(--p)","var(--p2)"]].map(([t,l,bg,sh])=>(
          <button key={t} onClick={()=>setMode(t)} style={{flex:1,padding:"10px",border:mode===t?"3px solid var(--bdc)":"3px solid transparent",borderRadius:14,cursor:"pointer",fontFamily:"Nunito,sans-serif",fontSize:13,fontWeight:900,background:mode===t?bg:"transparent",color:mode===t?"#fff":"var(--i2)",boxShadow:mode===t?`2px 2px 0 ${sh}`:"none",transition:"all .18s"}}>{l}</button>
        ))}
      </div>
      <input placeholder="🔍 Search student…" value={q} onChange={e=>setQ(e.target.value)}/>
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
          <p style={{fontSize:11,fontWeight:900,color:mode==="merit"?"var(--g)":"var(--p)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:4}}>{mode==="merit"?"✅ Merit":"⚠️ Demerit"} for:</p>
          <p style={{fontSize:15,fontWeight:900,marginBottom:12,color:"var(--ink)"}}>{murid.find(m=>m.id===pilih)?.nama}</p>
          <select value={sebab} onChange={e=>setSebab(e.target.value)} style={{marginBottom:12}}>
            <option value="">-- Select reason --</option>
            {(mode==="merit"?MERIT_SEBAB:DEMERIT_SEBAB).map(s=><option key={s}>{s}</option>)}
          </select>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            {[1,3,5,10].map(n=>(
              <button key={n} onClick={()=>setMarkah(n)} style={{flex:1,height:46,border:`3px solid ${markah===n?(mode==="merit"?"var(--g)":"var(--p)"):"var(--bdc)"}`,borderRadius:14,background:markah===n?(mode==="merit"?"var(--g)":"var(--p)"):"var(--wh)",color:markah===n?"#fff":"var(--ink)",fontFamily:"JetBrains Mono,monospace",fontSize:18,fontWeight:700,cursor:"pointer",boxShadow:`3px 3px 0 ${markah===n?(mode==="merit"?"#04855A":"var(--p2)"):"var(--bdc)"}`,transition:"all .15s"}}>{n}</button>
            ))}
          </div>
          <button className={`cbtn ${ok?"cbtn-green":mode==="merit"?"cbtn-green":"cbtn-blue"}`} onClick={submit}>
            {ok?"🎉 Done!":`Record +${markah} ${mode==="merit"?"Merit":"Demerit"}`}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── SENARAI MURID ── */
function SenaraiMurid({murid,saveMurid,deleteMurid}) {
  const [q,setQ]         = useState("");
  const [pilih,setPilih] = useState(null);
  const [sort,setSort]   = useState("no");
  const [modal,setModal] = useState(null);
  const [activeKelas,setActiveKelas] = useState("6 Adil");
  const save = async data => {
    await saveMurid(data);
    setModal(null);setPilih(null);setActiveKelas(data.kelas||activeKelas);
  };
  const hapus = async id=>{if(!confirm("Delete this student?"))return;await deleteMurid(id);setPilih(null);};
  const kelasMurid = murid.filter(m=>m.kelas===activeKelas);
  const filtered=[...kelasMurid].filter(m=>
    m.nama.toLowerCase().includes(q.toLowerCase())||
    m.wali.toLowerCase().includes(q.toLowerCase())||
    m.no.includes(q)||
    (m.delima||"").includes(q)
  ).sort((a,b)=>sort==="no"?a.no.localeCompare(b.no):sort==="merit"?netMerit(b)-netMerit(a):b.hadir-a.hadir);
  const sel = murid.find(m=>m.id===pilih);
  return (
    <>
      {modal&&<MuridModal data={modal==="tambah"?null:modal} onSave={save} onClose={()=>setModal(null)} count={murid.length} activeKelas={activeKelas}/>}
      <div style={{display:"flex",flexDirection:"column",gap:16}}>
        {sel?(
          <div className="fade-up" style={{display:"flex",flexDirection:"column",gap:14}}>
            <button onClick={()=>setPilih(null)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--p)",fontWeight:900,fontSize:13,textAlign:"left"}}>← Back</button>
            <div className="ccard" style={{textAlign:"center",padding:"24px 20px"}}>
              <Ava nama={sel.nama} jantina={sel.jantina} size={76}/>
              <p style={{fontFamily:"Fredoka,sans-serif",fontSize:20,fontWeight:700,marginTop:12,color:"var(--ink)"}}>{sel.nama}</p>
              <div style={{display:"flex",justifyContent:"center",gap:6,marginTop:6,flexWrap:"wrap"}}>
                <span className="cpill" style={{color:"var(--i2)",borderColor:"var(--bdc)",background:"var(--bg)"}}>No.{sel.no}</span>
                <span className="cpill" style={{color:"var(--i2)",borderColor:"var(--bdc)",background:"var(--bg)"}}>{sel.jantina==="L"?"👦 Male":"👧 Female"}</span>
                {(()=>{const st=muridStatus(sel);return <span className="cpill" style={{color:st.color,borderColor:st.bc||st.color,background:st.bg}}>{st.label}</span>;})()}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              {[
                {l:"No. IC",     v:sel.ic||"-",           m:true},
                {l:"ID Delima",  v:sel.delima||"-",        m:true},
                {l:"Guardian",     v:sel.wali.split(" ").slice(0,3).join(" ")},
                {l:"Guardian Tel", v:sel.tel,              m:true},
              ].map(f=>(
                <div key={f.l} className="ccard" style={{padding:"10px 12px"}}>
                  <p style={{fontSize:10,fontWeight:800,color:"var(--i3)",textTransform:"uppercase",letterSpacing:".4px"}}>{f.l}</p>
                  <p style={{fontSize:13,fontWeight:800,marginTop:4,color:"var(--ink)",fontFamily:f.m?"JetBrains Mono,monospace":"Nunito,sans-serif"}}>{f.v}</p>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              <Blob icon="📗" val={sel.hadir}    label="Days Present" bg="var(--gs)" color="var(--g)"  border="var(--g)"/>
              <Blob icon="📕" val={sel.absen}    label="Days Absent"  bg="var(--ps)" color="var(--p)"  border="var(--p)"/>
              <Blob icon="🏅" val={netMerit(sel)} label="Net Merit"   bg="var(--ys)" color="#B45309"   border="#B45309"/>
            </div>
            {sel.catatan&&(
              <div className="ccard ccard-yellow">
                <p style={{fontSize:11,fontWeight:900,color:"#B45309",marginBottom:4}}>📝 Note</p>
                <p style={{fontSize:13,fontStyle:"italic",fontWeight:600,color:"var(--ink)"}}>{sel.catatan}</p>
              </div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button className="cbtn cbtn-yellow" style={{flex:2,padding:"12px"}} onClick={()=>setModal(sel)}>✏️ Edit</button>
              <button onClick={()=>{const msg=encodeURIComponent(`Dear ${sel.wali}, this is a message from Teacher Anna, SK Bukit Lalang, Semporna regarding ${sel.nama}.`);window.open(`https://wa.me/60${sel.tel.replace(/^0/,"")}?text=${msg}`,"_blank");}}
                style={{flex:2,padding:"12px",background:"#25D366",border:"3px solid #1DA851",borderRadius:14,color:"#fff",fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:13,cursor:"pointer",boxShadow:"3px 3px 0 #1DA851"}}>📬 WA</button>
              <button className="cbtn" style={{flex:1,padding:"12px",background:"var(--ps)",color:"var(--p)",borderColor:"var(--p)",boxShadow:"3px 3px 0 var(--p2)"}} onClick={()=>hapus(sel.id)}>🗑️</button>
            </div>
          </div>
        ):(
          <>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>👥 Student <span style={{color:"var(--p)"}}>List</span></p>
              <button onClick={()=>setModal("tambah")} style={{background:"var(--p)",color:"#fff",border:"3px solid var(--bdc)",borderRadius:14,padding:"10px 14px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:"3px 3px 0 var(--bdc)"}}>+ Add</button>
            </div>
            <div style={{display:"flex",gap:8,overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none"}}>
              {KELAS_LIST.map(k=>{
                const sel=activeKelas===k;
                return (
                  <button key={k} onClick={()=>{setActiveKelas(k);setPilih(null);setQ("");}} style={{flexShrink:0,padding:"8px 18px",border:`3px solid ${sel?"var(--p)":"var(--bdc)"}`,borderRadius:99,background:sel?"var(--p)":"var(--wh)",color:sel?"#fff":"var(--ink)",fontFamily:"Nunito,sans-serif",fontWeight:900,fontSize:12,cursor:"pointer",boxShadow:`2px 2px 0 ${sel?"var(--p2)":"var(--bdc)"}`,whiteSpace:"nowrap"}}>
                    {sel?"✦ ":""}{k} <span style={{opacity:.7,fontSize:10}}>({murid.filter(m=>m.kelas===k).length})</span>
                  </button>
                );
              })}
            </div>
            <p style={{fontSize:12,fontWeight:700,color:"var(--i3)"}}>{filtered.length} students</p>
            <input placeholder="🔍 Search name, Delima ID, guardian…" value={q} onChange={e=>setQ(e.target.value)}/>
            <div style={{display:"flex",gap:6}}>
              {[["no","# No"],["merit","Merit"],["hadir","Present"]].map(([k,l])=>(
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
                      <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:11,color:"var(--i3)",marginTop:4}}>{netMerit(m)} pts</p>
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
function Jadual({jadual,addJadual,updateJadual,deleteJadual}) {
  const HARI=["Monday","Tuesday","Wednesday","Thursday","Friday"];
  const [aktif,setAktif]=useState("Monday");
  const [editId,setEditId]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({masa:"7:30",subjek:""});
  const setF=(k,v)=>setForm(p=>({...p,[k]:v}));

  const slots=[...jadual].filter(s=>s.hari===aktif).sort((a,b)=>a.urutan-b.urutan);

  const openEdit=(s)=>{setEditId(s.id);setForm({masa:s.masa,subjek:s.subjek});setShowAdd(false);};
  const openAdd=()=>{setShowAdd(true);setEditId(null);setForm({masa:"7:30",subjek:""}); };
  const cancel=()=>{setEditId(null);setShowAdd(false);setForm({masa:"7:30",subjek:""});};

  const save=async()=>{
    if(!form.subjek.trim())return;
    if(editId){
      await updateJadual(editId,{masa:form.masa,subjek:form.subjek.trim()});
    } else {
      await addJadual({hari:aktif,urutan:slots.length,masa:form.masa,subjek:form.subjek.trim()});
    }
    cancel();
  };

  const hapus=async(id)=>{if(!confirm("Delete this slot?"))return;await deleteJadual(id);};

  const SUBJEK_LIST=Object.keys(SUBJ_META).filter(s=>s!=="BREAK");

  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>📅 Weekly <span style={{color:"var(--p)"}}>Timetable</span></p>
        <button onClick={openAdd} style={{background:"var(--p)",color:"#fff",border:"3px solid var(--bdc)",borderRadius:14,padding:"9px 14px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:"3px 3px 0 var(--bdc)"}}>+ Add Slot</button>
      </div>
      <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4,scrollbarWidth:"none"}}>
        {HARI.map(h=>(
          <button key={h} onClick={()=>{setAktif(h);cancel();}} style={{whiteSpace:"nowrap",padding:"8px 16px",border:"3px solid var(--bdc)",borderRadius:14,background:aktif===h?"var(--p)":"var(--wh)",color:aktif===h?"#fff":"var(--ink)",fontSize:12,fontWeight:900,cursor:"pointer",flexShrink:0,boxShadow:aktif===h?"3px 3px 0 var(--p2)":"3px 3px 0 var(--bdc)"}}>{h}</button>
        ))}
      </div>

      {/* Add form */}
      {showAdd&&(
        <div className="ccard ccard-blue bounce-in" style={{display:"flex",flexDirection:"column",gap:10}}>
          <p style={{fontSize:12,fontWeight:900,color:"var(--p)",textTransform:"uppercase"}}>➕ Add Slot — {aktif}</p>
          <div style={{display:"flex",gap:8}}>
            <div style={{flex:1}}>
              <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:4}}>Time</p>
              <input value={form.masa} onChange={e=>setF("masa",e.target.value)} placeholder="7:30"/>
            </div>
            <div style={{flex:2}}>
              <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:4}}>Subject</p>
              <input value={form.subjek} onChange={e=>setF("subjek",e.target.value)} placeholder="Subject name…"/>
            </div>
          </div>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {SUBJEK_LIST.map(s=>(
              <button key={s} onClick={()=>setF("subjek",s)} style={{padding:"5px 10px",border:"2px solid var(--bdc)",borderRadius:99,background:form.subjek===s?"var(--p)":"var(--wh)",color:form.subjek===s?"#fff":"var(--ink)",fontSize:11,fontWeight:700,cursor:"pointer"}}>{s}</button>
            ))}
            <button onClick={()=>setF("subjek","BREAK")} style={{padding:"5px 10px",border:"2px solid var(--bdc)",borderRadius:99,background:form.subjek==="BREAK"?"#94A3B8":"var(--wh)",color:form.subjek==="BREAK"?"#fff":"var(--ink)",fontSize:11,fontWeight:700,cursor:"pointer"}}>🍱 BREAK</button>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button className="cbtn cbtn-blue" style={{padding:"10px"}} onClick={save}>➕ Add</button>
            <button className="cbtn cbtn-white" style={{width:"auto",padding:"10px 16px"}} onClick={cancel}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {slots.length===0&&<p style={{textAlign:"center",color:"var(--i3)",fontWeight:700,padding:"24px 0"}}>No slots for {aktif}. Add one above.</p>}
        {slots.map(s=>{
          const isR=s.subjek==="BREAK";
          const meta=SUBJ_META[s.subjek]||{emoji:"📚",color:"var(--p)",bg:"var(--ps)"};
          const isEdit=editId===s.id;
          return (
            <div key={s.id}>
              {isEdit?(
                <div className="ccard bounce-in" style={{display:"flex",flexDirection:"column",gap:10}}>
                  <p style={{fontSize:12,fontWeight:900,color:"var(--p)",textTransform:"uppercase"}}>✏️ Edit Slot</p>
                  <div style={{display:"flex",gap:8}}>
                    <div style={{flex:1}}>
                      <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:4}}>Time</p>
                      <input value={form.masa} onChange={e=>setF("masa",e.target.value)}/>
                    </div>
                    <div style={{flex:2}}>
                      <p style={{fontSize:11,fontWeight:800,color:"var(--i2)",marginBottom:4}}>Subject</p>
                      <input value={form.subjek} onChange={e=>setF("subjek",e.target.value)}/>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    {SUBJEK_LIST.map(sub=>(
                      <button key={sub} onClick={()=>setF("subjek",sub)} style={{padding:"5px 10px",border:"2px solid var(--bdc)",borderRadius:99,background:form.subjek===sub?"var(--p)":"var(--wh)",color:form.subjek===sub?"#fff":"var(--ink)",fontSize:11,fontWeight:700,cursor:"pointer"}}>{sub}</button>
                    ))}
                    <button onClick={()=>setF("subjek","BREAK")} style={{padding:"5px 10px",border:"2px solid var(--bdc)",borderRadius:99,background:form.subjek==="BREAK"?"#94A3B8":"var(--wh)",color:form.subjek==="BREAK"?"#fff":"var(--ink)",fontSize:11,fontWeight:700,cursor:"pointer"}}>🍱 BREAK</button>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button className="cbtn cbtn-blue" style={{padding:"10px"}} onClick={save}>💾 Save</button>
                    <button className="cbtn cbtn-white" style={{width:"auto",padding:"10px 16px"}} onClick={cancel}>Cancel</button>
                  </div>
                </div>
              ):(
                <div style={{display:"flex",alignItems:"center",gap:12,background:isR?"var(--bg)":meta.bg,border:`3px solid ${isR?"var(--pm)":"var(--bdc)"}`,borderRadius:18,padding:"12px 14px",boxShadow:isR?"none":"3px 3px 0 var(--bdc)",opacity:isR?.6:1}}>
                  <div style={{width:44,height:44,borderRadius:14,background:isR?"var(--pm)":meta.color,border:isR?"2px dashed var(--i3)":"3px solid var(--bdc)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:isR?"none":"2px 2px 0 var(--bdc)",flexShrink:0}}>{meta.emoji}</div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,fontWeight:isR?600:900,color:isR?"var(--i3)":"var(--ink)",fontStyle:isR?"italic":"normal"}}>{isR?"— Break Time —":s.subjek}</p>
                    {!isR&&<p style={{fontSize:11,color:"var(--i3)",fontWeight:600,marginTop:1}}>40 mins</p>}
                  </div>
                  <p style={{fontFamily:"JetBrains Mono,monospace",fontSize:12,fontWeight:700,color:isR?"var(--i3)":meta.color,flexShrink:0}}>{s.masa}</p>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>openEdit(s)} style={{width:32,height:32,borderRadius:10,border:"2px solid var(--bdc)",background:"var(--wh)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"2px 2px 0 var(--bdc)"}}>✏️</button>
                    <button onClick={()=>hapus(s.id)} style={{width:32,height:32,borderRadius:10,border:"2px solid var(--p)",background:"var(--ps)",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"2px 2px 0 var(--p2)"}}>🗑️</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── LOG IBU BAPA ── */
function Log({log,addLog,updateLog,deleteLog}) {
  const [filter,setFilter]=useState("all");
  const [balas,setBalas]  =useState(null);
  const [teks,setTeks]    =useState("");
  const [baru,setBaru]    =useState(false);
  const [form,setForm]    =useState({murid:"",wali:"",tel:"",jenis:"makluman",mesej:""});
  const jW={enquiry:{bg:"var(--bs)",c:"var(--b)"},notice:{bg:"var(--gs)",c:"var(--g)"},complaint:{bg:"var(--ps)",c:"var(--p)"}};
  const sW={unanswered:{bg:"var(--ps)",c:"var(--p)"},received:{bg:"var(--gs)",c:"var(--g)"},replied:{bg:"var(--bs)",c:"var(--b)"}};
  const shown=filter==="all"?log:log.filter(l=>l.status===filter||l.jenis===filter);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>📩 Parent <span style={{color:"var(--p)"}}>Log</span></p>
          <p style={{fontSize:12,fontWeight:700,color:"var(--i3)",marginTop:2}}>Communication & guardian notices</p>
        </div>
        <button onClick={()=>setBaru(true)} style={{background:"var(--p)",color:"#fff",border:"3px solid var(--bdc)",borderRadius:14,padding:"9px 14px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:"3px 3px 0 var(--bdc)"}}>+ New</button>
      </div>
      {baru&&(
        <div className="ccard ccard-blue bounce-in">
          <p style={{fontSize:12,fontWeight:900,color:"var(--p)",marginBottom:12,textTransform:"uppercase"}}>📢 New Notice</p>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            <input placeholder="Student name" value={form.murid} onChange={e=>setForm(p=>({...p,murid:e.target.value}))}/>
            <input placeholder="Guardian name" value={form.wali} onChange={e=>setForm(p=>({...p,wali:e.target.value}))}/>
            <input placeholder="Guardian tel (01XXXXXXXX)" value={form.tel} onChange={e=>setForm(p=>({...p,tel:e.target.value}))}/>
            <select value={form.jenis} onChange={e=>setForm(p=>({...p,jenis:e.target.value}))}><option value="notice">Notice</option><option value="enquiry">Enquiry</option><option value="complaint">Complaint</option></select>
            <textarea rows={3} placeholder="Message content…" value={form.mesej} onChange={e=>setForm(p=>({...p,mesej:e.target.value}))} style={{resize:"none"}}/>
            <div style={{display:"flex",gap:8}}>
              <button className="cbtn cbtn-blue" style={{padding:"11px"}} onClick={async()=>{if(!form.murid||!form.mesej)return;const d=getDateInfo();await addLog({...form,tarikh:`${d.tarikh}`,status:"received",balasan:""});setBaru(false);setForm({murid:"",wali:"",tel:"",jenis:"notice",mesej:""});}}>Send</button>
              <button className="cbtn cbtn-white" style={{padding:"11px"}} onClick={()=>setBaru(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4}}>
        {["all","unanswered","received","replied","complaint"].map(f=>(
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
                  <p style={{fontSize:11,fontWeight:800,color:"var(--b)"}}>📬 Reply:</p>
                  <p style={{fontSize:12,fontWeight:600,color:"var(--ink)",marginTop:2}}>{l.balasan}</p>
                </div>
              )}
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                {l.status==="belum balas"&&(balas===l.id?(
                  <div style={{flex:1,display:"flex",flexDirection:"column",gap:6}}>
                    <textarea rows={2} placeholder="Write reply…" value={teks} onChange={e=>setTeks(e.target.value)} style={{resize:"none",fontSize:13}}/>
                    <div style={{display:"flex",gap:6}}>
                      <button className="cbtn cbtn-blue" style={{padding:"9px"}} onClick={async()=>{await updateLog(l.id,{status:"replied",balasan:teks});setBalas(null);setTeks("");}}>Send</button>
                      <button className="cbtn cbtn-white" style={{padding:"9px"}} onClick={()=>setBalas(null)}>Cancel</button>
                    </div>
                  </div>
                ):(
                  <button onClick={()=>setBalas(l.id)} style={{background:"none",border:"none",color:"var(--p)",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",padding:0}}>📬 Reply →</button>
                ))}
                {l.tel&&<button onClick={()=>window.open(`https://wa.me/60${l.tel.replace(/^0/,"")}?text=${encodeURIComponent(`Dear ${l.wali}, regarding your message.`)}`,"_blank")} style={{marginLeft:"auto",background:"#25D366",border:"2px solid #1DA851",borderRadius:10,padding:"7px 12px",color:"#fff",fontSize:11,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>📬 WA</button>}
                <button onClick={()=>{if(!confirm("Delete this log?"))return;deleteLog(l.id);}} style={{marginLeft:l.tel?"4px":"auto",background:"var(--ps)",border:"2px solid var(--p)",borderRadius:10,padding:"7px 10px",color:"var(--p)",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif"}}>🗑️</button>
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
        <p style={{fontFamily:"Fredoka,sans-serif",fontSize:22,fontWeight:700,color:"var(--ink)"}}>📊 Class <span style={{color:"var(--p)"}}>Report</span></p>
        <button onClick={()=>window.print()} style={{background:"var(--p)",color:"#fff",border:"3px solid var(--bdc)",borderRadius:14,padding:"10px 14px",fontSize:13,fontWeight:900,cursor:"pointer",fontFamily:"Nunito,sans-serif",boxShadow:"3px 3px 0 var(--bdc)"}}>🖨️ PDF</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <Blob icon="📗" val={`${avgH}`} label="Avg Attendance" bg="var(--gs)" color="var(--g)"  border="var(--g)"/>
        <Blob icon="🏅" val={avgM}       label="Avg Merit"      bg="var(--ys)" color="#B45309"    border="#B45309"/>
        <Blob icon="⭐" val={cem}         label="Excellent"      bg="var(--ps)" color="var(--p)"   border="var(--p)"/>
        <Blob icon="⚠️" val={pantau}      label="Needs Monitor"  bg="var(--bs)" color="var(--b)"   border="var(--b)"/>
      </div>
      {/* Rekod lengkap dengan Delima ID */}
      <div className="ccard" style={{padding:0,overflow:"hidden"}}>
        <div style={{background:"var(--p)",padding:"10px 16px",borderBottom:"3px solid var(--bdc)",display:"flex",gap:8,alignItems:"center"}}>
          <span style={{fontSize:16}}>📋</span>
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:15,fontWeight:700,color:"#fff"}}>Full Student Records</p>
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
          <p style={{fontFamily:"Fredoka,sans-serif",fontSize:15,fontWeight:700,color:"#fff"}}>Net Merit Per Student</p>
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
          <p style={{fontSize:11,fontWeight:900,color:"rgba(255,255,255,.8)",textTransform:"uppercase",letterSpacing:".6px",marginBottom:8}}>🏆 TOP STUDENT OF THE CLASS</p>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <Ava nama={top.nama} jantina={top.jantina} size={56}/>
            <div>
              <p style={{fontFamily:"Fredoka,sans-serif",fontSize:19,fontWeight:700,color:"#fff"}}>{top.nama.split(" ").slice(0,3).join(" ")}</p>
              <p style={{color:"rgba(255,255,255,.85)",fontSize:13,fontWeight:700}}>Net Merit: <span style={{fontFamily:"JetBrains Mono,monospace",fontWeight:700}}>{netMerit(top)}</span></p>
            </div>
          </div>
        </div>
      )}
      <button onClick={()=>window.print()} className="cbtn cbtn-blue" style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>🖨️ Export Report as PDF</button>
    </div>
  );
}

/* ── DESKTOP SIDEBAR ── */
function DesktopSidebar({active,nav,notif,dark,setDark,logout,nama}) {
  return (
    <aside className="app-sidebar" style={{display:"none"}}>
      <div style={{background:"var(--p)",padding:"28px 20px 20px",borderBottom:"3px solid var(--bdc)",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-20,right:-20,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,.1)",pointerEvents:"none"}}/>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{background:"rgba(255,255,255,.2)",border:"2.5px solid rgba(255,255,255,.4)",borderRadius:12,padding:6}}><Logo size={32}/></div>
          <div>
            <p style={{color:"#fff",fontSize:15,fontWeight:900,fontFamily:"Fredoka,sans-serif",lineHeight:1.1}}>Portal Cikgu Anna</p>
            <p style={{color:"rgba(255,255,255,.7)",fontSize:10,fontWeight:600,lineHeight:1.2}}>SK Bukit Lalang, Semporna</p>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.15)",borderRadius:10,padding:"7px 10px"}}>
          <img src="/cikgu-anna.jpg" style={{width:34,height:34,borderRadius:"50%",objectFit:"cover",objectPosition:"top",border:"2px solid rgba(255,255,255,.5)",flexShrink:0}} alt="Cikgu Anna"/>
          <div>
            <p style={{color:"rgba(255,255,255,.65)",fontSize:9,fontWeight:800,textTransform:"uppercase",letterSpacing:".5px"}}>Class Teacher</p>
            <p style={{color:"#fff",fontSize:13,fontWeight:900,fontFamily:"Fredoka,sans-serif"}}>{nama||"Teacher Anna"}</p>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 0 8px"}}>
        {MENU.map(m=>{
          const sel=active===m.id;
          return (
            <button key={m.id} onClick={()=>nav(m.id)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"10px 16px",background:sel?"var(--ps)":"none",border:"none",borderLeft:`4px solid ${sel?"var(--p)":"transparent"}`,cursor:"pointer",textAlign:"left",transition:"all .12s"}}>
              <div style={{width:38,height:38,borderRadius:12,background:sel?"var(--p)":"var(--bg)",border:`2.5px solid ${sel?"var(--p)":"var(--bdc)"}`,boxShadow:sel?"2px 2px 0 var(--p2)":"2px 2px 0 var(--bdc)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{m.emoji}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:13,fontWeight:900,color:sel?"var(--p)":"var(--ink)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.label}</p>
                <p style={{fontSize:10,color:"var(--i3)",fontWeight:600,marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.sub}</p>
              </div>
              {m.id==="log"&&notif>0&&<span style={{background:"var(--p)",color:"#fff",fontSize:11,fontWeight:900,borderRadius:99,minWidth:22,height:22,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid var(--bdc)",padding:"0 4px"}}>{notif}</span>}
            </button>
          );
        })}
      </div>
      <div style={{padding:"12px 16px",borderTop:"3px solid var(--bdc)",background:"var(--ys)"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:16}}>{dark?"🌙":"☀️"}</span>
            <p style={{fontSize:12,fontWeight:800,color:"var(--ink)"}}>{dark?"Dark":"Light"} Mode</p>
          </div>
          <button onClick={()=>setDark(!dark)} style={{width:46,height:26,borderRadius:99,border:"3px solid var(--bdc)",background:dark?"var(--p)":"var(--i3)",cursor:"pointer",position:"relative",boxShadow:"2px 2px 0 var(--bdc)",transition:"background .2s"}}>
            <div style={{position:"absolute",top:3,left:dark?21:3,width:16,height:16,borderRadius:"50%",background:"#fff",border:"2px solid var(--bdc)",transition:"left .2s"}}/>
          </button>
        </div>
        <button onClick={logout} style={{width:"100%",padding:"8px",border:"3px solid var(--bdc)",borderRadius:12,background:"var(--wh)",color:"var(--ink)",fontFamily:"Nunito,sans-serif",fontWeight:800,fontSize:12,cursor:"pointer",boxShadow:"2px 2px 0 var(--bdc)"}}>🚪 Log Out</button>
        <p style={{fontSize:9,color:"var(--i3)",marginTop:6,fontWeight:600,textAlign:"center"}}>Teacher Anna's Portal v1.0 · 2026</p>
      </div>
    </aside>
  );
}

/* ── ROOT APP ── */
export default function App() {
  const { session, login, logout, authLoading, authError } = useAuth();
  const [tab,setTab]           = useState("dashboard");
  const [drawer,setDrawer]     = useState(false);
  const [search,setSearch]     = useState(false);
  const [waModal,setWaModal]   = useState(false);
  const [dark,setDark]         = useState(false);
  const [murid,setMurid]       = useState([]);
  const [log,setLog]           = useState([]);
  const [objektif,setObjektif] = useState([]);
  const [jadual,setJadual]     = useState([]);
  const [loading,setLoading]   = useState(true);
  const [kh]                   = useState(INIT_KH);
  const [activeKelas,setActiveKelas] = useState("6 Adil");

  /* ── LOAD FROM SUPABASE ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    const [{ data: mData }, { data: lData }, { data: oData }, { data: jData }] = await Promise.all([
      supabase.from("murid").select("*").order("no"),
      supabase.from("log_ibu_bapa").select("*").order("created_at", { ascending: false }),
      supabase.from("objektif").select("*").order("created_at", { ascending: false }),
      supabase.from("jadual").select("*").order("urutan"),
    ]);
    if (mData?.length) {
      setMurid(mData);
    } else {
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
    setObjektif(oData || []);
    if (Array.isArray(jData) && jData.length > 0) {
      setJadual(jData);
    } else if (Array.isArray(jData)) {
      const hariList = ["Monday","Tuesday","Wednesday","Thursday","Friday"];
      const masaList = ["7:30","8:10","8:50","9:30","10:10","11:10","11:50"];
      const rows = [];
      hariList.forEach(h => JADUAL[h].forEach((subj,i) => rows.push({hari:h,urutan:i,masa:masaList[i],subjek:subj})));
      const { data: seeded } = await supabase.from("jadual").insert(rows).select();
      if (seeded) setJadual(seeded);
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

  const deleteLog = async (id) => {
    await supabase.from("log_ibu_bapa").delete().eq("id", id);
    setLog(p => p.filter(l => l.id !== id));
  };

  /* ── OBJEKTIF CRUD ── */
  const addObjektif = async (fields) => {
    const { data: row } = await supabase.from("objektif").insert(fields).select().single();
    if (row) setObjektif(p => [row, ...p]);
  };

  const updateObjektif = async (id, fields) => {
    await supabase.from("objektif").update(fields).eq("id", id);
    setObjektif(p => p.map(o => o.id === id ? { ...o, ...fields } : o));
  };

  const deleteObjektif = async (id) => {
    await supabase.from("objektif").delete().eq("id", id);
    setObjektif(p => p.filter(o => o.id !== id));
  };

  /* ── JADUAL CRUD ── */
  const addJadual = async (fields) => {
    const { data: row } = await supabase.from("jadual").insert(fields).select().single();
    if (row) setJadual(p => [...p, row]);
  };
  const updateJadual = async (id, fields) => {
    await supabase.from("jadual").update(fields).eq("id", id);
    setJadual(p => p.map(s => s.id === id ? { ...s, ...fields } : s));
  };
  const deleteJadual = async (id) => {
    await supabase.from("jadual").delete().eq("id", id);
    setJadual(p => p.filter(s => s.id !== id));
  };

  const filteredMurid = murid.filter(m => m.kelas === activeKelas);
  const notif      = log.filter(l=>l.status==="belum balas").length;
  const hadirCount = filteredMurid.filter(m=>(kh[m.id]||"hadir")==="hadir").length;
  const g = getGreeting();

  if (!session) return (
    <>
      <style>{makeCSS(false)}</style>
      <LoginPage login={login} authLoading={authLoading} authError={authError}/>
    </>
  );

  if (session.role === "parent") return (
    <>
      <style>{makeCSS(dark)}</style>
      <ParentPortal studentId={session.studentId} waliName={session.wali||session.nama} onLogout={logout}/>
    </>
  );

  if (loading) return (
    <>
      <style>{makeCSS(dark)}</style>
      <div style={{minHeight:"100vh",background:"var(--bg)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:16}}>
        <Logo size={56}/>
        <p style={{fontFamily:"Fredoka,sans-serif",fontSize:18,color:"var(--p)",fontWeight:700}}>Loading Teacher Anna's Portal…</p>
      </div>
    </>
  );

  return (
    <>
      <style>{makeCSS(dark)}</style>
      {search  && <Search murid={murid} log={log} nav={t=>{setTab(t);setSearch(false);}} onClose={()=>setSearch(false)}/>}
      {drawer  && <Drawer active={tab} nav={t=>{setTab(t);}} onClose={()=>setDrawer(false)} notif={notif} dark={dark} setDark={setDark}/>}
      {waModal && <WAModal murid={filteredMurid} onClose={()=>setWaModal(false)}/>}

      <div className="app-wrap" style={{minHeight:"100vh",background:"var(--bg)",display:"flex",flexDirection:"column",maxWidth:430,margin:"0 auto"}}>
        <DesktopSidebar active={tab} nav={t=>{setTab(t);}} notif={notif} dark={dark} setDark={setDark} logout={logout} nama={session.nama}/>
        <div className="app-main" style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>

        {/* ── HEADER ── */}
        <div style={{position:"sticky",top:0,zIndex:20,background:"var(--p)",borderBottom:"3px solid var(--bdc)",boxShadow:"0 4px 0 var(--bdc)"}}>
          {/* Row 1 — clip decorative elements here only */}
          <div style={{overflow:"hidden",position:"relative"}}>
          <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,.1) 1px,transparent 1px)",backgroundSize:"16px 16px",pointerEvents:"none"}}/>
          <div style={{position:"absolute",top:-28,right:-28,width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,.08)",border:"2px solid rgba(255,255,255,.1)",pointerEvents:"none"}}/>
          <div style={{display:"flex",alignItems:"center",gap:10,padding:"36px 12px 8px",position:"relative"}}>
            <div style={{flexShrink:0,background:"rgba(255,255,255,.18)",border:"2.5px solid rgba(255,255,255,.45)",borderRadius:14,padding:5,boxShadow:"2px 2px 0 rgba(0,0,0,.18)"}}>
              <Logo size={38}/>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontFamily:"Fredoka,sans-serif",fontSize:16,fontWeight:700,color:"#fff",lineHeight:1.1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>Teacher Anna's Portal</p>
              <p style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,.72)",marginTop:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{g.e} {g.t} · SK Bukit Lalang, Semporna</p>
            </div>
            <div style={{display:"flex",gap:6,flexShrink:0,alignItems:"center"}}>
              <LiveClock/>
              <button onClick={()=>setDark(!dark)} style={{background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.4)",borderRadius:11,width:34,height:34,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>{dark?"☀️":"🌙"}</button>
              {notif>0&&(
                <button onClick={()=>setTab("log")} style={{position:"relative",background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.4)",borderRadius:11,width:34,height:34,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>
                  📩<span style={{position:"absolute",top:2,right:2,width:15,height:15,background:"var(--y)",color:"var(--ink)",fontSize:8,fontWeight:900,borderRadius:99,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid var(--bdc)"}}>{notif}</span>
                </button>
              )}
              <button onClick={logout} title="Log Keluar" style={{background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.4)",borderRadius:11,width:34,height:34,cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center"}}>🚪</button>
              <button className="hdr-hamburger" onClick={()=>setDrawer(true)} style={{background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.4)",borderRadius:11,width:34,height:34,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:4}}>
                {[0,1,2].map(i=><span key={i} style={{display:"block",width:14,height:2,background:"#fff",borderRadius:99}}/>)}
              </button>
            </div>
          </div>
          {/* Search row */}
          <div style={{padding:"0 12px 6px",position:"relative"}}>
            <button onClick={()=>setSearch(true)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,.2)",border:"2px solid rgba(255,255,255,.38)",borderRadius:12,padding:"9px 12px",cursor:"pointer",textAlign:"left",boxShadow:"2px 2px 0 rgba(0,0,0,.12)"}}>
              <span style={{fontSize:14}}>🔍</span>
              <span style={{fontSize:12,color:"rgba(255,255,255,.8)",fontFamily:"Nunito,sans-serif",fontWeight:700,flex:1}}>Search student, Delima ID, guardian, message…</span>
              <span style={{fontSize:9,fontWeight:900,color:"rgba(255,255,255,.55)",background:"rgba(255,255,255,.12)",borderRadius:6,padding:"2px 6px",border:"1.5px solid rgba(255,255,255,.2)"}}>⌘K</span>
            </button>
          </div>
          </div>{/* end overflow:hidden Row1 wrapper */}
          {/* Wavy */}
          <svg style={{display:"block",width:"100%",height:14,marginBottom:-1}} viewBox="0 0 430 14" preserveAspectRatio="none">
            <path d="M0,2 C80,14 160,0 215,8 C270,16 350,2 430,7 L430,14 L0,14 Z" fill="var(--bg)"/>
            <path d="M0,2 C80,14 160,0 215,8 C270,16 350,2 430,7" fill="none" stroke="var(--bdc)" strokeWidth="2"/>
          </svg>
        </div>

        {/* ── CONTENT ── */}
        <div style={{flex:1,padding:"14px 14px 40px",overflowY:"auto"}} key={tab} className="fade-up">
          {tab==="dashboard" && <Dashboard murid={filteredMurid} log={log} kh={kh} setWA={setWaModal} activeKelas={activeKelas}/>}
          {tab==="objektif"  && <Objektif objektif={objektif} addObjektif={addObjektif} updateObjektif={updateObjektif} deleteObjektif={deleteObjektif}/>}
          {tab==="kehadiran" && <Kehadiran murid={filteredMurid}/>}
          {tab==="merit"     && <Merit murid={filteredMurid} updateMerit={updateMerit}/>}
          {tab==="murid"     && <SenaraiMurid murid={murid} saveMurid={saveMurid} deleteMurid={deleteMurid}/>}
          {tab==="jadual"    && <Jadual jadual={jadual} addJadual={addJadual} updateJadual={updateJadual} deleteJadual={deleteJadual}/>}
          {tab==="log"       && <Log log={log} addLog={addLog} updateLog={updateLog} deleteLog={deleteLog}/>}
          {tab==="laporan"   && <Laporan murid={filteredMurid}/>}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div className="bottom-nav" style={{position:"sticky",bottom:0,background:"var(--wh)",borderTop:"3px solid var(--bdc)",boxShadow:"0 -3px 0 var(--bdc)",display:"flex",zIndex:20}}>
          {[
            {id:"dashboard", emoji:"🏠",label:"Home"},
            {id:"objektif",  emoji:"🎯",label:"Objectives"},
            {id:"kehadiran", emoji:"📋",label:"Attendance"},
            {id:"murid",     emoji:"👥",label:"Students"},
            {id:"laporan",   emoji:"📊",label:"Reports"},
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
        </div>{/* end app-main */}
      </div>
    </>
  );
}
