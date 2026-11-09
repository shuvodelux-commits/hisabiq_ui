/** Fixed, synthetic Magic Patterns Offline selling data (source snapshot: 3 Nov 2026).
 * Phase 1 preview only. Never access or alter real POS devices, session tokens,
 * sync queues, reserved invoice numbers, server-side authorization or inventory.
 */
import { useState } from 'react';
import { PREVIEW_NOW, seedSessions, seedStaff } from './sessionPreview';
export type OfflineProblem = { id: string; text: string; fix: string };
export type SyncRun = { id: string; at: string; device: string; sales: number; total: number; result: 'Synced' | 'Synced with problems' | 'Failed' };

export type OfflineState = {
  deviceId: string | null;
  enabledBy: string;
  enabledAt: string;
  lastSync: string;
  pending: number;
  productsSaved: number;
  numbersLeft: number;
  blockStart: number;
  maxHours: 4 | 12 | 24 | 72;
  allowCredit: boolean;
  creditLimit: number;
  warnAt: number;
  problems: OfflineProblem[];
  history: SyncRun[];
  simulateOffline: boolean;
  /** Device waiting to take over; the switch completes once the current device has synced. */
  handoverTo?: string | null;
};

export const seedOffline: OfflineState = {
  deviceId: 'SE-1',
  enabledBy: 'Md. Anisur Rahman',
  enabledAt: '2026-11-01T10:00:00+06:00',
  lastSync: '2026-11-03T15:28:00+06:00',
  pending: 0,
  productsSaved: 1248,
  numbersLeft: 186,
  blockStart: 1,
  maxHours: 24,
  allowCredit: true,
  creditLimit: 5000,
  warnAt: 20,
  problems: [{ id: 'OP-1', text: 'Walton LED Bulb 12W: 6 sold offline, but only 4 were in stock when it synced.', fix: 'Let stock go to −2' }],
  history: [
    { id: 'SY-4', at: '2026-11-03T15:28:00+06:00', device: 'Counter PC', sales: 0, total: 0, result: 'Synced' },
    { id: 'SY-3', at: '2026-11-02T18:10:00+06:00', device: 'Counter PC', sales: 12, total: 28640, result: 'Synced with problems' },
    { id: 'SY-2', at: '2026-11-01T16:45:00+06:00', device: 'Counter PC', sales: 4, total: 6120, result: 'Synced' },
  ],
  simulateOffline: false,
};
export function useOfflinePreview() {
 const sessions=seedSessions;
 const person=(personId:string)=>seedStaff.find(p=>p.id===personId);
 const [offline,setOffline]=useState<OfflineState>(()=>({
  ...seedOffline,
  problems:seedOffline.problems.map(p=>({...p})),
  history:seedOffline.history.map(h=>({...h})),
 }));
 const updateOffline=(patch:Pick<Partial<OfflineState>,'maxHours'|'warnAt'|'allowCredit'|'creditLimit'|'simulateOffline'|'pending'|'numbersLeft'>)=>{
  setOffline(o=>({...o,...patch}));
 };
 const setOfflineDevice=(sessionId:string):'done'|'waiting'=> {
  const target=sessions.find(s=>s.id===sessionId && s.trusted);
  if(!target || offline.deviceId===sessionId)return 'done';
  if(offline.deviceId && offline.pending>0){
   setOffline(o=>({...o,handoverTo:sessionId}));
   return 'waiting';
  }
  setOffline(o=>({
   ...o,deviceId:sessionId,handoverTo:null,enabledBy:'Md. Anisur Rahman',
   enabledAt:PREVIEW_NOW,blockStart:o.blockStart+200,
   numbersLeft:200,pending:0,simulateOffline:false,
  }));
  return 'done';
 };
 const cancelHandover=()=>setOffline(o=>({...o,handoverTo:null}));
 const disableOffline=()=>{
  if(offline.pending>0)return;
  setOffline(o=>({...o,deviceId:null,handoverTo:null,simulateOffline:false}));
 };
 const syncNow=()=>{
  const n=offline.pending;
  const next=offline.handoverTo;
  const last=offline.deviceId;
  const device=sessions.find(s=>s.id===last)?.device??'Offline device';
  setOffline(o=>{
   const synced:OfflineState={
    ...o,pending:0,simulateOffline:false,lastSync:PREVIEW_NOW,
    history:[{id:`SY-DEMO-${o.history.length+1}`,at:PREVIEW_NOW,device,sales:n,total:n*1460,result:'Synced'},...o.history],
   };
   if(!next)return synced;
   const authorized=sessions.find(s=>s.id===next&&s.trusted);
   return authorized?{...synced,deviceId:authorized.id,handoverTo:null,enabledAt:PREVIEW_NOW,
     enabledBy:'Md. Anisur Rahman',numbersLeft:200,blockStart:o.blockStart+200}:synced;
  });
  return n;
 };
 const resolveProblem=(id:string)=>{
  setOffline(o=>({...o,problems:o.problems.filter(p=>p.id!==id)}));
 };
 return {sessions,person,offline,setOfflineDevice,cancelHandover,disableOffline,syncNow,resolveProblem,updateOffline};
}
