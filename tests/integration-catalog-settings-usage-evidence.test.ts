import test from 'node:test';
import assert from 'node:assert/strict';

import { ApiError } from '../src/integration/errors.ts';
import { reconcileCatalogSettingsUsageEvidence } from '../src/integration/catalog-settings-usage-evidence.ts';

const u1='01ARZ3NDEKTSV4RRFFQ69G5FAV';
const u2='01ARZ3NDEKTSV4RRFFQ69G5FAW';
const b1='01ARZ3NDEKTSV4RRFFQ69G5FAX';
const c1='01ARZ3NDEKTSV4RRFFQ69G5FAY';
const c2='01ARZ3NDEKTSV4RRFFQ69G5FAZ';
const archived='01ARZ3NDEKTSV4RRFFQ69G5FB0';
const foreign='01ARZ3NDEKTSV4RRFFQ69G5FB1';
const features = {
  productOffers:false,expiryTracking:false,serialTracking:false,
  warranty:false,customerGroups:false,vendors:false,
};
function metadata() {
  return { data: {
    units:[
      {id:u1,name:'Foot',nameBn:'ফুট',symbol:'ft',version:1},
      {id:u2,name:'Box',nameBn:'বক্স',symbol:'box',version:2},
    ],
    brands:[{id:b1,name:'Foot',nameBn:null,version:3}],
    categories:[
      {id:c1,name:'Electrical',nameBn:null,parentId:null,version:1},
      {id:c2,name:'Cable',nameBn:null,parentId:c1,version:1},
    ],features:{...features},
  } };
}
function usage() {
  return { data: {
    units:[{id:u1,productCount:0},{id:u2,productCount:5}],
    brands:[{id:b1,productCount:1}],
    categories:[
      {id:c1,directProductCount:0,subtreeProductCount:4,parentState:'root'},
      {id:c2,directProductCount:4,subtreeProductCount:4,parentState:'present'},
    ],
    unresolved:{unitIds:[],brandIds:[],categoryIds:[],parentIds:[]},
  } };
}
const protocol=(e:unknown)=>e instanceof ApiError && e.kind==='protocol';

test('P7e: matched 0 stays real zero; product references are advisory and no lifecycle is invented', () => {
  const a=metadata(), b=usage();
  const originalA=structuredClone(a),originalB=structuredClone(b);
  const r=reconcileCatalogSettingsUsageEvidence(a,b);
  assert.deepEqual(r.units.map(x=>[x.id,x.productCount,x.active]),[[u1,0,null],[u2,5,null]]);
  assert.deepEqual(r.brands.map(x=>[x.id,x.productCount,x.active]),[[b1,1,null]]);
  assert.equal(r.units[0]?.name,'Foot');
  assert.equal(r.units[0]?.nameBn,'ফুট');
  assert.equal(r.units[0]?.symbol,'ft');
  assert.equal(r.units[0]?.unitKind,null);
  assert.deepEqual(r.categories.map(x=>[x.id,x.directProductCount,x.subtreeProductCount,x.active]),
    [[c1,0,4,null],[c2,4,4,null]]);
  assert.equal(r.crossSnapshotConsistency,'unverified');
  assert.equal(r.canUseForMutation,false);
  assert.equal(r.canMountFullConnectedEditor,false);
  assert.equal(r.completeness,'partial');
  assert.deepEqual(a,originalA);
  assert.deepEqual(b,originalB);
  assert.equal(Object.isFrozen(r.units[0]),true);
  assert.equal(Object.isFrozen(r.usageIdsOutsideRoster.unitIds),true);
});

test('P7e: missing count is null rather than the fabricated zero from a non-atomic GET pair', () => {
  const b=usage();
  b.data.units=b.data.units.filter(x=>x.id!==u2);
  const r=reconcileCatalogSettingsUsageEvidence(metadata(),b);
  assert.equal(r.units.find(x=>x.id===u2)?.productCount,null);
  assert.deepEqual(r.usageIdsMissingForRoster.unitIds,[u2]);
  assert.equal(r.units.find(x=>x.id===u1)?.productCount,0);
  assert.equal(r.canUseForMutation,false);
});

test('P7e: usage-only row is NOT an inactive/archived master, and unresolved references survive', () => {
  const b=usage();
  b.data.units.push({id:archived,productCount:8});
  b.data.unresolved.unitIds.push(foreign);
  b.data.unresolved.parentIds.push(archived);
  const r=reconcileCatalogSettingsUsageEvidence(metadata(),b);
  assert.deepEqual(r.usageIdsOutsideRoster.unitIds,[archived]);
  assert.deepEqual(r.unresolved.unitIds,[foreign]);
  assert.deepEqual(r.unresolved.parentIds,[archived]);
  assert.equal(r.units.length,2);
  assert.equal(r.units.some(x=>x.id===archived),false);
  assert.equal(r.canMountFullConnectedEditor,false);
});

test('P7e: different kinds with same name or ULID cannot cross-match by label', () => {
  const a=metadata(), b=usage();
  a.data.brands[0]!.id=u1;
  b.data.brands=[{id:u1,productCount:19}];
  const r=reconcileCatalogSettingsUsageEvidence(a,b);
  assert.equal(r.units[0]?.productCount,0);
  assert.equal(r.brands[0]?.productCount,19);
});

test('P7e: category parent visibility and census parent state remain independent', () => {
  const a=metadata(), b=usage();
  a.data.categories[1]!.parentId=foreign; // parent not visible among non-archived master rows
  const r=reconcileCatalogSettingsUsageEvidence(a,b);
  const child=r.categories.find(x=>x.id===c2)!;
  assert.equal(child.parentVisibility,'unresolved');
  assert.equal(child.usageParentState,'present');
  assert.deepEqual(r.categoryParentMismatches,[c2]);
  assert.deepEqual(r.unresolved.parentIds,[]);
  assert.equal(r.canUseForMutation,false);
});

test('P7e: archive/usage-only diagnostics distinguish master roster from missing references', () => {
  const a=metadata(), b=usage();
  b.data.categories.push({
    id:archived,directProductCount:1,subtreeProductCount:2,parentState:'unresolved',
  });
  b.data.unresolved.categoryIds.push(foreign);
  const r=reconcileCatalogSettingsUsageEvidence(a,b);
  assert.deepEqual(r.usageIdsOutsideRoster.categoryIds,[archived]);
  assert.deepEqual(r.unresolved.categoryIds,[foreign]);
  assert.equal(r.categories.length,2);
});

test('P7e: duplicate IDs in metadata are rejected before reconciliation', () => {
  for (const kind of ['units', 'brands', 'categories'] as const) {
    const a=metadata();
    const original=a.data[kind][0]!;
    (a.data[kind] as Array<typeof original>).push({...original});
    assert.throws(()=>reconcileCatalogSettingsUsageEvidence(a,usage()),protocol);
  }
});

test('P7e: strict decoders fail closed for invalid/duplicate/out-of-range payloads', () => {
  const invalid: [unknown,unknown][] = [
    [null,usage()],
    [metadata(),null],
    [{...metadata(),extra:true},usage()],
    [metadata(),{...usage(),extra:1}],
    [metadata(),{data:{...usage().data,units:[{id:u1,productCount:-3}]}}],
    [metadata(),{data:{...usage().data,units:[{id:u1,productCount:Number.MAX_SAFE_INTEGER+1}]}}],
    [metadata(),{data:{...usage().data,units:[{id:u1,productCount:0},{id:u1,productCount:2}]}}],
    [metadata(),{data:{...usage().data,unresolved:{...usage().data.unresolved,unitIds:['bad-id']}}}],
    [metadata(),{data:{...usage().data,categories:[{
      id:c1,directProductCount:3,subtreeProductCount:1,parentState:'root',
    }]}}],
  ];
  for (const [a,b] of invalid) assert.throws(()=>reconcileCatalogSettingsUsageEvidence(a,b),protocol);
});
