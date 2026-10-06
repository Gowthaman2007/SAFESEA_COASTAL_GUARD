import { FleetVessel, FleetStatus } from '../data/coastalGuardFleet';

export const BACKEND_URL = (import.meta as any).env?.VITE_SAFESEA_BACKEND_URL || 'http://172.16.120.41:3000';

const statusOf = (d:any): FleetStatus => {
  if (d.emergencyActive === true || d.status === 'SOS' || d.alertLevel === 'SOS' || d.alert === 'SOS') return 'SOS';
  const raw = String(d.status || d.state || d.alertLevel || '').toUpperCase();
  if (raw.includes('CRITICAL') || raw.includes('CROSSED')) return 'CRITICAL';
  if (raw.includes('WARNING') || raw.includes('REACHED')) return 'WARNING';
  if (raw.includes('OFFLINE')) return 'OFFLINE';
  const last = d.lastSeen || d.updatedAt || d.timestamp;
  if (last && Date.now() - new Date(last).getTime() > 2*60*1000) return 'OFFLINE';
  return 'SAFE';
};

export function normalizeDevices(list:any[]): FleetVessel[] {
  return (Array.isArray(list)?list:[]).map((d:any,i:number) => {
    const lat = Number(d.latitude ?? d.lat ?? d.location?.lat);
    const lng = Number(d.longitude ?? d.lng ?? d.location?.lng);
    return {
      id: String(d.id || d.device_id || d.deviceId || `SS-${i+1}`),
      boat: String(d.boat_name || d.boatName || d.boat || `SAFESEA-${i+1}`),
      fisherman: String(d.fisherman_name || d.fishermanName || d.fisherman || d.name || 'Unassigned'),
      deviceId: String(d.device_id || d.deviceId || d.id || `SS-${i+1}`),
      phone: String(d.phone || d.fishermanPhone || ''),
      lat: Number.isFinite(lat) ? lat : 9.38,
      lng: Number.isFinite(lng) ? lng : 79.35,
      speed: Number(d.speed ?? d.speedKnots ?? 0),
      heading: Number(d.heading ?? 0),
      status: statusOf(d),
      lastSeen: d.lastSeen ? new Date(d.lastSeen).toLocaleTimeString() : 'just now',
      zone: String(d.zone || d.currentZone || 'Unknown'),
      battery: Number(d.battery ?? 0),
    };
  });
}

export async function fetchFleet(): Promise<FleetVessel[]> {
  const r = await fetch(`${BACKEND_URL}/api/devices`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`Fleet API ${r.status}`);
  const data = await r.json();
  return normalizeDevices(data.devices || data.data || data);
}

export async function sendFleetBroadcast(message:string, deviceIds:string[]) {
  const r = await fetch(`${BACKEND_URL}/api/messages`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({senderRole:'COASTAL_GUARD', message, broadcast:true, deviceIds}) });
  if (!r.ok) throw new Error(`Message API ${r.status}`);
  return r.json().catch(()=>({ok:true}));
}
