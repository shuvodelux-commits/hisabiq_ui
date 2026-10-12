import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSearch, searchResults, type SearchResult } from '../src/utils/globalSearch.ts';
const records:SearchResult[]=[
 {id:'products',kind:'Module',label:'Products & Stock',helper:'পণ্য ও মজুত',path:'/app/products'},
 {id:'p1',kind:'Product',label:'LED Bulb 12W',helper:'এলইডি বাল্ব · ELC-1201',path:'/app/products?q=ELC-1201'},
 {id:'i1',kind:'Invoice',label:'INV-000241',helper:'Rahman Hardware',keywords:'01711000001',path:'/app/sales?q=INV-000241'}
];
test('global search matches Bangla names and digits, English case and all words',()=>{
 assert.equal(normalizeSearch('  INV-০০০২৪১  '),'inv-000241');
 assert.deepEqual(searchResults(records,' এলইডি  বাল্ব ').map(result=>result.id),['p1']);
 assert.deepEqual(searchResults(records,'BULB 12W').map(result=>result.id),['p1']);
 assert.deepEqual(searchResults(records,'INV-০০০২৪১ Rahman').map(result=>result.id),['i1']);
 assert.deepEqual(searchResults(records,'০১৭১১০০০০০১').map(result=>result.id),['i1']);
 assert.deepEqual(searchResults(records,'Bulb absent'),[]);
});
test('empty search offers modules and preserves exact source destinations',()=>{
 assert.deepEqual(searchResults(records,'  ').map(result=>result.id),['products']);
 assert.equal(searchResults(records,'INV-000241')[0].path,'/app/sales?q=INV-000241');
 assert.equal(records[2].label,'INV-000241');
});

test('Default word-prefix matches are precise; Advanced includes partial words and one-edit typos',()=>{
 assert.deepEqual(searchResults(records,'ulb','Default'),[]);
 assert.deepEqual(searchResults(records,'ulb','Advanced').map(item=>item.id),['p1']);
 assert.deepEqual(searchResults(records,'balb','Advanced').map(item=>item.id),['p1']);
 assert.equal(searchResults(records,'INV-000241','Default')[0].kind,'Invoice');
 assert.deepEqual(searchResults(records,'zzzzzz-no-record','Advanced'),[]);
});
