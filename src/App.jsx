import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════════════════════
// CONSTANTS & DEFAULTS
// ═══════════════════════════════════════════════════════════════════════
const uid = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_CATEGORIES = [
  {
    id: "warmup", title: "Warm-Up & Fundamentals", icon: "🔥", color: "#e2a12f",
    items: [
      { id: "wu-1", label: "Long Tones (pp → ff → pp)", sub: "Full range, focus on tone centering", mins: 10 },
      { id: "wu-2", label: "Lip Slurs / Flexibility", sub: "Bai Lin or Schlossberg patterns", mins: 10 },
      { id: "wu-3", label: "Mouthpiece Buzzing", sub: "Glissando + pitch matching", mins: 5 },
      { id: "wu-4", label: "Breathing Exercises", sub: "Breath builder or flow studies", mins: 5 },
    ],
  },
  {
    id: "technique", title: "Technique", icon: "⚙️", color: "#7c82f8",
    items: [
      { id: "tc-1", label: "Scales & Arpeggios", sub: "All 12 keys — major, minor, chromatic", mins: 10 },
      { id: "tc-2", label: "Articulation Drills", sub: "Single / double / triple tonguing", mins: 10 },
      { id: "tc-3", label: "Clarke Technical Studies", sub: "Current assignment or next study", mins: 10 },
      { id: "tc-4", label: "Range Building", sub: "Systematic upper register work", mins: 5 },
      { id: "tc-5", label: "Finger Dexterity / Valve Speed", sub: "Chromatic runs, awkward combos", mins: 5 },
    ],
  },
  {
    id: "etudes", title: "Etudes", icon: "📖", color: "#3fbf7f",
    items: [
      { id: "et-1", label: "Lyrical Etude", sub: "Concone, Bordogni, or Brandt", mins: 15 },
      { id: "et-2", label: "Technical Etude", sub: "Arban's, Charlier, or Bitsch", mins: 15 },
      { id: "et-3", label: "Characteristic Etude", sub: "Böhme, Bozza, or Tomasi", mins: 10 },
    ],
  },
  {
    id: "excerpts", title: "Orchestral Excerpts", icon: "🎼", color: "#e06090",
    items: [
      { id: "ex-1", label: "Excerpt #1 — Spotlight", sub: "Current audition list priority", mins: 15 },
      { id: "ex-2", label: "Excerpt #2 — Rotation", sub: "Rotating standard rep list", mins: 10 },
      { id: "ex-3", label: "Excerpt #3 — Maintenance", sub: "Keep old excerpts polished", mins: 10 },
    ],
  },
  {
    id: "repertoire", title: "Repertoire", icon: "🎺", color: "#f08040",
    items: [
      { id: "rp-1", label: "Solo Piece — Active", sub: "Current concerto or sonata", mins: 20 },
      { id: "rp-2", label: "Chamber / Ensemble Part", sub: "Quintet, band, or orchestra part", mins: 10 },
      { id: "rp-3", label: "Memorization Work", sub: "Run-throughs from memory", mins: 10 },
    ],
  },
  {
    id: "jazz", title: "Jazz & Improv", icon: "🎷", color: "#a070e0",
    items: [
      { id: "jz-1", label: "Jazz Down-Beat Reductions", sub: "Reduce lead sheets to chord tones on beats", mins: 10 },
      { id: "jz-2", label: "Transcription Practice", sub: "Learn / play back a transcribed solo", mins: 15 },
      { id: "jz-3", label: "ii-V-I Patterns (all keys)", sub: "Licks, enclosures, approach tones", mins: 10 },
      { id: "jz-4", label: "Play-Along / Backing Tracks", sub: "Aebersold or iReal Pro comping", mins: 10 },
    ],
  },
  {
    id: "sightread", title: "Sight-Reading & Musicianship", icon: "👁️", color: "#30b8b0",
    items: [
      { id: "sr-1", label: "Daily Sight-Read", sub: "New piece — one shot, no stopping", mins: 5 },
      { id: "sr-2", label: "Transposition Practice", sub: "Read in C, D, E♭, E, F — rotate key", mins: 5 },
      { id: "sr-3", label: "Rhythm Reading", sub: "Syncopation book or complex meters", mins: 5 },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// THEMES
// ═══════════════════════════════════════════════════════════════════════
const THEMES = {
  dark: {
    bg: "#0a0907", bgCard: "#12100d", bgInput: "#0a0907", bgItem: "#0d0b08",
    border: "#1e1a12", borderLight: "#2a2015",
    textPrimary: "#fef3c7", textSecondary: "#d4c5a0", textMuted: "#92704a", textFaint: "#6b5d42", textGhost: "#4a3d28", textDim: "#2a2015",
    ring: "#1a1510", scrollThumb: "#2a2015", checkBorder: "#3d3322",
    shadow: "0 24px 48px #00000088",
  },
  light: {
    bg: "#faf6ee", bgCard: "#ffffff", bgInput: "#f5f0e5", bgItem: "#fdfbf6",
    border: "#e8dfc8", borderLight: "#d6cbae",
    textPrimary: "#2c2416", textSecondary: "#5c4d35", textMuted: "#8a7a5a", textFaint: "#a09070", textGhost: "#c0b090", textDim: "#e8dfc8",
    ring: "#e8dfc8", scrollThumb: "#d6cbae", checkBorder: "#c0b090",
    shadow: "0 24px 48px #00000012",
  },
};

// ═══════════════════════════════════════════════════════════════════════
// CONFETTI ENGINE (enhanced with burst sizes)
// ═══════════════════════════════════════════════════════════════════════
function useConfetti() {
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const animRef = useRef(null);
  const active = useRef(false);

  const fire = useCallback((x, y, count = 55) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = x - rect.left;
    const cy = y - rect.top;
    const colors = ["#e2a12f","#7c82f8","#3fbf7f","#e06090","#f08040","#a070e0","#30b8b0","#fef3c7","#ff6b6b","#ffd93d"];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 1.2;
      const speed = 3 + Math.random() * 7;
      particles.current.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 3,
        size: 3 + Math.random() * 5,
        shape: Math.random() > 0.4 ? "r" : "c",
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1, decay: 0.012 + Math.random() * 0.012,
        rotation: Math.random() * 360, rotSpeed: (Math.random() - 0.5) * 12,
        gravity: 0.12 + Math.random() * 0.06,
      });
    }
    if (!active.current) {
      active.current = true;
      const animate = () => {
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.current = particles.current.filter(p => p.life > 0);
        particles.current.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += p.gravity; p.vx *= 0.98;
          p.life -= p.decay; p.rotation += p.rotSpeed;
          ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
          if (p.shape === "r") ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          else { ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2); ctx.fill(); }
          ctx.restore();
        });
        if (particles.current.length > 0) animRef.current = requestAnimationFrame(animate);
        else { active.current = false; ctx.clearRect(0, 0, canvas.width, canvas.height); }
      };
      animate();
    }
  }, []);

  const burst = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const w = canvas.width, h = canvas.height;
    const rect = canvas.getBoundingClientRect();
    fire(rect.left + w * 0.1, rect.top + h * 0.3, 40);
    fire(rect.left + w * 0.5, rect.top + h * 0.15, 60);
    fire(rect.left + w * 0.9, rect.top + h * 0.3, 40);
    setTimeout(() => {
      fire(rect.left + w * 0.3, rect.top + h * 0.4, 35);
      fire(rect.left + w * 0.7, rect.top + h * 0.4, 35);
    }, 200);
  }, [fire]);

  return { canvasRef, fire, burst };
}

// ═══════════════════════════════════════════════════════════════════════
// PERSISTENT STORAGE (streaks + theme)
// ═══════════════════════════════════════════════════════════════════════
function loadStreak() {
  try { const r = localStorage.getItem("trumpet-streak-v2"); return r ? JSON.parse(r) : { streak: 0, bestStreak: 0, lastCompleteDate: null, history: [] }; }
  catch { return { streak: 0, bestStreak: 0, lastCompleteDate: null, history: [] }; }
}
function saveStreak(d) {
  try { localStorage.setItem("trumpet-streak-v2", JSON.stringify(d)); } catch {}
}
function loadTheme() {
  try { return localStorage.getItem("trumpet-theme"); } catch {}
  return null;
}
function saveTheme(th) {
  try { localStorage.setItem("trumpet-theme", th); } catch {}
}
function loadCats() {
  try { const r = localStorage.getItem("trumpet-cats"); return r ? JSON.parse(r) : null; }
  catch { return null; }
}
function saveCats(d) {
  try { localStorage.setItem("trumpet-cats", JSON.stringify(d)); } catch {}
}
function loadDaily() {
  try {
    const r = localStorage.getItem("trumpet-daily");
    if (!r) return null;
    const d = JSON.parse(r);
    const tk = todayK();
    if (d.date !== tk) return null; // stale — different day
    return d;
  } catch { return null; }
}
function saveDaily(ckd, nts) {
  try { localStorage.setItem("trumpet-daily", JSON.stringify({ date: todayK(), ckd, nts })); } catch {}
}
function getSystemTheme() {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

// ═══════════════════════════════════════════════════════════════════════
// ICONS (SVGs)
// ═══════════════════════════════════════════════════════════════════════
const Chk = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const Plus = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const Trash = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>;
const Gear = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>;
const XIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
const Chev = ({ open }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{transform:open?"rotate(180deg)":"rotate(0)",transition:"transform 0.25s"}}><polyline points="6 9 12 15 18 9"/></svg>;
const Note = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>;
const Tmr = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const Sun = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>;
const Moon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>;
const AUp = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="18 15 12 9 6 15"/></svg>;
const ADn = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>;
const Pen = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const Grip = () => <svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor"><circle cx="3" cy="2" r="1.5"/><circle cx="7" cy="2" r="1.5"/><circle cx="3" cy="8" r="1.5"/><circle cx="7" cy="8" r="1.5"/><circle cx="3" cy="14" r="1.5"/><circle cx="7" cy="14" r="1.5"/></svg>;
const Trophy = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 9H4.5a2.5 2.5 0 010-5H6"/><path d="M18 9h1.5a2.5 2.5 0 000-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22"/><path d="M18 2H6v7a6 6 0 0012 0V2z"/></svg>;

// ═══════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════
function todayK() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function yesterdayK() { const d=new Date(); d.setDate(d.getDate()-1); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function fmtT(s) { return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`; }

// ═══════════════════════════════════════════════════════════════════════
// PROGRESS RING
// ═══════════════════════════════════════════════════════════════════════
function Ring({pct,totalMins,loggedMins,t}) {
  const r=52,c=2*Math.PI*r,off=c-(pct/100)*c;
  const col = pct>=100?"#3fbf7f":pct>=70?"#e2a12f":"#d97706";
  return (
    <div style={{display:"inline-flex",flexDirection:"column",alignItems:"center"}}>
      <svg width="140" height="140" viewBox="0 0 120 120">
        <defs><filter id="gl"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
        <circle cx="60" cy="60" r={r} fill="none" stroke={t.ring} strokeWidth="10"/>
        <circle cx="60" cy="60" r={r} fill="none" stroke={col} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} filter={pct>=100?"url(#gl)":"none"}
          transform="rotate(-90 60 60)" style={{transition:"stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1),stroke 0.4s"}}/>
        <text x="60" y="54" textAnchor="middle" fill={t.textPrimary} fontSize="26" fontWeight="800" fontFamily="'Playfair Display',Georgia,serif">{Math.round(pct)}%</text>
        <text x="60" y="72" textAnchor="middle" fill={t.textMuted} fontSize="10" fontWeight="600" letterSpacing="0.08em">COMPLETE</text>
      </svg>
      <div style={{display:"flex",gap:16,marginTop:8}}>
        {[{v:loggedMins,l:"MIN DONE"},{v:totalMins,l:"MIN GOAL"}].map((s,i)=>(
          <div key={i} style={{textAlign:"center",...(i?{borderLeft:`1px solid ${t.borderLight}`,paddingLeft:16}:{})}}>
            <div style={{fontSize:18,fontWeight:800,color:t.textPrimary,fontFamily:"'Playfair Display',Georgia,serif"}}>{s.v}</div>
            <div style={{fontSize:9,color:t.textMuted,fontWeight:600,letterSpacing:"0.1em"}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// PRACTICE TIMER
// ═══════════════════════════════════════════════════════════════════════
function Timer({targetMins,color,onComplete,visible,t}) {
  const [run,setRun]=useState(false);const [el,setEl]=useState(0);const ref=useRef(null);const tgt=targetMins*60;
  useEffect(()=>{if(run)ref.current=setInterval(()=>setEl(p=>p+1),1000);else clearInterval(ref.current);return()=>clearInterval(ref.current);},[run]);
  useEffect(()=>{if(el>=tgt&&run){setRun(false);onComplete?.();}},[el,tgt,run]);
  if(!visible)return null;
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6}} onClick={e=>e.stopPropagation()}>
      <div style={{flex:1,height:4,background:t.ring,borderRadius:2,overflow:"hidden"}}>
        <div style={{width:`${Math.min((el/tgt)*100,100)}%`,height:"100%",background:color,borderRadius:2,transition:"width 1s linear"}}/>
      </div>
      <span style={{fontSize:11,fontWeight:700,color:el>=tgt?"#3fbf7f":t.textPrimary,fontFamily:"monospace",minWidth:48,textAlign:"right"}}>{fmtT(el)}</span>
      <button onClick={e=>{e.stopPropagation();setRun(!run);}} style={{background:run?"#dc262618":`${color}18`,border:`1px solid ${run?"#dc262644":color+"44"}`,color:run?"#f87171":color,borderRadius:6,padding:"2px 8px",fontSize:10,fontWeight:700,cursor:"pointer"}}>{run?"PAUSE":el>0?"GO":"START"}</button>
      {el>0&&!run&&<button onClick={e=>{e.stopPropagation();setEl(0);}} style={{background:"none",border:"none",color:t.textGhost,fontSize:10,cursor:"pointer",fontWeight:700}}>RST</button>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// NOTES
// ═══════════════════════════════════════════════════════════════════════
function Notes({value,onChange,color,t}) {
  const [open,setOpen]=useState(false);
  return (
    <div style={{marginTop:4}} onClick={e=>e.stopPropagation()}>
      <button onClick={()=>setOpen(!open)} style={{background:"none",border:"none",color:t.textGhost,fontSize:10,cursor:"pointer",display:"flex",alignItems:"center",gap:3,padding:0,fontWeight:600}}><Note/> {open?"Hide":value?"Notes ✎":"Notes +"}</button>
      {open&&<textarea value={value} onChange={e=>onChange(e.target.value)} placeholder="Practice notes, tempo, observations..."
        style={{width:"100%",marginTop:3,padding:8,background:t.bgInput,border:`1px solid ${color}25`,borderRadius:6,color:t.textSecondary,fontSize:11,fontFamily:"inherit",resize:"vertical",minHeight:44,outline:"none"}}/>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MODAL
// ═══════════════════════════════════════════════════════════════════════
function Mdl({children,onClose,t}) {
  return (<div style={{position:"fixed",inset:0,background:"#000000aa",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{background:t.bgCard,border:`1px solid ${t.borderLight}`,borderRadius:16,padding:24,width:"100%",maxWidth:400,boxShadow:t.shadow}}>{children}</div>
  </div>);
}
function MdlH({title,onClose,t}) { return (<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}><span style={{fontSize:15,fontWeight:700,color:t.textPrimary,fontFamily:"'Playfair Display',Georgia,serif"}}>{title}</span><button onClick={onClose} style={{background:"none",border:"none",color:t.textMuted,cursor:"pointer"}}><XIcon/></button></div>); }
function MdlI({t,...p}) { return <input {...p} style={{padding:"10px 12px",background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:8,color:t.textPrimary,fontSize:13,outline:"none",fontFamily:"inherit",width:"100%",...(p.style||{})}}/>; }

// ═══════════════════════════════════════════════════════════════════════
// MODALS: Add Item, Add Category, Edit Item
// ═══════════════════════════════════════════════════════════════════════
function AddItemMdl({onAdd,onClose,cc,t}) {
  const [l,sL]=useState("");const [s,sS]=useState("");const [m,sM]=useState(10);
  return (<Mdl onClose={onClose} t={t}><MdlH title="Add Practice Item" onClose={onClose} t={t}/>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <MdlI value={l} onChange={e=>sL(e.target.value)} placeholder="Item name" t={t}/>
      <MdlI value={s} onChange={e=>sS(e.target.value)} placeholder="Description (optional)" t={t} style={{fontSize:12}}/>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:11,color:t.textMuted,fontWeight:600}}>Minutes:</label>
        <input type="number" value={m} onChange={e=>sM(Math.max(1,+e.target.value))} min="1" style={{width:60,padding:"6px 8px",background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:6,color:t.textPrimary,fontSize:13,outline:"none",textAlign:"center"}}/>
      </div>
      <button onClick={()=>{if(l.trim()){onAdd({id:uid(),label:l.trim(),sub:s.trim(),mins:m});onClose();}}} style={{padding:"10px",background:`${cc}18`,border:`1px solid ${cc}44`,borderRadius:10,color:cc,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}>+ Add Item</button>
    </div>
  </Mdl>);
}

function AddCatMdl({onAdd,onClose,t}) {
  const [ti,sTi]=useState("");const [ic,sIc]=useState("🎵");const [co,sCo]=useState("#7c82f8");
  const cols=["#e2a12f","#7c82f8","#3fbf7f","#e06090","#f08040","#a070e0","#30b8b0","#ef4444","#3b82f6","#84cc16"];
  return (<Mdl onClose={onClose} t={t}><MdlH title="New Category" onClose={onClose} t={t}/>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"flex",gap:8}}>
        <input value={ic} onChange={e=>sIc(e.target.value)} maxLength={2} style={{width:48,padding:"10px",background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:8,color:t.textPrimary,fontSize:18,outline:"none",textAlign:"center"}}/>
        <MdlI value={ti} onChange={e=>sTi(e.target.value)} placeholder="Category name" t={t}/>
      </div>
      <div><label style={{fontSize:10,color:t.textMuted,fontWeight:600,letterSpacing:"0.08em",display:"block",marginBottom:6}}>ACCENT COLOR</label>
        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{cols.map(c=><button key={c} onClick={()=>sCo(c)} style={{width:28,height:28,borderRadius:8,background:c,border:co===c?`2px solid ${t.textPrimary}`:"2px solid transparent",cursor:"pointer"}}/>)}</div>
      </div>
      <button onClick={()=>{if(ti.trim()){onAdd({id:uid(),title:ti.trim(),icon:ic,color:co,items:[]});onClose();}}} style={{padding:"10px",background:`${co}18`,border:`1px solid ${co}44`,borderRadius:10,color:co,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}>+ Create Category</button>
    </div>
  </Mdl>);
}

function EditMdl({item,onSave,onClose,cc,t}) {
  const [l,sL]=useState(item.label);const [s,sS]=useState(item.sub||"");const [m,sM]=useState(item.mins||10);
  return (<Mdl onClose={onClose} t={t}><MdlH title="Edit Item" onClose={onClose} t={t}/>
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <MdlI value={l} onChange={e=>sL(e.target.value)} t={t}/>
      <MdlI value={s} onChange={e=>sS(e.target.value)} placeholder="Description" t={t} style={{fontSize:12}}/>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <label style={{fontSize:11,color:t.textMuted,fontWeight:600}}>Minutes:</label>
        <input type="number" value={m} onChange={e=>sM(Math.max(1,+e.target.value))} min="1" style={{width:60,padding:"6px 8px",background:t.bgInput,border:`1px solid ${t.border}`,borderRadius:6,color:t.textPrimary,fontSize:13,outline:"none",textAlign:"center"}}/>
      </div>
      <button onClick={()=>{onSave({...item,label:l.trim()||item.label,sub:s.trim(),mins:m});onClose();}} style={{padding:"10px",background:`${cc}18`,border:`1px solid ${cc}44`,borderRadius:10,color:cc,fontSize:13,fontWeight:700,cursor:"pointer",marginTop:4}}>Save Changes</button>
    </div>
  </Mdl>);
}

// ═══════════════════════════════════════════════════════════════════════
// STREAK BAR (enhanced: best streak, 14-day history, milestones)
// ═══════════════════════════════════════════════════════════════════════
function StreakBar({sd,t}) {
  const last14=[];
  for(let i=13;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
    last14.push({k,day:["S","M","T","W","T","F","S"][d.getDay()],done:sd.history.includes(k),today:i===0});
  }
  const milestones=[7,14,30,60,100,365];
  const nextMs=milestones.find(m=>m>sd.streak);
  const progress=nextMs?((sd.streak%nextMs)/nextMs)*100:100;
  return (
    <div style={{padding:"12px 14px",background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:12,marginBottom:16}}>
      {/* Top row: streak + best streak */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <span style={{fontSize:22}}>{sd.streak>0?"🔥":"💤"}</span>
          <div>
            <div style={{fontSize:20,fontWeight:800,color:sd.streak>0?"#e2a12f":t.textMuted,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1}}>{sd.streak}</div>
            <div style={{fontSize:8,color:t.textMuted,fontWeight:700,letterSpacing:"0.12em"}}>STREAK</div>
          </div>
        </div>
        <div style={{width:1,height:32,background:t.border}}/>
        {sd.bestStreak>0&&<div style={{display:"flex",alignItems:"center",gap:4}}>
          <span style={{color:"#ffd93d",display:"flex"}}><Trophy/></span>
          <div>
            <div style={{fontSize:16,fontWeight:800,color:"#ffd93d",fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1}}>{sd.bestStreak}</div>
            <div style={{fontSize:8,color:t.textMuted,fontWeight:700,letterSpacing:"0.12em"}}>BEST</div>
          </div>
          <div style={{width:1,height:32,background:t.border,marginLeft:10}}/>
        </div>}
        {nextMs&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div style={{fontSize:10,color:t.textGhost,fontWeight:700}}>{nextMs}-day</div>
          <div style={{width:48,height:4,background:t.ring,borderRadius:2,overflow:"hidden"}}>
            <div style={{width:`${progress}%`,height:"100%",background:"#e2a12f",borderRadius:2,transition:"width 0.4s"}}/>
          </div>
          <div style={{fontSize:8,color:t.textGhost,fontWeight:600}}>{nextMs-sd.streak} to go</div>
        </div>}
      </div>
      {/* 14-day history */}
      <div style={{display:"flex",gap:3,justifyContent:"center"}}>
        {last14.map(d=>(
          <div key={d.k} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
            <div style={{fontSize:7,fontWeight:700,color:d.today?t.textPrimary:t.textGhost,letterSpacing:"0.03em"}}>{d.day}</div>
            <div style={{width:18,height:18,borderRadius:5,background:d.done?"#3fbf7f":d.today?`${t.textMuted}22`:t.bgInput,border:d.today&&!d.done?`2px dashed ${t.textGhost}`:d.done?"none":`1px solid ${t.border}`,display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s"}}>
              {d.done&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// SECTION (enhanced: drag-and-drop items)
// ═══════════════════════════════════════════════════════════════════════
function Section({cat,ci,tc,checked,notes,onToggle,onNote,onAddI,onRemI,onEditI,onRemCat,onMoveCat,onMoveI,edit,timers,t,boom,
  onCatDragStart,onCatDragOver,onCatDrop,onCatDragEnd,catDropIdx,catDragIdx}) {
  const [fold,setFold]=useState(false);const [addO,setAddO]=useState(false);const [editI,setEditI]=useState(null);
  const dn=cat.items.filter(i=>checked[i.id]).length,tot=cat.items.length,allD=tot>0&&dn===tot;
  const cm=cat.items.reduce((s,i)=>s+(i.mins||0),0),cdm=cat.items.filter(i=>checked[i.id]).reduce((s,i)=>s+(i.mins||0),0);

  // Item drag-and-drop state
  const dragItem=useRef(null);
  const gripActive=useRef(false);
  const [dropIdx,setDropIdx]=useState(null);

  // Category grip
  const catGripActive=useRef(false);

  useEffect(()=>{
    const reset=()=>{gripActive.current=false;catGripActive.current=false;};
    window.addEventListener("mouseup",reset);
    return()=>window.removeEventListener("mouseup",reset);
  },[]);

  const handleTog=(id,e)=>{const was=checked[id];onToggle(id);if(!was&&e)boom(e);};

  // Item DnD handlers
  const onIDragStart=(e,idx)=>{
    if(!gripActive.current){e.preventDefault();return;}
    dragItem.current=idx;
    e.dataTransfer.effectAllowed="move";
    e.dataTransfer.setData("text/x-item",cat.id);
    e.stopPropagation();
    requestAnimationFrame(()=>{if(e.target)e.target.style.opacity="0.4";});
  };
  const onIDragEnd=(e)=>{
    if(e.target)e.target.style.opacity="1";
    dragItem.current=null;gripActive.current=false;setDropIdx(null);
  };
  const onIDragOver=(e,idx)=>{
    if(!e.dataTransfer.types.includes("text/x-item"))return;
    if(dragItem.current===null)return;
    e.preventDefault();e.stopPropagation();
    e.dataTransfer.dropEffect="move";
    setDropIdx(idx);
  };
  const onIDrop=(e,idx)=>{
    if(!e.dataTransfer.types.includes("text/x-item"))return;
    e.preventDefault();e.stopPropagation();
    const from=dragItem.current;
    if(from!==null&&from!==idx){
      const to=idx>from?idx-1:idx;
      onMoveI(cat.id,from,to);
    }
    dragItem.current=null;setDropIdx(null);
  };

  // Category DnD handlers
  const onCDragStart=(e)=>{
    if(!catGripActive.current){e.preventDefault();return;}
    e.dataTransfer.effectAllowed="move";
    e.dataTransfer.setData("text/x-category",String(ci));
    requestAnimationFrame(()=>{if(e.target)e.target.style.opacity="0.4";});
    onCatDragStart?.(ci);
  };
  const onCDragEnd=(e)=>{
    if(e.target)e.target.style.opacity="1";
    catGripActive.current=false;
    onCatDragEnd?.();
  };
  const onCDragOver=(e)=>{
    if(!e.dataTransfer.types.includes("text/x-category"))return;
    e.preventDefault();e.dataTransfer.dropEffect="move";
    onCatDragOver?.(ci);
  };
  const onCDrop2=(e)=>{
    if(!e.dataTransfer.types.includes("text/x-category"))return;
    e.preventDefault();
    onCatDrop?.(ci);
  };

  const isCatDrop=catDropIdx===ci&&catDragIdx!==null&&catDragIdx!==ci&&catDragIdx+1!==ci;

  return (
    <div style={{marginBottom:14}} draggable="true" onDragStart={onCDragStart} onDragEnd={onCDragEnd} onDragOver={onCDragOver} onDrop={onCDrop2}>
      {addO&&<AddItemMdl cc={cat.color} onAdd={item=>onAddI(cat.id,item)} onClose={()=>setAddO(false)} t={t}/>}
      {editI&&<EditMdl item={editI} cc={cat.color} onSave={u=>onEditI(cat.id,u)} onClose={()=>setEditI(null)} t={t}/>}
      {/* Category drop indicator */}
      <div style={{height:isCatDrop?3:0,background:cat.color,borderRadius:2,transition:"height 0.15s",marginBottom:isCatDrop?2:0}}/>
      {/* Category header */}
      <button onClick={()=>setFold(!fold)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",width:"100%",padding:"10px 14px",background:allD?`${cat.color}10`:t.bgCard,border:`1px solid ${allD?cat.color+"44":t.border}`,borderRadius:fold?10:"10px 10px 0 0",cursor:"pointer",transition:"all 0.25s"}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          {/* Category grip handle */}
          <span className="grip" onMouseDown={e=>{e.stopPropagation();catGripActive.current=true;}} onClick={e=>e.stopPropagation()} style={{color:t.textDim,flexShrink:0,display:"flex",alignItems:"center",padding:"4px 2px"}}><Grip/></span>
          {edit&&<div style={{display:"flex",flexDirection:"column",gap:1,marginRight:2}} onClick={e=>e.stopPropagation()}>
            <button disabled={ci===0} onClick={()=>onMoveCat(ci,ci-1)} style={{background:"none",border:"none",color:ci===0?t.textDim:t.textMuted,cursor:ci===0?"default":"pointer",padding:0,lineHeight:1}}><AUp/></button>
            <button disabled={ci===tc-1} onClick={()=>onMoveCat(ci,ci+1)} style={{background:"none",border:"none",color:ci===tc-1?t.textDim:t.textMuted,cursor:ci===tc-1?"default":"pointer",padding:0,lineHeight:1}}><ADn/></button>
          </div>}
          <span style={{fontSize:17}}>{cat.icon}</span>
          <span style={{fontSize:12,fontWeight:700,color:t.textPrimary,letterSpacing:"0.04em"}}>{cat.title}</span>
          <span style={{fontSize:9,color:t.textGhost,fontWeight:600}}>{cdm}/{cm}m</span>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:11,color:allD?"#3fbf7f":t.textMuted,fontWeight:700}}>{dn}/{tot}</span>
          {edit&&<span onClick={e=>{e.stopPropagation();onRemCat(cat.id);}} style={{color:"#f87171",cursor:"pointer",display:"flex"}}><Trash/></span>}
          <Chev open={!fold}/>
        </div>
      </button>
      {!fold&&(
        <div style={{background:t.bgItem,border:`1px solid ${t.border}`,borderTop:"none",borderRadius:"0 0 10px 10px",padding:"6px 6px 10px"}}>
          {cat.items.map((item,idx)=>{
            const isDn=!!checked[item.id];
            const isItemDrop=dropIdx===idx&&dragItem.current!==null&&dragItem.current!==idx&&dragItem.current+1!==idx;
            return (
              <div key={item.id} draggable="true"
                onDragStart={e=>onIDragStart(e,idx)}
                onDragEnd={onIDragEnd}
                onDragOver={e=>onIDragOver(e,idx)}
                onDrop={e=>onIDrop(e,idx)}
                style={{marginBottom:2}}>
                {/* Item drop indicator */}
                <div style={{height:isItemDrop?3:0,background:cat.color,borderRadius:2,transition:"height 0.15s",marginLeft:32,marginRight:8}}/>
                <button onClick={e=>handleTog(item.id,e)} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"10px 10px",width:"100%",background:isDn?`${cat.color}06`:"transparent",border:"none",borderRadius:8,cursor:"pointer",textAlign:"left",transition:"all 0.2s"}}>
                  {/* Item grip handle */}
                  <span className="grip" onMouseDown={e=>{e.stopPropagation();gripActive.current=true;}} onClick={e=>e.stopPropagation()} style={{color:t.textDim,flexShrink:0,display:"flex",alignItems:"center",padding:"4px 2px",marginTop:1}}><Grip/></span>
                  {edit&&<div style={{display:"flex",flexDirection:"column",gap:0,flexShrink:0,marginTop:2}} onClick={e=>e.stopPropagation()}>
                    <button disabled={idx===0} onClick={()=>onMoveI(cat.id,idx,idx-1)} style={{background:"none",border:"none",color:idx===0?t.textDim:t.textGhost,cursor:idx===0?"default":"pointer",padding:0,lineHeight:1}}><AUp/></button>
                    <button disabled={idx===cat.items.length-1} onClick={()=>onMoveI(cat.id,idx,idx+1)} style={{background:"none",border:"none",color:idx===cat.items.length-1?t.textDim:t.textGhost,cursor:idx===cat.items.length-1?"default":"pointer",padding:0,lineHeight:1}}><ADn/></button>
                  </div>}
                  <div style={{width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",background:isDn?cat.color:"transparent",border:isDn?"none":`2px solid ${t.checkBorder}`,transition:"all 0.2s"}}>{isDn&&<Chk/>}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
                      <span style={{fontSize:12,fontWeight:600,color:isDn?t.textFaint:t.textPrimary,textDecoration:isDn?"line-through":"none",transition:"all 0.2s"}}>{item.label}</span>
                      {item.mins&&<span style={{fontSize:9,fontWeight:700,color:cat.color,background:`${cat.color}12`,padding:"1px 6px",borderRadius:4,letterSpacing:"0.05em"}}>{item.mins}m</span>}
                      {edit&&<span style={{display:"flex",gap:4,marginLeft:"auto"}}>
                        <span onClick={e=>{e.stopPropagation();setEditI(item);}} style={{color:"#e2a12f",cursor:"pointer",display:"flex"}}><Pen/></span>
                        <span onClick={e=>{e.stopPropagation();onRemI(cat.id,item.id);}} style={{color:"#f87171",cursor:"pointer",display:"flex"}}><Trash/></span>
                      </span>}
                    </div>
                    {item.sub&&<div style={{fontSize:10,color:t.textFaint,marginTop:2,textDecoration:isDn?"line-through":"none"}}>{item.sub}</div>}
                    {!isDn&&item.mins&&<Timer targetMins={item.mins} color={cat.color} onComplete={()=>onToggle(item.id)} visible={timers} t={t}/>}
                    <Notes value={notes[item.id]||""} onChange={v=>onNote(item.id,v)} color={cat.color} t={t}/>
                  </div>
                </button>
              </div>
            );
          })}
          {/* End-of-list drop zone */}
          {cat.items.length>0&&<div
            onDragOver={e=>{if(!e.dataTransfer.types.includes("text/x-item"))return;if(dragItem.current===null)return;e.preventDefault();e.stopPropagation();setDropIdx(cat.items.length);}}
            onDrop={e=>{if(!e.dataTransfer.types.includes("text/x-item"))return;e.preventDefault();e.stopPropagation();const from=dragItem.current;if(from!==null&&from!==cat.items.length){const to=cat.items.length>from?cat.items.length-1:cat.items.length;onMoveI(cat.id,from,to);}dragItem.current=null;setDropIdx(null);}}
            style={{height:dropIdx===cat.items.length&&dragItem.current!==null&&dragItem.current!==cat.items.length-1?6:4,borderTop:dropIdx===cat.items.length&&dragItem.current!==null&&dragItem.current!==cat.items.length-1?`3px solid ${cat.color}`:"none",transition:"all 0.15s",marginLeft:32,marginRight:8}}/>}
          <button onClick={()=>setAddO(true)} style={{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"8px",background:"transparent",border:`1px dashed ${t.borderLight}44`,borderRadius:8,color:t.textGhost,fontSize:11,fontWeight:600,cursor:"pointer",marginTop:4}}><Plus/> Add Item</button>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
// MAIN APP (enhanced: theme persistence, DnD categories, mega confetti)
// ═══════════════════════════════════════════════════════════════════════
export default function App() {
  const tk=todayK(),now=new Date(),ds=now.toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});
  const [theme,setTheme]=useState(getSystemTheme);
  const [themeLoaded,setThemeLoaded]=useState(false);
  const [cats,setCats]=useState(()=>loadCats()||DEFAULT_CATEGORIES);
  const [ckd,setCkd]=useState(()=>loadDaily()?.ckd||{});
  const [nts,setNts]=useState(()=>loadDaily()?.nts||{});
  const [sd,setSd]=useState(tk);
  const [edit,setEdit]=useState(false);
  const [addCO,setAddCO]=useState(false);
  const [tmrs,setTmrs]=useState(true);
  const [strk,setStrk]=useState({streak:0,bestStreak:0,lastCompleteDate:null,history:[]});
  const [sLoad,setSLoad]=useState(false);
  const [allDoneBanner,setAllDoneBanner]=useState(false);

  // Category DnD state
  const catDragIdx=useRef(null);
  const [catDropIdx,setCatDropIdx]=useState(null);

  const t=THEMES[theme];
  const {canvasRef,fire,burst}=useConfetti();

  // Load saved theme
  useEffect(()=>{const saved=loadTheme();if(saved&&(saved==="dark"||saved==="light"))setTheme(saved);setThemeLoaded(true);},[]);

  // Toggle theme with persistence
  const toggleTheme=useCallback(()=>{
    const next=theme==="dark"?"light":"dark";
    setTheme(next);saveTheme(next);
  },[theme]);

  useEffect(()=>{const d=loadStreak();setStrk(d);setSLoad(true);},[]);
  useEffect(()=>{if(sd!==tk){setCkd({});setNts({});setSd(tk);}},[tk,sd]);

  // Persist categories on change
  useEffect(()=>{saveCats(cats);},[cats]);
  // Persist daily check-offs and notes on change
  useEffect(()=>{saveDaily(ckd,nts);},[ckd,nts]);

  const all=cats.flatMap(c=>c.items);
  const dc=all.filter(i=>ckd[i.id]).length,tc2=all.length;
  const pct=tc2?(dc/tc2)*100:0;
  const tM=all.reduce((s,i)=>s+(i.mins||0),0),lM=all.filter(i=>ckd[i.id]).reduce((s,i)=>s+(i.mins||0),0);

  // All-complete mega confetti
  const wasAllDone=useRef(false);
  useEffect(()=>{
    const allDone=tc2>0&&dc===tc2;
    if(allDone&&!wasAllDone.current){
      burst();
      setAllDoneBanner(true);
      setTimeout(()=>setAllDoneBanner(false),3000);
    }
    wasAllDone.current=allDone;
  },[dc,tc2,burst]);

  // Streak logic
  useEffect(()=>{
    if(!sLoad)return;
    const allC=tc2>0&&dc===tc2,logged=strk.history.includes(tk);
    if(allC&&!logged){
      const yk=yesterdayK(),hadY=strk.history.includes(yk),ns=hadY?strk.streak+1:1;
      const best=Math.max(strk.bestStreak||0,ns);
      const nd={streak:ns,bestStreak:best,lastCompleteDate:tk,history:[...strk.history.slice(-60),tk]};
      setStrk(nd);saveStreak(nd);
    } else if(!allC&&strk.lastCompleteDate===tk){
      const nh=strk.history.filter(d=>d!==tk),yk=yesterdayK(),hadY=nh.includes(yk);
      let rc=0;if(hadY){for(let i=1;i<=365;i++){const dd=new Date();dd.setDate(dd.getDate()-i);const k2=`${dd.getFullYear()}-${String(dd.getMonth()+1).padStart(2,"0")}-${String(dd.getDate()).padStart(2,"0")}`;if(nh.includes(k2))rc++;else break;}}
      const nd={streak:rc,bestStreak:strk.bestStreak||0,lastCompleteDate:rc>0?yk:null,history:nh};setStrk(nd);saveStreak(nd);
    }
  },[dc,tc2,sLoad]);

  useEffect(()=>{
    if(!sLoad)return;
    if(strk.lastCompleteDate&&strk.lastCompleteDate!==tk&&strk.lastCompleteDate!==yesterdayK()){
      const nd={...strk,streak:0};setStrk(nd);saveStreak(nd);
    }
  },[sLoad]);

  const tog=useCallback(id=>setCkd(p=>({...p,[id]:!p[id]})),[]);
  const onN=useCallback((id,v)=>setNts(p=>({...p,[id]:v})),[]);
  const addI=(cid,item)=>setCats(p=>p.map(c=>c.id===cid?{...c,items:[...c.items,item]}:c));
  const remI=(cid,iid)=>{setCats(p=>p.map(c=>c.id===cid?{...c,items:c.items.filter(i=>i.id!==iid)}:c));setCkd(p=>{const n={...p};delete n[iid];return n;});};
  const edtI=(cid,u)=>setCats(p=>p.map(c=>c.id===cid?{...c,items:c.items.map(i=>i.id===u.id?u:i)}:c));
  const remCat=cid=>{const ct=cats.find(c=>c.id===cid);if(ct)ct.items.forEach(i=>setCkd(p=>{const n={...p};delete n[i.id];return n;}));setCats(p=>p.filter(c=>c.id!==cid));};
  const addCat=c=>setCats(p=>[...p,c]);

  // Move functions (from/to are final indices)
  const movCat=(from,to)=>setCats(p=>{
    if(from===to||to<0||to>=p.length)return p;
    const a=[...p];const[item]=a.splice(from,1);a.splice(to,0,item);return a;
  });
  const movI=(cid,from,to)=>setCats(p=>p.map(c=>{
    if(c.id!==cid||from===to||to<0||to>=c.items.length)return c;
    const a=[...c.items];const[item]=a.splice(from,1);a.splice(to,0,item);return{...c,items:a};
  }));

  // Category DnD handlers
  const handleCatDragStart=(ci)=>{catDragIdx.current=ci;};
  const handleCatDragOver=(ci)=>{setCatDropIdx(ci);};
  const handleCatDrop=(ci)=>{
    const from=catDragIdx.current;
    if(from!==null&&from!==ci){
      const to=ci>from?ci-1:ci;
      movCat(from,to);
    }
    catDragIdx.current=null;setCatDropIdx(null);
  };
  const handleCatDragEnd=()=>{catDragIdx.current=null;setCatDropIdx(null);};

  const boom=e=>{const r=canvasRef.current?.getBoundingClientRect();if(r)fire(e.clientX||r.width/2,e.clientY||r.height/2);};

  return (
    <div style={{minHeight:"100vh",background:t.bg,color:t.textPrimary,fontFamily:"'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif",transition:"background 0.4s,color 0.4s"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap');*{box-sizing:border-box;margin:0;padding:0}::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${t.scrollThumb};border-radius:4px}input::placeholder,textarea::placeholder{color:${t.textGhost}}@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}@keyframes bannerIn{from{opacity:0;transform:translateY(-20px) scale(0.9)}to{opacity:1;transform:translateY(0) scale(1)}}@keyframes bannerOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(0.9)}}.grip{opacity:0.2;cursor:grab;transition:opacity 0.2s}.grip:hover{opacity:0.65}[draggable=true]{-webkit-user-select:none;user-select:none}`}</style>
      <canvas ref={canvasRef} width={typeof window!=="undefined"?window.innerWidth:800} height={typeof window!=="undefined"?window.innerHeight:1400} style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999}}/>
      {addCO&&<AddCatMdl onAdd={addCat} onClose={()=>setAddCO(false)} t={t}/>}
      {/* All-complete celebration banner */}
      {allDoneBanner&&<div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:1001,background:"linear-gradient(135deg,#3fbf7f,#2d9d66)",color:"#fff",padding:"12px 28px",borderRadius:16,fontSize:15,fontWeight:800,fontFamily:"'Playfair Display',Georgia,serif",boxShadow:"0 8px 32px #3fbf7f44",animation:"bannerIn 0.4s ease,bannerOut 0.4s ease 2.4s forwards",letterSpacing:"0.04em",display:"flex",alignItems:"center",gap:10}}>
        <span style={{fontSize:22}}>🎉</span> All Tasks Complete! <span style={{fontSize:22}}>🎺</span>
      </div>}
      <div style={{maxWidth:540,margin:"0 auto",padding:"20px 16px 80px"}}>
        {/* Theme toggle */}
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:8}}>
          <button onClick={toggleTheme} style={{display:"flex",alignItems:"center",gap:6,padding:"6px 14px",background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:20,color:t.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.3s"}}>
            {theme==="dark"?<Sun/>:<Moon/>}{theme==="dark"?"Light Mode":"Dark Mode"}
          </button>
        </div>
        {/* Header */}
        <div style={{textAlign:"center",marginBottom:16,animation:"fadeIn 0.5s ease"}}>
          <div style={{fontSize:10,fontWeight:700,color:t.textFaint,letterSpacing:"0.2em",textTransform:"uppercase",marginBottom:6}}>🎺 TRUMPET DAILY PRACTICE</div>
          <div style={{fontSize:24,fontWeight:800,color:t.textPrimary,fontFamily:"'Playfair Display',Georgia,serif",lineHeight:1.2}}>{ds}</div>
          <div style={{fontSize:10,color:t.textGhost,marginTop:4,fontWeight:500}}>{tc2} tasks · {cats.length} categories · {tM} minutes planned</div>
        </div>
        <StreakBar sd={strk} t={t}/>
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}><Ring pct={pct} totalMins={tM} loggedMins={lM} t={t}/></div>
        {/* Category bar */}
        <div style={{display:"flex",gap:3,marginBottom:16,borderRadius:6,overflow:"hidden",height:6,background:t.ring}}>
          {cats.map(c=>{const cd=c.items.filter(i=>ckd[i.id]).length,ct=c.items.length;return(<div key={c.id} style={{flex:ct||1,height:"100%",background:t.border}}><div style={{width:`${ct?(cd/ct)*100:0}%`,height:"100%",background:c.color,transition:"width 0.4s",borderRadius:1}}/></div>);})}
        </div>
        {/* Stats */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:16}}>
          {[{l:"CATEGORIES",v:cats.length,a:"#e2a12f"},{l:"TASKS DONE",v:`${dc}/${tc2}`,a:"#3fbf7f"},{l:"REMAINING",v:`${tM-lM}m`,a:"#7c82f8"}].map(s=>(
            <div key={s.l} style={{background:t.bgCard,borderRadius:10,padding:"10px 6px",textAlign:"center",border:`1px solid ${t.border}`}}>
              <div style={{fontSize:9,color:t.textFaint,fontWeight:700,letterSpacing:"0.1em"}}>{s.l}</div>
              <div style={{fontSize:17,fontWeight:800,color:s.a,marginTop:2,fontFamily:"'Playfair Display',Georgia,serif"}}>{s.v}</div>
            </div>
          ))}
        </div>
        {/* Toolbar */}
        <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
          <button onClick={()=>setEdit(!edit)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:edit?"#e2a12f15":t.bgCard,border:`1px solid ${edit?"#e2a12f44":t.border}`,borderRadius:8,color:edit?"#e2a12f":t.textMuted,fontSize:11,fontWeight:700,cursor:"pointer"}}>{edit?<><XIcon/> Done</>:<><Gear/> Customize</>}</button>
          <button onClick={()=>setAddCO(true)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:8,color:t.textMuted,fontSize:11,fontWeight:700,cursor:"pointer"}}><Plus/> Category</button>
          <button onClick={()=>setTmrs(!tmrs)} style={{display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:t.bgCard,border:`1px solid ${t.border}`,borderRadius:8,color:tmrs?"#30b8b0":t.textMuted,fontSize:11,fontWeight:700,cursor:"pointer",marginLeft:"auto"}}><Tmr/> Timers {tmrs?"ON":"OFF"}</button>
        </div>
        {/* Sections */}
        {cats.map((c,i)=><Section key={c.id} cat={c} ci={i} tc={cats.length} checked={ckd} notes={nts} onToggle={tog} onNote={onN} onAddI={addI} onRemI={remI} onEditI={edtI} onRemCat={remCat} onMoveCat={movCat} onMoveI={movI} edit={edit} timers={tmrs} t={t} boom={boom}
          onCatDragStart={handleCatDragStart} onCatDragOver={handleCatDragOver} onCatDrop={handleCatDrop} onCatDragEnd={handleCatDragEnd} catDropIdx={catDropIdx} catDragIdx={catDragIdx.current}/>)}
        {/* End-of-list category drop zone */}
        <div
          onDragOver={e=>{if(!e.dataTransfer.types.includes("text/x-category"))return;e.preventDefault();e.dataTransfer.dropEffect="move";setCatDropIdx(cats.length);}}
          onDrop={e=>{if(!e.dataTransfer.types.includes("text/x-category"))return;e.preventDefault();const from=catDragIdx.current;if(from!==null&&from!==cats.length){const to=cats.length>from?cats.length-1:cats.length;movCat(from,to);}catDragIdx.current=null;setCatDropIdx(null);}}
          style={{height:catDropIdx===cats.length&&catDragIdx.current!==null?6:4,borderTop:catDropIdx===cats.length&&catDragIdx.current!==null?`3px solid #e2a12f`:"none",transition:"all 0.15s"}}/>
        {/* Actions */}
        <div style={{display:"flex",gap:8,marginTop:12}}>
          <button onClick={()=>{setCkd({});setNts({});}} style={{flex:1,padding:"12px",borderRadius:10,border:"1px solid #dc262622",background:"#dc262608",color:"#f87171",fontSize:12,fontWeight:700,cursor:"pointer"}}>↻ Reset Today</button>
          <button onClick={()=>{setCats(DEFAULT_CATEGORIES);setCkd({});setNts({});setEdit(false);}} style={{flex:1,padding:"12px",borderRadius:10,border:`1px solid ${t.border}`,background:t.bgCard,color:t.textMuted,fontSize:12,fontWeight:700,cursor:"pointer"}}>⟲ Restore Defaults</button>
        </div>
        <div style={{textAlign:"center",marginTop:20,fontSize:9,color:t.textDim,letterSpacing:"0.05em"}}>Resets at midnight · Streak persists across sessions · Alan's Trumpet Practice Tracker</div>
      </div>
    </div>
  );
}
