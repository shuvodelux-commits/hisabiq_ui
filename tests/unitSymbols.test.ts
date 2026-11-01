import test from 'node:test';
import assert from 'node:assert/strict';
import {unitSymbol, validUnitSymbol} from '../src/data/productUnits.ts';
import {availableProductUnits, createPreviewProductUnit} from '../src/data/erpDemoStore.ts';
import {productUnitFactor} from '../src/utils/unitChain.ts';

test('short labels resolve full names and legacy keys without changing conversions',()=>{
  for (const [unit,symbol] of [['Pieces','pcs'],['Pcs','pcs'],['Gauge','Gg'],['Carton','CT'],['Feet','Ft']])
    assert.equal(unitSymbol(unit),symbol);
  assert.equal(unitSymbol('Unmapped historical unit'),'Unmapped historical unit');
  const product={unit:'Gira',altUnit:{unit:'Gauge',factor:16}};
  assert.equal(productUnitFactor(product,'Gauge'),16);
  assert.equal(product.altUnit.unit,'Gauge');
  assert.equal(availableProductUnits().find(unit=>unit.name==='Gauge')?.value,'Gauge');
});

test('new units require explicit short symbols and reject ambiguous names/symbols',()=>{
  for (const symbol of ['', '   ', 'Pieces', 'p cs']) {
    assert.equal(validUnitSymbol(symbol),false);
    assert.throws(()=>createPreviewProductUnit('Invalid unit',symbol),/symbol/);
  }
  assert.throws(()=>createPreviewProductUnit('Another piece','PCS'),/already exists/);
  assert.throws(()=>createPreviewProductUnit('Gauge','Ga'),/already exists/);
  createPreviewProductUnit('Test packet','Pkt');
  assert.equal(unitSymbol('Test packet'),'Pkt');
  assert.equal(unitSymbol('Pkt'),'Pkt');
  assert.throws(()=>createPreviewProductUnit('Test packet','Pack'),/already exists/);
});
