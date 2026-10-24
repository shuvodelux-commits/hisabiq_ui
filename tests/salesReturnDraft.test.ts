import test from 'node:test';
import assert from 'node:assert/strict';
import {returnLineKey,returnBaseQuantity,buildReturnPreview} from '../src/utils/salesReturnDraft.ts';
import type {SaleLine,SalesInvoice,SalesReturn} from '../src/types/erp.ts';

const profile={baseUnit:'Pcs',factors:{Carton:120,Box:12,Pcs:1},purchasePrices:{},sellingPrices:{}};
const line:SaleLine={id:'shared-line',productId:'p1',name:'Test tape',quantity:'2 Carton',unit:'Pcs',returnableQuantity:240,soldBaseQuantity:240,unitSnapshot:profile,price:10,total:2400,netSaleTotal:2400};
const invoice=(id:string):SalesInvoice=>({id,invoice:'INV-'+id,party:'Walk-in customer',phone:'01712345678',date:'01 Oct 2026',time:'10:00 AM',items:1,total:2400,paid:2400,method:'Cash',lines:[{...line}],status:'Paid',discount:0,rounding:0,subtotal:2400,due:0,payments:[],salesperson:'Anis'});
const draft=(invoiceId:string,quantity:Record<string,string>,price?:string)=>({invoiceId,lineId:line.id,unitQuantities:quantity,serials:[],reason:'Customer return',rawReturnUnitPrice:price,aboveHistoricalReason:price&&Number(price)>10?'Compensation agreed':''});
test('multi-unit returns retain every quantity and convert using invoice-time factors',()=>{
 assert.deepEqual(returnBaseQuantity(line,{...draft('a',{Box:'1',Pcs:'5'})}),{quantity:17,issues:[]});
 assert.deepEqual(returnBaseQuantity(line,{...draft('a',{Carton:'1',Box:'2',Pcs:'6'})}),{quantity:150,issues:[]});
});
test('frozen historical profile is mandatory; never infer unit factors from edited catalog',()=>{
 assert.ok(returnBaseQuantity({...line,unitSnapshot:undefined},{...draft('a',{Box:'1',Pcs:'5'})}).issues.length);
 assert.ok(returnBaseQuantity(line,{...draft('a',{Crate:'1'})}).issues.length);
});
test('source-linked invoice IDs prevent duplicate line-id price and quantity collision',()=>{
 const a=invoice('a'),b=invoice('b');
 assert.notEqual(returnLineKey(a.id,line.id),returnLineKey(b.id,line.id));
 const result=buildReturnPreview({invoiceIds:['a','b'],lines:[draft('a',{Box:'1',Pcs:'5'},'12'),draft('b',{Pcs:'5'},'9')],invoices:[a,b],returns:[],settlement:'Cash refund'});
 assert.deepEqual(result.issues,[]);
 assert.equal(result.lines.length,2);
 assert.equal(result.lines[0].quantity,17);
 assert.equal(result.lines[1].quantity,5);
 assert.equal(result.historicalPaisa,22000);
 assert.equal(result.agreedPaisa,24900);
 assert.equal(result.compensationPaisa,3400);
 assert.equal(result.negativeAdjustmentPaisa,-500);
});
test('over-return after partial prior return is rejected using remaining base quantity',()=>{
 const a=invoice('a');
 const previous:SalesReturn={id:'ret-1',date:'01 Oct 2026',customer:'Walk-in customer',invoices:['INV-a'],items:'Test tape',amount:1500,settlement:'Cash refund',
 lineReturns:[{invoiceId:'a',lineId:line.id,quantity:150,amount:1500,serials:[]}]};
 const result=buildReturnPreview({invoiceIds:['a'],lines:[draft('a',{Box:'8'})],invoices:[a],returns:[previous],settlement:'Cash refund'});
 assert.ok(result.issues.length);
});

test('original invoice uniquely proves a two-level conversion without consulting the product catalog',()=>{
 const legacy={...line,unitSnapshot:undefined,quantity:'3 Box 6 Pcs',soldBaseQuantity:42,returnableQuantity:42,total:420,netSaleTotal:420};
 assert.deepEqual(returnBaseQuantity(legacy,{...draft('a',{Box:'1',Pcs:'5'})}),{quantity:17,issues:[]});
 const uncertain={...legacy,soldBaseQuantity:undefined};
 assert.ok(returnBaseQuantity(uncertain,{...draft('a',{Box:'1',Pcs:'5'})}).issues.length);
});

test('invalid or negative multi-unit draft cannot masquerade as zero and bypass validation',()=>{
 for(const amount of ['abc','-1','Infinity','1e2']){
  const result=returnBaseQuantity(line,{...draft('a',{Box:amount,Pcs:'0'})});
  assert.ok(result.issues.length,amount);
 }
 assert.deepEqual(returnBaseQuantity(line,{...draft('a',{Box:'0',Pcs:''})}),{quantity:0,issues:[]});
});
