import test from 'node:test';
import assert from 'node:assert/strict';
import {getSettingsHubItems} from '../src/settings/settingsHub.ts';
import {erpRoutePaths,erpFeatureIds} from '../src/navigation/erpNavigation.ts';
import {sectionNames} from '../src/settings/fields.ts';
import type {NavigationContext} from '../src/navigation/resolveErpNavigation.ts';

const all:NavigationContext={availablePaths:erpRoutePaths,enabledFeatures:erpFeatureIds,canAccess:()=>true};

test('tenant settings follows the Settings directory, then related standalone pages',()=>{
 const entries=getSettingsHubItems(all);
 assert.deepEqual(entries.map(e=>e.path),[...Object.keys(sectionNames).map(id=>`/app/settings/${id}`),'/app/notifications','/app/subscription']);
 assert.ok(entries.every(e=>e.description.length>15));
});
test('Settings removes unready destinations instead of showing broken tiles',()=>{
 const onlyCore:NavigationContext={...all,availablePaths:new Set(['/app/settings/business','/app/settings/personal'])};
 assert.deepEqual(getSettingsHubItems(onlyCore).map(e=>e.id),['general','appearance']);
 const noSms:NavigationContext={...all,enabledFeatures:new Set(['quotations','online-sales'])};
 assert.equal(getSettingsHubItems(noSms).some(e=>e.id==='notifications'),false);
});
test('cashier sees ordinary personal settings, not owner subscription or provider configuration',()=>{
 const cashier:NavigationContext={...all,canAccess:p=>!['team','notifications','export','owner'].includes(p)};
 const entries=getSettingsHubItems(cashier);
 assert.ok(entries.some(e=>e.id==='general'));
 assert.ok(entries.some(e=>e.id==='appearance'));
 assert.ok(entries.some(e=>e.id==='security'));
 assert.ok(!entries.some(e=>['users','data','notifications','subscription'].includes(e.id)));
});
