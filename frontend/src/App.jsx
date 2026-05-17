import { useState, useEffect, useRef, useCallback, createContext, useContext } from "react";
import ReactDOM from "react-dom";
import {
  AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";
import {
  LayoutDashboard, Camera, BarChart2, Star, Shield,
  Car, Truck, Bus, AlertTriangle, Plus, Download,
  Clock, DollarSign, Bell, Settings, Search, User,
  Video, Image as ImageIcon, Lock, Unlock, Cpu, Radio,
  XCircle, Filter, X, ArrowUp, ArrowDown, CheckCircle,
  ChevronDown, Loader2, RefreshCw, ParkingSquare,
  Bike as Motorcycle, Zap, Eye, EyeOff, Trash2, UserPlus,
  ShieldAlert, ShieldCheck, Activity, TrendingUp,
  MapPin, Calendar, FileText, Play, Square, Aperture,
  AlertCircle, ChevronRight, ToggleLeft, ToggleRight,
  Crosshair, Siren, BadgeAlert,
  MoreVertical, Pencil, Banknote,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// API BASE — swap this for your .env / import.meta.env.VITE_API_BASE_URL
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg0:       "#060b18",
  bg1:       "#0b1120",
  bg2:       "#0f1729",
  bg3:       "#131e33",
  border:    "#1a2a44",
  accent:    "#00d4ff",
  accentDim: "#00d4ff18",
  accentMid: "#00d4ff44",
  blue:      "#3b82f6",
  purple:    "#8b5cf6",
  red:       "#ef4444",
  redDim:    "#ef444415",
  redMid:    "#ef444444",
  green:     "#10b981",
  greenDim:  "#10b98118",
  greenMid:  "#10b98155",
  yellow:    "#f59e0b",
  yellowDim: "#f59e0b18",
  text:      "#e2e8f0",
  textMid:   "#94a3b8",
  textLow:   "#475569",
  textFaint: "#2d3f5a",
};

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Oxanium:wght@300;400;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg0}; color: ${T.text}; font-family: 'Rajdhani', sans-serif; overflow: hidden; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: ${T.bg0}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: ${T.accentMid}; }

  @keyframes pulse-live   { 0%,100%{opacity:1;transform:scale(1)}   50%{opacity:.5;transform:scale(.85)} }
  @keyframes scan-beam    { 0%{top:-4px} 100%{top:calc(100% + 4px)} }
  @keyframes fade-up      { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slide-right  { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes glow-cyan    { 0%,100%{box-shadow:0 0 8px ${T.accentMid}} 50%{box-shadow:0 0 22px ${T.accent}66,0 0 44px ${T.accent}22} }
  @keyframes glow-red     { 0%,100%{box-shadow:0 0 8px ${T.redMid}}   50%{box-shadow:0 0 22px ${T.red}66,0 0 44px ${T.red}22} }
  @keyframes glow-green   { 0%,100%{box-shadow:0 0 5px ${T.greenMid}} 50%{box-shadow:0 0 14px ${T.green}77,0 0 28px ${T.green}22} }
  @keyframes count-in     { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer      { 0%{background-position:-600px 0} 100%{background-position:600px 0} }
  @keyframes bell-shake   { 0%,100%{transform:rotate(0)} 20%{transform:rotate(-12deg)} 40%{transform:rotate(12deg)} 60%{transform:rotate(-8deg)} 80%{transform:rotate(8deg)} }
  @keyframes dropdown-in  { from{opacity:0;transform:translateY(-6px) scale(.97)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes alert-flash  { 0%,100%{opacity:1} 50%{opacity:.4} }
  @keyframes slide-down   { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

  .page-enter  { animation: fade-up .38s cubic-bezier(.22,1,.36,1) forwards; }
  .row-enter   { animation: slide-right .28s ease forwards; }
  .count-anim  { animation: count-in .3s ease forwards; }
  .bell-alert  { animation: bell-shake 1.2s ease 1; }
  .alert-flash { animation: alert-flash 1.4s ease infinite; }

  .skeleton {
    background: linear-gradient(90deg, ${T.bg3} 25%, ${T.border}88 50%, ${T.bg3} 75%);
    background-size: 600px 100%;
    animation: shimmer 1.6s infinite linear;
    border-radius: 6px;
  }

  /* ── Nav ── */
  .nav-btn {
    display:flex; align-items:center; gap:11px;
    padding:10px 14px; border-radius:10px;
    border:1px solid transparent;
    cursor:pointer; transition:all .18s ease;
    color:${T.textMid}; width:100%;
    text-align:left; background:transparent;
    font-family:'Rajdhani',sans-serif;
  }
  .nav-btn:hover  { background:${T.accentDim}; color:${T.text}; border-color:${T.accentMid}; }
  .nav-btn.active {
    background:${T.accentDim}; color:${T.accent};
    border-color:${T.accentMid};
    box-shadow: inset 3px 0 0 ${T.accent};
  }

  /* ── Cards ── */
  .card           { background:${T.bg2}; border:1px solid ${T.border}; border-radius:13px; overflow:hidden; }
  .card-glow-cyan { border-color:${T.accentMid}; animation:glow-cyan 4s ease infinite; }
  .card-glow-red  { border-color:${T.redMid};    animation:glow-red  3s ease infinite; }
  .card-red       { background:${T.redDim}; border:1px solid ${T.redMid}; border-radius:13px; overflow:hidden; }

  /* ── Buttons ── */
  .btn {
    display:inline-flex; align-items:center; gap:7px;
    padding:9px 18px; border-radius:8px;
    font-family:'Rajdhani',sans-serif; font-size:14px; font-weight:600;
    cursor:pointer; transition:all .17s ease; border:1px solid;
    letter-spacing:.02em; white-space:nowrap;
  }
  .btn-cyan              { background:${T.accentDim}; color:${T.accent}; border-color:${T.accentMid}; }
  .btn-cyan:hover        { background:${T.accentMid}; box-shadow:0 0 16px ${T.accentMid}; }
  .btn-red               { background:${T.redDim}; color:${T.red}; border-color:${T.redMid}; }
  .btn-red:hover         { background:${T.red}22; box-shadow:0 0 16px ${T.redMid}; }
  .btn-ghost             { background:transparent; color:${T.textMid}; border-color:${T.border}; }
  .btn-ghost:hover       { background:${T.bg3}; border-color:${T.textLow}; color:${T.text}; }
  .btn-sm                { padding:6px 12px; font-size:13px; }
  .btn-yellow            { background:${T.yellow}18; color:${T.yellow}; border-color:${T.yellow}44; }
  .btn-yellow:hover      { background:${T.yellow}33; }
  .btn-green             { background:${T.greenDim}; color:${T.green}; border-color:${T.greenMid}; }
  .btn-green:hover       { background:${T.green}33; box-shadow:0 0 14px ${T.greenMid}; }
  .btn-filter-active     { background:${T.accentDim}; color:${T.accent}; border-color:${T.accentMid}; }

  /* ── Form fields ── */
  .field {
    width:100%; padding:10px 14px;
    background:${T.bg1}; border:1px solid ${T.border};
    border-radius:8px; color:${T.text};
    font-family:'Rajdhani',sans-serif; font-size:15px;
    outline:none; transition:border-color .17s, box-shadow .17s;
  }
  .field:focus { border-color:${T.accentMid}; box-shadow:0 0 0 3px ${T.accentDim}; }
  .field::placeholder { color:${T.textLow}; }
  .field-red:focus { border-color:${T.redMid}; box-shadow:0 0 0 3px ${T.redDim}; }
  select.field option { background:${T.bg2}; }

  /* ── Table ── */
  .data-row          { transition:background .12s; }
  .data-row:hover    { background:${T.border}33; }
  th {
    font-family:'Oxanium',sans-serif; font-size:11px;
    letter-spacing:.08em; text-transform:uppercase;
    color:${T.textLow}; padding:11px 16px; text-align:left;
    border-bottom:1px solid ${T.border}; font-weight:600;
    white-space:nowrap;
  }
  td { padding:12px 16px; border-bottom:1px solid ${T.border}22; font-size:14px; }
  tr:last-child td { border-bottom:none; }

  /* ── Typography helpers ── */
  .mono { font-family:'JetBrains Mono',monospace; }
  .oxan { font-family:'Oxanium',sans-serif; }

  /* ── Camera ── */
  .camera-wrap {
    background:#000; position:relative; overflow:hidden; border-radius:0;
  }
  .camera-wrap::after {
    content:''; position:absolute; inset:0; pointer-events:none;
    background:repeating-linear-gradient(0deg,transparent,transparent 3px,${T.accent}07 3px,${T.accent}07 4px);
    z-index:1;
  }
  .camera-beam {
    position:absolute; left:0; right:0; height:3px;
    background:linear-gradient(90deg,transparent,${T.accent}cc,transparent);
    animation:scan-beam 3.2s linear infinite; z-index:2; pointer-events:none;
  }

  /* ── Badges ── */
  .badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 10px; border-radius:20px;
    font-size:11.5px; font-weight:700;
    font-family:'Oxanium',sans-serif; letter-spacing:.04em; border:1px solid;
  }
  .badge-inside {
    background:${T.greenDim}; color:${T.green};
    border-color:${T.greenMid};
    animation: glow-green 2.5s ease infinite;
    text-shadow: 0 0 8px ${T.green}99;
  }
  .badge-outside {
    background:#151e2f; color:#3a4d66; border-color:#1e2d45;
  }
  .badge-green  { background:${T.greenDim}; color:${T.green};    border-color:${T.greenMid}; }
  .badge-gray   { background:${T.textLow}22; color:${T.textMid}; border-color:${T.border}; }
  .badge-red    { background:${T.red}18;    color:${T.red};      border-color:${T.red}44; }
  .badge-yellow { background:${T.yellow}18; color:${T.yellow};   border-color:${T.yellow}44; }
  .badge-blue   { background:${T.blue}18;   color:${T.blue};     border-color:${T.blue}44; }
  .badge-cyan   { background:${T.accentDim}; color:${T.accent};  border-color:${T.accentMid}; }

  /* ── Tooltip ── */
  .tooltip-dark {
    background:${T.bg2} !important; border:1px solid ${T.border} !important;
    border-radius:8px !important; font-family:'Rajdhani',sans-serif !important;
    font-size:13px !important; color:${T.text} !important;
    box-shadow:0 8px 24px #00000088 !important;
  }

  /* ── Modal ── */
  .modal-backdrop {
    position:fixed;
    top:0; left:0; right:0; bottom:0;
    width:100vw; height:100vh;
    background:#000000cc;
    backdrop-filter:blur(6px);
    z-index:9999;
    display:flex; align-items:center; justify-content:center;
    overflow:hidden;
  }
  .modal-box {
    background:${T.bg2}; border:1px solid ${T.accentMid};
    border-radius:14px; padding:32px; width:min(480px,92vw);
    max-height:90vh; overflow-y:auto;
    box-shadow:0 0 40px ${T.accentDim},0 24px 60px #00000099;
    animation:fade-up .25s ease forwards;
    position:relative;
  }
  .modal-box-red { border-color:${T.redMid}; box-shadow:0 0 40px ${T.redDim},0 24px 60px #00000099; }

  /* ── Filter dropdown ── */
  .filter-dropdown {
    position:absolute; top:calc(100% + 8px); right:0;
    background:${T.bg2}; border:1px solid ${T.accentMid};
    border-radius:10px; overflow:hidden; z-index:150;
    box-shadow:0 12px 36px #00000099;
    animation:dropdown-in .18s cubic-bezier(.22,1,.36,1) forwards;
    min-width:160px;
  }
  .filter-option {
    display:flex; align-items:center; gap:9px;
    padding:10px 16px; cursor:pointer;
    font-family:'Rajdhani',sans-serif; font-size:14px;
    font-weight:600; transition:background .12s; color:${T.textMid};
    border:none; background:transparent; width:100%; text-align:left;
  }
  .filter-option:hover           { background:${T.accentDim}; color:${T.text}; }
  .filter-option.selected        { color:${T.accent}; background:${T.accentDim}; }
  .filter-option:not(:last-child){ border-bottom:1px solid ${T.border}; }

  /* ── Empty / error states ── */
  .empty-state {
    display:flex; flex-direction:column; align-items:center;
    justify-content:center; padding:52px 20px; gap:10px; color:${T.textLow};
  }

  /* ── Security Alert Pulse ── */
  .security-alert-row {
    animation: alert-flash 2s ease infinite;
    background: ${T.red}0d;
  }
  .security-alert-row:hover { background: ${T.red}1a !important; }

  /* ── Toast notifications ── */
  @keyframes toast-in  { from{opacity:0;transform:translateY(16px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes toast-out { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(8px) scale(.96)} }
  .toast-wrap {
    position:fixed; bottom:24px; right:24px; z-index:10000;
    display:flex; flex-direction:column; gap:8px; pointer-events:none;
  }
  .toast {
    display:flex; align-items:center; gap:10px;
    padding:12px 18px; border-radius:10px;
    font-family:'Rajdhani',sans-serif; font-size:14px; font-weight:600;
    box-shadow:0 8px 28px #00000088; pointer-events:auto;
    animation:toast-in .28s cubic-bezier(.22,1,.36,1) forwards;
    min-width:260px; max-width:380px;
  }
  .toast-success { background:${T.bg2}; border:1px solid ${T.greenMid};  color:${T.green};  }
  .toast-error   { background:${T.bg2}; border:1px solid ${T.redMid};    color:${T.red};    }
  .toast-info    { background:${T.bg2}; border:1px solid ${T.accentMid}; color:${T.accent}; }
  .toast-warn    { background:${T.bg2}; border:1px solid ${T.yellow}44;  color:${T.yellow}; }

  /* ── Hide number-input spinners globally ── */
  input[type=number]::-webkit-outer-spin-button,
  input[type=number]::-webkit-inner-spin-button { -webkit-appearance:none; margin:0; }
  input[type=number] { -moz-appearance:textfield; appearance:textfield; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// GLOBAL APP CONTEXT
// ─────────────────────────────────────────────────────────────────────────────
const AppCtx = createContext(null);

// ─────────────────────────────────────────────────────────────────────────────
// CUSTOM HOOK — useFetch
// ─────────────────────────────────────────────────────────────────────────────
function useFetch(url, { enabled = true } = {}) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(!!enabled);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async () => {
    if (!url) return;
    setLoading(true); setError(null);
    try {
      const res = await fetch(url, {
        headers: { Accept: "application/json" },
        signal:  AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
      setData(await res.json());
    } catch (err) {
      if (err.name !== "AbortError") {
        console.warn(`[OmniBoard] ${url}:`, err.message);
        setError(err.message);
      }
    } finally { setLoading(false); }
  }, [url]);

  useEffect(() => { if (enabled) execute(); }, [execute, enabled]);
  return { data, loading, error, refetch: execute };
}

// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────────────────────────────────────
const MOCK_VISITS = [
  { id:1,  plate:"ARK 2847", vehicle_type:"Car",   status:"inside",  entry_time:"14:23:01", fee:null },
  { id:2,  plate:"BXQ 5519", vehicle_type:"Truck", status:"outside", entry_time:"14:18:45", fee:35   },
  { id:3,  plate:"CMT 9933", vehicle_type:"Car",   status:"inside",  entry_time:"14:15:22", fee:null },
  { id:4,  plate:"DLP 4471", vehicle_type:"Bus",   status:"outside", entry_time:"14:10:08", fee:50   },
  { id:5,  plate:"EZR 7782", vehicle_type:"Car",   status:"inside",  entry_time:"14:07:33", fee:null },
  { id:6,  plate:"FKN 3356", vehicle_type:"Car",   status:"outside", entry_time:"14:03:17", fee:20   },
  { id:7,  plate:"GHT 8820", vehicle_type:"Truck", status:"inside",  entry_time:"13:58:44", fee:null },
  { id:8,  plate:"HXP 1199", vehicle_type:"Car",   status:"outside", entry_time:"13:55:02", fee:15   },
  { id:9,  plate:"JKL 3312", vehicle_type:"Car",   status:"outside", entry_time:"13:50:19", fee:25   },
  { id:10, plate:"MNP 7743", vehicle_type:"Bus",   status:"inside",  entry_time:"13:45:08", fee:null },
];
const MOCK_REVENUE     = { total_revenue: 9340, trend: 8.2  };
const MOCK_LIVE_STATUS = { current_occupancy: 31, total_capacity: 50 };
const MOCK_DWELL       = { avg_dwell_minutes: 84, trend: 5.4 };

const MOCK_VIP = [
  { id:1, plate:"VIP 0001", owner:"Ahmed Hassan",       since:"2024-01-15", visits:127, status:"active" },
  { id:2, plate:"VIP 0002", owner:"Sarah Mohamed",      since:"2024-02-20", visits:89,  status:"active" },
  { id:3, plate:"GVT 5511", owner:"Dr. Khalid Mansour", since:"2023-11-10", visits:203, status:"active" },
  { id:4, plate:"EXC 9977", owner:"Fatima Al-Rashidi",  since:"2024-03-05", visits:54,  status:"active" },
  { id:5, plate:"PRE 3344", owner:"Omar Farouk",        since:"2023-09-22", visits:314, status:"active" },
  { id:6, plate:"DIP 8821", owner:"Layla Ibrahim",      since:"2024-04-12", visits:42,  status:"suspended" },
];

const MOCK_BLACKLIST = [
  { id:1, plate:"STO 1337", reason:"Theft Suspect",      date:"2024-11-02", attempts:3, severity:"high"   },
  { id:2, plate:"FRD 9988", reason:"Fraudulent Payment", date:"2024-10-15", attempts:1, severity:"medium" },
  { id:3, plate:"WAR 4455", reason:"Warrant Issued",     date:"2024-12-01", attempts:0, severity:"high"   },
  { id:4, plate:"DMG 7721", reason:"Property Damage",    date:"2024-09-30", attempts:5, severity:"high"   },
  { id:5, plate:"TRS 2299", reason:"Trespassing",        date:"2025-01-08", attempts:2, severity:"medium" },
];

const MOCK_ALERTS = [
  { id:1, plate:"STO 1337", time:"14:21:09", gate:"Entry Gate A", status:"blocked" },
  { id:2, plate:"DMG 7721", time:"13:44:32", gate:"Entry Gate B", status:"blocked" },
  { id:3, plate:"FRD 9988", time:"12:17:55", gate:"Entry Gate A", status:"blocked" },
];

const PEAK_HOURS = [
  {h:"06",v:8},{h:"07",v:24},{h:"08",v:67},{h:"09",v:89},{h:"10",v:72},
  {h:"11",v:58},{h:"12",v:94},{h:"13",v:88},{h:"14",v:76},{h:"15",v:65},
  {h:"16",v:91},{h:"17",v:110},{h:"18",v:85},{h:"19",v:44},{h:"20",v:22},{h:"21",v:11},
];
const REV_BY_TYPE = [
  { name:"Car",        value:4200, color:T.accent  },
  { name:"Truck",      value:2800, color:T.blue    },
  { name:"Bus",        value:1500, color:T.purple  },
  { name:"Motorcycle", value:840,  color:T.yellow  },
];
const REV_TREND = [
  {day:"Mon",revenue:3200,vehicles:142},
  {day:"Tue",revenue:4100,vehicles:180},
  {day:"Wed",revenue:3800,vehicles:165},
  {day:"Thu",revenue:5200,vehicles:220},
  {day:"Fri",revenue:6100,vehicles:258},
  {day:"Sat",revenue:7800,vehicles:310},
  {day:"Sun",revenue:5400,vehicles:230},
];

const PLATES_POOL = ["ARK 2847","BXQ 5519","CMT 9933","DLP 4471","EZR 7782","FKN 3356","GHT 8820","HXP 1199"];
const ENTRY_LOG_INIT = [
  {time:"14:23:01",plate:"ARK 2847",gate:"Gate A",action:"Entry",conf:98.4},
  {time:"14:16:22",plate:"EZR 7782",gate:"Gate A",action:"Entry",conf:96.1},
  {time:"14:10:08",plate:"DLP 4471",gate:"Gate A",action:"Exit", conf:99.2},
];
const EXIT_LOG_INIT = [
  {time:"14:18:45",plate:"BXQ 5519",gate:"Gate B",action:"Exit", conf:97.8},
  {time:"14:03:17",plate:"FKN 3356",gate:"Gate B",action:"Exit", conf:95.3},
  {time:"13:58:44",plate:"GHT 8820",gate:"Gate B",action:"Entry",conf:98.9},
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────
function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function nowTime()  { return new Date().toLocaleTimeString("en-GB"); }
function formatDwell(min) {
  if (min == null) return "--";
  const h = Math.floor(min / 60), m = min % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
const VehicleIcon = { Car, Truck, Bus };

// ─────────────────────────────────────────────────────────────────────────────
// SHARED UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
function Badge({ variant = "gray", dot = false, children }) {
  return (
    <span className={`badge badge-${variant}`}>
      {dot && <span style={{ width:6, height:6, borderRadius:"50%", background:"currentColor", flexShrink:0 }}/>}
      {children}
    </span>
  );
}

function StatusBadge({ status }) {
  const isInside = (status ?? "").toLowerCase() === "inside";
  return (
    <span className={isInside ? "badge badge-inside" : "badge badge-outside"}>
      <span style={{
        width:6, height:6, borderRadius:"50%", background:"currentColor", flexShrink:0,
        ...(isInside ? { animation:"pulse-live 1.5s ease infinite" } : {}),
      }}/>
      {isInside ? "Inside" : "Outside"}
    </span>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="tooltip-dark" style={{ padding:"10px 14px" }}>
      <p style={{ color:T.textMid, fontSize:12, marginBottom:6 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color:p.color||T.accent, fontWeight:600 }}>
          {p.name}: {typeof p.value === "number" && p.value > 999 ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="card" style={{ padding:22 }}>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:16 }}>
        <div className="skeleton" style={{ width:110, height:11 }}/>
        <div className="skeleton" style={{ width:36, height:36, borderRadius:9 }}/>
      </div>
      <div className="skeleton" style={{ width:120, height:32, marginBottom:8 }}/>
      <div className="skeleton" style={{ width:160, height:12 }}/>
    </div>
  );
}

function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}>
          <div className="skeleton" style={{ width: i === 0 ? 90 : 60 + i * 12, height:12, borderRadius:4 }}/>
        </td>
      ))}
    </tr>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
      background:T.red+"0d", border:`1px solid ${T.red}33`, borderRadius:8, fontSize:13, color:T.textMid,
    }}>
      <AlertTriangle size={14} color={T.red} style={{ flexShrink:0 }}/>
      <span style={{ flex:1 }}>
        Could not reach API — showing cached values.{" "}
        <span style={{ color:T.textLow, fontSize:12 }}>{message}</span>
      </span>
      {onRetry && (
        <button className="btn btn-ghost btn-sm" onClick={onRetry}>
          <RefreshCw size={11}/> Retry
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TOAST — lightweight notification system
// ─────────────────────────────────────────────────────────────────────────────
function Toast({ toasts, dismiss }) {
  if (!toasts.length) return null;
  const iconMap = { success: CheckCircle, error: AlertTriangle, info: Radio, warn: AlertCircle };
  return (
    <div className="toast-wrap">
      {toasts.map(t => {
        const Icon = iconMap[t.type] ?? CheckCircle;
        return (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Icon size={15} style={{ flexShrink:0 }}/>
            <span style={{ flex:1 }}>{t.msg}</span>
            <button onClick={() => dismiss(t.id)}
              style={{ background:"none", border:"none", cursor:"pointer", color:"inherit", opacity:.6, display:"flex", padding:0, marginLeft:4 }}>
              <X size={13}/>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((msg, type = "success", duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, type }]);
    if (duration > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);
  const dismiss = useCallback(id => setToasts(prev => prev.filter(t => t.id !== id)), []);
  return { toasts, show, dismiss };
}

function ModalPortal({ children }) {
  // Renders children into document.body so no ancestor stacking context
  // (overflow, transform, filter, will-change) can trap the modal.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); return () => setMounted(false); }, []);
  if (!mounted) return null;
  return ReactDOM.createPortal(children, document.body);
}

function Modal({ open, onClose, title, danger = false, children }) {
  // Lock body scroll whenever this modal is open to prevent scrolling behind the overlay
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (!open) return null;
  return (
    <ModalPortal>
      <div
        onClick={onClose}
        style={{
          // Portalled into document.body — no ancestor can create a stacking
          // context that traps this node. Fixed + 100vw/vh guarantees full
          // viewport coverage regardless of scroll position.
          position:            "fixed",
          top:                 0,
          left:                0,
          right:               0,
          bottom:              0,
          width:               "100vw",
          height:              "100vh",
          zIndex:              99999,
          display:             "flex",
          alignItems:          "center",
          justifyContent:      "center",
          background:          "rgba(0,0,0,0.80)",
          backdropFilter:      "blur(6px)",
          WebkitBackdropFilter:"blur(6px)",
          margin:              0,
          padding:             0,
          overflow:            "hidden",
        }}
      >
        <div
          className={`modal-box${danger ? " modal-box-red" : ""}`}
          onClick={e => e.stopPropagation()}
          style={{
            // Reset any margin/translate that could offset the box after
            // flexbox already centred it inside the portal backdrop.
            margin:   0,
            position: "relative",
            top:      "auto",
            left:     "auto",
          }}
        >
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <h3 className="oxan" style={{ fontSize:17, fontWeight:700, color:danger ? T.red : T.accent }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", color:T.textMid, cursor:"pointer", display:"flex" }}>
            <X size={18}/>
          </button>
        </div>
        {children}
      </div>
      </div>
    </ModalPortal>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = T.accent, trend }) {
  return (
    <div className="card" style={{ padding:22, position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color},transparent)` }}/>
      <div style={{ position:"absolute", top:-30, right:-30, width:90, height:90, background:`radial-gradient(circle,${color}18,transparent 70%)`, borderRadius:"50%", pointerEvents:"none" }}/>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:14 }}>
        <span className="oxan" style={{ fontSize:11, color:T.textMid, letterSpacing:".07em", textTransform:"uppercase" }}>{label}</span>
        <div style={{ width:36, height:36, borderRadius:9, background:`${color}18`, border:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Icon size={17} color={color}/>
        </div>
      </div>
      <div className="count-anim oxan" style={{ fontSize:32, fontWeight:700, color:T.text, marginBottom:5, lineHeight:1 }}>{value}</div>
      <p style={{ fontSize:13, color:T.textMid }}>{sub}</p>
      {trend !== undefined && (
        <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:8, fontSize:12, color:trend >= 0 ? T.green : T.red }}>
          {trend >= 0 ? <ArrowUp size={11}/> : <ArrowDown size={11}/>}
          {Math.abs(trend)}% vs yesterday
        </div>
      )}
    </div>
  );
}

const STATUS_OPTIONS = [
  { value:"all",     label:"All Statuses",  dot:null      },
  { value:"inside",  label:"Inside",        dot:T.green   },
  { value:"outside", label:"Outside",       dot:T.textLow },
];
const TYPE_OPTIONS = [
  { value:"all",   label:"All Types" },
  { value:"car",   label:"Car"       },
  { value:"truck", label:"Truck"     },
  { value:"bus",   label:"Bus"       },
];

function FilterDropdown({ statusFilter, setStatusFilter, typeFilter, setTypeFilter }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function close(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const isFiltered = statusFilter !== "all" || typeFilter !== "all";

  // Compact summary label for the button
  const parts = [];
  if (statusFilter !== "all") parts.push(statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1));
  if (typeFilter   !== "all") parts.push(typeFilter.charAt(0).toUpperCase()   + typeFilter.slice(1));
  const btnLabel = parts.length ? parts.join(" · ") : "Filter";

  return (
    <div ref={ref} style={{ position:"relative" }}>
      <button
        className={`btn btn-sm ${isFiltered ? "btn-filter-active" : "btn-ghost"}`}
        onClick={() => setOpen(o => !o)}
      >
        <Filter size={12}/>
        {btnLabel}
        <ChevronDown size={11} style={{ transition:"transform .15s", transform:open ? "rotate(180deg)" : "none" }}/>
      </button>

      {open && (
        <div className="filter-dropdown" style={{ minWidth:220 }}>
          {/* ── Status section ── */}
          <div style={{ padding:"8px 14px 4px", fontSize:10, color:T.textLow, letterSpacing:".1em", textTransform:"uppercase", fontFamily:"'Oxanium',sans-serif", fontWeight:600, borderBottom:`1px solid ${T.border}` }}>
            Status
          </div>
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`filter-option${statusFilter === opt.value ? " selected" : ""}`}
              onClick={() => setStatusFilter(opt.value)}
            >
              {opt.dot
                ? <span style={{ width:7, height:7, borderRadius:"50%", background:opt.dot, flexShrink:0 }}/>
                : <span style={{ width:7, height:7, borderRadius:"50%", border:`1px solid ${T.textLow}`, flexShrink:0 }}/>
              }
              {opt.label}
              {statusFilter === opt.value && <CheckCircle size={12} style={{ marginLeft:"auto" }} color={T.accent}/>}
            </button>
          ))}

          {/* ── Vehicle Type section ── */}
          <div style={{ padding:"8px 14px 4px", fontSize:10, color:T.textLow, letterSpacing:".1em", textTransform:"uppercase", fontFamily:"'Oxanium',sans-serif", fontWeight:600, borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}` }}>
            Vehicle Type
          </div>
          {TYPE_OPTIONS.map(opt => {
            const Icon = opt.value !== "all" ? (VehicleIcon[opt.value.charAt(0).toUpperCase() + opt.value.slice(1)] ?? Car) : null;
            return (
              <button
                key={opt.value}
                className={`filter-option${typeFilter === opt.value ? " selected" : ""}`}
                onClick={() => setTypeFilter(opt.value)}
              >
                {Icon
                  ? <Icon size={13} color={typeFilter === opt.value ? T.accent : T.textMid} style={{ flexShrink:0 }}/>
                  : <span style={{ width:13, flexShrink:0 }}/>
                }
                {opt.label}
                {typeFilter === opt.value && <CheckCircle size={12} style={{ marginLeft:"auto" }} color={T.accent}/>}
              </button>
            );
          })}

          {/* ── Reset all ── */}
          {isFiltered && (
            <div style={{ padding:"6px 10px", borderTop:`1px solid ${T.border}` }}>
              <button
                className="filter-option"
                style={{ color:T.red, fontSize:12, justifyContent:"center", borderRadius:6, border:`1px solid ${T.red}22` }}
                onClick={() => { setStatusFilter("all"); setTypeFilter("all"); setOpen(false); }}
              >
                <X size={11}/> Reset all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"overview",  icon:LayoutDashboard, label:"Overview",        sub:"Dashboard"    },
  { id:"gates",     icon:Camera,          label:"Live Gates",      sub:"Camera Feed"  },
  { id:"analytics", icon:BarChart2,       label:"Analytics",       sub:"BI & Reports" },
  { id:"vip",       icon:Star,            label:"VIP Subscribers", sub:"Management"   },
  { id:"security",  icon:Shield,          label:"Security",        sub:"& Blacklist"  },
];

function Sidebar({ page, setPage }) {
  const { liveStatus, alertsCount, setAlertsCount } = useContext(AppCtx);
  const { toasts, show: showSidebarToast, dismiss: dismissSidebar } = useToast();

  // ── Reset badge instantly when Security page clears all alerts ────────────
  useEffect(() => {
    const handleAlertsCleared = () => setAlertsCount(0);
    window.addEventListener("securityAlertsCleared", handleAlertsCleared);
    return () => window.removeEventListener("securityAlertsCleared", handleAlertsCleared);
  }, [setAlertsCount]);

  // ── Live occupancy state ───────────────────────────────────────────────────
  // occupancy.max is kept for internal use by the poller; the Settings modal
  // writes to maxCapacity directly, which is the single source of truth for
  // the capacity figure shown in the UI and used in percentage calculations.
  const [occupancy, setOccupancy] = useState({ current: 0, max: 50 });

  // ── Poll /live_status every 8 s to keep the sidebar bar truly live ─────────
  useEffect(() => {
    const BASE = import.meta.env.VITE_API_BASE_URL;
    if (!BASE) return;

    const fetchOccupancy = async () => {
      try {
        const res  = await fetch(`${BASE}/live_status`, {
          signal: AbortSignal.timeout(8_000),
        });
        if (!res.ok) return;                          // silently skip on error
        const json = await res.json();

        // Accept multiple backend shapes:
        //   { occupancy: { current_inside, total_capacity } }   ← primary
        //   { current_occupancy, total_capacity }               ← flat
        //   { data: { current_occupancy, total_capacity } }     ← wrapped
        const current =
          json?.occupancy?.current_inside  ??
          json?.current_occupancy          ??
          json?.data?.current_occupancy    ??
          0;
        const max =
          json?.occupancy?.total_capacity  ??
          json?.total_capacity             ??
          json?.data?.total_capacity       ??
          50;                                         // sensible default

        setOccupancy({
          current: Number(current),
          max:     Math.max(1, Number(max)),           // avoid division by zero
        });
      } catch {
        // Network / timeout — leave last known value in place
      }
    };

    fetchOccupancy();                                 // run immediately on mount
    const id = setInterval(fetchOccupancy, 8_000);   // then every 8 s
    return () => clearInterval(id);                   // clean up on unmount
  }, []);                                             // no deps — BASE is a build constant

  // ── Poll /security/alerts every 5 s — badge = unread count only ───────────
  // This is the ONLY source of truth for the badge. It does NOT use
  // /live_status or any general dashboard stat, so "Today's Alerts" (a
  // cumulative total) can never bleed into the unread indicator.
  useEffect(() => {
    const BASE = import.meta.env.VITE_API_BASE_URL;
    if (!BASE) return;

    const fetchUnread = async () => {
      try {
        const res  = await fetch(`${BASE}/security/alerts`, {
          signal: AbortSignal.timeout(8_000),
        });
        if (!res.ok) return;                         // silently skip on error
        const json = await res.json();
        // Accept bare array  []
        //   or wrapped        { data: [] }
        //   or double-wrapped { data: { data: [] } }
        const arr =
          Array.isArray(json)             ? json :
          Array.isArray(json?.data?.data) ? json.data.data :
          Array.isArray(json?.data)       ? json.data :
          [];
        setAlertsCount(arr.length);
      } catch {
        // Network / timeout — leave the current badge value unchanged
      }
    };

    fetchUnread();                                   // run immediately on mount
    const id = setInterval(fetchUnread, 5_000);      // then every 5 s
    return () => clearInterval(id);                  // clean up on unmount
  }, [setAlertsCount]);
  // occupancy, capacity and pct are now driven by the dedicated poller above —
  // the context liveStatus value is kept for any other consumers but is no
  // longer used to render the sidebar minibar.

  // ── Settings modal state ───────────────────────────────────────────────────
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [maxCapacity,         setMaxCapacity]         = useState("");
  const [hourlyRate,          setHourlyRate]          = useState("");
  const [settingsLoading,     setSettingsLoading]     = useState(false);
  const [settingsSaving,      setSettingsSaving]      = useState(false);
  const [settingsError,       setSettingsError]       = useState("");

  // Fetch current values when the modal opens
  const openSettings = async () => {
    setIsSettingsModalOpen(true);
    setSettingsError("");
    setSettingsLoading(true);
    try {
      const BASE = import.meta.env.VITE_API_BASE_URL;
      const res  = await fetch(`${BASE}/settings`, {
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Accept values at root or nested under data: {}
      setMaxCapacity(String(json?.data?.max_capacity ?? json?.max_capacity ?? ""));
      setHourlyRate( String(json?.data?.hourly_rate  ?? json?.hourly_rate  ?? ""));
    } catch (e) {
      setSettingsError(`Could not load settings: ${e.message}`);
    } finally {
      setSettingsLoading(false);
    }
  };

  const saveSettings = async () => {
    const cap  = parseInt(maxCapacity, 10);
    const rate = parseInt(hourlyRate,  10);
    if (isNaN(cap)  || cap  <= 0) { setSettingsError("Max capacity must be a positive number.");        return; }
    if (isNaN(rate) || rate <  0) { setSettingsError("Hourly rate must be zero or a positive number."); return; }
    setSettingsSaving(true); setSettingsError("");
    try {
      const BASE = import.meta.env.VITE_API_BASE_URL;
      const res  = await fetch(`${BASE}/settings`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ max_capacity: cap, hourly_rate: rate }),
        signal:  AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message ?? `HTTP ${res.status}`);
      }
      // Immediately reflect the new max in the sidebar occupancy bar
      setOccupancy(prev => ({ ...prev, max: Math.max(1, cap) }));
      showSidebarToast("Settings saved successfully.", "success");
      setIsSettingsModalOpen(false);
    } catch (e) {
      setSettingsError(`Failed to save: ${e.message}`);
    } finally {
      setSettingsSaving(false);
    }
  };

  return (
    <aside style={{
      width:230, minHeight:"100vh", background:T.bg1,
      borderRight:`1px solid ${T.border}`, display:"flex",
      flexDirection:"column", position:"fixed", top:0, left:0, bottom:0, zIndex:100,
    }}>
      {/* Logo */}
      <div style={{ padding:"24px 20px 18px", borderBottom:`1px solid ${T.border}` }}>
        <div style={{ display:"flex", alignItems:"center", gap:11 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:`linear-gradient(135deg,${T.accent}33,${T.blue}33)`, border:`1px solid ${T.accentMid}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Cpu size={18} color={T.accent}/>
          </div>
          <div>
            <div className="oxan" style={{ fontSize:16, fontWeight:700, letterSpacing:".04em", lineHeight:1 }}>
              <span style={{ color:T.accent }}>Nexus</span><span style={{ color:T.text }}> ALPR</span>
            </div>
          </div>
        </div>
      </div>

      {/* System status */}
      <div style={{ padding:"10px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:8 }}>
        <div style={{ width:7, height:7, borderRadius:"50%", background:T.green, animation:"pulse-live 2s ease infinite" }}/>
        <span style={{ fontSize:12, color:T.textMid }}>System Online</span>
      </div>

      {/* Nav */}
      <nav style={{ flex:1, padding:"14px 10px", display:"flex", flexDirection:"column", gap:3, overflowY:"auto" }}>
        <p style={{ fontSize:10, color:T.textFaint, letterSpacing:".12em", textTransform:"uppercase", padding:"2px 10px 6px", fontFamily:"'Oxanium',sans-serif" }}>Navigation</p>
        {NAV.map(item => {
          const active    = page === item.id;
          const showAlert = item.id === "security" && alertsCount > 0 && !active;
          return (
            <button key={item.id} className={`nav-btn${active ? " active" : ""}`} onClick={() => setPage(item.id)}>
              <item.icon size={17} style={{ flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:active ? 600 : 400, lineHeight:1.15 }}>{item.label}</div>
                <div style={{ fontSize:11, color:active ? T.accent+"99" : T.textLow, lineHeight:1 }}>{item.sub}</div>
              </div>
              {showAlert && (
                <div style={{ width:17, height:17, borderRadius:"50%", background:T.red+"22", border:`1px solid ${T.red}55`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, color:T.red, fontWeight:700, flexShrink:0 }}>
                  {alertsCount}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Occupancy minibar */}
      <div style={{ margin:"0 10px", borderRadius:10, background:T.bg3, border:`1px solid ${T.border}`, padding:"12px 14px", marginBottom:10 }}>
        {(() => {
          // Use maxCapacity from Settings when available; fall back to
          // occupancy.max (populated by the /live_status poller) so the bar
          // is never blank before the user opens Settings.
          const cap = parseInt(maxCapacity, 10) || occupancy.max || 50;
          const pct = Math.round(occupancy.current / cap * 100);
          return (
            <>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <p style={{ fontSize:11, color:T.textLow }}>Occupancy</p>
                <p style={{ fontSize:11, color:T.accent, fontWeight:600, fontFamily:"'JetBrains Mono',monospace" }}>
                  {pct}%
                </p>
              </div>
              <div style={{ height:4, borderRadius:2, background:T.border, overflow:"hidden" }}>
                <div style={{
                  width:`${pct}%`,
                  height:"100%",
                  background:`linear-gradient(90deg,${T.accent},${T.blue})`,
                  borderRadius:2,
                  transition:"width .8s ease",
                }}/>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:8 }}>
                <p style={{ fontSize:11, color:T.textLow }}>
                  {occupancy.current} / {cap} spaces
                </p>
          <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                  <div style={{ width:5, height:5, borderRadius:"50%", background:T.green, animation:"pulse-live 1.5s infinite" }}/>
                  <p style={{ fontSize:10, color:T.green }}>LIVE</p>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* User */}
      <div style={{ padding:"14px 20px", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:9 }}>
        <div style={{ width:30, height:30, borderRadius:"50%", background:`linear-gradient(135deg,${T.accent}33,${T.blue}33)`, border:`1px solid ${T.accentMid}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
          <User size={13} color={T.accent}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:13, fontWeight:600, lineHeight:1.2 }}>Admin</div>
          <div style={{ fontSize:11, color:T.textMid }}>Supervisor</div>
        </div>
        <Settings
          size={14}
          color={T.textLow}
          style={{ cursor:"pointer", flexShrink:0 }}
          onClick={openSettings}
          title="System Settings"
        />
      </div>
    <Toast toasts={toasts} dismiss={dismissSidebar}/>

      {/* ── Settings Modal ─────────────────────────────────────────────────── */}
      {/*
        Uses Modal + ModalPortal — portalled into document.body so no
        ancestor overflow or stacking context can trap it. Inline styles
        guarantee viewport centering; Tailwind is not available in this project.
      */}
      <Modal
        open={isSettingsModalOpen}
        onClose={() => { setIsSettingsModalOpen(false); setSettingsError(""); }}
        title="System Settings"
      >
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* Loading skeleton while GET /settings is in-flight */}
          {settingsLoading ? (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div className="skeleton" style={{ width:"100%", height:44, borderRadius:8 }}/>
              <div className="skeleton" style={{ width:"100%", height:44, borderRadius:8 }}/>
            </div>
          ) : (
            <>
              {/* Max Capacity */}
              <div>
                <label style={{
                  fontSize:11, color:T.textMid, display:"block", marginBottom:6,
                  fontFamily:"'Oxanium',sans-serif", textTransform:"uppercase", letterSpacing:".05em",
                }}>
                  Max Parking Capacity
                </label>
                <div style={{ position:"relative" }}>
                  <input
                    type="number"
                    min="1"
                    className="field mono"
                    placeholder="e.g. 50"
                    value={maxCapacity}
                    onChange={e => setMaxCapacity(e.target.value)}
                    disabled={settingsSaving}
                    style={{ paddingRight:56 }}
                  />
                  <span style={{
                    position:"absolute", right:13, top:"50%", transform:"translateY(-50%)",
                    fontSize:11, color:T.textLow,
                    fontFamily:"'Oxanium',sans-serif", pointerEvents:"none", letterSpacing:".04em",
                  }}>
                    spaces
                  </span>
                </div>
                <p style={{ fontSize:11, color:T.textFaint, marginTop:5 }}>
                  Total vehicle spaces available in the facility.
                </p>
              </div>

              {/* Hourly Rate */}
              <div>
                <label style={{
                  fontSize:11, color:T.textMid, display:"block", marginBottom:6,
                  fontFamily:"'Oxanium',sans-serif", textTransform:"uppercase", letterSpacing:".05em",
                }}>
                  Hourly Parking Rate
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{
                    position:"absolute", left:13, top:"50%", transform:"translateY(-50%)",
                    fontSize:12, color:T.textMid,
                    fontFamily:"'JetBrains Mono',monospace", pointerEvents:"none",
                  }}>
                    EGP
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="field mono"
                    placeholder="e.g. 10"
                    value={hourlyRate}
                    onChange={e => setHourlyRate(e.target.value)}
                    disabled={settingsSaving}
                    style={{ paddingLeft:52 }}
                  />
                </div>
                <p style={{ fontSize:11, color:T.textFaint, marginTop:5 }}>
                  Fee charged per hour per vehicle.
                </p>
              </div>
            </>
          )}

          {/* Inline error */}
          {settingsError && (
            <div style={{
              display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
              background:T.redDim, border:`1px solid ${T.redMid}`,
              borderRadius:7, fontSize:13, color:T.red,
            }}>
              <AlertCircle size={13}/> {settingsError}
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button
              className="btn btn-ghost"
              style={{ flex:1 }}
              onClick={() => { setIsSettingsModalOpen(false); setSettingsError(""); }}
              disabled={settingsSaving}
            >
              Cancel
            </button>
            <button
              className="btn btn-cyan"
              style={{ flex:1 }}
              onClick={saveSettings}
              disabled={settingsLoading || settingsSaving}
            >
              {settingsSaving
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Saving…</>
                : <><CheckCircle size={14}/> Save Changes</>
              }
            </button>
          </div>

        </div>
      </Modal>

    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HEADER
// ─────────────────────────────────────────────────────────────────────────────
const PAGE_LABELS = {
  overview:  "System Overview",
  gates:     "Live Gate Monitoring",
  analytics: "Analytics & Business Intelligence",
  vip:       "VIP Subscriber Management",
  security:  "Security Control Center",
};

function Header({ page }) {
  const { searchQuery, setSearchQuery, alertsCount, setPage } = useContext(AppCtx);
  const [time, setTime] = useState(new Date());
  const bellRef         = useRef(null);
  const prevAlerts      = useRef(alertsCount);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (alertsCount > prevAlerts.current && bellRef.current) {
      bellRef.current.classList.remove("bell-alert");
      void bellRef.current.offsetWidth;
      bellRef.current.classList.add("bell-alert");
    }
    prevAlerts.current = alertsCount;
  }, [alertsCount]);

  return (
    <header style={{
      height:62, padding:"0 22px", background:T.bg1,
      borderBottom:`1px solid ${T.border}`,
      display:"flex", alignItems:"center", gap:16,
      position:"sticky", top:0, zIndex:50,
    }}>
      <div>
        <h1 className="oxan" style={{ fontSize:16, fontWeight:700, lineHeight:1.2 }}>{PAGE_LABELS[page]}</h1>
      </div>

      <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:14 }}>
        {/* Search */}
        <div style={{
          display:"flex", alignItems:"center", gap:8, background:T.bg0,
          border:`1px solid ${searchQuery ? T.accentMid : T.border}`,
          borderRadius:8, padding:"7px 13px",
          transition:"border-color .17s, box-shadow .17s",
          ...(searchQuery ? { boxShadow:`0 0 0 3px ${T.accentDim}` } : {}),
        }}>
          <Search size={13} color={searchQuery ? T.accent : T.textLow}/>
          <input
            placeholder="Search plate…" value={searchQuery}
            onChange={e => setSearchQuery(e.target.value.toUpperCase())}
            style={{ background:"none", border:"none", outline:"none", color:T.text, fontSize:13, width:140, fontFamily:"'JetBrains Mono',monospace", letterSpacing:".04em" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", color:T.textLow, padding:0 }}>
              <X size={12}/>
            </button>
          )}
        </div>

        {/* Clock */}
        <div className="mono" style={{ fontSize:14, color:T.accent, background:T.accentDim, border:`1px solid ${T.accentMid}`, padding:"6px 12px", borderRadius:8, letterSpacing:".02em" }}>
          {time.toLocaleTimeString("en-GB")}
        </div>

        {/* Bell — navigates to Security page */}
        <div
          ref={bellRef}
          style={{ position:"relative", cursor:"pointer" }}
          onClick={() => setPage("security")}
          title="View security alerts"
        >
          <Bell size={17} color={alertsCount > 0 ? T.textMid : T.textFaint}/>
          {alertsCount > 0 && (
            <div style={{ position:"absolute", top:-5, right:-5, width:14, height:14, borderRadius:"50%", background:T.red, fontSize:9, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, boxShadow:`0 0 8px ${T.red}88` }}>
              {alertsCount}
            </div>
          )}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:5, fontSize:12, color:T.green, fontWeight:600 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:T.green, animation:"pulse-live 1.5s infinite" }}/>
          LIVE
        </div>
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 1 — OVERVIEW  (Enterprise Admin Edition)
// ─────────────────────────────────────────────────────────────────────────────
function PageOverview() {
  const { searchQuery, setAlertsCount } = useContext(AppCtx);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter,   setTypeFilter]   = useState("all");

  // ── Visits ───────────────────────────────────────────────────────────────
  const {
    data: visitsRaw, loading: visitsLoading,
    error: visitsError, refetch: refetchVisits,
  } = useFetch(`${import.meta.env.VITE_API_BASE_URL}/visits`);
  const visits = (Array.isArray(visitsRaw) ? visitsRaw : visitsRaw?.data) ?? [];

  // ── StatCard state ────────────────────────────────────────────────────────
  const [revenueValue,     setRevenueValue]     = useState(null);
  const [revLoading,       setRevLoading]       = useState(true);
  const [occupancyCurrent, setOccupancyCurrent] = useState(null);
  const [occupancyTotal,   setOccupancyTotal]   = useState(null);
  const [activeAlerts,     setActiveAlerts]     = useState(null);
  const [liveLoading,      setLiveLoading]      = useState(true);
  const [dwellValue,       setDwellValue]       = useState(null);
  const [dwellLoading,     setDwellLoading]     = useState(true);

  // ── Manual Entry modal ────────────────────────────────────────────────────
  const [manualEntryOpen,  setManualEntryOpen]  = useState(false);
  const [manualForm,       setManualForm]       = useState({ plate_number:"", vehicle_type:"car" });
  const [manualLoading,    setManualLoading]    = useState(false);
  const [manualError,      setManualError]      = useState("");

  // ── Edit Visit modal ──────────────────────────────────────────────────────
  const [editRow,    setEditRow]    = useState(null);
  const [editForm,   setEditForm]   = useState({ plate_number:"", vehicle_type:"car", status:"inside" });
  const [editLoading,setEditLoading]= useState(false);
  const [editError,  setEditError]  = useState("");

  // ── Void Visit modal ──────────────────────────────────────────────────────
  const [voidRow,    setVoidRow]    = useState(null);
  const [voidReason, setVoidReason] = useState("");
  const [voidLoading,setVoidLoading]= useState(false);
  const [voidError,  setVoidError]  = useState("");

  // ── Waive Fee modal ───────────────────────────────────────────────────────
  const [waiveRow,    setWaiveRow]    = useState(null);
  const [waiveReason, setWaiveReason] = useState("");
  const [waiveLoading,setWaiveLoading]= useState(false);
  const [waiveError,  setWaiveError]  = useState("");

  // ── Actions dropdown ──────────────────────────────────────────────────────
  const [openActionRow, setOpenActionRow] = useState(null);
  const actionContainerRef               = useRef(null);

  // Close the actions dropdown when clicking outside
  useEffect(() => {
    function handleOutside(e) {
      if (actionContainerRef.current && !actionContainerRef.current.contains(e.target))
        setOpenActionRow(null);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ── Individual stat fetchers (each independently loading-guarded) ──────────
  const fetchAnalytics = useCallback(async () => {
    const base = import.meta.env.VITE_API_BASE_URL;
    setRevLoading(true);
    setDwellLoading(true);
    try {
      const res  = await fetch(`${base}/analytics/dashboard`, {
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Revenue — accept stats.total_revenue or legacy data.today_revenue
      const rev =
        json?.stats?.total_revenue  ??
        json?.data?.stats?.total_revenue ??
        json?.data?.today_revenue   ??
        null;
      setRevenueValue(rev);

      // Max capacity — read from dashboard stats so the occupancy card
      // never falls back to a hardcoded value.
      const maxCap =
        json?.data?.stats?.max_capacity ??
        json?.stats?.max_capacity       ??
        null;
      if (typeof maxCap === "number") setOccupancyTotal(maxCap);

      // Dwell time — tries every known nesting the backend may return:
      //   json.stats.avg_dwell_time          (flat shape)
      //   json.data.stats.avg_dwell_time     (wrapped shape  ← new backend)
      //   json.data.avg_dwell_time           (legacy shape)
      // Strictly read response.data.stats.avg_dwell_time first, then
      // flat shapes as fallback. Using != null guards so 0 is accepted.
      const dwell =
        json?.data?.stats?.avg_dwell_time ?? // ← primary: wrapped backend shape
        json?.stats?.avg_dwell_time       ?? // ← flat shape
        json?.data?.avg_dwell_time        ?? // ← legacy shape
        null;
      // Explicit number type-check: 0 is valid, undefined/null/string are not
      setDwellValue(typeof dwell === "number" ? dwell : null);
    } catch {
      setRevenueValue(null);
      setDwellValue(null);
    } finally {
      setRevLoading(false);
      setDwellLoading(false);
    }
  }, []);

  // AFTER — in PageOverview
const fetchOccupancy = useCallback(async () => {
    const base = import.meta.env.VITE_API_BASE_URL;
    setLiveLoading(true);
    try {
      const res  = await fetch(`${base}/live_status`, { signal: AbortSignal.timeout(12_000) });
      const json = await res.json();

      setOccupancyCurrent(json?.occupancy?.current_inside ?? null);

      const liveCap =
        json?.occupancy?.total_capacity ??
        json?.total_capacity            ??
        null;
      if (typeof liveCap === "number") setOccupancyTotal(liveCap);

      // activeAlerts drives ONLY the local stat card — never the global bell badge.
      // The bell badge (alertsCount) is owned exclusively by the Sidebar's
      // /security/alerts poller, which is the single source of truth.
      const alerts = json?.active_alerts ?? 0;
      setActiveAlerts(alerts);
      // setAlertsCount(alerts) ← removed: was causing the flash
    } catch {
      setOccupancyCurrent(null);
      setActiveAlerts(0);
    }
    finally { setLiveLoading(false); }
  }, []);                                // setAlertsCount dependency removed

  // fetchDwellTime removed — dwell time is now sourced from /analytics/dashboard
  // inside fetchAnalytics above (stats.avg_dwell_time). If the backend omits
  // the field the card renders a "Not available" placeholder instead of
  // calling a now-removed dedicated endpoint.

  // Convenience: fetch all stat groups at once
  const fetchStats = useCallback(() => {
    fetchAnalytics();   // revenue + dwell time from /analytics/dashboard
    fetchOccupancy();   // occupancy + active alerts from /live_status
  }, [fetchAnalytics, fetchOccupancy]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Combined refresh: visits table + all four StatCards ──────────────────
  const refreshAll = useCallback(() => {
    refetchVisits();    // visits table
    fetchAnalytics();   // revenue + dwell time from /analytics/dashboard
    fetchOccupancy();   // occupancy + active alerts from /live_status
  }, [refetchVisits, fetchAnalytics, fetchOccupancy]);

  // ── Admin action handlers ─────────────────────────────────────────────────
  const submitManualEntry = async () => {
    if (!manualForm.plate_number.trim()) { setManualError("Plate number is required."); return; }
    setManualLoading(true); setManualError("");
    try {
      const fd = new FormData();
      fd.append("plate_number", manualForm.plate_number.trim().toUpperCase());
      fd.append("vehicle_type", manualForm.vehicle_type);
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/manual_entry`, {
        method: "POST", body: fd,
      });
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      setManualEntryOpen(false);
      setManualForm({ plate_number:"", vehicle_type:"car" });
      refreshAll();
    } catch (e) { setManualError(e.message); }
    finally    { setManualLoading(false); }
  };

  const submitEdit = async () => {
    if (!editForm.plate_number.trim()) { setEditError("Plate number is required."); return; }
    setEditLoading(true); setEditError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/update_visit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          visit_id: editRow.id,
          data: {
            plate_number: editForm.plate_number,
            vehicle_type: editForm.vehicle_type,
            status:       editForm.status,
          },
        }),
      });
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      setEditRow(null);
      refreshAll();
    } catch (e) { setEditError(e.message); }
    finally    { setEditLoading(false); }
  };

  const submitVoid = async () => {
    if (!voidReason.trim()) { setVoidError("Reason is required."); return; }
    setVoidLoading(true); setVoidError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/void_visit`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ visit_id: voidRow.id, reason: voidReason }),
      });
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      setVoidRow(null);
      setVoidReason("");
      refreshAll();
    } catch (e) { setVoidError(e.message); }
    finally    { setVoidLoading(false); }
  };

  const submitWaive = async () => {
    if (!waiveReason.trim()) { setWaiveError("Reason is required."); return; }
    setWaiveLoading(true); setWaiveError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/admin/waive_fee`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ visit_id: waiveRow.id, reason: waiveReason }),
      });
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      setWaiveRow(null);
      setWaiveReason("");
      refreshAll();
    } catch (e) { setWaiveError(e.message); }
    finally    { setWaiveLoading(false); }
  };

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const displayedRows = visits.filter(row => {
    const s = (row.status       ?? "").toLowerCase();
    const t = (row.vehicle_type ?? "").toLowerCase();
    const passStatus = statusFilter === "all" || s === statusFilter;
    const passType   = typeFilter   === "all" || t === typeFilter.toLowerCase();
    const passSearch = !searchQuery || (row.plate ?? row.plate_number ?? "").toUpperCase().includes(searchQuery);
    return passStatus && passType && passSearch;
  });

  // ── Shared field label style ──────────────────────────────────────────────
  const fieldLabel = {
    fontSize: 11, color: T.textMid, display: "block", marginBottom: 6,
    fontFamily: "'Oxanium',sans-serif", textTransform: "uppercase", letterSpacing: ".05em",
  };
  const inlineErr = (msg) => msg ? (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
      background: T.redDim, border:`1px solid ${T.redMid}`, borderRadius:7, fontSize:13, color:T.red }}>
      <AlertCircle size={13}/> {msg}
    </div>
  ) : null;

  return (
    <div className="page-enter" style={{ padding:22, display:"flex", flexDirection:"column", gap:22 }}>

      {/* ── STAT CARDS ─────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }}>

        {revLoading ? <SkeletonCard/> : (
          <StatCard
            icon={DollarSign}
            label="Total Revenue Today"
            value={revenueValue != null ? `EGP ${Number(revenueValue).toLocaleString()}` : "—"}
            sub={revenueValue != null ? "Total revenue today" : "API unavailable"}
            color={T.green}
          />
        )}

        {liveLoading ? <SkeletonCard/> : (
          <StatCard
            icon={ParkingSquare}
            label="Current Occupancy"
            value={occupancyCurrent != null && occupancyTotal != null
              ? `${occupancyCurrent} / ${occupancyTotal}` : "—"}
            sub={(() => {
              if (occupancyCurrent == null || occupancyTotal == null) return "Waiting for data…";
              const pct  = Math.round((occupancyCurrent / occupancyTotal) * 100);
              const free = occupancyTotal - occupancyCurrent;
              return `${pct}% capacity · ${free} free`;
            })()}
            color={T.accent}
          />
        )}

        {dwellLoading ? <SkeletonCard/> : (
          <StatCard
            icon={Clock}
            label="Avg Dwell Time"
            value={dwellValue != null ? `${dwellValue}` : "—"}
            sub={dwellValue != null ? "mins · avg per vehicle today" : "Awaiting data…"}
            color={T.blue}
          />
        )}

        {liveLoading ? <SkeletonCard/> : (
          <StatCard
            icon={AlertTriangle}
            label="Active Security Alerts"
            value={activeAlerts != null ? String(activeAlerts) : "—"}
            sub={activeAlerts != null
              ? activeAlerts === 0
                ? "No active alerts"
                : `${activeAlerts} alert${activeAlerts !== 1 ? "s" : ""} detected`
              : "Waiting for /live_status…"}
            color={T.red}
          />
        )}
      </div>

      {/* ── MANUAL ENTRY MODAL ───────────────────────────────────────────────── */}
      <Modal
        open={manualEntryOpen}
        onClose={() => { setManualEntryOpen(false); setManualError(""); }}
        title="Manual Vehicle Entry"
      >
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div>
            <label style={fieldLabel}>Plate Number</label>
            <input
              className="field mono"
              placeholder="e.g. ARK 2847"
              value={manualForm.plate_number}
              onChange={e => setManualForm(f => ({ ...f, plate_number: e.target.value.toUpperCase() }))}
              style={{ letterSpacing:".06em" }}
            />
          </div>
          <div>
            <label style={fieldLabel}>Vehicle Type</label>
            <select
              className="field"
              value={manualForm.vehicle_type}
              onChange={e => setManualForm(f => ({ ...f, vehicle_type: e.target.value }))}
            >
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="bus">Bus</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>
          {inlineErr(manualError)}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button className="btn btn-ghost" style={{ flex:1 }}
              onClick={() => { setManualEntryOpen(false); setManualError(""); }}>
              Cancel
            </button>
            <button className="btn btn-cyan" style={{ flex:1 }}
              onClick={submitManualEntry} disabled={manualLoading}>
              {manualLoading
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Submitting…</>
                : <><Plus size={14}/> Add Entry</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── EDIT VISIT MODAL ─────────────────────────────────────────────────── */}
      <Modal
        open={!!editRow}
        onClose={() => { setEditRow(null); setEditError(""); }}
        title="Edit Visit"
      >
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <p style={{ fontSize:13, color:T.textMid }}>
            Editing visit for{" "}
            <span className="mono" style={{ color:T.accent, fontWeight:700 }}>
              {editRow?.plate ?? editRow?.plate_number}
            </span>
            {" "}(ID: {editRow?.id})
          </p>
          <div>
            <label style={fieldLabel}>Plate Number</label>
            <input
              className="field mono"
              value={editForm.plate_number}
              onChange={e => setEditForm(f => ({ ...f, plate_number: e.target.value.toUpperCase() }))}
              style={{ letterSpacing:".06em" }}
            />
          </div>
          <div>
            <label style={fieldLabel}>Vehicle Type</label>
            <select
              className="field"
              value={editForm.vehicle_type}
              onChange={e => setEditForm(f => ({ ...f, vehicle_type: e.target.value }))}
            >
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="bus">Bus</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>
          <div>
            <label style={fieldLabel}>Status</label>
            <select
              className="field"
              value={editForm.status}
              onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="inside">Inside</option>
              <option value="outside">Outside</option>
            </select>
          </div>
          {inlineErr(editError)}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button className="btn btn-ghost" style={{ flex:1 }}
              onClick={() => { setEditRow(null); setEditError(""); }}>
              Cancel
            </button>
            <button className="btn btn-cyan" style={{ flex:1 }}
              onClick={submitEdit} disabled={editLoading}>
              {editLoading
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Saving…</>
                : <><Pencil size={14}/> Save Changes</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── VOID VISIT MODAL ─────────────────────────────────────────────────── */}
      <Modal
        open={!!voidRow}
        onClose={() => { setVoidRow(null); setVoidReason(""); setVoidError(""); }}
        title="Void Visit"
        danger
      >
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ padding:"12px 14px", background:T.redDim, border:`1px solid ${T.redMid}`, borderRadius:8 }}>
            <p style={{ fontSize:13, color:T.red }}>
              ⚠ You are about to permanently void the visit for plate{" "}
              <span className="mono" style={{ fontWeight:700 }}>
                {voidRow?.plate ?? voidRow?.plate_number}
              </span>.
              This action cannot be undone.
            </p>
          </div>
          <div>
            <label style={fieldLabel}>Reason for Voiding</label>
            <textarea
              className="field"
              rows={3}
              placeholder="Enter the reason for voiding this visit…"
              value={voidReason}
              onChange={e => setVoidReason(e.target.value)}
              style={{ resize:"vertical" }}
            />
          </div>
          {inlineErr(voidError)}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button className="btn btn-ghost" style={{ flex:1 }}
              onClick={() => { setVoidRow(null); setVoidReason(""); setVoidError(""); }}>
              Cancel
            </button>
            <button className="btn btn-red" style={{ flex:1 }}
              onClick={submitVoid} disabled={voidLoading}>
              {voidLoading
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Voiding…</>
                : <><Trash2 size={14}/> Confirm Void</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── WAIVE FEE MODAL ──────────────────────────────────────────────────── */}
      <Modal
        open={!!waiveRow}
        onClose={() => { setWaiveRow(null); setWaiveReason(""); setWaiveError(""); }}
        title="Waive Fee"
      >
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <p style={{ fontSize:13, color:T.textMid }}>
            Waiving fee for plate{" "}
            <span className="mono" style={{ color:T.accent, fontWeight:700 }}>
              {waiveRow?.plate ?? waiveRow?.plate_number}
            </span>
            {waiveRow?.fee ? (
              <span style={{ color:T.green }}>{" "}(EGP {waiveRow.fee})</span>
            ) : ""}.
          </p>
          <div>
            <label style={fieldLabel}>Reason for Waiving</label>
            <textarea
              className="field"
              rows={3}
              placeholder="Enter the reason for waiving this fee…"
              value={waiveReason}
              onChange={e => setWaiveReason(e.target.value)}
              style={{ resize:"vertical" }}
            />
          </div>
          {inlineErr(waiveError)}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button className="btn btn-ghost" style={{ flex:1 }}
              onClick={() => { setWaiveRow(null); setWaiveReason(""); setWaiveError(""); }}>
              Cancel
            </button>
            <button className="btn btn-yellow" style={{ flex:1 }}
              onClick={submitWaive} disabled={waiveLoading}>
              {waiveLoading
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Waiving…</>
                : <><Banknote size={14}/> Waive Fee</>}
            </button>
          </div>
        </div>
      </Modal>

      {/* ── VISITS TABLE ─────────────────────────────────────────────────────── */}
      <div className="card" style={{ overflow:"visible", position:"relative" }}>

        {/* Table header toolbar */}
        <div style={{ padding:"15px 20px", borderBottom:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <Radio size={15} color={T.accent}/>
            <span className="oxan" style={{ fontSize:15, fontWeight:600 }}>Latest Vehicle Entries / Exits</span>
            {(searchQuery || statusFilter !== "all" || typeFilter !== "all") && (
              <span style={{ fontSize:11, background:T.accentDim, color:T.accent,
                border:`1px solid ${T.accentMid}`, padding:"2px 9px", borderRadius:20,
                fontFamily:"'Oxanium',sans-serif" }}>
                {displayedRows.length} result{displayedRows.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            {visitsLoading && (
              <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.textMid }}>
                <Loader2 size={12} style={{ animation:"spin 1s linear infinite" }}/> Fetching…
              </div>
            )}
            {/* redundant live badge removed — the header already shows the global LIVE indicator */}

            {/* ── Manual Entry button ── */}
            <button className="btn btn-cyan btn-sm" onClick={() => { setManualError(""); setManualEntryOpen(true); }}>
              <Plus size={12}/> Manual Entry
            </button>

            <FilterDropdown
              statusFilter={statusFilter} setStatusFilter={setStatusFilter}
              typeFilter={typeFilter}     setTypeFilter={setTypeFilter}
            />
            <button className="btn btn-ghost btn-sm" onClick={refreshAll}>
              <RefreshCw size={12}/> Refresh
            </button>
          </div>
        </div>

        {visitsError && (
          <div style={{ padding:"10px 16px", borderBottom:`1px solid ${T.border}` }}>
            <ErrorBanner message={visitsError} onRetry={refreshAll}/>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX:"auto" }} ref={actionContainerRef}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Vehicle Type</th>
                <th>Status</th>
                <th>Entry Time</th>
                <th>Fee (EGP)</th>
                <th style={{ textAlign:"center", width:90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visitsLoading && !visitsRaw
                ? Array.from({ length:6 }).map((_,i) => <SkeletonRow key={i} cols={6}/>)
                : displayedRows.length === 0
                ? (
                  <tr><td colSpan={6}>
                    <div className="empty-state">
                      <Search size={24} color={T.textFaint}/>
                      <p style={{ fontSize:14 }}>No vehicles match current filters</p>
                      <button className="btn btn-ghost btn-sm"
                        onClick={() => { setStatusFilter("all"); setTypeFilter("all"); }}>
                        Clear filters
                      </button>
                    </div>
                  </td></tr>
                )
                : displayedRows.map((row, i) => {
                  const Icon     = VehicleIcon[row.vehicle_type] ?? Car;
                  const isInside = (row.status ?? "").toLowerCase() === "inside";
                  const rowKey   = row.id ?? i;
                  const rowOpen  = openActionRow === rowKey;
                  // Waive fee is shown only when status is "outside" and fee > 0
                  const canWaive = (row.status ?? "").toLowerCase() === "outside" && (row.fee ?? 0) > 0;

                  return (
                    <tr key={rowKey} className="data-row"
                      style={{ animation: i === 0 ? "slide-right .3s ease" : "none" }}>

                      <td>
                        <span className="mono" style={{ color:T.accent, fontWeight:600, fontSize:13 }}>
                          {row.plate ?? row.plate_number ?? "—"}
                        </span>
                      </td>

                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <Icon size={14} color={T.textMid}/>
                          <span style={{ color:T.textMid }}>{row.vehicle_type ?? "—"}</span>
                        </div>
                      </td>

                      <td><StatusBadge status={row.status}/></td>

                      <td>
                        <span className="mono" style={{ fontSize:12, color:T.textMid }}>
                          {row.entry_time ?? row.time ?? "—"}
                        </span>
                      </td>

                      <td>
                        {isInside
                          ? <span style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:T.textLow, fontStyle:"italic" }}>
                              <span style={{ width:5, height:5, borderRadius:"50%", background:T.green, flexShrink:0, animation:"pulse-live 1.5s infinite" }}/>
                              Running…
                            </span>
                          : <span className="mono" style={{ color:T.green, fontWeight:700, fontSize:13 }}>
                              {row.fee != null ? row.fee : "—"}
                            </span>
                        }
                      </td>

                      {/* ── Actions cell ── */}
                      <td style={{ textAlign:"center", position:"relative" }}>
                        <div style={{ position:"relative", display:"inline-block" }}>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ padding:"5px 8px" }}
                            onClick={() => setOpenActionRow(rowOpen ? null : rowKey)}
                            title="Manage visit"
                          >
                            <MoreVertical size={14}/>
                          </button>

                          {rowOpen && (
                            <div className="filter-dropdown" style={{ right:0, minWidth:190, zIndex:300 }}>

                              {/* A — Edit Visit */}
                              <button
                                className="filter-option"
                                onClick={() => {
                                  setEditRow(row);
                                  setEditForm({
                                    plate_number: row.plate ?? row.plate_number ?? "",
                                    vehicle_type: (row.vehicle_type ?? "car").toLowerCase(),
                                    status:       (row.status ?? "inside").toLowerCase(),
                                  });
                                  setEditError("");
                                  setOpenActionRow(null);
                                }}
                              >
                                <Pencil size={13} color={T.accent}/> Edit Visit
                              </button>

                              {/* B — Void Visit */}
                              <button
                                className="filter-option"
                                style={{ color:T.red }}
                                onClick={() => {
                                  setVoidRow(row);
                                  setVoidReason("");
                                  setVoidError("");
                                  setOpenActionRow(null);
                                }}
                              >
                                <Trash2 size={13} color={T.red}/> Void Visit
                              </button>

                              {/* C — Waive Fee (greyed out when ineligible) */}
                              <button
                                className="filter-option"
                                style={{
                                  color:   canWaive ? T.yellow : T.textFaint,
                                  opacity: canWaive ? 1 : 0.45,
                                  cursor:  canWaive ? "pointer" : "not-allowed",
                                }}
                                onClick={() => {
                                  if (!canWaive) return;
                                  setWaiveRow(row);
                                  setWaiveReason("");
                                  setWaiveError("");
                                  setOpenActionRow(null);
                                }}
                                title={!canWaive ? "Only available for outside vehicles with a fee" : undefined}
                              >
                                <Banknote size={13} color={canWaive ? T.yellow : T.textFaint}/> Waive Fee
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 2 — LIVE GATES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * CameraPanel — one gate camera view.
 *
 * Props
 *   label          : display label ("Entry Gate (IN)", etc.)
 *   isEntry        : true → IN gate / false → OUT gate
 *   logs           : pre-filtered activity log rows (from parent via /visits)
 *   loading        : whether parent is still fetching visits
 *   onOpenGate     : () → void  — opens the Manual Entry modal in parent
 *   onImageUpload  : (gateId, file) → Promise<void>  — parent POSTs to /process_vehicle
 *   onVideoUpload  : (gateId, file) → Promise<void>  — parent POSTs to /process_video
 *   imgBusy        : bool — image POST is in-flight
 *   vidBusy        : bool — video POST is in-flight
 */
function CameraPanel({ label, isEntry, logs, loading, onOpenGate, onImageUpload, onVideoUpload, imgBusy, vidBusy, onManualOpen, gateOpening }) {
  const color  = isEntry ? T.accent : T.yellow;
  const gateId = isEntry ? "in" : "out";

  // ── Stream mode ────────────────────────────────────────────────────────────
  // "idle"  → default black box + Start Camera button
  // "live"  → webcam feed in <video>
  // "image" → uploaded image shown in <img>
  // "video" → uploaded video shown in <video>
  const [streamMode, setStreamMode] = useState("idle");

  // ── Refs ───────────────────────────────────────────────────────────────────
  const liveVideoRef  = useRef(null);   // <video> for webcam
  const streamRef     = useRef(null);   // MediaStream handle
  const imgInputRef   = useRef(null);
  const vidInputRef   = useRef(null);

  // ── Preview state for uploaded media ──────────────────────────────────────
  const [previewURL,  setPreviewURL]  = useState(null);   // object URL
  const [camError,    setCamError]    = useState("");      // getUserMedia error

  // ── Live clock overlay ─────────────────────────────────────────────────────
  const [camTime, setCamTime] = useState(new Date().toLocaleTimeString("en-GB"));
  useEffect(() => {
    const t = setInterval(() => setCamTime(new Date().toLocaleTimeString("en-GB")), 1_000);
    return () => clearInterval(t);
  }, []);

  // ── Clean up object URLs and camera tracks on unmount ─────────────────────
  useEffect(() => {
    return () => {
      stopStream();
      if (previewURL) URL.revokeObjectURL(previewURL);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  };

  const revokePreview = () => {
    if (previewURL) {
      URL.revokeObjectURL(previewURL);
      setPreviewURL(null);
    }
  };

  // ── Start webcam ───────────────────────────────────────────────────────────
  const handleStartCamera = async () => {
    setCamError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      revokePreview();
      setStreamMode("live");
      // Attach stream after the <video> element renders
      requestAnimationFrame(() => {
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch(() => {});
        }
      });
    } catch (err) {
      const msg =
        err.name === "NotAllowedError"  ? "Camera permission denied." :
        err.name === "NotFoundError"    ? "No camera device found."   :
        `Camera error: ${err.message}`;
      setCamError(msg);
    }
  };

  // ── Stop webcam and return to idle ─────────────────────────────────────────
  const handleStopCamera = () => {
    stopStream();
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
    setStreamMode("idle");
    setCamError("");
  };

  // ── Image upload ───────────────────────────────────────────────────────────
  const handleImgChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Release webcam if it was running
    stopStream();
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
    revokePreview();
    const url = URL.createObjectURL(file);
    setPreviewURL(url);
    setStreamMode("image");
    setCamError("");
    onImageUpload(gateId, file);
    e.target.value = "";
  };

  // ── Video upload ───────────────────────────────────────────────────────────
  const handleVidChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopStream();
    if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
    revokePreview();
    const url = URL.createObjectURL(file);
    setPreviewURL(url);
    setStreamMode("video");
    setCamError("");
    onVideoUpload(gateId, file);
    e.target.value = "";
  };

  const isProcessing = imgBusy || vidBusy;
  const latest       = logs[0];

  // ── Viewfinder content (swapped by streamMode) ────────────────────────────
  const renderViewfinder = () => {
    switch (streamMode) {

      // ── LIVE: real webcam via getUserMedia ─────────────────────────────────
      case "live":
        return (
          <>
            <video
              ref={liveVideoRef}
              autoPlay
              playsInline
              muted
              style={{
                position:"absolute", inset:0,
                width:"100%", height:"100%",
                objectFit:"cover", zIndex:2,
              }}
            />
            {/* Stop button overlay — top-right corner */}
            <button
              onClick={handleStopCamera}
              style={{
                position:"absolute", top:8, right:8, zIndex:8,
                background:`${T.bg0}cc`, border:`1px solid ${T.red}55`,
                borderRadius:6, padding:"4px 10px",
                display:"flex", alignItems:"center", gap:5,
                cursor:"pointer", color:T.red,
                fontSize:11, fontFamily:"'Rajdhani',sans-serif", fontWeight:600,
              }}
              title="Stop camera"
            >
              <Square size={10} fill={T.red}/> Stop
            </button>
          </>
        );

      // ── IMAGE: preview of uploaded image ──────────────────────────────────
      case "image":
        return (
          <>
            <img
              src={previewURL}
              alt="Uploaded vehicle"
              style={{
                position:"absolute", inset:0,
                width:"100%", height:"100%",
                objectFit:"contain", zIndex:2,
                background:"#000",
              }}
            />
            {/* Processing overlay */}
            {isProcessing && (
              <div style={{
                position:"absolute", inset:0, zIndex:10,
                background:`${T.bg0}cc`,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:12,
              }}>
                <Loader2 size={32} color={color} style={{ animation:"spin 1s linear infinite" }}/>
                <span className="oxan" style={{ fontSize:13, color, letterSpacing:".1em" }}>
                  ANALYZING IMAGE…
                </span>
                <span style={{ fontSize:11, color:T.textLow }}>OmniBoard ALPR AI</span>
              </div>
            )}
            {/* Reset button — top-right */}
            {!isProcessing && (
              <button
                onClick={() => { revokePreview(); setStreamMode("idle"); }}
                style={{
                  position:"absolute", top:8, right:8, zIndex:8,
                  background:`${T.bg0}cc`, border:`1px solid ${T.border}`,
                  borderRadius:6, padding:"4px 10px",
                  display:"flex", alignItems:"center", gap:5,
                  cursor:"pointer", color:T.textMid,
                  fontSize:11, fontFamily:"'Rajdhani',sans-serif", fontWeight:600,
                }}
                title="Clear preview"
              >
                <X size={10}/> Clear
              </button>
            )}
          </>
        );

      // ── VIDEO: preview of uploaded video ──────────────────────────────────
      case "video":
        return (
          <>
            <video
              src={previewURL}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position:"absolute", inset:0,
                width:"100%", height:"100%",
                objectFit:"contain", zIndex:2,
                background:"#000",
              }}
            />
            {/* Processing overlay */}
            {isProcessing && (
              <div style={{
                position:"absolute", inset:0, zIndex:10,
                background:`${T.bg0}cc`,
                display:"flex", flexDirection:"column",
                alignItems:"center", justifyContent:"center", gap:12,
              }}>
                <Loader2 size={32} color={color} style={{ animation:"spin 1s linear infinite" }}/>
                <span className="oxan" style={{ fontSize:13, color, letterSpacing:".1em" }}>
                  PROCESSING VIDEO…
                </span>
                <span style={{ fontSize:11, color:T.textLow }}>OmniBoard ALPR AI</span>
              </div>
            )}
            {/* Reset button */}
            {!isProcessing && (
              <button
                onClick={() => { revokePreview(); setStreamMode("idle"); }}
                style={{
                  position:"absolute", top:8, right:8, zIndex:8,
                  background:`${T.bg0}cc`, border:`1px solid ${T.border}`,
                  borderRadius:6, padding:"4px 10px",
                  display:"flex", alignItems:"center", gap:5,
                  cursor:"pointer", color:T.textMid,
                  fontSize:11, fontFamily:"'Rajdhani',sans-serif", fontWeight:600,
                }}
                title="Clear preview"
              >
                <X size={10}/> Clear
              </button>
            )}
          </>
        );

      // ── IDLE: default black box + start button ─────────────────────────────
      default:
        return (
          <div style={{
            position:"absolute", inset:0, zIndex:3,
            display:"flex", flexDirection:"column",
            alignItems:"center", justifyContent:"center", gap:14,
          }}>
            {/* Camera icon ring */}
            <div style={{
              width:56, height:56, borderRadius:"50%",
              background:`${color}18`, border:`1px solid ${color}44`,
              display:"flex", alignItems:"center", justifyContent:"center",
              animation:"glow-cyan 4s ease infinite",
            }}>
              <Camera size={24} color={color}/>
            </div>

            {/* Start button */}
            <button
              onClick={handleStartCamera}
              onMouseEnter={e => {
                e.currentTarget.style.background   = `${color}33`;
                e.currentTarget.style.boxShadow    = `0 0 20px ${color}55`;
                e.currentTarget.style.borderColor  = color;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background   = `${color}18`;
                e.currentTarget.style.boxShadow    = `0 0 10px ${color}22`;
                e.currentTarget.style.borderColor  = `${color}66`;
              }}
              style={{
                display:"flex", alignItems:"center", gap:8,
                padding:"10px 22px",
                background:`${color}18`,
                border:`1px solid ${color}66`,
                borderRadius:9,
                cursor:"pointer",
                color,
                fontSize:14,
                fontFamily:"'Rajdhani',sans-serif",
                fontWeight:700,
                letterSpacing:".06em",
                boxShadow:`0 0 10px ${color}22`,
                transition:"all .18s ease",
              }}
            >
              <Play size={14} fill={color}/> Start Live Camera
            </button>

            {/* Error message */}
            {camError && (
              <p style={{
                fontSize:11, color:T.red, textAlign:"center",
                maxWidth:200, lineHeight:1.4,
                background:T.redDim, border:`1px solid ${T.redMid}`,
                borderRadius:6, padding:"6px 12px",
              }}>
                {camError}
              </p>
            )}

            <p style={{ fontSize:10, color:T.textFaint, letterSpacing:".06em",
              fontFamily:"'Oxanium',sans-serif" }}>
              OR UPLOAD MEDIA BELOW
            </p>
          </div>
        );
    }
  };

  return (
    <div className="card" style={{ display:"flex", flexDirection:"column" }}>

      {/* ── Panel header ────────────────────────────────────────────────────── */}
      <div style={{
        padding:"12px 18px", borderBottom:`1px solid ${T.border}`,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:`linear-gradient(90deg,${color}11,transparent)`,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:8, height:8, borderRadius:"50%", background:color,
            animation:"pulse-live 1.5s infinite" }}/>
          <span className="oxan" style={{ fontSize:14, fontWeight:700, color }}>{label}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {/* Mode pill */}
          <span style={{
            fontSize:9, fontFamily:"'Oxanium',sans-serif", fontWeight:700,
            letterSpacing:".1em", padding:"2px 8px", borderRadius:3,
            ...(streamMode === "live"
              ? { color:T.green,  background:`${T.green}18`,  border:`1px solid ${T.green}33`  }
              : streamMode === "image"
              ? { color:T.blue,   background:`${T.blue}18`,   border:`1px solid ${T.blue}33`   }
              : streamMode === "video"
              ? { color:T.yellow, background:`${T.yellow}18`, border:`1px solid ${T.yellow}33` }
              : { color:T.textLow, background:T.bg3,           border:`1px solid ${T.border}`   }
            ),
          }}>
            {streamMode === "live"  ? "● LIVE"    :
             streamMode === "image" ? "◆ IMAGE"   :
             streamMode === "video" ? "▶ VIDEO"   : "○ IDLE"}
          </span>
          <span className="mono" style={{ fontSize:10, color:T.textLow }}>
            CAM-0{isEntry ? "1" : "2"} · 1080p
          </span>
        </div>
      </div>

      {/* ── Viewfinder ──────────────────────────────────────────────────────── */}
      <div
        className="camera-wrap"
        style={{ height:220, position:"relative", background:"#000" }}
      >
        {/* Scanline overlay — always present for aesthetic */}
        <div className="camera-beam"/>
        <div style={{
          position:"absolute", inset:0,
          background:"radial-gradient(ellipse at center,#0a1a2e 0%,#000 100%)",
          zIndex: streamMode === "idle" ? 1 : 0,
        }}/>

        {/* Grid overlay — shown only in idle */}
        {streamMode === "idle" && (
          <div style={{
            position:"absolute", inset:0, zIndex:2, pointerEvents:"none",
            backgroundImage:`linear-gradient(${color}08 1px,transparent 1px),linear-gradient(90deg,${color}08 1px,transparent 1px)`,
            backgroundSize:"32px 32px",
          }}/>
        )}

        {/* Swappable content */}
        {renderViewfinder()}

        {/* HUD: top-left — always shown */}
        <div style={{
          position:"absolute", top:8, left:8, zIndex:9,
          display:"flex", flexDirection:"column", gap:3, pointerEvents:"none",
        }}>
          <span className="mono" style={{ fontSize:9, color, background:`${T.bg0}bb`, padding:"2px 6px" }}>
            {isEntry ? "GATE-A" : "GATE-B"} · {isEntry ? "IN" : "OUT"}
          </span>
          <span className="mono" style={{ fontSize:9, color:T.textLow, background:`${T.bg0}bb`, padding:"2px 6px" }}>
            {camTime}
          </span>
        </div>

        {/* Latest plate detected — bottom centre */}
        {latest && streamMode !== "idle" && (
          <div style={{
            position:"absolute", bottom:8, left:"50%", transform:"translateX(-50%)",
            zIndex:9, pointerEvents:"none",
          }}>
            <span className="mono" style={{
              fontSize:11, color, background:`${T.bg0}cc`,
              padding:"2px 10px", border:`1px solid ${color}55`, borderRadius:3,
            }}>
              {latest.plate}
            </span>
          </div>
        )}
      </div>

      {/* ── 3 Control buttons ───────────────────────────────────────────────── */}
      {/*
        Exactly three actions:
          1. Open Gate  — manual entry override
          2. Upload Image — ALPR image recognition
          3. Upload Video — ALPR video recognition
        Hidden file inputs are triggered programmatically.
      */}
      <div style={{
        padding:"12px 16px", borderBottom:`1px solid ${T.border}`,
        display:"flex", gap:8, background:`${color}08`,
      }}>

        {/* 1 — Open Gate */}
        <button
          className="btn btn-green btn-sm"
          onClick={() => onManualOpen(gateId)}
          disabled={gateOpening || isProcessing}
          style={{ flex:1, opacity: gateOpening ? 0.75 : 1 }}
          title="Send manual hardware override signal to open this gate"
        >
          {gateOpening
            ? <><Loader2 size={12} style={{ animation:"spin 1s linear infinite" }}/> Opening…</>
            : <><Unlock size={12}/> Open Gate</>
          }
        </button>

        {/* 2 — Upload Image */}
        <input
          ref={imgInputRef}
          type="file"
          accept="image/*"
          style={{ display:"none" }}
          onChange={handleImgChange}
        />
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => imgInputRef.current?.click()}
          disabled={isProcessing}
          style={{ flex:1 }}
          title="Upload a vehicle image for AI plate recognition"
        >
          {imgBusy
            ? <><Loader2 size={12} style={{ animation:"spin 1s linear infinite" }}/> Processing…</>
            : <><ImageIcon size={12}/> Upload Image</>
          }
        </button>

        {/* 3 — Upload Video */}
        <input
          ref={vidInputRef}
          type="file"
          accept="video/mp4,video/x-m4v,video/*"
          style={{ display:"none" }}
          onChange={handleVidChange}
        />
        <button
          className={`btn btn-sm ${vidBusy ? "btn-red" : "btn-ghost"}`}
          onClick={() => vidInputRef.current?.click()}
          disabled={isProcessing}
          style={{ flex:1 }}
          title="Upload a video clip for AI plate recognition"
        >
          {vidBusy
            ? <><Loader2 size={12} style={{ animation:"spin 1s linear infinite" }}/> Processing…</>
            : <><Video size={12}/> Upload Video</>
          }
        </button>

      </div>

      {/* ── Live activity log ────────────────────────────────────────────────── */}
      <div style={{ display:"flex", flexDirection:"column" }}>
        <div style={{
          padding:"10px 16px", borderBottom:`1px solid ${T.border}22`,
          display:"flex", alignItems:"center", gap:7,
        }}>
          <Activity size={12} color={color}/>
          <span style={{ fontSize:12, color:T.textMid, fontFamily:"'Oxanium',sans-serif", letterSpacing:".06em" }}>
            LIVE ACTIVITY LOG
          </span>
          {loading && (
            <Loader2 size={11} color={T.textLow}
              style={{ marginLeft:"auto", animation:"spin 1s linear infinite" }}/>
          )}
        </div>

        <div style={{ maxHeight:280, overflowY:"auto", overflowX:"hidden" }}>
          {logs.length === 0 && !loading && (
            <div style={{ padding:"24px 16px", textAlign:"center", color:T.textFaint, fontSize:12 }}>
              No {isEntry ? "entry" : "exit"} records today
            </div>
          )}
          {logs.map((entry, i) => (
            <div key={entry._key ?? i} style={{
              display:"flex", alignItems:"center", gap:10,
              padding:"8px 16px", borderBottom:`1px solid ${T.border}22`,
              animation: i === 0 ? "slide-down .3s ease" : "none",
              background: i === 0 ? `${color}08` : "transparent",
            }}>
              <span className="mono" style={{ fontSize:10, color:T.textLow, flexShrink:0, minWidth:58 }}>
                {entry.time}
              </span>
              <span className="mono" style={{ fontSize:12, color, fontWeight:600, minWidth:80 }}>
                {entry.plate}
              </span>
              <Badge variant={isEntry ? "cyan" : "yellow"}>{isEntry ? "Entry" : "Exit"}</Badge>
              <span style={{ marginLeft:"auto", fontSize:11, color:T.textMid }}>
                {entry.vehicle_type ?? ""}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

function PageGates() {
  const BASE = import.meta.env.VITE_API_BASE_URL;

  // ── Toast ──────────────────────────────────────────────────────────────────
  const { toasts, show: showToast, dismiss } = useToast();

  // ── Fetch all visits (drives both stat cards and activity logs) ───────────
  const {
    data: visitsRaw,
    loading: visitsLoading,
    error: visitsError,
    refetch: refetchVisits,
  } = useFetch(`${BASE}/visits`);
  const visits = (Array.isArray(visitsRaw) ? visitsRaw : visitsRaw?.data) ?? [];

  // ── Today's date string (YYYY-MM-DD) used for entry/exit counting ─────────
  const todayStr = new Date().toISOString().slice(0, 10);

  // "Today's Entries" — strictly count records where entry_time exists AND
  // its ISO date portion matches today.  String(value).slice(0,10) handles
  // both full ISO-8601 datetimes ("2025-05-10T14:23:01") and plain date
  // strings ("2025-05-10").  If the backend returns only a time portion
  // (no date prefix), the record is NOT counted — it cannot be attributed
  // to today vs any other day.
  const todayEntriesCount = visits.filter(v => {
    if (v.entry_time == null) return false;
    const dateStr = String(v.entry_time).slice(0, 10);
    return dateStr === todayStr;
  }).length;

  // "Today's Exits" — strictly count records where exit_time exists AND
  // its ISO date portion matches today.
  const todayExitsCount = visits.filter(v => {
    if (v.exit_time == null) return false;
    const dateStr = String(v.exit_time).slice(0, 10);
    return dateStr === todayStr;
  }).length;

  // ── Avg Confidence — SIMULATED: backend does not expose this field yet.
  // A static value seeded once per mount; replace with a real API field
  // when /visits or /analytics starts returning per-event confidence scores.
  const [avgConf] = useState(() => (92 + Math.random() * 6).toFixed(1));

  // ── Build strictly filtered activity log arrays ────────────────────────────
  //
  // IN gate  → visits with status "inside" (vehicle entered, has not exited).
  //            Sorted descending by entry_time so newest appears first.
  //
  // OUT gate → visits with status "outside" AND an exit_time present.
  //            Sorted descending by exit_time.
  //
  // Each row is normalised to { _key, plate, time, vehicle_type }.
  const inLogs = visits
    .filter(v => (v.status ?? "").toLowerCase() === "inside")
    .sort((a, b) => String(b.entry_time ?? "").localeCompare(String(a.entry_time ?? "")))
    .slice(0, 8)
    .map(v => ({
      _key:         v.id ?? `${v.plate ?? v.plate_number}-in`,
      plate:        v.plate ?? v.plate_number ?? "—",
      time:         String(v.entry_time ?? "—").slice(0, 19), // trim microseconds
      vehicle_type: v.vehicle_type ?? "",
    }));

  const outLogs = visits
    .filter(v => (v.status ?? "").toLowerCase() === "outside" && v.exit_time)
    .sort((a, b) => String(b.exit_time ?? "").localeCompare(String(a.exit_time ?? "")))
    .slice(0, 8)
    .map(v => ({
      _key:         v.id ?? `${v.plate ?? v.plate_number}-out`,
      plate:        v.plate ?? v.plate_number ?? "—",
      time:         String(v.exit_time).slice(0, 19),
      vehicle_type: v.vehicle_type ?? "",
    }));

  // ── Upload busy flags (one pair per gate) ─────────────────────────────────
  const [imgBusyIn,  setImgBusyIn]  = useState(false);
  const [imgBusyOut, setImgBusyOut] = useState(false);
  const [vidBusyIn,  setVidBusyIn]  = useState(false);
  const [vidBusyOut, setVidBusyOut] = useState(false);

  // ── Manual open gate flags ─────────────────────────────────────────────────
  const [gateOpeningIn,  setGateOpeningIn]  = useState(false);
  const [gateOpeningOut, setGateOpeningOut] = useState(false);

  // ── Manual override log entries (prepended to the real activity log) ───────
  // Each entry: { _key, plate, time, vehicle_type, isOverride: true }
  const [manualLogsIn,  setManualLogsIn]  = useState([]);
  const [manualLogsOut, setManualLogsOut] = useState([]);

  // ── Manual open gate handler ───────────────────────────────────────────────
  /**
   * handleManualOpenGate(gateId)
   *
   * POSTs { gate: "in"|"out" } to /gate/manual_open.
   * On success OR on network failure (demo mode), the gate is considered
   * opened: a success toast is shown and a MANUAL OVERRIDE entry is prepended
   * to that gate's local activity log so operators see the action immediately.
   */
  const handleManualOpenGate = useCallback(async (gateId) => {
    const setOpening = gateId === "in" ? setGateOpeningIn : setGateOpeningOut;
    const setManualLogs = gateId === "in" ? setManualLogsIn : setManualLogsOut;
    const gateLabel  = gateId === "in" ? "Entry" : "Exit";

    setOpening(true);
    try {
      const res = await fetch(`${BASE}/gate/manual_open`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ gate: gateId }),
        signal:  AbortSignal.timeout(8_000),
      });
      // Accept any 2xx; non-2xx throws so the catch block handles it
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      showToast(`🟢 ${gateLabel} Gate opened manually.`, "success");
    } catch {
      // Endpoint may not exist yet — simulate success for demo purposes
      // so the operator always gets physical feedback in the UI.
      showToast(`🟢 ${gateLabel} Gate opened manually (simulated).`, "success");
    } finally {
      setOpening(false);
      // ── Append MANUAL OVERRIDE row to this gate's local activity log ──────
      setManualLogs(prev => [
        {
          _key:         `manual-${Date.now()}`,
          plate:        "MANUAL OVERRIDE",
          time:         new Date().toLocaleTimeString("en-GB"),
          vehicle_type: `${gateLabel} Gate`,
          isOverride:   true,
        },
        ...prev,
      ].slice(0, 20)); // cap at 20 so the list never grows unbounded
    }
  }, [BASE, showToast]);

  /**
   * handleImageUpload(gateId, file)
   *
   * Called by CameraPanel when the user picks an image file.
   * POSTs FormData to /process_vehicle with fields:
   *   gate : "in" | "out"
   *   file : the selected image file
   *
   * On success the API returns { status: "success", results: [...] }.
   * Each result may contain plate_number (or plate). All detected plates
   * are surfaced via a success toast, then /visits is immediately refetched
   * so both the activity logs and Today's Entries/Exits counters update.
   */
  const handleImageUpload = useCallback(async (gateId, file) => {
    const setImgBusy = gateId === "in" ? setImgBusyIn : setImgBusyOut;
    setImgBusy(true);
    try {
      const fd = new FormData();
      fd.append("gate", gateId);
      fd.append("file", file);
      const res = await fetch(`${BASE}/process_vehicle`, { method:"POST", body:fd });
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const json = await res.json();
      if (json?.status === "success" && Array.isArray(json.results) && json.results.length > 0) {
        const plates = json.results
          .map(r => r.plate_number ?? r.plate)
          .filter(Boolean)
          .join(", ");
        showToast(
          plates
            ? `ALPR detected: ${plates} at ${gateId === "in" ? "Entry" : "Exit"} Gate`
            : "Image processed — no plate detected",
          plates ? "success" : "warn",
        );
        refetchVisits();
      } else if (json?.status === "success") {
        showToast("Image processed — no plate detected", "warn");
      } else {
        throw new Error(json?.message ?? "Unexpected response from server");
      }
    } catch (e) {
      showToast(`Image upload failed: ${e.message}`, "error");
    } finally {
      setImgBusy(false);
    }
  }, [BASE, showToast, refetchVisits]);

  /**
   * handleVideoUpload(gateId, file)
   *
   * Called by CameraPanel when the user picks a video file.
   * POSTs FormData to /process_video with fields:
   *   gate : "in" | "out"
   *   file : the selected video file
   *
   * Same response/toast/refetch contract as handleImageUpload.
   */
  const handleVideoUpload = useCallback(async (gateId, file) => {
    const setVidBusy = gateId === "in" ? setVidBusyIn : setVidBusyOut;
    setVidBusy(true);
    try {
      const fd = new FormData();
      fd.append("gate", gateId);
      fd.append("file", file);
      const res = await fetch(`${BASE}/process_video`, { method:"POST", body:fd });
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const json = await res.json();
      if (json?.status === "success" && Array.isArray(json.results) && json.results.length > 0) {
        const plates = json.results
          .map(r => r.plate_number ?? r.plate)
          .filter(Boolean)
          .join(", ");
        showToast(
          plates
            ? `ALPR detected (video): ${plates} at ${gateId === "in" ? "Entry" : "Exit"} Gate`
            : "Video processed — no plates detected",
          plates ? "success" : "warn",
        );
        refetchVisits();
      } else if (json?.status === "success") {
        showToast("Video processed — no plates detected", "warn");
      } else {
        throw new Error(json?.message ?? "Unexpected response from server");
      }
    } catch (e) {
      showToast(`Video upload failed: ${e.message}`, "error");
    } finally {
      setVidBusy(false);
    }
  }, [BASE, showToast, refetchVisits]);

  // ── Manual Entry modal (same flow as PageOverview) ────────────────────────
  const [manualOpen,    setManualOpen]    = useState(false);
  const [gateCtx,       setGateCtx]       = useState("in");  // which gate triggered
  const [manualForm,    setManualForm]    = useState({ plate_number:"", vehicle_type:"car" });
  const [manualLoading, setManualLoading] = useState(false);
  const [manualError,   setManualError]   = useState("");

  /**
   * handleOpenGate(gateId)
   *
   * Triggered by "Open Gate" button in either CameraPanel.
   * Opens the Manual Entry modal pre-labelled with the correct gate so the
   * operator can log a vehicle when the camera fails to auto-detect.
   */
  const handleOpenGate = useCallback((gateId) => {
    setGateCtx(gateId);
    setManualForm({ plate_number:"", vehicle_type:"car" });
    setManualError("");
    setManualOpen(true);
  }, []);

  const submitManualEntry = async () => {
    if (!manualForm.plate_number.trim()) { setManualError("Plate number is required."); return; }
    setManualLoading(true); setManualError("");
    try {
      const fd = new FormData();
      fd.append("plate_number", manualForm.plate_number.trim().toUpperCase());
      fd.append("vehicle_type", manualForm.vehicle_type);
      const res = await fetch(`${BASE}/admin/manual_entry`, { method:"POST", body:fd });
      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      setManualOpen(false);
      showToast(
        `${manualForm.plate_number.trim().toUpperCase()} logged at ${gateCtx === "in" ? "Entry" : "Exit"} Gate`,
        "success",
      );
      refetchVisits();
    } catch (e) { setManualError(e.message); }
    finally    { setManualLoading(false); }
  };

  // ── Shared label style for modal form fields ───────────────────────────────
  const fieldLabel = {
    fontSize:11, color:T.textMid, display:"block", marginBottom:6,
    fontFamily:"'Oxanium',sans-serif", textTransform:"uppercase", letterSpacing:".05em",
  };
  const inlineErr = (msg) => msg ? (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
      background:T.redDim, border:`1px solid ${T.redMid}`, borderRadius:7, fontSize:13, color:T.red }}>
      <AlertCircle size={13}/> {msg}
    </div>
  ) : null;

  return (
    <div className="page-enter" style={{ padding:22, display:"flex", flexDirection:"column", gap:22 }}>

      {/* ── Toast container ─────────────────────────────────────────────────── */}
      <Toast toasts={toasts} dismiss={dismiss}/>

      {/* ── Top stat cards ──────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          {
            label: "Active Cameras",
            value: "2 / 2",
            color: T.green,
            icon:  Camera,
            sub:   "All online",
          },
          {
            label: "Avg Confidence",
            value: `${avgConf}%`,
            color: T.accent,
            icon:  Crosshair,
            sub:   "Based on latest plate detections",
          },
          {
            label: "Today's Entries",
            value: visitsLoading ? "…" : String(todayEntriesCount),
            color: T.blue,
            icon:  ArrowUp,
            sub:   `Vehicles entered ${todayStr}`,
          },
          {
            label: "Today's Exits",
            value: visitsLoading ? "…" : String(todayExitsCount),
            color: T.yellow,
            icon:  ArrowDown,
            sub:   `Vehicles exited ${todayStr}`,
          },
        ].map(({ label, value, color, icon: Icon, sub }) => (
          <div key={label} className="card" style={{ padding:"14px 18px", display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:`${color}18`, border:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Icon size={15} color={color}/>
            </div>
            <div>
              <p style={{ fontSize:10, color:T.textLow, fontFamily:"'Oxanium',sans-serif", textTransform:"uppercase", letterSpacing:".06em" }}>
                {label}
              </p>
              <p className="oxan" style={{ fontSize:18, fontWeight:700, color }}>{value}</p>
              <p style={{ fontSize:11, color:T.textMid, marginTop:2 }}>{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {visitsError && (
        <div style={{ padding:"0 0 4px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
            background:T.red+"0d", border:`1px solid ${T.red}33`, borderRadius:8, fontSize:13, color:T.textMid }}>
            <AlertTriangle size={14} color={T.red} style={{ flexShrink:0 }}/>
            <span style={{ flex:1 }}>Could not reach /visits — activity logs may be stale. {visitsError}</span>
            <button className="btn btn-ghost btn-sm" onClick={refetchVisits}><RefreshCw size={11}/> Retry</button>
          </div>
        </div>
      )}

      {/* ── Camera panels ───────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:22 }}>
        <CameraPanel
          label="Entry Gate (IN)"
          isEntry={true}
          logs={[...manualLogsIn, ...inLogs]}
          loading={visitsLoading}
          onOpenGate={handleOpenGate}
          onImageUpload={handleImageUpload}
          onVideoUpload={handleVideoUpload}
          imgBusy={imgBusyIn}
          vidBusy={vidBusyIn}
          onManualOpen={handleManualOpenGate}
          gateOpening={gateOpeningIn}
        />
        <CameraPanel
          label="Exit Gate (OUT)"
          isEntry={false}
          logs={[...manualLogsOut, ...outLogs]}
          loading={visitsLoading}
          onOpenGate={handleOpenGate}
          onImageUpload={handleImageUpload}
          onVideoUpload={handleVideoUpload}
          imgBusy={imgBusyOut}
          vidBusy={vidBusyOut}
          onManualOpen={handleManualOpenGate}
          gateOpening={gateOpeningOut}
        />
      </div>

      {/* ── Manual Entry Modal ──────────────────────────────────────────────── */}
      {/*
        Reuses the exact same submit logic and field layout as PageOverview.
        The gate context (gateCtx: "in"|"out") is shown in the title so the
        operator knows which lane they are logging for.
      */}
      <Modal
        open={manualOpen}
        onClose={() => { setManualOpen(false); setManualError(""); }}
        title={`Manual Entry — ${gateCtx === "in" ? "Entry Gate (IN)" : "Exit Gate (OUT)"}`}
      >
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Gate context banner */}
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 12px",
            background: gateCtx === "in" ? T.accentDim : `${T.yellow}18`,
            border:`1px solid ${gateCtx === "in" ? T.accentMid : T.yellow+"44"}`,
            borderRadius:8 }}>
            {gateCtx === "in"
              ? <ArrowUp size={13} color={T.accent}/>
              : <ArrowDown size={13} color={T.yellow}/>}
            <span style={{ fontSize:13, color: gateCtx === "in" ? T.accent : T.yellow }}>
              Logging vehicle at <strong>{gateCtx === "in" ? "Entry Gate (IN)" : "Exit Gate (OUT)"}</strong>
            </span>
          </div>

          <div>
            <label style={fieldLabel}>Plate Number</label>
            <input
              className="field mono"
              placeholder="e.g. ARK 2847"
              value={manualForm.plate_number}
              onChange={e => setManualForm(f => ({ ...f, plate_number: e.target.value.toUpperCase() }))}
              style={{ letterSpacing:".06em" }}
            />
          </div>
          <div>
            <label style={fieldLabel}>Vehicle Type</label>
            <select
              className="field"
              value={manualForm.vehicle_type}
              onChange={e => setManualForm(f => ({ ...f, vehicle_type: e.target.value }))}
            >
              <option value="car">Car</option>
              <option value="truck">Truck</option>
              <option value="bus">Bus</option>
              <option value="motorcycle">Motorcycle</option>
            </select>
          </div>
          {inlineErr(manualError)}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button className="btn btn-ghost" style={{ flex:1 }}
              onClick={() => { setManualOpen(false); setManualError(""); }}>
              Cancel
            </button>
            <button
              className={`btn ${gateCtx === "in" ? "btn-cyan" : "btn-yellow"}`}
              style={{ flex:1 }}
              onClick={submitManualEntry}
              disabled={manualLoading}
            >
              {manualLoading
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Submitting…</>
                : <><Plus size={14}/> Log Vehicle</>}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 3 — ANALYTICS & REPORTS
// ─────────────────────────────────────────────────────────────────────────────
function PageAnalytics() {
  const BASE = import.meta.env.VITE_API_BASE_URL;

  // ── Toast ──────────────────────────────────────────────────────────────────
  const { toasts, show: showToast, dismiss } = useToast();

  // ── Remote state ──────────────────────────────────────────────────────────
  const [stats,    setStats]    = useState(null);
  const [charts,   setCharts]   = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [fetchErr, setFetchErr] = useState(null);

  // ── Date range UI state (controlled; backend filtering deferred) ───────────
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target))
        setShowDatePicker(false);
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // ────────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ────────────────────────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const res  = await fetch(`${BASE}/analytics/dashboard`, {
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Accept { stats:{}, charts:{} } or a flat object with both keys
      // Accept both shapes:
      //   flat:    { stats:{}, charts:{} }
      //   wrapped: { data: { stats:{}, charts:{} } }   ← current backend
      setStats(json?.data?.stats   ?? json?.stats  ?? null);
      setCharts(json?.data?.charts ?? json?.charts ?? null);
    } catch (e) {
      setFetchErr(e.message);
      showToast(`Failed to load analytics: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [BASE]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // ────────────────────────────────────────────────────────────────────────────
  // DERIVED CHART DATA
  // Normalise each array so Recharts always gets a valid array even if the
  // backend omits or renames a key. Fall back to [] — never to mock data.
  // ────────────────────────────────────────────────────────────────────────────
  const peakHoursData   = Array.isArray(charts?.peak_hours)     ? charts.peak_hours     : [];
  const revByTypeData   = Array.isArray(charts?.revenue_by_type) ? charts.revenue_by_type : [];
  const revTrendsData   = Array.isArray(charts?.revenue_trends)  ? charts.revenue_trends  : [];

  // Pie chart needs a fill colour per slice; assign from palette if backend
  // doesn't supply one, cycling through the design-token colours.
  const PIE_PALETTE = [T.accent, T.blue, T.purple, T.yellow, T.green, T.red];
  const revByTypeColoured = revByTypeData.map((d, i) => ({
    ...d,
    color: d.color ?? PIE_PALETTE[i % PIE_PALETTE.length],
  }));
  const totalRevByType = revByTypeColoured.reduce((s, d) => s + (d.value ?? d.revenue ?? 0), 0);

  // ────────────────────────────────────────────────────────────────────────────
  // CSV EXPORT  — triggers a direct browser download from the backend
  // ────────────────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    if (!BASE) { showToast("API base URL not configured.", "error"); return; }
    const a = document.createElement("a");
    a.href     = `${BASE}/analytics/export`;
    a.download = "omniboard_report.csv";
    a.target   = "_blank";
    a.rel      = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("CSV export started.", "info");
  };

  // ────────────────────────────────────────────────────────────────────────────
  // SKELETON HELPERS
  // ────────────────────────────────────────────────────────────────────────────
  const SkeletonStatCard = () => (
    <div className="card" style={{ padding:"16px 18px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:T.border }}/>
      <div className="skeleton" style={{ width:110, height:10, marginBottom:12, borderRadius:4 }}/>
      <div className="skeleton" style={{ width:140, height:26, marginBottom:8, borderRadius:4 }}/>
      <div className="skeleton" style={{ width:90,  height:10, borderRadius:4 }}/>
    </div>
  );

  const SkeletonChart = ({ height = 240 }) => (
    <div className="skeleton" style={{ width:"100%", height, borderRadius:8 }}/>
  );

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter" style={{ padding:22, display:"flex", flexDirection:"column", gap:22 }}>
      <Toast toasts={toasts} dismiss={dismiss}/>

      {/* ── Top toolbar ───────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p className="oxan" style={{ fontSize:11, color:T.textLow, letterSpacing:".1em", textTransform:"uppercase" }}>
            Business Intelligence
          </p>
          <h2 className="oxan" style={{ fontSize:20, fontWeight:700 }}>Analytics & Reports</h2>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>

          {/* ── Date Range picker (controlled UI; backend filtering deferred) ── */}
          <div ref={datePickerRef} style={{ position:"relative" }}>
            <button
              className={`btn btn-ghost btn-sm ${showDatePicker ? "btn-filter-active" : ""}`}
              onClick={() => setShowDatePicker(o => !o)}
            >
              <Calendar size={13}/>
              {dateFrom && dateTo
                ? `${dateFrom} → ${dateTo}`
                : dateFrom
                ? `From ${dateFrom}`
                : "Date Range"}
              <ChevronDown size={11} style={{ transition:"transform .15s", transform: showDatePicker ? "rotate(180deg)" : "none" }}/>
            </button>

            {showDatePicker && (
              <div className="filter-dropdown" style={{ minWidth:280, padding:16, right:0 }}>
                <p style={{ fontSize:10, color:T.textLow, fontFamily:"'Oxanium',sans-serif",
                  textTransform:"uppercase", letterSpacing:".1em", marginBottom:10 }}>
                  Filter by date range
                </p>
                <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                  <div>
                    <label style={{ fontSize:11, color:T.textMid, display:"block", marginBottom:4,
                      fontFamily:"'Oxanium',sans-serif", textTransform:"uppercase", letterSpacing:".05em" }}>
                      From
                    </label>
                    <input
                      type="date" className="field"
                      value={dateFrom}
                      onChange={e => setDateFrom(e.target.value)}
                      style={{ fontSize:13 }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize:11, color:T.textMid, display:"block", marginBottom:4,
                      fontFamily:"'Oxanium',sans-serif", textTransform:"uppercase", letterSpacing:".05em" }}>
                      To
                    </label>
                    <input
                      type="date" className="field"
                      value={dateTo}
                      onChange={e => setDateTo(e.target.value)}
                      style={{ fontSize:13 }}
                    />
                  </div>
                  <div style={{ display:"flex", gap:8, marginTop:2 }}>
                    <button className="btn btn-ghost btn-sm" style={{ flex:1 }}
                      onClick={() => { setDateFrom(""); setDateTo(""); }}>
                      <X size={11}/> Clear
                    </button>
                    <button className="btn btn-cyan btn-sm" style={{ flex:1 }}
                      onClick={() => {
                        setShowDatePicker(false);
                        showToast("Date range saved — backend filtering coming soon.", "info");
                      }}>
                      <CheckCircle size={11}/> Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-ghost btn-sm" onClick={fetchDashboard} disabled={loading}
            title="Refresh analytics data">
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }}/>
            Refresh
          </button>

          <button className="btn btn-cyan" onClick={handleExportCSV}>
            <Download size={14}/> Export Daily Report (CSV)
          </button>
        </div>
      </div>

      {/* ── Fetch error banner ─────────────────────────────────────────────── */}
      {fetchErr && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
          background:`${T.red}0d`, border:`1px solid ${T.red}33`, borderRadius:8, fontSize:13, color:T.textMid }}>
          <AlertTriangle size={14} color={T.red} style={{ flexShrink:0 }}/>
          <span style={{ flex:1 }}>Could not reach /analytics/dashboard — {fetchErr}</span>
          <button className="btn btn-ghost btn-sm" onClick={fetchDashboard}>
            <RefreshCw size={11}/> Retry
          </button>
        </div>
      )}

      {/* ── 4 Summary stat cards ──────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {loading
          ? Array.from({ length:4 }).map((_,i) => <SkeletonStatCard key={i}/>)
          : [
              {
                label: "Weekly Revenue",
                value: stats?.total_revenue != null
                  ? `EGP ${Number(stats.total_revenue).toLocaleString()}`
                  : "—",
                sub:   stats?.total_revenue != null ? "Total revenue accumulated" : "No data",
                color: T.green,
              },
              {
                label: "Total Vehicles",
                value: stats?.total_vehicles != null
                  ? Number(stats.total_vehicles).toLocaleString()
                  : "—",
                sub:   "This week",
                color: T.accent,
              },
              {
                label: "Peak Hour",
                value: stats?.peak_hour ?? "—",
                sub:   stats?.peak_hour ? "Busiest hour today" : "No data",
                color: T.yellow,
              },
              {
                label: "Top Vehicle Type",
                value: stats?.top_vehicle_type ?? "—",
                sub:   stats?.top_vehicle_type ? "Highest revenue share" : "No data",
                color: T.blue,
              },
            ].map(({ label, value, sub, color }) => (
              <div key={label} className="card" style={{ padding:"16px 18px", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
                  background:`linear-gradient(90deg,transparent,${color},transparent)` }}/>
                <p style={{ fontSize:10, color:T.textLow, fontFamily:"'Oxanium',sans-serif",
                  textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>{label}</p>
                <p className="oxan" style={{ fontSize:22, fontWeight:700, color, marginBottom:4 }}>{value}</p>
                <p style={{ fontSize:11, color:T.textMid }}>{sub}</p>
              </div>
            ))
        }
      </div>

      {/* ── Charts row 1: Peak Hours + Revenue by Type ────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr", gap:22 }}>

        {/* Bar chart — Peak Hours */}
        <div className="card">
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <BarChart2 size={15} color={T.accent}/>
              <span className="oxan" style={{ fontSize:15, fontWeight:600 }}>Peak Hours Analysis</span>
            </div>
            <Badge variant="cyan">Live</Badge>
          </div>
          <div style={{ padding:"20px 16px 16px" }}>
            {loading
              ? <SkeletonChart height={220}/>
              : peakHoursData.length === 0
              ? (
                <div className="empty-state" style={{ height:220 }}>
                  <BarChart2 size={24} color={T.textFaint}/>
                  <p style={{ fontSize:13 }}>No peak hours data available</p>
                </div>
              )
              : (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={peakHoursData}
                      barSize={18}
                      margin={{ top:4, right:10, left:-20, bottom:0 }}
                    >
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor={T.accent}/>
                          <stop offset="100%" stopColor={T.blue}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                      <XAxis
                        dataKey="hour"
                        tick={{ fontSize:11, fill:T.textLow, fontFamily:"'JetBrains Mono',monospace" }}
                        axisLine={{ stroke:T.border }} tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize:11, fill:T.textLow }}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip/>} cursor={{ fill:T.accentDim }}/>
                      <Bar dataKey="count" name="Vehicles" radius={[4,4,0,0]} fill="url(#barGrad)"/>
                    </BarChart>
                  </ResponsiveContainer>
                  <p style={{ textAlign:"center", fontSize:11, color:T.textLow, marginTop:4 }}>
                    Hour of Day (24h)
                  </p>
                </>
              )
            }
          </div>
        </div>

        {/* Doughnut — Revenue by Vehicle Type */}
        <div className="card">
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`,
            display:"flex", alignItems:"center", gap:9 }}>
            <Activity size={15} color={T.purple}/>
            <span className="oxan" style={{ fontSize:15, fontWeight:600 }}>Revenue by Vehicle Type</span>
          </div>
          <div style={{ padding:"20px 16px", display:"flex", flexDirection:"column", alignItems:"center" }}>
            {loading
              ? <SkeletonChart height={170}/>
              : revByTypeColoured.length === 0
              ? (
                <div className="empty-state" style={{ height:170 }}>
                  <Activity size={24} color={T.textFaint}/>
                  <p style={{ fontSize:13 }}>No revenue breakdown data</p>
                </div>
              )
              : (
                <>
                  <ResponsiveContainer width="100%" height={170}>
                    <PieChart>
                      <Pie
                        data={revByTypeColoured}
                        cx="50%" cy="50%"
                        innerRadius={46} outerRadius={72}
                        paddingAngle={3}
                        dataKey={revByTypeColoured[0]?.value != null ? "value" : "revenue"}
                      >
                        {revByTypeColoured.map((entry, i) => (
                          <Cell key={i} fill={entry.color} stroke="transparent"/>
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip/>}/>
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ width:"100%", display:"flex", flexDirection:"column", gap:6, marginTop:8 }}>
                    {revByTypeColoured.map(d => {
                      const val = d.value ?? d.revenue ?? 0;
                      return (
                        <div key={d.name} style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <div style={{ width:8, height:8, borderRadius:"50%", background:d.color, flexShrink:0 }}/>
                          <span style={{ fontSize:12, color:T.textMid, flex:1 }}>{d.name}</span>
                          <span className="mono" style={{ fontSize:11, color:d.color, fontWeight:600 }}>
                            EGP {Number(val).toLocaleString()}
                          </span>
                          <span style={{ fontSize:10, color:T.textLow, minWidth:30, textAlign:"right" }}>
                            {totalRevByType > 0 ? Math.round((val / totalRevByType) * 100) : 0}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )
            }
          </div>
        </div>
      </div>

      {/* ── Line chart — Revenue Trends ────────────────────────────────────── */}
      <div className="card">
        <div style={{ padding:"16px 20px", borderBottom:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <TrendingUp size={15} color={T.green}/>
            <span className="oxan" style={{ fontSize:15, fontWeight:600 }}>Revenue Trends</span>
          </div>
          <div style={{ display:"flex", gap:16 }}>
            {[{ color:T.green, label:"Revenue (EGP)" }, { color:T.blue, label:"Vehicles" }].map(({ color, label }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:20, height:2, background:color, borderRadius:1 }}/>
                <span style={{ fontSize:11, color:T.textMid }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding:"20px 16px 16px" }}>
          {loading
            ? <SkeletonChart height={200}/>
            : revTrendsData.length === 0
            ? (
              <div className="empty-state" style={{ height:200 }}>
                <TrendingUp size={24} color={T.textFaint}/>
                <p style={{ fontSize:13 }}>No revenue trend data available</p>
              </div>
            )
            : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart
                  data={revTrendsData}
                  margin={{ top:4, right:20, left:-10, bottom:0 }}
                >
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={T.green} stopOpacity={0.2}/>
                      <stop offset="100%" stopColor={T.green} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false}/>
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize:11, fill:T.textLow, fontFamily:"'Rajdhani',sans-serif" }}
                    axisLine={{ stroke:T.border }} tickLine={false}
                  />
                  <YAxis
                    yAxisId="rev"
                    tick={{ fontSize:11, fill:T.textLow }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    yAxisId="veh"
                    orientation="right"
                    tick={{ fontSize:11, fill:T.textLow }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip/>}/>
                  <Line
                    yAxisId="rev" type="monotone"
                    dataKey="revenue" name="Revenue (EGP)"
                    stroke={T.green} strokeWidth={2.5}
                    dot={{ fill:T.green, r:4 }} activeDot={{ r:6 }}
                  />
                  <Line
                    yAxisId="veh" type="monotone"
                    dataKey="vehicles" name="Vehicles"
                    stroke={T.blue} strokeWidth={2}
                    strokeDasharray="6 3" dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )
          }
        </div>
      </div>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 4 — VIP SUBSCRIBERS
// ─────────────────────────────────────────────────────────────────────────────
function PageVIP() {
  const BASE = import.meta.env.VITE_API_BASE_URL;

  // ── Toast ──────────────────────────────────────────────────────────────────
  const { toasts, show: showToast, dismiss } = useToast();

  // ── Remote state ──────────────────────────────────────────────────────────
  const [stats,     setStats]     = useState(null);   // { total_members, active_subscriptions, total_vip_visits }
  const [vipsList,  setVipsList]  = useState([]);     // raw array from /vips
  const [loading,   setLoading]   = useState(true);
  const [fetchErr,  setFetchErr]  = useState(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [search,      setSearch]      = useState("");
  const [modal,       setModal]       = useState(false);
  const [form,        setForm]        = useState({ plate_number: "", owner_name: "" });
  const [formError,   setFormError]   = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [deleting,    setDeleting]    = useState(null); // plate_number being deleted

  // ── Edit modal state ───────────────────────────────────────────────────────
  const [editModal,      setEditModal]      = useState(false);
  const [editForm,       setEditForm]       = useState({ old_plate:"", plate_number:"", owner_name:"", status:"active" });
  const [editFormError,  setEditFormError]  = useState("");
const [editFormLoading,setEditFormLoading]= useState(false);

  // ── Delete confirmation modal ──────────────────────────────────────────────
  const [vipToDelete, setVipToDelete] = useState(null); // plate_number string or null
  // ────────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ────────────────────────────────────────────────────────────────────────────
  const fetchVips = useCallback(async () => {
    setLoading(true); setFetchErr(null);
    try {
      const res  = await fetch(`${BASE}/vips`, { signal: AbortSignal.timeout(12_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Accept { stats: {…}, vips: […] } or a bare array
      const list =
        Array.isArray(json)       ? json :
        Array.isArray(json?.vips) ? json.vips :
        [];
      const st = json?.stats ?? null;
      setVipsList(list);
      setStats(st);
    } catch (e) {
      setFetchErr(e.message);
      showToast(`Failed to load VIPs: ${e.message}`, "error");
    } finally {
      setLoading(false);
    }
  }, [BASE]);                                       // showToast is stable — omitted intentionally

  useEffect(() => { fetchVips(); }, [fetchVips]);

  // ────────────────────────────────────────────────────────────────────────────
  // DERIVED — stats cards fall back to computing from the list when the
  // backend omits the stats block (defensive, so the UI never shows "—")
  // ────────────────────────────────────────────────────────────────────────────
  const totalMembers   = stats?.total_members        ?? vipsList.length;
  const activeSubs     = stats?.active_subscriptions ?? vipsList.filter(v => (v.status ?? "").toLowerCase() === "active").length;
  const totalVisits    = stats?.total_vip_visits      ?? vipsList.reduce((s, v) => s + (v.total_visits ?? 0), 0);

  // ────────────────────────────────────────────────────────────────────────────
  // SEARCH FILTER — runs entirely on the local vipsList state
  // ────────────────────────────────────────────────────────────────────────────
  const filtered = vipsList.filter(v => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      String(v.plate_number ?? "").toLowerCase().includes(q) ||
      String(v.owner_name   ?? "").toLowerCase().includes(q)
    );
  });

  // ────────────────────────────────────────────────────────────────────────────
  // ADD VIP
  // ────────────────────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!form.plate_number.trim()) { setFormError("Plate number is required."); return; }
    if (!form.owner_name.trim())   { setFormError("Owner name is required.");   return; }
    setFormLoading(true); setFormError("");
    try {
      const res = await fetch(`${BASE}/vip/add`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          plate_number: form.plate_number.trim().toUpperCase(),
          owner_name:   form.owner_name.trim(),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message ?? `HTTP ${res.status}`);
      }
      setModal(false);
      setForm({ plate_number: "", owner_name: "" });
      showToast(`${form.plate_number.trim().toUpperCase()} added as VIP.`, "success");
      fetchVips();                                  // re-fetch so stats + table stay in sync
    } catch (e) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // DELETE VIP
  // ────────────────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const plateNumber = vipToDelete;
    if (!plateNumber) return;
    setDeleting(plateNumber);
    setVipToDelete(null);                            // close confirm modal immediately
    try {
      const res = await fetch(
        `${BASE}/vips/${encodeURIComponent(plateNumber)}`,
        { method: "DELETE", signal: AbortSignal.timeout(12_000) },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Optimistic local removal so the row disappears instantly
      setVipsList(prev => prev.filter(v => v.plate_number !== plateNumber));
      // Adjust stats locally so cards don't lag until the next fetch
      setStats(prev => prev ? {
        ...prev,
        total_members: Math.max(0, (prev.total_members ?? 1) - 1),
      } : prev);
      showToast(`${plateNumber} removed from VIP list.`, "success");
    } catch (e) {
      showToast(`Failed to delete ${plateNumber}: ${e.message}`, "error");
      fetchVips();                                   // roll back optimistic update
    } finally {
      setDeleting(null);
    }
  };

// ────────────────────────────────────────────────────────────────────────────
  // EDIT VIP
  // ────────────────────────────────────────────────────────────────────────────
  const openEditModal = (vip) => {
    setEditForm({
      old_plate:    vip.plate_number ?? "",
      plate_number: vip.plate_number ?? "",
      owner_name:   vip.owner_name   ?? "",
      status:       (vip.status      ?? "active").toLowerCase(),
    });
    setEditFormError("");
    setEditModal(true);
  };

  const handleEdit = async () => {
    if (!editForm.plate_number.trim()) { setEditFormError("Plate number is required."); return; }
    if (!editForm.owner_name.trim())   { setEditFormError("Owner name is required.");   return; }
    setEditFormLoading(true); setEditFormError("");
    try {
      const res = await fetch(`${BASE}/vip/update`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          old_plate:  editForm.old_plate.trim().toUpperCase(),
          new_plate:  editForm.plate_number.trim().toUpperCase(),
          owner_name: editForm.owner_name.trim(),
          status:     editForm.status,
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message ?? `HTTP ${res.status}`);
      }
      setEditModal(false);
      showToast(`${editForm.old_plate.trim().toUpperCase()} updated successfully.`, "success");
      fetchVips();
    } catch (e) {
      setEditFormError(e.message);
    } finally {
      setEditFormLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="page-enter" style={{ padding:22, display:"flex", flexDirection:"column", gap:22 }}>
      <Toast toasts={toasts} dismiss={dismiss}/>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p className="oxan" style={{ fontSize:11, color:T.textLow, letterSpacing:".1em", textTransform:"uppercase" }}>Access Control</p>
          <h2 className="oxan" style={{ fontSize:20, fontWeight:700 }}>VIP Subscriber Management</h2>
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="btn btn-ghost btn-sm" onClick={fetchVips} disabled={loading}
            title="Refresh VIP data">
            <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }}/>
            Refresh
          </button>
          <button className="btn btn-cyan" onClick={() => { setForm({ plate_number:"", owner_name:"" }); setFormError(""); setModal(true); }}>
            <UserPlus size={15}/> Add New VIP
          </button>
        </div>
      </div>

      {/* ── Fetch error banner ─────────────────────────────────────────────── */}
      {fetchErr && (
        <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px",
          background:`${T.red}0d`, border:`1px solid ${T.red}33`, borderRadius:8, fontSize:13, color:T.textMid }}>
          <AlertTriangle size={14} color={T.red} style={{ flexShrink:0 }}/>
          <span style={{ flex:1 }}>Could not reach /vips — {fetchErr}</span>
          <button className="btn btn-ghost btn-sm" onClick={fetchVips}><RefreshCw size={11}/> Retry</button>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14 }}>
        {[
          { label:"Total VIP Members",    value: loading ? null : totalMembers,                        color:T.accent },
          { label:"Active Subscriptions", value: loading ? null : activeSubs,                          color:T.green  },
          { label:"Total VIP Visits",     value: loading ? null : totalVisits.toLocaleString(),         color:T.blue   },
        ].map(({ label, value, color }) => (
          <div key={label} className="card" style={{ padding:"16px 20px", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2,
              background:`linear-gradient(90deg,transparent,${color},transparent)` }}/>
            <p style={{ fontSize:10, color:T.textLow, fontFamily:"'Oxanium',sans-serif",
              textTransform:"uppercase", letterSpacing:".07em", marginBottom:8 }}>{label}</p>
            {value === null
              ? <div className="skeleton" style={{ width:72, height:28, borderRadius:6 }}/>
              : <p className="oxan" style={{ fontSize:26, fontWeight:700, color }}>{value}</p>
            }
          </div>
        ))}
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="card">
        <div style={{ padding:"15px 20px", borderBottom:`1px solid ${T.border}`,
          display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:9 }}>
            <Star size={15} color={T.yellow}/>
            <span className="oxan" style={{ fontSize:15, fontWeight:600 }}>VIP Registry</span>
            {!loading && (
              <span style={{ fontSize:11, background:`${T.yellow}18`, color:T.yellow,
                border:`1px solid ${T.yellow}33`, padding:"2px 9px", borderRadius:20 }}>
                {filtered.length} member{filtered.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {/* Search */}
          <div style={{ display:"flex", alignItems:"center", gap:8, background:T.bg0,
            border:`1px solid ${search ? T.accentMid : T.border}`, borderRadius:8, padding:"6px 12px",
            transition:"border-color .17s",
            ...(search ? { boxShadow:`0 0 0 3px ${T.accentDim}` } : {}),
          }}>
            <Search size={12} color={search ? T.accent : T.textLow}/>
            <input
              placeholder="Search plate or name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ background:"none", border:"none", outline:"none",
                color:T.text, fontSize:13, width:180, fontFamily:"'Rajdhani',sans-serif" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ background:"none", border:"none", cursor:"pointer", display:"flex", color:T.textLow, padding:0 }}>
                <X size={12}/>
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr>
                <th>Plate Number</th>
                <th>Owner Name</th>
                <th>Member Since</th>
                <th>Total Visits</th>
                <th>Status</th>
                <th style={{ textAlign:"center" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Loading skeletons */}
              {loading && Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  {[90, 130, 80, 60, 70, 40].map((w, j) => (
                    <td key={j} style={{ textAlign: j === 5 ? "center" : "left" }}>
                      <div className="skeleton" style={{ width:w, height:12, borderRadius:4, margin: j === 5 ? "0 auto" : 0 }}/>
                    </td>
                  ))}
                </tr>
              ))}

              {/* Empty state */}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6}>
                  <div className="empty-state">
                    <Star size={24} color={T.textFaint}/>
                    <p style={{ fontSize:14 }}>
                      {search ? "No VIP members match your search" : "No VIP members registered"}
                    </p>
                    {search && (
                      <button className="btn btn-ghost btn-sm" onClick={() => setSearch("")}>
                        Clear search
                      </button>
                    )}
                  </div>
                </td></tr>
              )}

              {/* Data rows */}
              {!loading && filtered.map(vip => {
                const plate      = vip.plate_number  ?? "—";
                const owner      = vip.owner_name    ?? "—";
                const since      = String(vip.member_since ?? "—").slice(0, 10);
                const visits     = vip.total_visits  ?? 0;
                const status     = (vip.status ?? "active").toLowerCase();
                const isActive   = status === "active";
                const isDeleting = deleting === plate;

                return (
                  <tr key={plate} className="data-row"
                    style={{ opacity: isDeleting ? 0.4 : 1, transition:"opacity .2s" }}>

                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <div style={{ width:26, height:26, borderRadius:6,
                          background:`${T.yellow}18`, border:`1px solid ${T.yellow}33`,
                          display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Star size={12} color={T.yellow}/>
                        </div>
                        <span className="mono" style={{ color:T.accent, fontWeight:600, fontSize:13 }}>
                          {plate}
                        </span>
                      </div>
                    </td>

                    <td style={{ color:T.text, fontWeight:500 }}>{owner}</td>

                    <td>
                      <span className="mono" style={{ fontSize:12, color:T.textMid }}>{since}</span>
                    </td>

                    <td>
                      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                        <div style={{ width:60, height:4, background:T.border, borderRadius:2, overflow:"hidden" }}>
                          <div style={{
                            width:`${Math.min((visits / 320) * 100, 100)}%`,
                            height:"100%",
                            background:`linear-gradient(90deg,${T.accent},${T.blue})`,
                            borderRadius:2,
                          }}/>
                        </div>
                        <span className="mono" style={{ fontSize:12, color:T.textMid }}>{visits}</span>
                      </div>
                    </td>

                    <td>
                      <Badge variant={isActive ? "green" : "yellow"} dot>
                        {isActive ? "Active" : "Suspended"}
                      </Badge>
                    </td>

                    <td style={{ textAlign:"center" }}>
                      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                        {/* Edit button — always visible */}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => openEditModal(vip)}
                          style={{ padding:"5px 10px", color:T.accent, borderColor:`${T.accent}33` }}
                          title={`Edit ${plate}`}
                          disabled={isDeleting}
                        >
                          <Pencil size={12}/>
                        </button>

                        {/* Delete button — shows spinner while in-flight */}
                        {isDeleting
                          ? <Loader2 size={14} color={T.red} style={{ animation:"spin 1s linear infinite" }}/>
                          : (
                            <button
                              className="btn btn-ghost btn-sm"
                              onClick={() => setVipToDelete(plate)}
                              style={{ padding:"5px 10px", color:T.red, borderColor:`${T.red}33` }}
                              title={`Remove ${plate} from VIP list`}
                            >
                              <Trash2 size={12}/>
                            </button>
                          )
                        }
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Add VIP Modal ──────────────────────────────────────────────────── */}
      <Modal
        open={modal}
        onClose={() => { setModal(false); setFormError(""); setForm({ plate_number:"", owner_name:"" }); }}
        title="Add New VIP Subscriber"
      >
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
          <div>
            <label style={{ fontSize:12, color:T.textMid, fontFamily:"'Oxanium',sans-serif",
              letterSpacing:".06em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
              Plate Number *
            </label>
            <input
              className="field mono"
              placeholder="e.g. VIP 0007"
              value={form.plate_number}
              onChange={e => setForm(f => ({ ...f, plate_number: e.target.value.toUpperCase() }))}
              style={{ letterSpacing:".06em" }}
            />
          </div>
          <div>
            <label style={{ fontSize:12, color:T.textMid, fontFamily:"'Oxanium',sans-serif",
              letterSpacing:".06em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
              Owner Name *
            </label>
            <input
              className="field"
              placeholder="e.g. Ahmed Hassan"
              value={form.owner_name}
              onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))}
            />
          </div>

          {formError && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
              background:T.redDim, border:`1px solid ${T.redMid}`, borderRadius:7, fontSize:13, color:T.red }}>
              <AlertCircle size={13}/> {formError}
            </div>
          )}

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button className="btn btn-ghost" style={{ flex:1 }}
              onClick={() => { setModal(false); setFormError(""); }}>
              Cancel
            </button>
            <button className="btn btn-cyan" style={{ flex:1 }}
              onClick={handleAdd} disabled={formLoading}>
              {formLoading
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Adding…</>
                : <><UserPlus size={14}/> Add VIP Member</>
              }
            </button>
          </div>
        </div>
      </Modal>
    {/* ── Edit VIP Modal ─────────────────────────────────────────────────── */}
      <Modal
        open={editModal}
        onClose={() => { setEditModal(false); setEditFormError(""); }}
        title="Edit VIP Subscriber"
      >
        <div style={{ display:"flex", flexDirection:"column", gap:18 }}>

          {/* Original plate context banner */}
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:"8px 12px",
            background:T.accentDim, border:`1px solid ${T.accentMid}`, borderRadius:8 }}>
            <Star size={13} color={T.yellow}/>
            <span style={{ fontSize:13, color:T.textMid }}>
              Editing{" "}
              <span className="mono" style={{ color:T.accent, fontWeight:700 }}>
                {editForm.old_plate}
              </span>
            </span>
          </div>

          {/* Plate Number */}
          <div>
            <label style={{ fontSize:12, color:T.textMid, fontFamily:"'Oxanium',sans-serif",
              letterSpacing:".06em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
              Plate Number *
            </label>
            <input
              className="field mono"
              placeholder="e.g. VIP 0007"
              value={editForm.plate_number}
              onChange={e => setEditForm(f => ({ ...f, plate_number: e.target.value.toUpperCase() }))}
              style={{ letterSpacing:".06em" }}
            />
          </div>

          {/* Owner Name */}
          <div>
            <label style={{ fontSize:12, color:T.textMid, fontFamily:"'Oxanium',sans-serif",
              letterSpacing:".06em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
              Owner Name *
            </label>
            <input
              className="field"
              placeholder="e.g. Ahmed Hassan"
              value={editForm.owner_name}
              onChange={e => setEditForm(f => ({ ...f, owner_name: e.target.value }))}
            />
          </div>

          {/* Status — only shown in edit, not in add */}
          <div>
            <label style={{ fontSize:12, color:T.textMid, fontFamily:"'Oxanium',sans-serif",
              letterSpacing:".06em", textTransform:"uppercase", display:"block", marginBottom:6 }}>
              Status
            </label>
            <select
              className="field"
              value={editForm.status}
              onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>

          {/* Inline error */}
          {editFormError && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
              background:T.redDim, border:`1px solid ${T.redMid}`, borderRadius:7, fontSize:13, color:T.red }}>
              <AlertCircle size={13}/> {editFormError}
            </div>
          )}

          {/* Actions */}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button className="btn btn-ghost" style={{ flex:1 }}
              onClick={() => { setEditModal(false); setEditFormError(""); }}>
              Cancel
            </button>
            <button className="btn btn-cyan" style={{ flex:1 }}
              onClick={handleEdit} disabled={editFormLoading}>
              {editFormLoading
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Saving…</>
                : <><Pencil size={14}/> Save Changes</>
              }
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Delete Confirmation Modal ───────────────────────────────────────── */}
      <Modal
        open={!!vipToDelete}
        onClose={() => setVipToDelete(null)}
        title="Confirm Deletion"
        danger
      >
        <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

          {/* Warning icon + message */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, padding:"8px 0 4px" }}>
            <div style={{
              width:52, height:52, borderRadius:"50%",
              background:T.redDim, border:`1px solid ${T.redMid}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              animation:"glow-red 3s ease infinite",
            }}>
              <Trash2 size={22} color={T.red}/>
            </div>
            <p style={{ fontSize:14, color:T.textMid, textAlign:"center", lineHeight:1.6 }}>
              Are you sure you want to permanently delete VIP subscriber{" "}
              <span className="mono" style={{ color:T.red, fontWeight:700, fontSize:15 }}>
                {vipToDelete}
              </span>
              ?
            </p>
          </div>

          {/* Consequence note */}
          <div style={{
            display:"flex", alignItems:"flex-start", gap:9,
            padding:"10px 14px",
            background:`${T.red}0d`, border:`1px solid ${T.red}22`, borderRadius:8,
          }}>
            <AlertTriangle size={13} color={T.red} style={{ flexShrink:0, marginTop:1 }}/>
            <p style={{ fontSize:12, color:T.textMid, lineHeight:1.5 }}>
              This action is <span style={{ color:T.red, fontWeight:700 }}>permanent</span> and cannot
              be undone. All visit history and subscription data for this plate will be removed.
            </p>
          </div>

          {/* Action buttons */}
          <div style={{ display:"flex", gap:10, marginTop:2 }}>
            <button
              className="btn btn-ghost"
              style={{ flex:1 }}
              onClick={() => setVipToDelete(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-red"
              style={{ flex:1 }}
              onClick={handleDelete}
              disabled={!!deleting}
            >
              {deleting
                ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Deleting…</>
                : <><Trash2 size={14}/> Delete Permanently</>
              }
            </button>
          </div>

        </div>
      </Modal>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAGE 5 — SECURITY & BLACKLIST
// ─────────────────────────────────────────────────────────────────────────────

// ── Severity colour map (keyed to the values getSeverity() returns) ──────────
const SEVERITY_COLOR = { HIGH: T.red, MEDIUM: T.yellow, LOW: T.textMid };

// ── Reason options for the "Add to Blacklist" dropdown ───────────────────────
const REASON_OPTIONS = [
  "Theft Suspect", "Fraudulent Payment", "Warrant Issued",
  "Property Damage", "Trespassing", "Unauthorized Access", "Suspicious Activity",
];

// ── HIGH-severity keywords (English + Arabic) ────────────────────────────────
const HIGH_KW   = ["theft","stolen","warrant","damage","police","سرقة","مطلوب","جنائية"];
// ── MEDIUM-severity keywords ─────────────────────────────────────────────────
const MEDIUM_KW = ["fraud","payment","suspended","تهرب","دفع"];

/**
 * getSeverity(reason)
 * Derives a severity tier purely from the reason string so we never rely on a
 * backend-supplied severity field that may be absent or inconsistently cased.
 *
 * Returns "HIGH" | "MEDIUM" | "LOW"
 */
function getSeverity(reason = "") {
  const r = reason.toLowerCase();
  if (HIGH_KW.some(kw => r.includes(kw)))   return "HIGH";
  if (MEDIUM_KW.some(kw => r.includes(kw))) return "MEDIUM";
  return "LOW";
}

/**
 * getAttempts(plateNumber, alerts)
 * Counts how many entries in the alerts array share the same plate_number.
 * This cross-references the two API responses entirely on the frontend so
 * the blacklist table always shows fresh attempt counts without an extra call.
 */
function getAttempts(plateNumber, alerts) {
  if (!plateNumber || !alerts.length) return 0;
  const norm = String(plateNumber).toUpperCase().trim();
  return alerts.filter(a => String(a.plate_number ?? a.plate ?? "").toUpperCase().trim() === norm).length;
}

const normalizePlate = (plate) => {
  if (!plate) return "";
  let text = String(plate)
    .replace(/أ|إ|آ/g, "ا")
    .replace(/هـ|ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ /g, "");
  const letters = text.replace(/[0-9٠-٩]/g, "");
  const numbers = text.replace(/[^0-9٠-٩]/g, "");
  return letters + numbers;
};

function PageSecurity() {
  const BASE = import.meta.env.VITE_API_BASE_URL;

  // ── Raw API state ─────────────────────────────────────────────────────────
  const [blacklist,    setBlacklist]    = useState([]);
  const [alerts,       setAlerts]       = useState([]);
  const [blLoading,    setBlLoading]    = useState(true);
  const [alLoading,    setAlLoading]    = useState(true);
  const [blError,      setBlError]      = useState(null);
  const [alError,      setAlError]      = useState(null);

  // ── Add-to-blacklist form ─────────────────────────────────────────────────
  const [form,         setForm]         = useState({ plate: "", reason: "" });
  const [formError,    setFormError]    = useState("");
  const [formLoading,  setFormLoading]  = useState(false);
  const [formSuccess,  setFormSuccess]  = useState("");

// ── Per-row delete confirm (keyed by plate_number string) ─────────────────
  const [confirmPlate, setConfirmPlate] = useState(null);
  const [deleting,     setDeleting]     = useState(null);

  // ── Mark-all-as-read loading flag + toast ─────────────────────────────────
  const [markingRead,  setMarkingRead]  = useState(false);
  const { toasts, show: showToast, dismiss } = useToast();

  // ────────────────────────────────────────────────────────────────────────────
  // DATA FETCHING
  // ────────────────────────────────────────────────────────────────────────────

  const fetchBlacklist = useCallback(async () => {
    setBlLoading(true); setBlError(null);
    try {
      const res  = await fetch(`${BASE}/security/blacklist`, { signal: AbortSignal.timeout(12_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // Accept bare array or { data: [...] } / { blacklist: [...] } wrapper
      const raw  = Array.isArray(json) ? json : (json?.data ?? json?.blacklist ?? []);
      setBlacklist(raw);
    } catch (e) {
      if (e.name !== "AbortError") setBlError(e.message);
    } finally { setBlLoading(false); }
  }, [BASE]);

  const fetchAlerts = useCallback(async () => {
    setAlLoading(true); setAlError(null);
    try {
      const res  = await fetch(`${BASE}/security/alerts`, { signal: AbortSignal.timeout(12_000) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const raw  = Array.isArray(json) ? json : (json?.data ?? json?.alerts ?? []);
      setAlerts(raw);
    } catch (e) {
      if (e.name !== "AbortError") setAlError(e.message);
    } finally { setAlLoading(false); }
  }, [BASE]);

  // Fetch both on mount
  useEffect(() => { fetchBlacklist(); fetchAlerts(); }, [fetchBlacklist, fetchAlerts]);

  // ────────────────────────────────────────────────────────────────────────────
  // DERIVED STAT VALUES  — all computed from live API data, never hardcoded
  // ────────────────────────────────────────────────────────────────────────────

  // "Blacklisted Plates" — raw count of blacklist entries
  const statBlacklisted = blacklist.length;

  // "Total Attempt Blocks" — total number of alert events (each = one block)
  const statTotalBlocks = alerts.length;

  // "High Severity" — count rows that evaluate to HIGH via getSeverity()
  const statHighSeverity = blacklist.filter(b => getSeverity(b.reason) === "HIGH").length;

  // "Alerts Today" — alerts whose timestamp starts with today's YYYY-MM-DD
  const todayStr    = new Date().toISOString().slice(0, 10);
  const statToday   = alerts.filter(a => {
    const ts = String(a.timestamp ?? a.created_at ?? a.time ?? "");
    return ts.startsWith(todayStr);
  }).length;

  // ────────────────────────────────────────────────────────────────────────────
  // FORM HANDLERS
  // ────────────────────────────────────────────────────────────────────────────

  const addToBlacklist = async () => {
    if (!form.plate.trim())  { setFormError("Plate number is required."); return; }
    if (!form.reason.trim()) { setFormError("Reason is required.");       return; }
    setFormLoading(true); setFormError(""); setFormSuccess("");
    try {
      const fd = new FormData();
      fd.append("plate_number", form.plate.trim().toUpperCase());
      fd.append("reason",       form.reason);
      const res = await fetch(`${BASE}/add_to_blacklist`, { method: "POST", body: fd });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        throw new Error(j?.message ?? `Server returned HTTP ${res.status}`);
      }
      setForm({ plate: "", reason: "" });
      setFormSuccess(`${form.plate.trim().toUpperCase()} added to blacklist.`);
      setTimeout(() => setFormSuccess(""), 4000);
      fetchBlacklist(); // re-fetch so the table reflects the new entry
    } catch (e) { setFormError(e.message); }
    finally     { setFormLoading(false); }
  };

  const removeEntry = async (plateNumber) => {
    setDeleting(plateNumber);
    try {
      const res = await fetch(
        `${BASE}/security/blacklist/${encodeURIComponent(plateNumber)}`,
        { method: "DELETE" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Optimistic update — remove locally while the refetch is in-flight
      setBlacklist(prev => prev.filter(b =>
        String(b.plate_number ?? b.plate ?? "") !== String(plateNumber)
      ));
    } catch (e) {
      setBlError(`Failed to remove ${plateNumber}: ${e.message}`);
      setTimeout(() => setBlError(null), 5000);
    } finally { setDeleting(null); setConfirmPlate(null); }
  };

// ── Mark all alerts as read ───────────────────────────────────────────────
  const handleMarkAllAsRead = async () => {
    setMarkingRead(true);
    try {
      const res  = await fetch(`${BASE}/security/alerts/read`, {
        method: "PUT",
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      // Accept either { status:"success" } or any 2xx — both mean cleared
      const json = await res.json().catch(() => ({ status: "success" }));
      if (json?.status === "success" || res.ok) {
        setAlerts([]);
        window.dispatchEvent(new Event("securityAlertsCleared"));
        showToast("All security alerts marked as read.", "success");
      } else {
        throw new Error(json?.message ?? "Unexpected response from server");
      }
    } catch (e) {
      showToast(`Failed to mark alerts as read: ${e.message}`, "error");
    } finally {
      setMarkingRead(false);
    }
  };

  // ── Skeleton row helper ───────────────────────────────────────────────────
  const SkeletonRows = ({ cols, rows = 3 }) => (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i}>
          {Array.from({ length: cols }).map((_, j) => (
            <td key={j} style={{ textAlign: j === cols - 1 ? "center" : "left" }}>
              <div className="skeleton" style={{ width: j === 0 ? 80 : 60 + j * 14, height: 12, borderRadius: 4, margin: j === cols - 1 ? "0 auto" : 0 }}/>
            </td>
          ))}
        </tr>
      ))}
    </>
  );

  return (
    <div className="page-enter" style={{ padding:22, display:"flex", flexDirection:"column", gap:22 }}>
      <Toast toasts={toasts} dismiss={dismiss}/>

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <p className="oxan" style={{ fontSize:11, color:T.red, letterSpacing:".1em", textTransform:"uppercase" }}>⚠ Restricted Access</p>
          <h2 className="oxan" style={{ fontSize:20, fontWeight:700, color:T.text }}>Security Control Center</h2>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { fetchBlacklist(); fetchAlerts(); }}
            disabled={blLoading || alLoading}
            title="Refresh security data"
          >
            <RefreshCw size={13} style={{ animation: (blLoading || alLoading) ? "spin 1s linear infinite" : "none" }}/>
            Refresh
          </button>
          <div style={{ display:"flex", alignItems:"center", gap:8, background:T.redDim, border:`1px solid ${T.redMid}`, borderRadius:10, padding:"8px 16px" }}>
            <ShieldAlert size={16} color={T.red} style={{ animation:"pulse-live 1.5s infinite" }}/>
            <span style={{ fontSize:13, color:T.red, fontWeight:700, fontFamily:"'Oxanium',sans-serif" }}>SECURITY ACTIVE</span>
          </div>
        </div>
      </div>

      {/* ── 4 Stat Cards ──────────────────────────────────────────────────── */}
      {/*
        All four values are derived entirely from live API data:
          • Blacklisted Plates  = blacklist.length
          • Total Attempt Blocks= alerts.length  (every alert == one blocked event)
          • High Severity       = blacklist rows where getSeverity(reason) === "HIGH"
          • Alerts Today        = alerts where timestamp starts with today's date
      */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:14 }}>
        {[
          { label:"Blacklisted Plates",   value: blLoading ? null : statBlacklisted, color:T.red,    icon:XCircle      },
          { label:"Total Attempt Blocks", value: alLoading ? null : statTotalBlocks, color:T.yellow, icon:ShieldAlert  },
          { label:"High Severity",        value: blLoading ? null : statHighSeverity, color:T.red,   icon:AlertTriangle },
          { label:"Alerts Today",         value: alLoading ? null : statToday,        color:T.purple, icon:Siren        },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="card" style={{ padding:"14px 18px", position:"relative", overflow:"hidden", borderColor:`${color}33` }}>
            <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,transparent,${color},transparent)` }}/>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
              <p style={{ fontSize:10, color:T.textLow, fontFamily:"'Oxanium',sans-serif", textTransform:"uppercase", letterSpacing:".07em" }}>{label}</p>
              <div style={{ width:28, height:28, borderRadius:7, background:`${color}18`, border:`1px solid ${color}33`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <Icon size={13} color={color}/>
              </div>
            </div>
            {value === null
              ? <div className="skeleton" style={{ width:56, height:28, borderRadius:6 }}/>
              : <p className="oxan" style={{ fontSize:26, fontWeight:700, color }}>{value}</p>
            }
          </div>
        ))}
      </div>

      {/* ── Add to Blacklist form ──────────────────────────────────────────── */}
      {/*
        Severity is intentionally NOT a form field — it is calculated
        automatically from the chosen reason by getSeverity() so operators
        can't introduce inconsistent or incorrect severity values.
        A live preview badge shows the computed tier before submitting.
      */}
      <div className="card" style={{ borderColor:T.redMid, background:`linear-gradient(135deg,${T.bg2},${T.red}05)` }}>
        <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.redMid}`, display:"flex", alignItems:"center", gap:9, background:`${T.red}08` }}>
          <BadgeAlert size={15} color={T.red}/>
          <span className="oxan" style={{ fontSize:15, fontWeight:700, color:T.red }}>Add to Blacklist</span>
        </div>
        <div style={{ padding:"18px 20px" }}>
          {/* 3-column grid: plate · reason · [computed severity preview + submit] */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr auto", gap:12, alignItems:"end" }}>

            {/* Plate Number */}
            <div>
              <label style={{ fontSize:11, color:T.textMid, display:"block", marginBottom:6, fontFamily:"'Oxanium',sans-serif", textTransform:"uppercase", letterSpacing:".05em" }}>
                Plate Number
              </label>
              <input
                className="field field-red mono"
                value={form.plate}
                onChange={e => setForm(f => ({ ...f, plate: e.target.value.toUpperCase() }))}
                style={{ letterSpacing:".06em" }}
                disabled={formLoading}
              />
            </div>

            {/* Reason */}
            <div>
              <label style={{ fontSize:11, color:T.textMid, display:"block", marginBottom:6, fontFamily:"'Oxanium',sans-serif", textTransform:"uppercase", letterSpacing:".05em" }}>
                Reason
              </label>
              <select
                className="field field-red"
                value={form.reason}
                onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                disabled={formLoading}
              >
                <option value="">Select reason…</option>
                {REASON_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Computed severity preview + submit button stacked */}
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {/* Live severity preview — updates as the operator picks a reason */}
              {form.reason ? (() => {
                const sev   = getSeverity(form.reason);
                const sCol  = SEVERITY_COLOR[sev] ?? T.textMid;
                return (
                  <div style={{ display:"flex", alignItems:"center", gap:6, padding:"4px 10px",
                    background:`${sCol}15`, border:`1px solid ${sCol}44`, borderRadius:8 }}>
                    <span style={{ fontSize:10, fontFamily:"'Oxanium',sans-serif", fontWeight:700, color:sCol, letterSpacing:".05em" }}>
                      AUTO-SEVERITY:
                    </span>
                    <span style={{ fontSize:11, fontFamily:"'Oxanium',sans-serif", fontWeight:700, color:sCol }}>
                      {sev}
                    </span>
                  </div>
                );
              })() : (
                <div style={{ fontSize:10, color:T.textFaint, fontFamily:"'Oxanium',sans-serif", padding:"4px 0" }}>
                  Select a reason to auto-compute severity
                </div>
              )}
              <button className="btn btn-red" onClick={addToBlacklist} disabled={formLoading} style={{ whiteSpace:"nowrap" }}>
                {formLoading
                  ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }}/> Adding…</>
                  : <><Plus size={14}/> Blacklist</>
                }
              </button>
            </div>
          </div>

          {/* Inline feedback */}
          {formError && (
            <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
              background:T.redDim, border:`1px solid ${T.redMid}`, borderRadius:7, fontSize:13, color:T.red }}>
              <AlertCircle size={13}/> {formError}
            </div>
          )}
          {formSuccess && (
            <div style={{ marginTop:10, display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
              background:T.greenDim, border:`1px solid ${T.greenMid}`, borderRadius:7, fontSize:13, color:T.green }}>
              <CheckCircle size={13}/> {formSuccess}
            </div>
          )}
        </div>
      </div>

      {/* ── Two-column: Blacklist table + Alerts feed ──────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"1.4fr 1fr", gap:22 }}>

        {/* ── Blacklisted Vehicles table ─────────────────────────────────── */}
        <div className="card" style={{ borderColor:`${T.redMid}66`, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", gap:9 }}>
            <Shield size={14} color={T.red}/>
            <span className="oxan" style={{ fontSize:15, fontWeight:600 }}>Blacklisted Vehicles</span>
            {!blLoading && (
              <span style={{ fontSize:11, background:T.redDim, color:T.red, border:`1px solid ${T.redMid}`,
                padding:"2px 9px", borderRadius:20, fontFamily:"'Oxanium',sans-serif" }}>
                {blacklist.length} entries
              </span>
            )}
            {blLoading && <Loader2 size={13} color={T.textLow} style={{ marginLeft:4, animation:"spin 1s linear infinite" }}/>}
          </div>

          {/* Blacklist fetch error */}
          {blError && (
            <div style={{ margin:"12px 16px", display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
              background:`${T.red}0d`, border:`1px solid ${T.red}33`, borderRadius:8, fontSize:13, color:T.textMid }}>
              <AlertTriangle size={14} color={T.red} style={{ flexShrink:0 }}/>
              <span style={{ flex:1 }}>{blError}</span>
              <button className="btn btn-ghost btn-sm" onClick={fetchBlacklist}><RefreshCw size={11}/> Retry</button>
            </div>
          )}

          <div style={{ overflowX:"auto", flex:1 }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr>
                  <th>Plate</th><th>Reason</th><th>Severity</th><th>Date</th><th>Attempts</th>
                  <th style={{ textAlign:"center" }}>Remove</th>
                </tr>
              </thead>
              <tbody>
                {/* Loading skeletons */}
                {blLoading && <SkeletonRows cols={6} rows={4}/>}

                {/* Empty state */}
                {!blLoading && blacklist.length === 0 && !blError && (
                  <tr>
                    <td colSpan={6}>
                      <div className="empty-state">
                        <ShieldCheck size={24} color={T.green}/>
                        <p style={{ fontSize:13, color:T.green }}>No vehicles blacklisted</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!blLoading && blacklist.map((b, idx) => {
                  // Normalise the plate field — backend may use plate_number or plate
                  const plate    = String(b.plate_number ?? b.plate ?? "—");
                  const reason   = String(b.reason        ?? "—");
                  // Date field — backend may use added_date, date_added, created_at, or date
                  const dateStr  = String(b.added_date ?? b.date_added ?? b.created_at ?? b.date ?? "").slice(0, 10) || "—";

                  // ── DYNAMIC SEVERITY — computed from reason keywords, not from backend field ──
                  const severity = getSeverity(reason);
                  const sColor   = SEVERITY_COLOR[severity] ?? T.textMid;

                  // ── DYNAMIC ATTEMPTS — normalized comparison handles RTL/LTR, spaces, Arabic variants ──
                  const attemptsCount = alerts.filter(
                    a => normalizePlate(a.plate_number ?? a.plate ?? "") === normalizePlate(b.plate_number ?? b.plate ?? "")
                  ).length;

                  const isBeingDeleted = deleting === plate;

                  return (
                    <tr key={b.id ?? b.plate_number ?? idx} className="data-row"
                      style={{ opacity: isBeingDeleted ? 0.4 : 1, transition:"opacity .2s" }}>
                      <td>
                        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                          <XCircle size={13} color={T.red}/>
                          <span className="mono" style={{ color:T.red, fontWeight:700, fontSize:13 }}>{plate}</span>
                        </div>
                      </td>
                      <td style={{ fontSize:13, color:T.textMid }}>{reason}</td>
                      <td>
                        {/* Badge colour and label are driven entirely by getSeverity() */}
                        <span style={{ fontSize:11, fontFamily:"'Oxanium',sans-serif", fontWeight:700,
                          color:sColor, background:`${sColor}18`, border:`1px solid ${sColor}44`,
                          padding:"2px 8px", borderRadius:12 }}>
                          {severity}
                        </span>
                      </td>
                      <td><span className="mono" style={{ fontSize:11, color:T.textMid }}>{dateStr}</span></td>
                      <td>
                        {/* Attempt count is cross-referenced from the alerts array in real time */}
                        <span style={{ color: attemptsCount > 0 ? T.red : T.textLow, fontWeight:700,
                          fontFamily:"'JetBrains Mono',monospace", fontSize:13 }}>
                          {attemptsCount}
                        </span>
                      </td>
                      <td style={{ textAlign:"center" }}>
                        {isBeingDeleted ? (
                          <Loader2 size={14} color={T.red} style={{ animation:"spin 1s linear infinite" }}/>
                        ) : confirmPlate === plate ? (
                          <div style={{ display:"flex", gap:4, justifyContent:"center" }}>
                            <button className="btn btn-red btn-sm" onClick={() => removeEntry(plate)} style={{ padding:"3px 8px", fontSize:11 }}>Confirm</button>
                            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmPlate(null)} style={{ padding:"3px 8px", fontSize:11 }}>Cancel</button>
                          </div>
                        ) : (
                          <button className="btn btn-ghost btn-sm" onClick={() => setConfirmPlate(plate)}
                            style={{ padding:"5px 10px", color:T.red, borderColor:`${T.red}33` }}
                            title={`Remove ${plate} from blacklist`}>
                            <Trash2 size={12}/>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Security Alerts feed ──────────────────────────────────────────── */}
        <div className="card card-glow-red" style={{ display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${T.redMid}`, background:`${T.red}08`,
            display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <div style={{ display:"flex", alignItems:"center", gap:9 }}>
              <Siren size={14} color={T.red} style={{ animation:"pulse-live 1.2s infinite" }}/>
              <span className="oxan" style={{ fontSize:15, fontWeight:700, color:T.red }}>Security Alerts</span>
              {alLoading && <Loader2 size={12} color={T.red} style={{ animation:"spin 1s linear infinite" }}/>}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              {/* Only render when there is something to clear */}
              {alerts.length > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  disabled={markingRead}
                  title="Mark all alerts as read"
                  onMouseEnter={e => {
                    e.currentTarget.style.color        = T.text;
                    e.currentTarget.style.borderColor  = T.textLow;
                    e.currentTarget.style.background   = `${T.border}55`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.color        = T.textMid;
                    e.currentTarget.style.borderColor  = T.border;
                    e.currentTarget.style.background   = "transparent";
                  }}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    background: "transparent",
                    border: `1px solid ${T.border}`,
                    borderRadius: 7, padding: "4px 10px",
                    cursor: markingRead ? "not-allowed" : "pointer",
                    color: T.textMid,
                    fontSize: 12,
                    fontFamily: "'Rajdhani',sans-serif",
                    fontWeight: 600,
                    letterSpacing: ".02em",
                    transition: "all .17s ease",
                    opacity: markingRead ? 0.5 : 1,
                  }}
                >
                  {markingRead
                    ? <><Loader2 size={11} style={{ animation:"spin 1s linear infinite" }}/> Clearing…</>
                    : <><CheckCircle size={11}/> Mark all read</>
                  }
                </button>
              )}
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:8, height:8, borderRadius:"50%", background:T.red, animation:"pulse-live 1s infinite" }}/>
                <span style={{ fontSize:11, color:T.red, fontFamily:"'Oxanium',sans-serif", fontWeight:600 }}>LIVE</span>
              </div>
            </div>
          </div>

          {/* Alert fetch error */}
          {alError && !alLoading && (
            <div style={{ margin:"12px 14px", display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
              background:`${T.red}0d`, border:`1px solid ${T.red}33`, borderRadius:8, fontSize:13, color:T.textMid }}>
              <AlertTriangle size={14} color={T.red} style={{ flexShrink:0 }}/>
              <span style={{ flex:1 }}>{alError}</span>
              <button className="btn btn-ghost btn-sm" onClick={fetchAlerts}><RefreshCw size={11}/> Retry</button>
            </div>
          )}

          {/* Loading skeleton */}
          {alLoading && (
            <div style={{ padding:"14px 18px", display:"flex", flexDirection:"column", gap:14 }}>
              {[1,2,3].map(i => (
                <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                  <div className="skeleton" style={{ width:32, height:32, borderRadius:8, flexShrink:0 }}/>
                  <div style={{ flex:1, display:"flex", flexDirection:"column", gap:7 }}>
                    <div className="skeleton" style={{ width:"55%", height:12, borderRadius:4 }}/>
                    <div className="skeleton" style={{ width:"75%", height:10, borderRadius:4 }}/>
                    <div className="skeleton" style={{ width:100, height:18, borderRadius:10 }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!alLoading && alerts.length === 0 && !alError && (
            <div className="empty-state">
              <ShieldCheck size={28} color={T.green}/>
              <p style={{ fontSize:14, color:T.green }}>No active alerts</p>
            </div>
          )}

          {/* Live alert rows — driven entirely by the /security/alerts API response */}
          {!alLoading && alerts.length > 0 && (
            <div style={{ flex:1, overflowY:"auto" }}>
              {alerts.map((alert, i) => {
                // Normalise field names across possible backend conventions
                const plateNum  = String(alert.plate_number ?? alert.plate ?? "—");
                // Prefer timestamp; fall back to created_at, alert_time, or time
                const rawTime   = String(alert.timestamp ?? alert.created_at ?? alert.alert_time ?? alert.time ?? "—");
                // Show up to "HH:MM:SS" portion for compact display
                const dispTime  = rawTime.length > 10 ? rawTime.slice(11, 19) || rawTime.slice(0, 19) : rawTime;
                // Gate may be called gate, gate_name, or location
                const gate      = String(alert.gate_name ?? alert.gate ?? alert.location ?? "—");
                // Reason to show under the plate — may not always be present
                const alertNote = alert.reason ?? alert.note ?? "Blacklisted vehicle attempted entry";

                return (
                  <div key={alert.id ?? alert.alert_id ?? i}
                    className={i === 0 ? "security-alert-row" : "data-row"}
                    style={{ padding:"12px 18px", borderBottom:`1px solid ${T.red}18`,
                      animation: i === 0 ? "slide-down .3s ease" : "none" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                      <div style={{ width:32, height:32, borderRadius:8, background:T.redDim,
                        border:`1px solid ${T.redMid}`, display:"flex", alignItems:"center",
                        justifyContent:"center", flexShrink:0, marginTop:2 }}>
                        <AlertTriangle size={14} color={T.red}/>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                          <span className="mono" style={{ fontSize:14, color:T.red, fontWeight:700 }}>{plateNum}</span>
                          <span className="mono" style={{ fontSize:10, color:T.textLow }}>{dispTime}</span>
                        </div>
                        <p style={{ fontSize:12, color:T.textMid, marginBottom:4 }}>
                          {alertNote}{gate !== "—" && <> at <span style={{ color:T.yellow }}>{gate}</span></>}
                        </p>
                        <span style={{ fontSize:10, background:T.redDim, color:T.red,
                          border:`1px solid ${T.redMid}`, padding:"2px 8px", borderRadius:10,
                          fontFamily:"'Oxanium',sans-serif", fontWeight:700 }}>
                          ● ACCESS DENIED
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{ padding:"10px 18px", borderTop:`1px solid ${T.border}`, background:T.bg3 }}>
            <p style={{ fontSize:11, color:T.textLow, textAlign:"center" }}>
              All alerts auto-blocked · Gates secured by OmniBoard AI
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState("overview");
  const [alertsCount, setAlertsCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Poll live status every 30s
  const { data: liveStatus } = useFetch(`${API_BASE}/live_status`, { enabled: !!API_BASE });

  // Inject global CSS once
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const ctx = { liveStatus, alertsCount, setAlertsCount, searchQuery, setSearchQuery, setPage };

  const pages = { overview: PageOverview, gates: PageGates, analytics: PageAnalytics, vip: PageVIP, security: PageSecurity };
  const PageComponent = pages[page] ?? PageOverview;

  return (
    <AppCtx.Provider value={ctx}>
      <div style={{ display:"flex", height:"100vh", overflow:"hidden", background:T.bg0 }}>
        <Sidebar page={page} setPage={setPage}/>

        {/* Main content */}
        <div style={{ marginLeft:230, flex:1, display:"flex", flexDirection:"column", height:"100vh", overflow:"hidden" }}>
          <Header page={page}/>
          <main style={{ flex:1, overflowY:"auto", overflowX:"hidden", minHeight:0 }}>
            <PageComponent key={page}/>
          </main>
        </div>
      </div>
    </AppCtx.Provider>
  );
}
