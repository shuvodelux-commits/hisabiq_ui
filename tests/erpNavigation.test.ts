import test from 'node:test';
import assert from 'node:assert/strict';
import {erpNavigation} from '../src/navigation/erpNavigation.ts';
import {getVisibleNavigation,resolveNavLocation, type NavigationContext} from '../src/navigation/resolveErpNavigation.ts';
import {sectionNames} from '../src/settings/fields.ts';

test('sidebar destinations match the complete module tab sequence',()=>{
 const paths=(id:string)=>erpNavigation.find(g=>g.id===id)!.children!.map(c=>c.path);
 assert.deepEqual(paths('sales').slice(0,5),['/app/sales','/app/sales?tab=return','/app/sales?tab=returns','/app/sales?tab=credits','/app/sales?tab=drafts']);
 assert.deepEqual(paths('purchases'),['/app/purchases','/app/purchases?tab=return','/app/purchases?tab=return-history']);
 assert.deepEqual(paths('products'),['/app/products','/app/products?view=lots','/app/products?view=history','/app/products?view=settings']);
 assert.deepEqual(paths('finance'),['/app/finance','/app/finance?tab=transactions','/app/finance?tab=cheques','/app/finance?tab=cash']);
 assert.deepEqual(paths('accounts'),['/app/accounts','/app/accounts?tab=money-accounts','/app/accounts?tab=vouchers','/app/accounts?tab=ledger','/app/accounts?tab=trial','/app/accounts?tab=statements','/app/accounts?tab=chart','/app/reconciliation','/app/audit-ledger']);
 assert.equal(erpNavigation.find(g=>g.id==='daybook')?.landingPath,'/app/daybook');
 assert.equal(erpNavigation.find(g=>g.id==='daybook')?.children?.length??0,0);
 assert.deepEqual(paths('settings').filter(p=>p.startsWith('/app/settings/')),Object.keys(sectionNames).map(id=>`/app/settings/${id}`));
 assert.deepEqual(paths('parties'),['/app/parties',...['Customer','Supplier','Vendor','Lender','Borrower','Payee','Owner'].map(role=>`/app/parties?role=${role}`)]);
});

const allPaths=new Set(erpNavigation.flatMap(g=>[g.landingPath,...(g.children??[]).map(c=>c.path)].filter(Boolean) as string[]));
const allowAll:NavigationContext={availablePaths:allPaths,enabledFeatures:new Set(['quotations','online-sales','notifications']),canAccess:()=>true};

test('approved KISS hierarchy has only two levels, POS single click and Settings last',()=>{
 assert.deepEqual(erpNavigation.map(g=>g.id),['dashboard','pos','counter','sales','purchases','vendor','products','parties','expenses','finance','accounts','daybook','warranty','reports','settings']);
 assert.equal(erpNavigation.find(g=>g.id==='pos')?.children?.length??0,0);
 assert.equal(erpNavigation.find(g=>g.id==='daybook')?.children?.length??0,0);
 assert.equal(erpNavigation.find(g=>g.id==='finance')?.label,'Finance');
 assert.equal(erpNavigation.find(g=>g.id==='accounts')?.label,'Accounts');
 assert.ok(erpNavigation.every(g=>!g.children?.some(c=>'children' in c)));
 const ids=erpNavigation.flatMap(g=>[g.id,...(g.children??[]).map(c=>c.id)]);
 assert.equal(new Set(ids).size,ids.length);
 assert.equal(erpNavigation[erpNavigation.length-1].id,'settings');
});

test('contextual destinations retain existing real routes and only canonical path templates',()=>{
 assert.deepEqual(resolveNavLocation('/app/quotations',erpNavigation),{groupId:'sales',childId:'quotations'});
 assert.deepEqual(resolveNavLocation('/app/notifications',erpNavigation),{groupId:'settings',childId:'notifications'});
 assert.deepEqual(resolveNavLocation('/app/pos',erpNavigation),{groupId:'pos'});
 assert.deepEqual(resolveNavLocation('/app/counter',erpNavigation),{groupId:'counter'});
 assert.deepEqual(resolveNavLocation('/app/sales?tab=return',erpNavigation),{groupId:'sales',childId:'sales-return'});
 assert.deepEqual(resolveNavLocation('/app/parties?role=Supplier',erpNavigation),{groupId:'parties',childId:'suppliers'});
 assert.equal(resolveNavLocation('/app/sales-old',erpNavigation),null);
 assert.equal(resolveNavLocation('/app/not-a-route',erpNavigation),null);
 assert.deepEqual(resolveNavLocation('/app/settings/team',erpNavigation),{groupId:'settings',childId:'users'});
 assert.deepEqual(resolveNavLocation('/app/purchases/new',erpNavigation),{groupId:'purchases'});
 assert.deepEqual(resolveNavLocation('/app/finance?tab=cash',erpNavigation),{groupId:'finance',childId:'cash-sessions'});
 assert.deepEqual(resolveNavLocation('/app/finance?tab=accounts',erpNavigation),{groupId:'finance'});
 assert.deepEqual(resolveNavLocation('/app/accounts?tab=money-accounts',erpNavigation),{groupId:'accounts',childId:'money-accounts'});
 assert.deepEqual(resolveNavLocation('/app/accounts?tab=ledger',erpNavigation),{groupId:'accounts',childId:'accounts-ledger'});
 assert.deepEqual(resolveNavLocation('/app/accounts',erpNavigation),{groupId:'accounts',childId:'accounts-overview'});
 assert.deepEqual(resolveNavLocation('/app/accounts?tab=bank-entry',erpNavigation),{groupId:'accounts',childId:'accounts-overview'});
 assert.deepEqual(resolveNavLocation('/app/daybook',erpNavigation),{groupId:'daybook'});
 assert.deepEqual(resolveNavLocation('/app/reconciliation?account=Main%20Cash%20Counter',erpNavigation),{groupId:'accounts',childId:'reconciliation'});
 assert.deepEqual(resolveNavLocation('/app/audit-ledger',erpNavigation),{groupId:'accounts',childId:'audit'});
});

test('feature readiness and owner settings access gate links but not authorization',()=>{
 const unavailable:NavigationContext={availablePaths:new Set(['/app/dashboard','/app/pos','/app/sales','/app/settings/business']),enabledFeatures:new Set(),canAccess:()=>true};
 const list=getVisibleNavigation(erpNavigation,unavailable);
 assert.equal(list.find(g=>g.id==='sales')?.children?.some(c=>c.id==='quotations'),false);
 assert.equal(list.find(g=>g.id==='settings')?.children?.some(c=>c.id==='notifications'),false);
 const cashier:NavigationContext={...allowAll,canAccess:p=>!['owner','team','notifications'].includes(p)};
 const settings=getVisibleNavigation(erpNavigation,cashier).find(g=>g.id==='settings');
 assert.equal(settings?.children?.some(c=>c.id==='subscription'),false);
 assert.equal(settings?.children?.some(c=>c.id==='users'),false);
 assert.equal(settings?.children?.some(c=>c.id==='notifications'),false);
 assert.equal(settings?.children?.some(c=>c.id==='general'),true);
 const restricted=getVisibleNavigation(erpNavigation,{...allowAll,canAccess:p=>p!=='money'});
 assert.equal(restricted.find(g=>g.id==='accounts')?.children?.some(c=>c.id==='audit'),false);
 assert.equal(restricted.find(g=>g.id==='daybook')?.landingPath,'/app/daybook');
});
