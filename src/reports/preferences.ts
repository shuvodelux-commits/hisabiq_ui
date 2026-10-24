import { defaultReportFilters } from './model.ts';
import { reportDefinition } from './catalog.ts';
import type { ReportFilters, ReportKey } from './types';

export type SavedReportView={id:string;name:string;report:ReportKey;filters:ReportFilters;columns:string[]};
export type ReportPreferences={favorites:ReportKey[];views:SavedReportView[]};
export const emptyPreferences:ReportPreferences={favorites:['reorder','receivables','product-profit'],views:[]};
export function parsePreferences(raw:string|null):ReportPreferences {
 try{
  const v=JSON.parse(raw??'null');
  if(!v||typeof v!=='object')return {...emptyPreferences};
  const favorites=Array.isArray(v.favorites)?v.favorites.filter((k:unknown)=>typeof k==='string'&&reportDefinition(k).id===k):emptyPreferences.favorites;
  const views=Array.isArray(v.views)?v.views.filter((s:unknown):s is SavedReportView=>{
   if(!s||typeof s!=='object')return false;
   const r=s as Record<string,unknown>;
   return typeof r.id==='string'&&typeof r.name==='string'&&r.name.length<=80&&typeof r.report==='string'&&reportDefinition(r.report).id===r.report&&Array.isArray(r.columns)&&r.columns.every(c=>typeof c==='string')&&!!r.filters&&typeof r.filters==='object';
  }).slice(0,20).map((s:SavedReportView)=>({...s,filters:filtersFromParams(new URLSearchParams(s.filters as unknown as Record<string,string>))})): [];
  return {favorites,views};
 }catch{return {...emptyPreferences};}
}
export function filtersFromParams(params:URLSearchParams):ReportFilters {
 const values={...defaultReportFilters};
 for(const key of Object.keys(values) as (keyof ReportFilters)[]){
  const v=params.get(key);
  if(v!==null)(values as Record<string,string>)[key]=v.slice(0,200);
 }
 if(!['none','previous'].includes(values.compare))values.compare='none';
 if(!['asc','desc'].includes(values.direction))values.direction='desc';
 return values;
}
export function paramsForReport(report:ReportKey,filters:ReportFilters,columns:string[]) {
 const p=new URLSearchParams({report,from:filters.from,to:filters.to});
 for(const [key,v]of Object.entries(filters))if(v!==defaultReportFilters[key as keyof ReportFilters])p.set(key,v);
 if(columns.length)p.set('columns',columns.join(','));
 return p;
}

