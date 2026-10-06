import React from 'react';
import { Layers, Satellite, Map as MapIcon, Waves, Route, CloudRain, Anchor, Shield, Eye, EyeOff } from 'lucide-react';
import { MapLayerConfig, ThemeMode } from '../types';

interface Props {
  theme: ThemeMode;
  config: MapLayerConfig;
  onChange: (patch: Partial<MapLayerConfig>) => void;
}

export const MapVisibilityPanel: React.FC<Props> = ({ theme, config, onChange }) => {
  const [open, setOpen] = React.useState(false);
  const dark = theme === 'dark';
  const panel = dark ? 'bg-[#03111f]/95 border-slate-700/80 text-slate-100' : 'bg-white/95 border-sky-200 text-slate-800';
  const item = (active:boolean) => active
    ? (dark ? 'bg-cyan-500/10 border-cyan-400/40 text-cyan-300' : 'bg-sky-50 border-sky-300 text-sky-700')
    : (dark ? 'bg-slate-900/40 border-slate-700/50 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500');
  const layers = [
    ['showIMBL','IMBL Treaty Boundary', Shield],
    ['showFleet','SAFESEA Vessels', Anchor],
    ['showGeofence','Operational Geofences', Route],
    ['showSafeZones','Safe Fishing Zones', Shield],
    ['showRestrictedZones','Restricted Zones', Shield],
    ['showTrails','Vessel Trails', Route],
    ['showPorts','Ports & Harbours', Anchor],
    ['showWeather','Weather / Marine Overlay', CloudRain],
  ] as const;
  const bases = [
    ['satellite','Satellite',Satellite], ['osm','Standard',MapIcon], ['dark','Dark Maritime',Waves], ['ocean','Ocean',Waves]
  ] as const;
  return <div className="absolute top-4 right-4 z-[900]">
    <button onClick={()=>setOpen(v=>!v)} className={`flex items-center gap-2 px-3 py-2 rounded-xl border backdrop-blur-xl shadow-xl text-[10px] font-black tracking-wide ${panel}`}>
      <Layers className="w-4 h-4 text-cyan-400"/> MAP VISIBILITY <span className="text-cyan-400">{open ? '▲' : '▼'}</span>
    </button>
    {open && <div className={`mt-2 w-72 rounded-2xl border backdrop-blur-2xl shadow-2xl p-3 ${panel}`}>
      <div className="text-[9px] font-black tracking-[.16em] text-cyan-400 mb-2">BASE MAP</div>
      <div className="grid grid-cols-2 gap-2 mb-3">{bases.map(([key,label,Icon])=><button key={key} onClick={()=>onChange({tileProvider:key as MapLayerConfig['tileProvider']})} className={`p-2 rounded-xl border text-[9px] font-bold flex items-center gap-2 ${config.tileProvider===key ? item(true) : item(false)}`}><Icon className="w-3.5 h-3.5"/>{label}</button>)}</div>
      <div className="text-[9px] font-black tracking-[.16em] text-cyan-400 mb-2">OPERATIONAL LAYERS</div>
      <div className="space-y-1.5">{layers.map(([key,label,Icon])=>{const active=!!config[key]; return <button key={key} onClick={()=>onChange({[key]:!active})} className={`w-full p-2 rounded-xl border text-[9px] font-bold flex items-center gap-2 ${item(active)}`}><Icon className="w-3.5 h-3.5"/><span className="flex-1 text-left">{label}</span>{active?<Eye className="w-3.5 h-3.5"/>:<EyeOff className="w-3.5 h-3.5"/>}</button>})}</div>
      <div className={`mt-3 text-[8px] ${dark?'text-slate-500':'text-slate-400'}`}>Satellite is recommended for maritime operations. IMBL remains the authoritative treaty layer.</div>
    </div>}
  </div>;
};
