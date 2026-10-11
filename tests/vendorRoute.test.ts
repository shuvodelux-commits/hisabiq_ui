import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveVendorView,vendorWorkLink,filterVendors,resolveVendorPaymentIntent} from '../src/vendor/vendorRoute.ts';
import type {Party} from '../src/types/erp.ts';
const vendors=[{id:'v1',name:'Shapla Transport',phone:'01911-305566',roles:['Vendor'],status:'Active'},
{id:'v2',name:'Bismillah Steel',phone:'01811-555555',roles:['Supplier','Vendor'],status:'Active'},
{id:'c1',name:'Customer',phone:'01701',roles:['Customer'],status:'Active'},
{id:'v3',name:'Old Shop',phone:'01809',roles:['Vendor'],status:'Inactive'}] as Party[];
test('open Vendor module with preselected canonical Party and operational tab',()=>{
 assert.deepEqual(resolveVendorView('?partyId=v1&tab=given',vendors),{partyId:'v1',tab:'given'});
 assert.deepEqual(resolveVendorView('?partyId=v2&tab=purchases',vendors),{partyId:'v2',tab:'purchases'});
 assert.equal(filterVendors(vendors,'01811').length,1);
 assert.equal(filterVendors(vendors,'bismillah')[0].id,'v2');
});
test('invalid Party or tab cannot access another role or unknown Vendor',()=>{
 assert.deepEqual(resolveVendorView('?partyId=c1&tab=given',vendors),{partyId:null,tab:'ledger'});
 assert.deepEqual(resolveVendorView('?partyId=missing&tab=given',vendors),{partyId:null,tab:'ledger'});
 assert.deepEqual(resolveVendorView('?partyId=v1&tab=wrong',vendors),{partyId:'v1',tab:'ledger'});
 assert.deepEqual(resolveVendorView('?partyId=v3&tab=given',vendors),{partyId:'v3',tab:'given'});
});
test('canonical deep link preserves selected Vendor and tab',()=>{
 assert.equal(vendorWorkLink('v1','payments','given-17'),'/app/vendors?partyId=v1&tab=payments&sourceId=given-17');
 assert.equal(vendorWorkLink('v2'),'/app/vendors?partyId=v2');
});

test('Party payment shortcuts retain source direction without choosing the opposite balance',()=>{
 assert.equal(vendorWorkLink('v1','payments','source-2','receive'),
  '/app/vendors?partyId=v1&tab=payments&sourceId=source-2&intent=receive');
 assert.equal(vendorWorkLink('v1','payments',undefined,'make'),
  '/app/vendors?partyId=v1&tab=payments&intent=make');
 assert.equal(resolveVendorPaymentIntent('?partyId=v1&tab=payments&intent=receive'),'receive');
 assert.equal(resolveVendorPaymentIntent('?partyId=v1&tab=payments&intent=malformed'),null);
});
