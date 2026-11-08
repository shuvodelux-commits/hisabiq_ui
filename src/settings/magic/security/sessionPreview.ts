/** UI-only copy of Magic Patterns security source fixtures, pinned to 3 November 2026.
 * These identities, locations, devices and session states are synthetic demonstration
 * records; never interpret them as real authenticated sessions or device tracking.
 */
import { useState } from 'react';
export type DeviceKind = 'desktop' | 'phone' | 'tablet';
export type SessionFlag = 'new' | 'unusual-hour' | 'different-city';

export type StaffMember = { id: string; name: string; role: string; paused: boolean };

export type LoginSession = {
  id: string;
  personId: string;
  device: string;
  kind: DeviceKind;
  browser: string;
  city: string;
  signedInAt: string;
  lastActive: string;
  current?: boolean;
  trusted: boolean;
  flags: SessionFlag[];
};


export const PREVIEW_NOW = '2026-11-03T15:30:00+06:00';

export const seedStaff: StaffMember[] = [
  { id: 'ST-01', name: 'Md. Anisur Rahman', role: 'Owner', paused: false },
  { id: 'ST-02', name: 'Sabbir Hossain', role: 'Cashier', paused: false },
  { id: 'ST-03', name: 'Sumi Akter', role: 'Manager', paused: false },
  { id: 'ST-04', name: 'Karim Mia', role: 'Cashier', paused: false },
  { id: 'ST-05', name: 'Rubel Hasan', role: 'Stock keeper', paused: false },
];

export const seedSessions: LoginSession[] = [
  { id: 'SE-1', personId: 'ST-01', device: 'Counter PC', kind: 'desktop', browser: 'Chrome · Windows 11', city: 'Dhaka', signedInAt: '2026-11-03T09:02:00+06:00', lastActive: '2026-11-03T15:30:00+06:00', current: true, trusted: true, flags: [] },
  { id: 'SE-2', personId: 'ST-01', device: 'Owner phone', kind: 'phone', browser: 'Chrome · Android', city: 'Dhaka', signedInAt: '2026-10-28T21:10:00+06:00', lastActive: '2026-11-03T13:45:00+06:00', trusted: true, flags: [] },
  { id: 'SE-3', personId: 'ST-02', device: 'Front counter tablet', kind: 'tablet', browser: 'Chrome · Android', city: 'Dhaka', signedInAt: '2026-11-03T09:15:00+06:00', lastActive: '2026-11-03T15:18:00+06:00', trusted: true, flags: [] },
  { id: 'SE-4', personId: 'ST-04', device: 'Karim’s phone', kind: 'phone', browser: 'Chrome · Android', city: 'Dhaka', signedInAt: '2026-11-03T10:05:00+06:00', lastActive: '2026-11-03T15:02:00+06:00', trusted: true, flags: [] },
  { id: 'SE-5', personId: 'ST-03', device: 'iPhone 13', kind: 'phone', browser: 'Safari · iOS', city: 'Chattogram', signedInAt: '2026-11-03T02:14:00+06:00', lastActive: '2026-11-03T02:40:00+06:00', trusted: false, flags: ['new', 'unusual-hour', 'different-city'] },
  { id: 'SE-6', personId: 'ST-03', device: 'Back office laptop', kind: 'desktop', browser: 'Edge · Windows 10', city: 'Dhaka', signedInAt: '2026-11-02T10:00:00+06:00', lastActive: '2026-11-03T12:10:00+06:00', trusted: true, flags: [] },
  { id: 'SE-7', personId: 'ST-05', device: 'Godown phone', kind: 'phone', browser: 'Chrome · Android', city: 'Dhaka', signedInAt: '2026-10-31T11:30:00+06:00', lastActive: '2026-11-03T11:55:00+06:00', trusted: false, flags: ['new'] },
  { id: 'SE-8', personId: 'ST-02', device: 'Old Samsung', kind: 'phone', browser: 'Samsung Internet', city: 'Narayanganj', signedInAt: '2026-10-12T18:00:00+06:00', lastActive: '2026-10-20T19:22:00+06:00', trusted: true, flags: [] },
];

export function ago(iso: string): string {
 const mins=Math.max(0,Math.round((new Date(PREVIEW_NOW).getTime()-new Date(iso).getTime())/60000));
 if(mins<2)return 'Now';
 if(mins<60)return `${mins} min ago`;
 if(mins<1440)return `${Math.round(mins/60)} hr ago`;
 return `${Math.round(mins/1440)} days ago`;
}
export function dhakaTime(iso: string): string {
 return new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Dhaka',day:'numeric',month:'short',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(iso));
}

/** Local-only transactions, intentionally disconnected from the tenant/auth provider. */
export function useSessionsPreview() {
 const [staff,setStaff]=useState<StaffMember[]>(()=>seedStaff.map(p=>({...p})));
 const [sessions,setSessions]=useState<LoginSession[]>(()=>seedSessions.map(s=>({...s,flags:[...s.flags]})));
 const person=(id:string)=>staff.find(p=>p.id===id);
 const signOut=(id:string):LoginSession|undefined=>{
  const found=sessions.find(s=>s.id===id&&!s.current);
  if(found)setSessions(list=>list.filter(s=>s.id!==id));
  return found;
 };
 const restoreSession=(s:LoginSession)=>setSessions(list=>list.some(x=>x.id===s.id)?list:[...list,s]);
 const setPaused=(personId:string,paused:boolean)=>setStaff(list=>list.map(p=>p.id===personId?{...p,paused}:p));
 const signOutPerson=(personId:string,pause:boolean)=>{
  const amount=sessions.filter(s=>s.personId===personId&&!s.current).length;
  setSessions(list=>list.filter(s=>s.personId!==personId||s.current));
  if(pause)setPaused(personId,true);
  return amount;
 };
 const signOutAllExceptMe=()=>{
  const amount=sessions.filter(s=>!s.current).length;
  setSessions(list=>list.filter(s=>s.current));
  return amount;
 };
 return {staff,sessions,person,signOut,restoreSession,setPaused,signOutPerson,signOutAllExceptMe};
}
