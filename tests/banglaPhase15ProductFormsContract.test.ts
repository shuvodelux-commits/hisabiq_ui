import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {productFormLabel,productFormOptions} from '../src/i18n/productFormsCopy.ts';

test('Phase 15 Product Settings and Add/Edit locale labels retain machine values',()=>{
 const modes=['English','English + Bangla','Bangla'] as const;
 for(const language of modes){
  for(const field of ['Category','Unit','Brand','Selling price','Opening stock','Save product']){
   assert.ok(productFormLabel(language,field));
   if(language!=='Bangla')assert.equal(productFormLabel(language,field),field);
  }
 }
 assert.equal(productFormLabel('Bangla','Add product'),'নতুন পণ্য');
 assert.equal(productFormLabel('Bangla','Edit product'),'পণ্য বদলান');
 assert.equal(productFormLabel('Bangla','Selling price'),'বিক্রির দাম');
 assert.equal(productFormLabel('Bangla','Required'),'বাধ্যতামূলক');
 assert.equal(productFormLabel('Bangla','Product name is required.'),'পণ্যের নাম লিখুন।');
 for(const id of ['prod-003','stock','Pcs','Gira','Gauge','FEFO-01','SNO-1200','SKU-1004','৳1,245']) {
  assert.equal(productFormLabel('Bangla',id),id,'source/user identifiers never translated');
 }
});
test('enumeration dropdown keeps persisted IDs across English and Bangla',()=>{
 const values=['Off','Optional','Required'];
 assert.deepEqual(productFormOptions('Bangla',values).map(x=>x.value),values);
 assert.deepEqual(productFormOptions('Bangla',['Days','Months','Years']).map(x=>x.value),['Days','Months','Years']);
 assert.deepEqual(productFormOptions('Bangla',['FIFO','FEFO']).map(x=>x.value),['FIFO','FEFO']);
 assert.deepEqual(productFormOptions('English',values).map(x=>x.label),values);
 assert.deepEqual(productFormOptions('Bangla',values).map(x=>x.label),['বন্ধ','ঐচ্ছিক','বাধ্যতামূলক']);
});
test('source-safe product editing retains unit, warranty, serial, lot and quick-add logic',()=>{
 const dialog=readFileSync('src/components/products/AddProductDialog.tsx','utf8');
 const settings=readFileSync('src/components/products/ProductSettings.tsx','utf8');
 for(const s of [
  "useUiCopy()","productFormLabel(language,english)",
  "toBasePrice(", "toBaseQuantity(","requiredSerialCount(","duplicateSerials(","normalizeSerials(",
  "onSave(product, opening)","createPreviewProductCategory(","createPreviewProductBrand(",
  "createPreviewProductUnit(", "newName.trim()"
 ])assert.ok((dialog+'\n'+settings).includes(s),s);
 for(const s of ["setSerialTracking(mode)", "setAllocationMethod(next as StockAllocationMethod)", "value={category}",
  "value={brand}","priceToBase(sell, selectedSellUnit)","priceToBase(buy, selectedBuyUnit)"])
  assert.ok(dialog.includes(s),s);
 assert.match(settings,/\['categories', 'Categories', Tags\]/);
 assert.match(settings,/\['units', 'Units', Ruler\]/);
 assert.match(settings,/\['brands', 'Brands', Tags\]/);
 assert.match(settings,/\['defaults', 'Defaults', Settings2\]/);
 assert.match(dialog,/options=\{productFormOptions\(language,serialModes\)\}/u===null? /serialModes/ : /serialModes/);
 assert.doesNotMatch(dialog,/setSerialTracking\(pl\(/);
 assert.doesNotMatch(settings,/createPreviewProductCategory\(pl\(/);
});
