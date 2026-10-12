import { Link, useSearchParams } from 'react-router-dom';
import { ArrowUpRight, Search } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { availableProducts, availableParties, availablePurchases } from '../data/erpDemoStore';
import { salesInvoices } from '../data/sales';
import { erpNavigation, erpRoutePaths, erpFeatureIds } from '../navigation/erpNavigation';
import { getVisibleNavigation } from '../navigation/resolveErpNavigation';
import { useTenantSettings } from '../settings/TenantSettingsProvider';
import { canManage, type SettingsPermission } from '../settings/model';
import { searchResults, type SearchResult } from '../utils/globalSearch';

export function GlobalSearch() {
  const [params]=useSearchParams();
  const query=params.get('q') ?? '';
  const {state,actorId,personal}=useTenantSettings();
  const nav=getVisibleNavigation(erpNavigation,{
    availablePaths:erpRoutePaths,enabledFeatures:erpFeatureIds,
    canAccess:permission=>permission==='owner'
      ? Boolean(state.sections.team.employees.find(employee=>employee.id===actorId)?.roleIds.includes('owner'))
      : canManage(state,actorId,permission as SettingsPermission)
  });
  const modules=new Map<string,SearchResult>();
  for(const group of nav) {
    for(const child of [{id:group.id,label:group.label,bn:group.bn,path:group.landingPath},...(group.children??[])]) {
      if(!modules.has(child.path)) modules.set(child.path,{id:child.id,kind:'Module',label:personal.language==='Bangla'?(child.bn??child.label):child.label,helper:personal.language==='Bangla'?child.label:(child.bn??''),path:child.path});
    }
  }
  const paths=new Set([...modules.keys()].map(path=>path.split('?')[0]));
  const records:SearchResult[]=[...modules.values()];
  if(query.trim()) {
    if(paths.has('/app/products')) records.push(...availableProducts().map(product=>({id:product.id,kind:'Product' as const,label:product.name,helper:[product.nameBn,product.sku].filter(Boolean).join(' · '),path:'/app/products?q='+encodeURIComponent(product.sku),keywords:product.brand})));
    if(paths.has('/app/parties')) records.push(...availableParties().filter(party=>party.roles.length).map(party=>({id:party.id,kind:'Party' as const,label:party.name,helper:[party.nameBn,party.phone,...party.roles].filter(Boolean).join(' · '),path:'/app/parties?id='+encodeURIComponent(party.id)+'&role='+encodeURIComponent(party.roles[0]),keywords:party.area})));
    if(paths.has('/app/sales')) records.push(...salesInvoices.map(invoice=>({id:invoice.id,kind:'Invoice' as const,label:invoice.invoice,helper:invoice.party,path:'/app/sales?q='+encodeURIComponent(invoice.invoice),keywords:[invoice.phone,...invoice.lines.map(line=>line.name)].filter(Boolean).join(' ')})));
    if(paths.has('/app/purchases')) records.push(...availablePurchases().map(purchase=>({id:purchase.id,kind:'Purchase' as const,label:purchase.ref,helper:purchase.supplier,path:'/app/purchases?q='+encodeURIComponent(purchase.ref),keywords:purchase.items})));
  }
  const results=searchResults(records,query);
  return <>
    <PageHeader title="Search results" titleBn="খোঁজার ফলাফল" description={query.trim()?`Results for “${query.trim()}”`:'Search by name, phone, SKU or bill number. নাম, ফোন বা বিল নম্বর দিয়ে খুঁজুন।'} />
    <p className="mb-3 text-xs text-ink-500">Preview records and available modules. Backend search is not connected.</p>
    <section aria-label="Search results" className="overflow-hidden rounded-xl border border-border bg-card">
      {results.length ? <ul className="divide-y divide-border">{results.slice(0,50).map(result=><li key={result.kind+':'+result.id}>
        <Link to={result.path} className="flex min-h-14 items-center gap-3 px-4 py-3 hover:bg-ink-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500">
          <span className="min-w-0 flex-1"><span className="block break-words text-sm font-medium text-ink">{result.label}</span><span className="block break-words text-xs text-ink-500">{result.helper}</span></span>
          <span className="shrink-0 text-xs text-ink-500">{result.kind}</span><ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-ink-400" />
        </Link>
      </li>)}</ul>:<div role="status" className="p-5 text-sm text-ink-500"><Search aria-hidden="true" className="mb-2 size-5" />No matching records. Try a shorter name or number. <span lang="bn">কম শব্দ দিয়ে আবার খুঁজুন।</span></div>}
    </section>
    {results.length>50&&<p role="status" className="mt-3 text-sm text-ink-500">Showing the first 50 results. Add more words to narrow your search.</p>}
  </>;
}
