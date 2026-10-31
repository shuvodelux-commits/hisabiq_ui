import test from 'node:test';
import assert from 'node:assert/strict';
import {availableProductCategories,availableProductBrands,availableProductUnits,availableProducts,editPreviewProductSetting,getEditedProductSetting,renamePreviewProductBrand,renamePreviewProductUnit} from '../src/data/erpDemoStore.ts';
import {getProductImportPreviewSnapshot} from '../src/data/productImportPreviewStore.ts';
import {unitSymbol} from '../src/data/productUnits.ts';

test('classification edits update selectors and current products, retaining metadata and inventory',()=>{
 const before=getProductImportPreviewSnapshot();
 const affected=before.products.filter(p=>p.category==='Plumbing').map(p=>p.id);
 editPreviewProductSetting('categories','Plumbing',{name:'Plumbing supplies',nameBn:'প্লাম্বিং সামগ্রী'});
 assert.ok(availableProductCategories().includes('Plumbing supplies'));
 assert.ok(!availableProductCategories().includes('Plumbing'));
 assert.ok(availableProducts().filter(p=>affected.includes(p.id)).every(p=>p.category==='Plumbing supplies'));
 assert.equal(getEditedProductSetting('categories','Plumbing')?.nameBn,'প্লাম্বিং সামগ্রী');
 assert.deepEqual(getProductImportPreviewSnapshot().lots,before.lots);
 assert.deepEqual(getProductImportPreviewSnapshot().movements,before.movements);
 editPreviewProductSetting('brands','RFL',{name:'RFL Group',nameBn:'আরএফএল'});
 assert.ok(availableProductBrands().includes('RFL Group'));
 assert.ok(!availableProductBrands().includes('RFL'));
});
test('unit display edits retain historical keys and conversion chains',()=>{
 const before=structuredClone(getProductImportPreviewSnapshot().products);
 editPreviewProductSetting('units','Piece',{name:'Single piece',symbol:'pc'});
 assert.equal(unitSymbol('Pcs'),'pc');
 assert.equal(unitSymbol('Piece'),'pc');
 assert.equal(availableProductUnits().find(u=>u.name==='Single piece')?.value,'Pcs');
 assert.deepEqual(getProductImportPreviewSnapshot().products,before);
 editPreviewProductSetting('units','Single piece',{name:'Each piece',symbol:'ea'});
 assert.equal(getEditedProductSetting('units','Piece')?.name,'Each piece');
 assert.equal(unitSymbol('Pcs'),'ea');
});
test('invalid and duplicate edits leave preview state unchanged',()=>{
 const before=getProductImportPreviewSnapshot();
 for(const draft of [{name:''},{name:'Electrical'}])assert.throws(()=>editPreviewProductSetting('categories','Steel',draft));
 for(const draft of [{name:'New unit',symbol:''},{name:'New unit',symbol:'longer'},{name:'New unit',symbol:'Kg'},{name:'Kilogram',symbol:'xx'}])assert.throws(()=>editPreviewProductSetting('units','Feet',draft));
 assert.equal(getProductImportPreviewSnapshot(),before);
 assert.equal(unitSymbol('Feet'),'Ft');
});

test('inline master edits and Settings share metadata and stable unit keys',()=>{
 renamePreviewProductBrand('RFL Group','RFL Industries');
 assert.equal(getEditedProductSetting('brands','RFL')?.name,'RFL Industries');
 assert.equal(getEditedProductSetting('brands','RFL')?.nameBn,'আরএফএল');
 assert.equal(renamePreviewProductUnit('Feet','Foot length','ft'),'Feet');
 assert.equal(getEditedProductSetting('units','Feet')?.name,'Foot length');
 assert.equal(unitSymbol('Feet'),'ft');
});
