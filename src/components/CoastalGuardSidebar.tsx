import React, { useMemo, useState } from 'react';
import { AlertTriangle, Bell, CheckCircle2, ChevronRight, Crosshair, MessageSquare, Radio, Shield, Siren, Users, X, MapPin, FileText, Settings, Send, Search, Navigation, Activity } from 'lucide-react';
import { FleetVessel } from '../data/coastalGuardFleet';
import { ThemeMode } from '../types';

interface Props {
  theme: ThemeMode;
  fleet: FleetVessel[];
  isOpen: boolean;
  onClose: () => void;
  onSelectVessel: (vessel: FleetVessel) => void;
  onFocusVessel: (vessel: FleetVessel) => void;
  onBroadcast: (message: string) => void;
  onViewIMBL: () => void;
  onStartDraw: (shape: 'polygon' | 'rectangle' | 'circle') => void;
  onClearGeofence: () => void;
}

type Tab = 'COMMAND' | 'FLEET' | 'ALERTS' | 'COMMS' | 'ZONES' | 'REPORTS';

export const CoastalGuardSidebar: React.FC<Props> = ({ theme, fleet, isOpen, onClose, onSelectVessel, onFocusVessel, onBroadcast, onViewIMBL, onStartDraw, onClearGeofence }) => {
  const [tab, setTab] = useState<Tab>('COMMAND');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const isLight = theme === 'light';
  const panel = isLight ? 'bg-white/94 border-sky-200 text-slate-800' : 'bg-[#030e1b]/95 border-slate-800 text-slate-100';
  const card = isLight ? 'bg-white/80 border-sky-100' : 'bg-[#061526]/85 border-slate-800/90';
  const muted = isLight ? 'text-slate-500' : 'text-slate-400';
  const filtered = useMemo(() => fleet.filter(v => `${v.boat} ${v.fisherman} ${v.deviceId}`.toLowerCase().includes(search.toLowerCase())), [fleet, search]);
  const counts = { safe: fleet.filter(v => v.status === 'SAFE').length, warning: fleet.filter(v => v.status === 'WARNING').length, critical: fleet.filter(v => v.status === 'CRITICAL').length, sos: fleet.filter(v => v.status === 'SOS').length, offline: fleet.filter(v => v.status === 'OFFLINE').length };
  const statusClass = (s: FleetVessel['status']) => ({ SAFE:'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', WARNING:'text-yellow-300 bg-yellow-500/10 border-yellow-500/30', CRITICAL:'text-orange-300 bg-orange-500/10 border-orange-500/30', SOS:'text-red-300 bg-red-500/15 border-red-500/40', OFFLINE:'text-slate-400 bg-slate-500/10 border-slate-500/30' }[s]);

  return <aside className={`fixed top-14 bottom-0 left-0 z-[995] w-[350px] sm:w-[390px] ${panel} backdrop-blur-2xl border-r shadow-2xl transition-transform duration-300 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
    <div className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between">
      <div><div className="text-[11px] font-black tracking-[.18em] text-cyan-400">COASTAL GUARD</div><div className="text-sm font-extrabold">Command & Fleet Management</div></div>
      <button onClick={onClose} className="p-2 rounded-xl border border-slate-700/40 hover:bg-slate-700/20"><X className="w-4 h-4" /></button>
    </div>
    <div className="grid grid-cols-3 border-b border-slate-700/30 text-[9px] font-bold">
      {(['COMMAND','FLEET','ALERTS','COMMS','ZONES','REPORTS'] as Tab[]).map(t => <button key={t} onClick={() => setTab(t)} className={`py-2.5 ${tab===t ? 'text-cyan-400 border-b-2 border-cyan-400 bg-cyan-500/5' : muted}`}>{t}</button>)}
    </div>
    <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin">
      {tab === 'COMMAND' && <>
        <div className="grid grid-cols-2 gap-2">
          {[['TOTAL',fleet.length,'text-cyan-300'],['ONLINE',fleet.length-counts.offline,'text-emerald-300'],['WARNING',counts.warning,'text-yellow-300'],['CRITICAL',counts.critical,'text-orange-300'],['SOS',counts.sos,'text-red-300'],['OFFLINE',counts.offline,'text-slate-400']].map(([a,b,c]) => <div className={`${card} border rounded-2xl p-3`} key={a as string}><div className={`text-[9px] uppercase tracking-wider ${muted}`}>{a}</div><div className={`text-xl font-black ${c}`}>{b}</div></div>)}
        </div>
        <section className={`${card} border rounded-2xl p-3`}><div className="flex items-center justify-between mb-2"><h3 className="font-extrabold text-xs flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-400"/>Command Status</h3><span className="text-[9px] text-emerald-400 font-bold">SYSTEM ONLINE</span></div><div className={`text-[10px] ${muted}`}>Fleet telemetry, emergency events and operational zones are under Coastal Guard command.</div></section>
        <section className={`${card} border rounded-2xl p-3`}><div className="font-extrabold text-xs mb-2 flex items-center gap-2"><Siren className="w-4 h-4 text-red-400"/>Priority Incidents</div>{fleet.filter(v=>v.status==='SOS'||v.status==='CRITICAL'||v.status==='WARNING').map(v=><button key={v.id} onClick={()=>onFocusVessel(v)} className="w-full text-left flex items-center justify-between p-2 rounded-xl hover:bg-white/5 border-b border-slate-700/20"><div><div className="text-[11px] font-bold">{v.boat} · {v.fisherman}</div><div className={`text-[9px] ${muted}`}>{v.zone} · {v.lastSeen}</div></div><span className={`px-2 py-1 rounded-full border text-[8px] font-black ${statusClass(v.status)}`}>{v.status}</span></button>)}{counts.sos+counts.critical+counts.warning===0&&<div className={`text-[10px] ${muted}`}>No priority incidents.</div>}</section>
        <div className="grid grid-cols-2 gap-2"><button onClick={onViewIMBL} className="p-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-[10px] font-bold">⌁ Full IMBL</button><button onClick={()=>setTab('FLEET')} className="p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-bold">View Fleet</button></div>
      </>}

      {tab === 'FLEET' && <><div className="relative"><Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search boat, fisherman, device" className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900/40 border border-slate-700/50 text-xs outline-none focus:border-cyan-400"/></div>{filtered.map(v=><button key={v.id} onClick={()=>onSelectVessel(v)} className={`${card} border rounded-2xl p-3 w-full text-left hover:border-cyan-500/40 transition-all`}><div className="flex items-center justify-between"><div className="font-extrabold text-xs">{v.boat}</div><span className={`px-2 py-1 rounded-full border text-[8px] font-black ${statusClass(v.status)}`}>{v.status}</span></div><div className={`grid grid-cols-2 gap-1 mt-2 text-[9px] ${muted}`}><span>Fisherman: <b className="text-inherit">{v.fisherman}</b></span><span>Device: <b className="text-inherit">{v.deviceId}</b></span><span>Speed: {v.speed} kts</span><span>Battery: {v.battery}%</span></div><div className="mt-2 flex gap-1"><span className="text-[8px] px-2 py-1 rounded-lg bg-slate-500/10">{v.zone}</span><span className="ml-auto text-[8px] text-cyan-400 flex items-center gap-1"><MapPin className="w-3 h-3"/>Locate</span></div></button>)}</>}

      {tab === 'ALERTS' && <><div className={`${card} border rounded-2xl p-3`}><div className="flex items-center gap-2 font-extrabold text-xs"><Bell className="w-4 h-4 text-yellow-400"/>Alert Operations</div><div className={`mt-1 text-[9px] ${muted}`}>Acknowledge, locate and respond to vessel alerts.</div></div>{fleet.filter(v=>v.status!=='SAFE'&&v.status!=='OFFLINE').map(v=><div key={v.id} className={`${card} border rounded-2xl p-3`}><div className="flex justify-between"><div><b className="text-xs">{v.boat}</b><div className={`text-[9px] ${muted}`}>{v.fisherman} · {v.zone}</div></div><span className={`text-[8px] font-black px-2 py-1 rounded-full border ${statusClass(v.status)}`}>{v.status}</span></div><div className="flex gap-2 mt-2"><button onClick={()=>onFocusVessel(v)} className="flex-1 p-2 rounded-lg bg-cyan-500/10 text-cyan-300 text-[9px] font-bold">LOCATE</button><button onClick={()=>setTab('COMMS')} className="flex-1 p-2 rounded-lg bg-red-500/10 text-red-300 text-[9px] font-bold">CONTACT</button><button onClick={()=>onSelectVessel(v)} className="p-2 rounded-lg bg-emerald-500/10 text-emerald-300"><CheckCircle2 className="w-3.5 h-3.5"/></button></div></div>)}</>}

      {tab === 'COMMS' && <><section className={`${card} border rounded-2xl p-3`}><div className="flex items-center gap-2 font-extrabold text-xs"><MessageSquare className="w-4 h-4 text-cyan-400"/>Command Broadcast</div><textarea value={message} onChange={e=>setMessage(e.target.value)} placeholder="Type safety instruction or maritime alert..." className="w-full mt-3 h-24 p-3 rounded-xl bg-slate-950/30 border border-slate-700/50 text-xs outline-none focus:border-cyan-400 resize-none"/><button disabled={!message.trim()} onClick={()=>{onBroadcast(message.trim());setMessage('')}} className="w-full mt-2 p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-extrabold disabled:opacity-40 flex items-center justify-center gap-2"><Send className="w-3.5 h-3.5"/>Broadcast to Fleet</button></section><div className={`${card} border rounded-2xl p-3`}><div className="font-extrabold text-xs mb-2 flex items-center gap-2"><Users className="w-4 h-4 text-cyan-400"/>Direct Contact</div>{fleet.filter(v=>v.status!=='OFFLINE').map(v=><button key={v.id} onClick={()=>onSelectVessel(v)} className="w-full flex items-center justify-between py-2 border-b border-slate-700/20"><span className="text-[10px] font-bold">{v.fisherman} · {v.boat}</span><ChevronRight className="w-3.5 h-3.5 text-slate-500"/></button>)}</div></>}

      {tab === 'ZONES' && <><section className={`${card} border rounded-2xl p-3`}><div className="font-extrabold text-xs flex items-center gap-2"><Crosshair className="w-4 h-4 text-cyan-400"/>Operational Zones</div><div className={`text-[9px] mt-1 ${muted}`}>Create zones for fishing operations, restricted waters and temporary safety corridors.</div><div className="grid grid-cols-3 gap-2 mt-3"><button onClick={()=>onStartDraw('polygon')} className="p-2 rounded-xl bg-cyan-500/10 text-cyan-300 text-[9px] font-bold">Polygon</button><button onClick={()=>onStartDraw('rectangle')} className="p-2 rounded-xl bg-indigo-500/10 text-indigo-300 text-[9px] font-bold">Rectangle</button><button onClick={()=>onStartDraw('circle')} className="p-2 rounded-xl bg-pink-500/10 text-pink-300 text-[9px] font-bold">Circle</button></div><div className="grid grid-cols-2 gap-2 mt-2"><button onClick={onViewIMBL} className="p-2 rounded-xl bg-rose-500/10 text-rose-300 text-[9px] font-bold">Fixed IMBL</button><button onClick={onClearGeofence} className="p-2 rounded-xl bg-slate-500/10 text-slate-300 text-[9px] font-bold">Clear Custom</button></div></section><section className={`${card} border rounded-2xl p-3 space-y-2`}><div className="text-[9px] font-black uppercase tracking-wider text-slate-400">Alert thresholds</div><div className="flex justify-between text-[10px]"><span>Warning</span><b className="text-yellow-300">500 m</b></div><div className="flex justify-between text-[10px]"><span>Critical</span><b className="text-orange-300">250 m</b></div><div className="flex justify-between text-[10px]"><span>Rapid / Emergency</span><b className="text-red-300">100 m</b></div></section></>}

      {tab === 'REPORTS' && <><section className={`${card} border rounded-2xl p-3`}><div className="flex items-center gap-2 font-extrabold text-xs"><FileText className="w-4 h-4 text-cyan-400"/>Command Reports</div><div className="grid grid-cols-2 gap-2 mt-3">{[['Fleet status','Live'],['SOS incidents',String(counts.sos)],['Critical alerts',String(counts.critical)],['Offline devices',String(counts.offline)]].map(([a,b])=><div key={a} className="p-2 rounded-xl bg-slate-500/5 border border-slate-700/20"><div className={`text-[8px] ${muted}`}>{a}</div><b className="text-xs">{b}</b></div>)}</div><button className="w-full mt-3 p-2.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[9px] font-bold flex items-center justify-center gap-2"><Activity className="w-3.5 h-3.5"/>Generate Operational Report</button></section><section className={`${card} border rounded-2xl p-3`}><div className="font-extrabold text-xs flex items-center gap-2"><Settings className="w-4 h-4 text-slate-400"/>Command Settings</div><div className={`text-[9px] mt-1 ${muted}`}>Role-based access, notification rules, fleet configuration and server connection will be managed here.</div></section></>}
    </div>
  </aside>;
};
