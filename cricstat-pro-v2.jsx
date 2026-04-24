import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   DESIGN SYSTEM — UI/UX PRO MAX APPLIED
   Product Type : Sports Management Dashboard
   Style        : Vibrant Dark + Glassmorphism + Bento Grid
   Color Palette: Stadium Night (Deep navy base, Pitch Green accent, Gold premium)
   Font Pairing : Bebas Neue (display) + Plus Jakarta Sans (body) + JetBrains Mono (data)
   UX Pattern   : Mobile-first, bottom nav, card system, micro-interactions
   Effects      : Gradient mesh bg, frosted glass cards, glow accents, shimmer
═══════════════════════════════════════════════════════════════════════════ */

// ── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = "cricstat_pro_v2";
async function loadData() {
  try { const r = await window.storage.get(STORAGE_KEY); if (r?.value) return JSON.parse(r.value); } catch(_){}
  return null;
}
async function saveData(d) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(d)); } catch(_){}
}
const uid = () => Math.random().toString(36).slice(2,8);

// ── Seed Data ────────────────────────────────────────────────────────────────
const SEED = {
  teams: [
    { id:"t1", name:"Mumbai Mavericks", short:"MUM", logo:"🔵", color:"#00d4ff", format:"T20", players:["p1","p2","p3"] },
    { id:"t2", name:"Delhi Dragons",    short:"DEL", logo:"🔴", color:"#ff6b35", format:"T20", players:["p4","p5","p6"] },
    { id:"t3", name:"Chennai Chargers", short:"CHE", logo:"🟡", color:"#ffd700", format:"T10", players:["p7","p8"] },
  ],
  players: [
    { id:"p1", name:"Rohit Mehta",    role:"Batsman",        team:"t1", runs:1240, wickets:0,  matches:32, avg:42.3, sr:148.2, catches:14 },
    { id:"p2", name:"Arjun Patel",    role:"Bowler",         team:"t1", runs:120,  wickets:48, matches:30, avg:18.4, sr:72.1,  catches:9  },
    { id:"p3", name:"Vikram Singh",   role:"All-Rounder",    team:"t1", runs:680,  wickets:22, matches:28, avg:31.2, sr:135.5, catches:12 },
    { id:"p4", name:"Sanjay Kumar",   role:"Batsman",        team:"t2", runs:1580, wickets:0,  matches:38, avg:51.2, sr:162.4, catches:8  },
    { id:"p5", name:"Ravi Sharma",    role:"Wicket-Keeper",  team:"t2", runs:840,  wickets:0,  matches:35, avg:28.9, sr:131.0, catches:52 },
    { id:"p6", name:"Deepak Rao",     role:"Bowler",         team:"t2", runs:90,   wickets:61, matches:36, avg:14.2, sr:66.8,  catches:7  },
    { id:"p7", name:"Karan Nair",     role:"All-Rounder",    team:"t3", runs:920,  wickets:31, matches:29, avg:36.7, sr:141.2, catches:11 },
    { id:"p8", name:"Amitesh Joshi",  role:"Batsman",        team:"t3", runs:1120, wickets:0,  matches:31, avg:44.1, sr:155.8, catches:6  },
  ],
  matches: [
    { id:"m1", t1:"t1", t2:"t2", fmt:"T20", status:"completed", winner:"t1", s1:"186/4 (20)", s2:"174/8 (20)", date:"2025-04-10", venue:"Wankhede Stadium" },
    { id:"m2", t1:"t2", t2:"t3", fmt:"T10", status:"completed", winner:"t3", s1:"112/6 (10)", s2:"115/3 (9.2)", date:"2025-04-14", venue:"Feroz Shah Kotla" },
    { id:"m3", t1:"t1", t2:"t3", fmt:"T20", status:"live",      winner:null, s1:"142/3 (16.2)", s2:"Yet to bat", date:"2025-04-22", venue:"Chepauk Stadium" },
    { id:"m4", t1:"t1", t2:"t2", fmt:"T20", status:"upcoming",  winner:null, s1:"", s2:"", date:"2025-04-28", venue:"DY Patil Stadium" },
  ],
  league: {
    name:"IPL Pro League 2025",
    standings:[
      { tid:"t1", p:8, w:6, l:2, pts:12, nrr:"+0.842" },
      { tid:"t3", p:7, w:4, l:3, pts:8,  nrr:"+0.312" },
      { tid:"t2", p:8, w:3, l:5, pts:6,  nrr:"-0.215" },
    ]
  }
};

const ROLES = ["Batsman","Bowler","All-Rounder","Wicket-Keeper"];
const FMTS  = ["T20","T10","Custom"];
const ROLE_ACCENT = { Batsman:"#ffd700", Bowler:"#00d4ff", "All-Rounder":"#00e676", "Wicket-Keeper":"#ff6b35" };

// ── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

*, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

:root {
  /* Foundation */
  --bg0: #050810;
  --bg1: #090d18;
  --bg2: #0c1220;
  --bg3: #101828;
  --bg4: #141f32;

  /* Glass */
  --glass:    rgba(14,22,40,0.72);
  --glass2:   rgba(20,32,54,0.60);
  --glassb:   rgba(255,255,255,0.06);
  --glassb2:  rgba(255,255,255,0.10);
  --glassb3:  rgba(255,255,255,0.16);

  /* Brand */
  --green:  #00e676;
  --green2: #00c853;
  --green3: rgba(0,230,118,0.12);
  --cyan:   #00d4ff;
  --cyan2:  rgba(0,212,255,0.12);
  --gold:   #ffd740;
  --gold2:  rgba(255,215,64,0.12);
  --orange: #ff6b35;
  --live:   #ff3d57;
  --live2:  rgba(255,61,87,0.15);
  --purple: #c084fc;

  /* Text */
  --t1: #f0f4ff;
  --t2: #8b9fc0;
  --t3: #4a5a78;
  --t4: #2a3550;

  /* Misc */
  --r-xl: 20px;
  --r-lg: 16px;
  --r-md: 12px;
  --r-sm: 8px;
  --shadow: 0 8px 32px rgba(0,0,0,0.5);
  --shadow-glow: 0 0 24px rgba(0,230,118,0.2);
  --transition: 220ms cubic-bezier(0.4,0,0.2,1);
}

html,body,#root { height:100%; overflow:hidden; }
body {
  font-family:'Plus Jakarta Sans',sans-serif;
  background: var(--bg0);
  color: var(--t1);
  -webkit-font-smoothing: antialiased;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width:3px; height:3px; }
::-webkit-scrollbar-track { background:transparent; }
::-webkit-scrollbar-thumb { background:var(--glassb2); border-radius:3px; }

/* ── App shell ── */
.app {
  display:flex; flex-direction:column; height:100vh;
  background: var(--bg0);
  position:relative; overflow:hidden;
}

/* Gradient mesh background */
.app::before {
  content:'';
  position:fixed; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(ellipse 80% 60% at 10% 0%,   rgba(0,230,118,0.04) 0%, transparent 60%),
    radial-gradient(ellipse 60% 80% at 90% 100%,  rgba(0,212,255,0.04) 0%, transparent 60%),
    radial-gradient(ellipse 100% 100% at 50% 50%, rgba(192,132,252,0.02) 0%, transparent 70%);
}

/* ── Header ── */
.header {
  flex-shrink:0;
  height:58px;
  display:flex; align-items:center; justify-content:space-between;
  padding:0 16px;
  background: var(--glass);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid var(--glassb);
  position:relative; z-index:50;
}
.header-brand {
  display:flex; align-items:center; gap:10px;
}
.header-logo-ring {
  width:36px; height:36px; border-radius:10px;
  background: linear-gradient(135deg, var(--green), var(--cyan));
  display:flex; align-items:center; justify-content:center;
  font-size:18px;
  box-shadow: 0 0 16px rgba(0,230,118,0.35), 0 2px 8px rgba(0,0,0,0.4);
  position:relative;
}
.header-wordmark {
  font-family:'Bebas Neue',sans-serif;
  font-size:22px; letter-spacing:3px;
  background: linear-gradient(135deg, #fff 40%, var(--green));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
}
.header-sub { font-size:10px; color:var(--t3); letter-spacing:1.5px; text-transform:uppercase; line-height:1; }
.live-pill {
  display:flex; align-items:center; gap:5px;
  background: var(--live2);
  border: 1px solid rgba(255,61,87,0.3);
  border-radius:20px; padding:4px 10px;
  font-size:11px; font-weight:700; color:var(--live);
  font-family:'JetBrains Mono',monospace; letter-spacing:1px;
}
.live-dot { width:6px; height:6px; background:var(--live); border-radius:50%; animation:livePulse 1.4s infinite; }
@keyframes livePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.7)} }

/* ── Scroll area ── */
.scroll-area {
  flex:1; overflow-y:auto; overflow-x:hidden;
  padding:16px 14px 88px;
  position:relative; z-index:1;
  scroll-behavior:smooth;
}

/* ── Bottom Nav ── */
.bottom-nav {
  position:fixed; bottom:0; left:0; right:0; z-index:100;
  height:72px;
  background: var(--glass);
  backdrop-filter: blur(24px) saturate(200%);
  border-top: 1px solid var(--glassb);
  display:flex; align-items:center; justify-content:space-around;
  padding:0 8px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
.nav-item {
  display:flex; flex-direction:column; align-items:center; gap:3px;
  padding:8px 12px; border-radius:var(--r-md);
  border:none; background:none; cursor:pointer;
  color:var(--t3); transition:var(--transition);
  position:relative; min-width:52px;
  -webkit-tap-highlight-color:transparent;
}
.nav-item:active { transform:scale(0.92); }
.nav-item.active { color:var(--green); }
.nav-item.active .nav-icon-wrap {
  background: var(--green3);
  box-shadow: 0 0 12px rgba(0,230,118,0.2);
}
.nav-icon-wrap {
  width:36px; height:28px; border-radius:var(--r-sm);
  display:flex; align-items:center; justify-content:center;
  transition:var(--transition);
}
.nav-label { font-size:10px; font-weight:600; letter-spacing:.3px; }
.nav-badge {
  position:absolute; top:4px; right:8px;
  width:16px; height:16px; border-radius:50%;
  background:var(--live); color:#fff;
  font-size:9px; font-weight:700; font-family:'JetBrains Mono',monospace;
  display:flex; align-items:center; justify-content:center;
  animation:livePulse 1.4s infinite;
  border:2px solid var(--bg0);
}

/* ── Glass Card ── */
.g-card {
  background: var(--glass2);
  border: 1px solid var(--glassb);
  border-radius: var(--r-xl);
  backdrop-filter: blur(12px);
  position:relative; overflow:hidden;
  transition: border-color var(--transition), transform var(--transition), box-shadow var(--transition);
}
.g-card:hover { border-color: var(--glassb2); }
.g-card:active { transform:scale(0.99); }

/* Accent top bar */
.g-card[data-accent]::before {
  content:''; position:absolute; top:0; left:0; right:0; height:2px;
}
.g-card[data-accent="green"]::before  { background:linear-gradient(to right,var(--green),transparent); }
.g-card[data-accent="gold"]::before   { background:linear-gradient(to right,var(--gold),transparent); }
.g-card[data-accent="cyan"]::before   { background:linear-gradient(to right,var(--cyan),transparent); }
.g-card[data-accent="orange"]::before { background:linear-gradient(to right,var(--orange),transparent); }
.g-card[data-accent="live"]::before   { background:linear-gradient(to right,var(--live),transparent); }

/* ── Section Header ── */
.section-hdr {
  display:flex; align-items:center; gap:10px;
  margin:20px 0 12px;
}
.section-hdr-title {
  font-family:'Bebas Neue',sans-serif;
  font-size:19px; letter-spacing:2px; color:var(--t1);
  white-space:nowrap;
}
.section-hdr-line {
  flex:1; height:1px;
  background:linear-gradient(to right, var(--glassb2), transparent);
}

/* ── Hero Banner ── */
.hero-banner {
  border-radius: var(--r-xl);
  background: linear-gradient(135deg, #091425 0%, #06180e 60%, #0b1526 100%);
  border: 1px solid var(--glassb2);
  padding:24px 20px 20px;
  margin-bottom:16px;
  position:relative; overflow:hidden;
}
.hero-banner::after {
  content:'';
  position:absolute; right:-30px; top:50%; transform:translateY(-50%);
  width:180px; height:180px;
  border-radius:50%;
  border: 18px solid rgba(0,230,118,0.05);
  box-shadow: inset 0 0 40px rgba(0,230,118,0.04), 0 0 60px rgba(0,230,118,0.06);
}
.hero-eyebrow {
  font-size:10px; letter-spacing:3px; color:var(--green);
  font-family:'JetBrains Mono',monospace; font-weight:600;
  text-transform:uppercase; margin-bottom:6px;
  display:flex; align-items:center; gap:6px;
}
.hero-title {
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(30px,8vw,48px); letter-spacing:2px; line-height:.95;
  background:linear-gradient(135deg,#fff 30%,var(--green));
  -webkit-background-clip:text; -webkit-text-fill-color:transparent;
  margin-bottom:4px;
}
.hero-sub { font-size:12px; color:var(--t2); font-weight:500; }
.hero-kpis {
  display:grid; grid-template-columns:repeat(4,1fr);
  gap:8px; margin-top:18px;
}
.hero-kpi {
  background:rgba(0,0,0,0.25);
  border: 1px solid var(--glassb);
  border-radius: var(--r-md); padding:10px 8px; text-align:center;
  backdrop-filter:blur(8px);
}
.hero-kpi-val {
  font-family:'Bebas Neue',sans-serif;
  font-size:24px; letter-spacing:1px; color:var(--gold); display:block;
}
.hero-kpi-lbl { font-size:9px; color:var(--t3); text-transform:uppercase; letter-spacing:1px; }

/* ── Tag / Chip ── */
.tag {
  display:inline-flex; align-items:center; gap:4px;
  padding:3px 9px; border-radius:20px;
  font-size:10px; font-weight:700; letter-spacing:.4px;
  font-family:'JetBrains Mono',monospace; white-space:nowrap;
}
.tag-green  { background:var(--green3);  color:var(--green);  border:1px solid rgba(0,230,118,0.2); }
.tag-gold   { background:var(--gold2);   color:var(--gold);   border:1px solid rgba(255,215,64,0.2); }
.tag-cyan   { background:var(--cyan2);   color:var(--cyan);   border:1px solid rgba(0,212,255,0.2); }
.tag-live   { background:var(--live2);   color:var(--live);   border:1px solid rgba(255,61,87,0.3); animation:livePulse 1.4s infinite; }
.tag-ghost  { background:rgba(255,255,255,0.04); color:var(--t2); border:1px solid var(--glassb); }

/* Chip tabs */
.chip-row { display:flex; gap:6px; overflow-x:auto; padding-bottom:2px; margin-bottom:14px; scrollbar-width:none; }
.chip-row::-webkit-scrollbar { display:none; }
.chip-btn {
  flex-shrink:0; padding:6px 14px; border-radius:20px;
  font-size:12px; font-weight:700; letter-spacing:.3px;
  border: 1px solid var(--glassb); background:var(--glass2);
  color:var(--t2); cursor:pointer; transition:var(--transition);
  font-family:'Plus Jakarta Sans',sans-serif;
  -webkit-tap-highlight-color:transparent;
}
.chip-btn:active { transform:scale(0.96); }
.chip-btn.on { border-color:rgba(0,230,118,.35); background:var(--green3); color:var(--green); }

/* ── Match Card ── */
.match-card { padding:16px; margin-bottom:10px; }
.match-teams-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; gap:8px; }
.match-team { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
.match-team-logo { font-size:32px; line-height:1; }
.match-team-short { font-size:12px; font-weight:800; letter-spacing:1px; }
.match-score {
  font-family:'JetBrains Mono',monospace;
  font-size:11px; color:var(--green); font-weight:600;
}
.vs-orb {
  width:36px; height:36px; border-radius:50%;
  border: 1.5px solid var(--glassb2);
  background:rgba(0,0,0,0.3);
  display:flex; align-items:center; justify-content:center;
  font-family:'Bebas Neue',sans-serif; font-size:13px; color:var(--t3);
  flex-shrink:0;
}
.match-footer { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
.match-meta { font-size:11px; color:var(--t3); display:flex; align-items:center; gap:3px; }
.winner-strip {
  display:flex; align-items:center; gap:5px;
  margin-top:8px; padding:6px 10px;
  background:var(--gold2); border-radius:var(--r-sm);
  font-size:11px; font-weight:700; color:var(--gold);
}

/* ── Player Card ── */
.player-card { padding:16px; }
.player-card-top { display:flex; align-items:flex-start; justify-content:space-between; margin-bottom:14px; }
.p-avatar {
  width:44px; height:44px; border-radius:50%;
  display:flex; align-items:center; justify-content:center;
  font-family:'Bebas Neue',sans-serif; font-size:16px;
  font-weight:700; flex-shrink:0;
}
.stat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-top:2px; }
.stat-cell {
  background:rgba(0,0,0,0.3); border-radius:var(--r-sm);
  padding:8px 4px; text-align:center;
  border: 1px solid var(--glassb);
}
.stat-cell-val {
  font-family:'JetBrains Mono',monospace;
  font-size:15px; font-weight:600; display:block;
}
.stat-cell-lbl { font-size:9px; color:var(--t3); text-transform:uppercase; letter-spacing:.5px; }

/* ── Team Card ── */
.team-card { padding:16px; }
.team-card-head { display:flex; align-items:center; gap:12px; margin-bottom:12px; }
.team-logo-box {
  width:48px; height:48px; border-radius:14px;
  background: var(--glass2); border: 1px solid var(--glassb2);
  display:flex; align-items:center; justify-content:center;
  font-size:26px; flex-shrink:0;
}
.team-name { font-size:16px; font-weight:800; }
.team-code { font-family:'JetBrains Mono',monospace; font-size:11px; color:var(--t3); letter-spacing:2px; }
.team-player-row {
  display:flex; align-items:center; gap:8px;
  padding:7px 0; border-bottom: 1px solid var(--glassb);
}
.team-player-row:last-child { border-bottom:none; }

/* ── Live Hero ── */
.live-hero {
  border-radius:var(--r-xl);
  background: linear-gradient(135deg, #0a1e10, #06101e);
  border: 1px solid rgba(0,230,118,0.18);
  padding:20px 16px;
  margin-bottom:14px;
  position:relative; overflow:hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.5), 0 0 40px rgba(0,230,118,0.06);
}
.live-hero::before {
  content:''; position:absolute; inset:0;
  background: radial-gradient(ellipse at 50% 0%, rgba(0,230,118,0.06) 0%, transparent 60%);
  pointer-events:none;
}
.live-hero-top {
  display:flex; align-items:center; gap:8px; margin-bottom:14px;
}
.live-score-row {
  display:flex; align-items:center; justify-content:space-around;
  gap:8px; margin-bottom:14px;
}
.live-team { text-align:center; flex:1; }
.live-team-logo { font-size:44px; display:block; margin-bottom:6px; }
.live-team-name { font-size:14px; font-weight:800; margin-bottom:2px; }
.live-score-big {
  font-family:'Bebas Neue',sans-serif;
  font-size:32px; color:var(--green); letter-spacing:2px;
  text-shadow: 0 0 20px rgba(0,230,118,0.4);
}
.live-vs { font-family:'Bebas Neue',sans-serif; font-size:18px; color:var(--t3); flex-shrink:0; }

/* ── Leaderboard ── */
.lb-list { border-radius:var(--r-xl); overflow:hidden; background:var(--glass2); border:1px solid var(--glassb); }
.lb-row {
  display:flex; align-items:center; gap:10px;
  padding:12px 14px; border-bottom:1px solid var(--glassb);
  transition: background var(--transition);
  cursor:default;
}
.lb-row:last-child { border-bottom:none; }
.lb-row:active { background:rgba(255,255,255,0.02); }
.lb-rank {
  font-family:'JetBrains Mono',monospace;
  font-size:14px; font-weight:600; color:var(--t3); width:24px; text-align:center; flex-shrink:0;
}
.lb-name { flex:1; font-size:14px; font-weight:700; }
.lb-team-label { font-size:10px; color:var(--t2); }
.lb-progress-bg { height:3px; background:rgba(255,255,255,0.06); border-radius:3px; margin-top:4px; overflow:hidden; }
.lb-progress-fill { height:100%; border-radius:3px; transition:width .6s cubic-bezier(0.4,0,0.2,1); }
.lb-val {
  font-family:'JetBrains Mono',monospace;
  font-size:18px; font-weight:600;
}

/* ── Standings Table ── */
.standings-wrap { border-radius:var(--r-xl); overflow:hidden; background:var(--glass2); border:1px solid var(--glassb); }
.standings-tbl { width:100%; border-collapse:collapse; }
.standings-tbl th {
  font-size:9px; letter-spacing:1.5px; color:var(--t3); font-family:'JetBrains Mono',monospace;
  text-transform:uppercase; padding:10px 12px; text-align:left;
  border-bottom:1px solid var(--glassb); background:rgba(0,0,0,0.2);
}
.standings-tbl td { padding:11px 12px; border-bottom:1px solid var(--glassb); font-size:13px; }
.standings-tbl tr:last-child td { border-bottom:none; }
.rank-dot {
  width:24px; height:24px; border-radius:50%;
  display:inline-flex; align-items:center; justify-content:center;
  font-family:'Bebas Neue',sans-serif; font-size:13px; font-weight:700;
}
.rank-1 { background:var(--gold); color:#111; }
.rank-2 { background:#b0b8c8; color:#111; }
.rank-3 { background:#cd7f32; color:#fff; }

/* ── Buttons ── */
.btn {
  display:inline-flex; align-items:center; gap:6px;
  padding:9px 16px; border-radius:var(--r-md);
  border:none; cursor:pointer; font-family:'Plus Jakarta Sans',sans-serif;
  font-size:13px; font-weight:700; letter-spacing:.2px;
  transition:var(--transition); white-space:nowrap;
  -webkit-tap-highlight-color:transparent;
}
.btn:active { transform:scale(0.96); }
.btn-primary {
  background:linear-gradient(135deg,var(--green),var(--green2));
  color:#060e08; box-shadow:0 2px 12px rgba(0,230,118,0.3);
}
.btn-primary:hover { box-shadow:0 4px 20px rgba(0,230,118,0.4); }
.btn-glass {
  background:var(--glass2); color:var(--t2);
  border:1px solid var(--glassb); backdrop-filter:blur(8px);
}
.btn-glass:hover { border-color:var(--glassb2); color:var(--t1); }
.btn-danger { background:rgba(255,61,87,0.1); color:var(--live); border:1px solid rgba(255,61,87,0.2); }
.btn-danger:hover { background:rgba(255,61,87,0.2); }
.btn-sm { padding:5px 10px; font-size:11px; }
.btn-icon { padding:7px; border-radius:var(--r-sm); }

/* ── FAB ── */
.fab {
  position:fixed; bottom:82px; right:16px; z-index:90;
  width:52px; height:52px; border-radius:50%;
  background:linear-gradient(135deg,var(--green),var(--green2));
  border:none; cursor:pointer;
  display:flex; align-items:center; justify-content:center;
  font-size:22px; font-weight:300;
  box-shadow:0 4px 20px rgba(0,230,118,0.4), 0 8px 32px rgba(0,0,0,0.4);
  transition:var(--transition);
  -webkit-tap-highlight-color:transparent;
  color:#060e08;
}
.fab:active { transform:scale(0.92); }

/* ── Modal ── */
.modal-bg {
  position:fixed; inset:0; z-index:200;
  background:rgba(0,0,0,0.65); backdrop-filter:blur(6px);
  display:flex; align-items:flex-end; justify-content:center;
  animation:fadeIn .18s;
}
@media(min-width:540px) { .modal-bg { align-items:center; } }
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.modal-sheet {
  width:100%; max-width:460px; max-height:92vh; overflow-y:auto;
  background: var(--bg3);
  border:1px solid var(--glassb2);
  border-radius:var(--r-xl) var(--r-xl) 0 0;
  padding:20px;
  animation:slideUp .22s cubic-bezier(0.4,0,0.2,1);
}
@media(min-width:540px) { .modal-sheet { border-radius:var(--r-xl); } }
@keyframes slideUp { from{transform:translateY(40px);opacity:0} to{transform:translateY(0);opacity:1} }
.modal-handle {
  width:36px; height:4px; border-radius:2px;
  background:var(--glassb3); margin:0 auto 16px;
}
.modal-title {
  font-family:'Bebas Neue',sans-serif;
  font-size:22px; letter-spacing:2.5px;
  display:flex; justify-content:space-between; align-items:center;
  margin-bottom:20px;
}

/* ── Form ── */
.form-grp { margin-bottom:14px; }
.form-lbl { font-size:10px; font-weight:700; color:var(--t2); letter-spacing:1.5px; text-transform:uppercase; margin-bottom:6px; display:block; }
.form-ctrl {
  width:100%; background:rgba(0,0,0,0.3);
  border:1px solid var(--glassb); border-radius:var(--r-md);
  padding:11px 13px; color:var(--t1);
  font-family:'Plus Jakarta Sans',sans-serif; font-size:14px; font-weight:500;
  outline:none; transition:border-color var(--transition);
}
.form-ctrl:focus { border-color:rgba(0,230,118,0.4); box-shadow:0 0 0 3px rgba(0,230,118,0.08); }
.form-ctrl option { background:var(--bg3); }
.form-2col { display:grid; grid-template-columns:1fr 1fr; gap:12px; }

/* ── Empty state ── */
.empty-state { text-align:center; padding:48px 20px; color:var(--t3); }
.empty-icon { font-size:44px; opacity:.25; margin-bottom:12px; }

/* ── Performer card (special) ── */
.performer-card { padding:16px; }
.performer-eyebrow {
  font-size:9px; letter-spacing:2.5px; font-family:'JetBrains Mono',monospace;
  font-weight:600; text-transform:uppercase; margin-bottom:10px;
}
.performer-inner { display:flex; align-items:center; gap:12px; margin-bottom:14px; }

/* ── Bento grid ── */
.bento { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px; }
.bento-full { grid-column:1/-1; }

/* ── NRR ── */
.nrr-pos { color:var(--green); font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600; }
.nrr-neg { color:var(--live);  font-family:'JetBrains Mono',monospace; font-size:12px; font-weight:600; }

/* Actions row */
.action-row { display:flex; gap:8px; flex-wrap:wrap; margin-top:12px; }

/* Mobile touch — no hover flicker */
@media(hover:none) { .g-card:hover { border-color:var(--glassb); transform:none; } }

@media(max-width:380px) {
  .hero-kpis { grid-template-columns:repeat(2,1fr); }
  .bento { grid-template-columns:1fr; }
  .bento-full { grid-column:auto; }
}
`;

// ── SVG icons ────────────────────────────────────────────────────────────────
const Ico = {
  dash:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>,
  teams:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  live:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>,
  stats:  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  trophy: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="8 21 12 21 16 21"/><line x1="12" y1="17" x2="12" y2="21"/><path d="M7 4H17l-1 7a5 5 0 0 1-10 0L7 4"/><path d="M5 4H3a2 2 0 0 0 0 4h2"/><path d="M19 4h2a2 2 0 0 0 0 4h-2"/></svg>,
  plus:   <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  close:  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  edit:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  trash:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>,
  cal:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  pin:    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
};

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tab,  setTab]  = useState("dash");
  const [data, setData] = useState(null);
  const [modal,setModal]= useState(null);
  const [ready,setReady]= useState(false);

  useEffect(() => {
    loadData().then(d => { setData(d || SEED); setReady(true); });
  }, []);

  useEffect(() => { if (data) saveData(data); }, [data]);

  const update = useCallback(fn => setData(d => {
    const c = JSON.parse(JSON.stringify(d)); fn(c); return c;
  }), []);

  if (!ready) return (
    <>
      <style>{CSS}</style>
      <div style={{height:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#050810",gap:16}}>
        <div style={{fontSize:52,animation:"livePulse 1.4s infinite"}}>🏏</div>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:28,letterSpacing:4,background:"linear-gradient(135deg,#fff,#00e676)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>LOADING...</div>
      </div>
    </>
  );

  const teamMap   = Object.fromEntries(data.teams.map(t=>[t.id,t]));
  const liveCount = data.matches.filter(m=>m.status==="live").length;

  const NAV = [
    {id:"dash",  label:"Home",     icon:Ico.dash},
    {id:"teams", label:"Teams",    icon:Ico.teams},
    {id:"live",  label:"Live",     icon:Ico.live,  badge:liveCount},
    {id:"stats", label:"Stats",    icon:Ico.stats},
    {id:"league",label:"League",   icon:Ico.trophy},
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* ── Header ── */}
        <header className="header">
          <div className="header-brand">
            <div className="header-logo-ring">🏏</div>
            <div>
              <div className="header-wordmark">CricStat Pro</div>
              <div className="header-sub">Management System</div>
            </div>
          </div>
          {liveCount > 0 && (
            <div className="live-pill">
              <span className="live-dot"/>
              {liveCount} LIVE
            </div>
          )}
        </header>

        {/* ── Content ── */}
        <div className="scroll-area">
          {tab==="dash"   && <Dashboard  data={data} teamMap={teamMap} update={update} setModal={setModal} />}
          {tab==="teams"  && <Teams      data={data} teamMap={teamMap} update={update} setModal={setModal} />}
          {tab==="live"   && <Live       data={data} teamMap={teamMap} update={update} setModal={setModal} />}
          {tab==="stats"  && <StatsTab   data={data} teamMap={teamMap} />}
          {tab==="league" && <League     data={data} teamMap={teamMap} update={update} />}
        </div>

        {/* ── Bottom Nav ── */}
        <nav className="bottom-nav">
          {NAV.map(n => (
            <button key={n.id} className={`nav-item${tab===n.id?" active":""}`} onClick={()=>setTab(n.id)}>
              {n.badge > 0 && <span className="nav-badge">{n.badge}</span>}
              <div className="nav-icon-wrap">{n.icon}</div>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </nav>

        {/* ── Modals ── */}
        {modal && <ModalHub modal={modal} close={()=>setModal(null)} data={data} update={update} teamMap={teamMap} />}
      </div>
    </>
  );
}

// ── Dashboard ────────────────────────────────────────────────────────────────
function Dashboard({ data, teamMap, update, setModal }) {
  const live     = data.matches.filter(m=>m.status==="live");
  const upcoming = data.matches.filter(m=>m.status==="upcoming").slice(0,2);
  const topBat   = [...data.players].sort((a,b)=>b.runs-a.runs)[0];
  const topBowl  = [...data.players].sort((a,b)=>b.wickets-a.wickets)[0];
  const done     = data.matches.filter(m=>m.status==="completed").length;

  return (
    <>
      {/* Hero */}
      <div className="hero-banner">
        <div className="hero-eyebrow">⚡ Season 2025</div>
        <div className="hero-title">{data.league.name}</div>
        <div className="hero-sub">Multi-format · T20 / T10 / Custom</div>
        <div className="hero-kpis">
          <div className="hero-kpi"><span className="hero-kpi-val">{data.teams.length}</span><span className="hero-kpi-lbl">Teams</span></div>
          <div className="hero-kpi"><span className="hero-kpi-val">{data.players.length}</span><span className="hero-kpi-lbl">Players</span></div>
          <div className="hero-kpi"><span className="hero-kpi-val">{done}</span><span className="hero-kpi-lbl">Played</span></div>
          <div className="hero-kpi"><span className="hero-kpi-val" style={{color:"var(--live)"}}>{live.length}</span><span className="hero-kpi-lbl">Live</span></div>
        </div>
      </div>

      {/* Live now */}
      {live.length > 0 && (
        <>
          <SectionHdr title="🔴 Live Now" />
          {live.map(m => <MatchCard key={m.id} m={m} teamMap={teamMap} update={update} setModal={setModal} />)}
        </>
      )}

      {/* Top performers bento */}
      <SectionHdr title="⭐ Top Performers" />
      <div className="bento">
        {topBat && <PerformerCard label="Top Batsman" color="gold" player={topBat} teamMap={teamMap} metric="runs" metricLabel="Runs" />}
        {topBowl && <PerformerCard label="Top Bowler" color="cyan" player={topBowl} teamMap={teamMap} metric="wickets" metricLabel="Wkts" />}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <>
          <SectionHdr title="📅 Upcoming" />
          {upcoming.map(m => <MatchCard key={m.id} m={m} teamMap={teamMap} />)}
        </>
      )}
    </>
  );
}

function PerformerCard({ label, color, player, teamMap, metric, metricLabel }) {
  const accent = color === "gold" ? "var(--gold)" : "var(--cyan)";
  const bg     = color === "gold" ? "var(--gold2)" : "var(--cyan2)";
  const initials = player.name.split(" ").map(w=>w[0]).join("").slice(0,2);
  return (
    <div className="g-card performer-card" data-accent={color}>
      <div className="performer-eyebrow" style={{color:accent}}>{label}</div>
      <div className="performer-inner">
        <div className="p-avatar" style={{background:bg,color:accent,border:`1.5px solid ${accent}44`,fontSize:14}}>{initials}</div>
        <div>
          <div style={{fontWeight:800,fontSize:14,lineHeight:1.2}}>{player.name}</div>
          <div style={{fontSize:11,color:"var(--t2)",marginTop:2}}>{teamMap[player.team]?.short || "—"}</div>
        </div>
      </div>
      <div style={{textAlign:"center",padding:"8px 0",background:"rgba(0,0,0,0.2)",borderRadius:"var(--r-sm)"}}>
        <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:30,color:accent,letterSpacing:1,lineHeight:1}}>{player[metric]}</div>
        <div style={{fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1}}>{metricLabel}</div>
      </div>
    </div>
  );
}

// ── Teams ─────────────────────────────────────────────────────────────────────
function Teams({ data, teamMap, update, setModal }) {
  const playerMap = Object.fromEntries(data.players.map(p=>[p.id,p]));

  return (
    <>
      <SectionHdr title="Teams" action={<button className="btn btn-primary btn-sm" onClick={()=>setModal({type:"addTeam"})}>{Ico.plus} Add</button>} />
      {data.teams.length === 0 && <EmptyState icon="🏟️" text="No teams yet. Tap Add to get started." />}
      {data.teams.map(team => (
        <div key={team.id} className="g-card team-card" data-accent="green" style={{marginBottom:10}}>
          <div className="team-card-head">
            <div className="team-logo-box">{team.logo}</div>
            <div style={{flex:1}}>
              <div className="team-name">{team.name}</div>
              <div className="team-code">{team.short}</div>
              <div style={{display:"flex",gap:5,marginTop:5}}>
                <span className="tag tag-cyan">{team.format}</span>
                <span className="tag tag-ghost">{team.players.length} players</span>
              </div>
            </div>
            <div style={{display:"flex",gap:5}}>
              <button className="btn btn-glass btn-icon btn-sm" onClick={()=>setModal({type:"editTeam",item:team})}>{Ico.edit}</button>
              <button className="btn btn-danger btn-icon btn-sm" onClick={()=>update(d=>{d.teams=d.teams.filter(t=>t.id!==team.id)})}>{Ico.trash}</button>
            </div>
          </div>
          {team.players.slice(0,4).map(pid=>playerMap[pid]).filter(Boolean).map(p=>(
            <div key={p.id} className="team-player-row">
              <div className="p-avatar" style={{width:28,height:28,fontSize:11,background:`${ROLE_ACCENT[p.role]}22`,color:ROLE_ACCENT[p.role],border:`1.5px solid ${ROLE_ACCENT[p.role]}44`}}>
                {p.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
              </div>
              <span style={{flex:1,fontSize:13,fontWeight:600}}>{p.name}</span>
              <span className="tag tag-ghost" style={{fontSize:9}}>{p.role.split("-")[0]}</span>
            </div>
          ))}
          {team.players.length > 4 && <div style={{fontSize:11,color:"var(--t3)",paddingTop:6}}>+{team.players.length-4} more players</div>}
        </div>
      ))}

      {/* Players section */}
      <SectionHdr title="Players" action={<button className="btn btn-primary btn-sm" onClick={()=>setModal({type:"addPlayer"})}>{Ico.plus} Add</button>} />
      {data.players.length === 0 && <EmptyState icon="🏃" text="No players yet." />}
      {data.players.map(p => (
        <PlayerCard key={p.id} p={p} teamMap={teamMap} update={update} setModal={setModal} />
      ))}
    </>
  );
}

function PlayerCard({ p, teamMap, update, setModal }) {
  const color = ROLE_ACCENT[p.role] || "#888";
  const init  = p.name.split(" ").map(w=>w[0]).join("").slice(0,2);
  return (
    <div className="g-card player-card" style={{marginBottom:10,borderTop:`2px solid ${color}44`}}>
      <div className="player-card-top">
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div className="p-avatar" style={{background:`${color}18`,color,border:`1.5px solid ${color}44`}}>{init}</div>
          <div>
            <div style={{fontWeight:800,fontSize:15}}>{p.name}</div>
            <div style={{fontSize:11,color:"var(--t2)",marginTop:2}}>{teamMap[p.team]?.short || "Free Agent"}</div>
            <span className="tag tag-ghost" style={{marginTop:3,borderColor:`${color}33`,color,fontSize:9}}>{p.role}</span>
          </div>
        </div>
        <div style={{display:"flex",gap:5}}>
          <button className="btn btn-glass btn-icon btn-sm" onClick={()=>setModal({type:"editPlayer",item:p})}>{Ico.edit}</button>
          <button className="btn btn-danger btn-icon btn-sm" onClick={()=>update(d=>{
            d.players=d.players.filter(x=>x.id!==p.id);
            if(p.team){const t=d.teams.find(t=>t.id===p.team);if(t)t.players=t.players.filter(pid=>pid!==p.id);}
          })}>{Ico.trash}</button>
        </div>
      </div>
      <div className="stat-grid">
        {[["Runs",p.runs,"var(--gold)"],["Wkts",p.wickets,"var(--cyan)"],["Matches",p.matches,"var(--green)"],
          ["Avg",p.avg,"var(--gold)"],["S/R",p.sr,"var(--gold)"],["Ct",p.catches,"var(--t1)"]].map(([l,v,c])=>(
          <div key={l} className="stat-cell">
            <span className="stat-cell-val" style={{color:c}}>{v}</span>
            <span className="stat-cell-lbl">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Live ──────────────────────────────────────────────────────────────────────
function Live({ data, teamMap, update, setModal }) {
  const live     = data.matches.filter(m=>m.status==="live");
  const upcoming = data.matches.filter(m=>m.status==="upcoming");
  const done     = data.matches.filter(m=>m.status==="completed");

  return (
    <>
      {live.map(m => {
        const t1=teamMap[m.t1], t2=teamMap[m.t2];
        return (
          <div key={m.id} className="live-hero">
            <div className="live-hero-top">
              <span className="tag tag-live">🔴 LIVE</span>
              <span className="tag tag-cyan">{m.fmt}</span>
              <span style={{fontSize:11,color:"var(--t3)",marginLeft:"auto"}}>{m.venue}</span>
            </div>
            <div className="live-score-row">
              <div className="live-team">
                <span className="live-team-logo">{t1?.logo}</span>
                <div className="live-team-name">{t1?.short}</div>
                <div className="live-score-big">{m.s1||"—"}</div>
              </div>
              <div className="live-vs">VS</div>
              <div className="live-team">
                <span className="live-team-logo">{t2?.logo}</span>
                <div className="live-team-name">{t2?.short}</div>
                <div className="live-score-big" style={{color:m.s2==="Yet to bat"?"var(--t3)":"var(--green)"}}>{m.s2||"Yet to bat"}</div>
              </div>
            </div>
            <div className="action-row">
              <button className="btn btn-glass btn-sm" onClick={()=>setModal({type:"score",item:m})}>✏️ Update Score</button>
              <button className="btn btn-glass btn-sm" onClick={()=>update(d=>{const x=d.matches.find(x=>x.id===m.id);if(x)x.status="completed";})}>✅ End Match</button>
            </div>
          </div>
        );
      })}

      <SectionHdr title="All Matches" action={<button className="btn btn-primary btn-sm" onClick={()=>setModal({type:"addMatch"})}>{Ico.plus} Schedule</button>} />
      {data.matches.length===0 && <EmptyState icon="🏟️" text="No matches yet." />}
      {[...live,...upcoming,...done].map(m=><MatchCard key={m.id} m={m} teamMap={teamMap} update={update} setModal={setModal} editable />)}
    </>
  );
}

// ── Stats ─────────────────────────────────────────────────────────────────────
function StatsTab({ data, teamMap }) {
  const [metric, setMetric] = useState("runs");
  const METRICS = [{k:"runs",l:"Runs"},{k:"wickets",l:"Wickets"},{k:"catches",l:"Catches"},{k:"matches",l:"Matches"}];
  const sorted = [...data.players].sort((a,b)=>b[metric]-a[metric]);
  const max    = sorted[0]?.[metric] || 1;

  return (
    <>
      <SectionHdr title="Leaderboard" />
      <div className="chip-row">
        {METRICS.map(({k,l})=>(
          <button key={k} className={`chip-btn${metric===k?" on":""}`} onClick={()=>setMetric(k)}>{l}</button>
        ))}
      </div>
      <div className="lb-list">
        {sorted.map((p,i)=>{
          const color = ROLE_ACCENT[p.role]||"#888";
          const pct   = (p[metric]/max)*100;
          const medal = ["🥇","🥈","🥉"][i] || (i+1);
          return (
            <div key={p.id} className="lb-row">
              <div className="lb-rank" style={i<3?{fontSize:18}:{}}>{medal}</div>
              <div className="p-avatar" style={{width:36,height:36,fontSize:12,background:`${color}18`,color,border:`1.5px solid ${color}44`,flexShrink:0}}>
                {p.name.split(" ").map(w=>w[0]).join("").slice(0,2)}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div className="lb-name" style={{fontSize:13}}>{p.name}</div>
                <div className="lb-team-label">{teamMap[p.team]?.short||"—"} · {p.role}</div>
                <div className="lb-progress-bg">
                  <div className="lb-progress-fill" style={{width:`${pct}%`,background:`linear-gradient(to right,${color},${color}66)`}}/>
                </div>
              </div>
              <div className="lb-val" style={{color}}>{p[metric]}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── League ────────────────────────────────────────────────────────────────────
function League({ data, teamMap }) {
  const done = data.matches.filter(m=>m.status==="completed");
  return (
    <>
      <div className="hero-banner" style={{marginBottom:16}}>
        <div className="hero-eyebrow">🏆 Tournament</div>
        <div className="hero-title" style={{fontSize:"clamp(24px,7vw,38px)"}}>{data.league.name}</div>
        <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
          <span className="tag tag-green">T20 Format</span>
          <span className="tag tag-ghost">{data.teams.length} Teams</span>
          <span className="tag tag-gold">{done.length} Matches Played</span>
        </div>
      </div>

      <SectionHdr title="Points Table" />
      <div className="standings-wrap" style={{marginBottom:16}}>
        <table className="standings-tbl">
          <thead>
            <tr>
              <th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>Pts</th><th>NRR</th>
            </tr>
          </thead>
          <tbody>
            {data.league.standings.map((row,i)=>{
              const t=teamMap[row.tid];
              return (
                <tr key={row.tid}>
                  <td><span className={`rank-dot rank-${i+1}`}>{i+1}</span></td>
                  <td>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{fontSize:20}}>{t?.logo}</span>
                      <div>
                        <div style={{fontWeight:800,fontSize:13}}>{t?.short}</div>
                        <div style={{fontSize:10,color:"var(--t3)"}}>{t?.name}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{color:"var(--t2)"}}>{row.p}</td>
                  <td style={{color:"var(--green)",fontWeight:700}}>{row.w}</td>
                  <td style={{color:"var(--live)"}}>{row.l}</td>
                  <td><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"var(--gold)"}}>{row.pts}</span></td>
                  <td><span className={row.nrr.startsWith("-")?"nrr-neg":"nrr-pos"}>{row.nrr}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <SectionHdr title="Results" />
      {done.map(m=><MatchCard key={m.id} m={m} teamMap={teamMap} />)}
      {done.length===0 && <EmptyState icon="📋" text="No results yet." />}
    </>
  );
}

// ── Match Card ────────────────────────────────────────────────────────────────
function MatchCard({ m, teamMap, update, setModal, editable }) {
  const t1 = teamMap[m.t1], t2 = teamMap[m.t2];
  const winner = m.winner ? teamMap[m.winner] : null;
  const accentColor = m.status==="live"?"live":m.status==="completed"?"green":"gold";

  return (
    <div className="g-card match-card" data-accent={accentColor} style={{marginBottom:10}}>
      <div className="match-teams-row">
        <div className="match-team">
          <span className="match-team-logo">{t1?.logo}</span>
          <span className="match-team-short">{t1?.short}</span>
          {m.s1 && <span className="match-score">{m.s1}</span>}
        </div>
        <div className="vs-orb">VS</div>
        <div className="match-team">
          <span className="match-team-logo">{t2?.logo}</span>
          <span className="match-team-short">{t2?.short}</span>
          {m.s2 && <span className="match-score">{m.s2}</span>}
        </div>
      </div>
      <div className="match-footer">
        <span className={`tag tag-${accentColor==="live"?"live":accentColor==="green"?"green":"gold"}`}>
          {m.status==="live"?"🔴 LIVE":m.status.toUpperCase()}
        </span>
        <span className="tag tag-cyan">{m.fmt}</span>
        <span className="match-meta">{Ico.cal} {m.date}</span>
        {m.venue && <span className="match-meta">{Ico.pin} {m.venue}</span>}
      </div>
      {winner && <div className="winner-strip">🏆 {winner.name} won</div>}
      {editable && m.status!=="completed" && (
        <div className="action-row">
          {m.status==="upcoming" && (
            <button className="btn btn-glass btn-sm" onClick={()=>update(d=>{const x=d.matches.find(x=>x.id===m.id);if(x)x.status="live";})}>▶ Start</button>
          )}
          {m.status==="live" && (
            <button className="btn btn-glass btn-sm" onClick={()=>setModal?.({type:"score",item:m})}>✏️ Score</button>
          )}
          <button className="btn btn-danger btn-sm" onClick={()=>update(d=>{d.matches=d.matches.filter(x=>x.id!==m.id);})}>{Ico.trash}</button>
        </div>
      )}
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function SectionHdr({ title, action }) {
  return (
    <div className="section-hdr">
      <span className="section-hdr-title">{title}</span>
      <div className="section-hdr-line" />
      {action}
    </div>
  );
}
function EmptyState({ icon, text }) {
  return <div className="empty-state"><div className="empty-icon">{icon}</div>{text}</div>;
}

// ── Modal Hub ─────────────────────────────────────────────────────────────────
function ModalHub({ modal, close, data, update, teamMap }) {
  return (
    <div className="modal-bg" onClick={e=>e.target===e.currentTarget&&close()}>
      <div className="modal-sheet">
        <div className="modal-handle"/>
        {modal.type==="addTeam"   && <TeamModal   close={close} update={update} />}
        {modal.type==="editTeam"  && <TeamModal   close={close} update={update} item={modal.item} />}
        {modal.type==="addPlayer" && <PlayerModal close={close} update={update} teams={data.teams} />}
        {modal.type==="editPlayer"&& <PlayerModal close={close} update={update} teams={data.teams} item={modal.item} />}
        {modal.type==="addMatch"  && <MatchModal  close={close} update={update} teams={data.teams} />}
        {modal.type==="score"     && <ScoreModal  close={close} update={update} match={modal.item} teamMap={teamMap} />}
      </div>
    </div>
  );
}

// ── Team Modal ────────────────────────────────────────────────────────────────
function TeamModal({ close, update, item }) {
  const [f, setF] = useState(item||{name:"",short:"",logo:"🏏",format:"T20",players:[]});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const LOGOS = ["🏏","🔵","🔴","🟡","🟢","🟠","🟣","⚫","🦅","🐯","🦁","⭐"];
  const save=()=>{
    if(!f.name||!f.short)return;
    update(d=>{
      if(item){const i=d.teams.findIndex(t=>t.id===item.id);if(i>=0)d.teams[i]={...d.teams[i],...f};}
      else d.teams.push({...f,id:"t"+uid(),players:[]});
    });
    close();
  };
  return (
    <>
      <div className="modal-title">{item?"EDIT TEAM":"ADD TEAM"}<button className="btn btn-glass btn-icon" onClick={close}>{Ico.close}</button></div>
      <div className="form-grp"><label className="form-lbl">Team Name</label><input className="form-ctrl" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Mumbai Mavericks"/></div>
      <div className="form-2col">
        <div className="form-grp"><label className="form-lbl">Short Code</label><input className="form-ctrl" value={f.short} onChange={e=>set("short",e.target.value.toUpperCase().slice(0,4))} placeholder="MUM"/></div>
        <div className="form-grp"><label className="form-lbl">Format</label><select className="form-ctrl" value={f.format} onChange={e=>set("format",e.target.value)}>{FMTS.map(x=><option key={x}>{x}</option>)}</select></div>
      </div>
      <div className="form-grp">
        <label className="form-lbl">Logo</label>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {LOGOS.map(l=><button key={l} onClick={()=>set("logo",l)} style={{fontSize:20,width:38,height:38,borderRadius:10,border:`2px solid ${f.logo===l?"var(--green)":"var(--glassb)"}`,background:"rgba(0,0,0,0.3)",cursor:"pointer",transition:"var(--transition)"}}>{l}</button>)}
        </div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:6}}>
        <button className="btn btn-primary" style={{flex:1}} onClick={save}>{item?"Save Changes":"Add Team"}</button>
        <button className="btn btn-glass" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

// ── Player Modal ──────────────────────────────────────────────────────────────
function PlayerModal({ close, update, teams, item }) {
  const [f,setF]=useState(item||{name:"",role:"Batsman",team:"",runs:0,wickets:0,matches:0,avg:0,sr:0,catches:0});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{
    if(!f.name)return;
    update(d=>{
      if(item){
        const i=d.players.findIndex(p=>p.id===item.id);
        if(i>=0)d.players[i]={...d.players[i],...f};
        if(item.team!==f.team){
          const ot=d.teams.find(t=>t.id===item.team);if(ot)ot.players=ot.players.filter(p=>p!==item.id);
          const nt=d.teams.find(t=>t.id===f.team);if(nt&&!nt.players.includes(item.id))nt.players.push(item.id);
        }
      } else {
        const pid="p"+uid();
        d.players.push({...f,id:pid});
        if(f.team){const t=d.teams.find(t=>t.id===f.team);if(t)t.players.push(pid);}
      }
    });
    close();
  };
  return (
    <>
      <div className="modal-title">{item?"EDIT PLAYER":"ADD PLAYER"}<button className="btn btn-glass btn-icon" onClick={close}>{Ico.close}</button></div>
      <div className="form-grp"><label className="form-lbl">Full Name</label><input className="form-ctrl" value={f.name} onChange={e=>set("name",e.target.value)} placeholder="Player Name"/></div>
      <div className="form-2col">
        <div className="form-grp"><label className="form-lbl">Role</label><select className="form-ctrl" value={f.role} onChange={e=>set("role",e.target.value)}>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
        <div className="form-grp"><label className="form-lbl">Team</label><select className="form-ctrl" value={f.team} onChange={e=>set("team",e.target.value)}><option value="">Free Agent</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      </div>
      <div className="form-2col">
        <div className="form-grp"><label className="form-lbl">Runs</label><input type="number" className="form-ctrl" value={f.runs} onChange={e=>set("runs",+e.target.value)}/></div>
        <div className="form-grp"><label className="form-lbl">Wickets</label><input type="number" className="form-ctrl" value={f.wickets} onChange={e=>set("wickets",+e.target.value)}/></div>
      </div>
      <div className="form-2col">
        <div className="form-grp"><label className="form-lbl">Matches</label><input type="number" className="form-ctrl" value={f.matches} onChange={e=>set("matches",+e.target.value)}/></div>
        <div className="form-grp"><label className="form-lbl">Catches</label><input type="number" className="form-ctrl" value={f.catches} onChange={e=>set("catches",+e.target.value)}/></div>
      </div>
      <div className="form-2col">
        <div className="form-grp"><label className="form-lbl">Batting Avg</label><input type="number" step="0.1" className="form-ctrl" value={f.avg} onChange={e=>set("avg",+e.target.value)}/></div>
        <div className="form-grp"><label className="form-lbl">Strike Rate</label><input type="number" step="0.1" className="form-ctrl" value={f.sr} onChange={e=>set("sr",+e.target.value)}/></div>
      </div>
      <div style={{display:"flex",gap:10,marginTop:6}}>
        <button className="btn btn-primary" style={{flex:1}} onClick={save}>{item?"Save Changes":"Add Player"}</button>
        <button className="btn btn-glass" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

// ── Match Modal ───────────────────────────────────────────────────────────────
function MatchModal({ close, update, teams }) {
  const [f,setF]=useState({t1:"",t2:"",fmt:"T20",date:"",venue:"",status:"upcoming"});
  const set=(k,v)=>setF(p=>({...p,[k]:v}));
  const save=()=>{
    if(!f.t1||!f.t2||f.t1===f.t2)return;
    update(d=>d.matches.push({...f,id:"m"+uid(),winner:null,s1:"",s2:""}));
    close();
  };
  return (
    <>
      <div className="modal-title">SCHEDULE MATCH<button className="btn btn-glass btn-icon" onClick={close}>{Ico.close}</button></div>
      <div className="form-2col">
        <div className="form-grp"><label className="form-lbl">Team 1</label><select className="form-ctrl" value={f.t1} onChange={e=>set("t1",e.target.value)}><option value="">Select</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div className="form-grp"><label className="form-lbl">Team 2</label><select className="form-ctrl" value={f.t2} onChange={e=>set("t2",e.target.value)}><option value="">Select</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
      </div>
      <div className="form-2col">
        <div className="form-grp"><label className="form-lbl">Format</label><select className="form-ctrl" value={f.fmt} onChange={e=>set("fmt",e.target.value)}>{FMTS.map(x=><option key={x}>{x}</option>)}</select></div>
        <div className="form-grp"><label className="form-lbl">Date</label><input type="date" className="form-ctrl" value={f.date} onChange={e=>set("date",e.target.value)}/></div>
      </div>
      <div className="form-grp"><label className="form-lbl">Venue</label><input className="form-ctrl" value={f.venue} onChange={e=>set("venue",e.target.value)} placeholder="Stadium name"/></div>
      <div style={{display:"flex",gap:10,marginTop:6}}>
        <button className="btn btn-primary" style={{flex:1}} onClick={save}>Schedule Match</button>
        <button className="btn btn-glass" onClick={close}>Cancel</button>
      </div>
    </>
  );
}

// ── Score Modal ───────────────────────────────────────────────────────────────
function ScoreModal({ close, update, match:m, teamMap }) {
  const [s1,setS1]=useState(m.s1||"");
  const [s2,setS2]=useState(m.s2||"");
  const [winner,setWinner]=useState(m.winner||"");
  const t1=teamMap[m.t1], t2=teamMap[m.t2];
  const save=()=>{
    update(d=>{const x=d.matches.find(x=>x.id===m.id);if(x){x.s1=s1;x.s2=s2;x.winner=winner||null;}});
    close();
  };
  return (
    <>
      <div className="modal-title">UPDATE SCORE<button className="btn btn-glass btn-icon" onClick={close}>{Ico.close}</button></div>
      <div className="form-grp"><label className="form-lbl">{t1?.logo} {t1?.name}</label><input className="form-ctrl" value={s1} onChange={e=>setS1(e.target.value)} placeholder="186/4 (20)"/></div>
      <div className="form-grp"><label className="form-lbl">{t2?.logo} {t2?.name}</label><input className="form-ctrl" value={s2} onChange={e=>setS2(e.target.value)} placeholder="174/8 (20)"/></div>
      <div className="form-grp">
        <label className="form-lbl">Winner</label>
        <select className="form-ctrl" value={winner} onChange={e=>setWinner(e.target.value)}>
          <option value="">Match in progress</option>
          <option value={m.t1}>{t1?.name}</option>
          <option value={m.t2}>{t2?.name}</option>
        </select>
      </div>
      <div style={{display:"flex",gap:10,marginTop:6}}>
        <button className="btn btn-primary" style={{flex:1}} onClick={save}>Save Score</button>
        <button className="btn btn-glass" onClick={close}>Cancel</button>
      </div>
    </>
  );
}
