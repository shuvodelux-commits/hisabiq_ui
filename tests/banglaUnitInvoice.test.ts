import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {unitBanglaName, unitSymbol} from '../src/data/productUnits.ts';
import {availableProductUnits,createPreviewProductUnit,editPreviewProductSetting} from '../src/data/erpDemoStore.ts';
import {freezeInvoiceUnitNames,formatPrintQuantity} from '../src/utils/printUnitQuantity.ts';
import {invoiceDesignDefaults} from '../src/documents/profile.ts';

test('Unit settings persist editable Bangla names without changing stable keys or English symbols',()=>{
 assert.equal(unitBanglaName('Piece'),'পিস');
 assert.equal(unitBanglaName('Pcs'),'পিস');
 assert.equal(unitBanglaName('Gauge'),'গেজ');
 assert.equal(unitSymbol('Gauge'),'Gg');
 createPreviewProductUnit('Test bundle packet','tbp','বান্ডিল প্যাকেট');
 assert.equal(availableProductUnits().find(u=>u.name==='Test bundle packet')?.nameBn,'বান্ডিল প্যাকেট');
 assert.equal(unitBanglaName('tbp'),'বান্ডিল প্যাকেট');
 editPreviewProductSetting('units','Test bundle packet',{name:'Test bundle packet',symbol:'tbp',nameBn:'নতুন প্যাকেট'});
 assert.equal(unitBanglaName('tbp'),'নতুন প্যাকেট');
 assert.equal(unitSymbol('tbp'),'tbp');
});

test('English, Bangla, bilingual and legacy quantities preserve quantities and safe fallback',()=>{
 const raw='3 Box 5 Pcs 1 Gauge';
 const frozen=freezeInvoiceUnitNames(raw);
 assert.deepEqual(frozen,{Box:'বক্স',Pcs:'পিস',Gauge:'গেজ'});
 assert.equal(formatPrintQuantity(raw,'English',frozen),raw);
 assert.equal(formatPrintQuantity(raw,'English + Bangla',frozen),raw);
 assert.equal(formatPrintQuantity(raw,'Bangla',frozen),'৩ বক্স ৫ পিস ১ গেজ');
 assert.equal(formatPrintQuantity('2.5 Kg','Bangla'),'২.৫ কেজি');
 assert.equal(formatPrintQuantity('2 UnknownUnit','Bangla'),'২ UnknownUnit');
 assert.equal(formatPrintQuantity('Legacy free-text amount','Bangla'),'Legacy free-text amount');
 assert.equal(formatPrintQuantity('5 Pcs','Bangla',{Pcs:''}),'৫ Pcs');
});

test('captured unit names survive later edits without altering frozen invoice lines',()=>{
 const original=freezeInvoiceUnitNames('2 Gauge');
 editPreviewProductSetting('units','Gauge',{name:'Gauge',symbol:'Gg',nameBn:'গজ গেজ'});
 assert.equal(formatPrintQuantity('2 Gauge','Bangla',original),'২ গেজ');
 assert.equal(formatPrintQuantity('2 Gauge','Bangla'),'২ গজ গেজ');
 assert.equal(unitSymbol('Gauge'),'Gg');
});

test('actual invoice HTML renders Bangla unit quantities in A4 and thermal formats',async()=>{
 const server=await createServer({server:{middlewareMode:true}});
 try{
  const {ReceiptPreview}=await server.ssrLoadModule('/src/components/brand/ReceiptPreview.tsx');
  const base={
   invoice:'INV-BN-1',customer:'Rahim',
   lines:[{name:'Pipe',nameBn:'পাইপ',qty:'3 Box 5 Pcs',unitNamesBn:{Box:'বক্স',Pcs:'পিস'},price:25,total:100}],
   subtotal:100,discount:0,rounding:0,total:100,paid:100,due:0,method:'Cash',
   branding:{name:'Shop',nameBn:'দোকান',address:'',phone:'',logo:'',showLogo:false,footer:'',
    design:{...invoiceDesignDefaults(),showSku:false,language:'Bangla'}}
  };
  for(const paper of ['A4','80 mm','58 mm'] as const){
   const html=renderToStaticMarkup(createElement(ReceiptPreview,{...base,branding:{...base.branding,design:{...base.branding.design,paper}}}));
   assert.match(html,/৩ বক্স ৫ পিস/,paper);
   assert.match(html,/পাইপ/,paper);
  }
  const english=renderToStaticMarkup(createElement(ReceiptPreview,{...base,branding:{...base.branding,design:{...base.branding.design,language:'English'}}}));
  assert.match(english,/3 Box 5 Pcs/);
  const bilingual=renderToStaticMarkup(createElement(ReceiptPreview,{...base,branding:{...base.branding,design:{...base.branding.design,language:'English + Bangla'}}}));
  assert.match(bilingual,/data-document-helper=""/);
  assert.match(bilingual,/৩ বক্স ৫ পিস/);
 }finally{await server.close();}
});
