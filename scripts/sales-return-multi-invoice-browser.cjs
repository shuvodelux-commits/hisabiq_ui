/* Functional Sales Return review: multiple phone-matched invoices and compensation ledger preview. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');

async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4869,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{
  for(const width of [390,768,1440]){
   const page=await browser.newPage({viewport:{width,height:840}});
   const failures=[];page.on('pageerror',error=>failures.push(error.message));
   await page.goto('http://127.0.0.1:4869/#/app/sales?tab=return');
   await page.evaluate(async()=>{
    const {getSalesPreviewSnapshot,updateSalesPreview}=await import('/src/data/salesPreviewStore.ts');
    const base=getSalesPreviewSnapshot().invoices.find(i=>i.id==='s240');
    if(!base)throw Error('missing sample walk-in invoice');
    const make=(id,phone)=>({...base,id,invoice:'INV-'+id,phone,
      lines:[{...base.lines[0],id:'shared-return-line',name:'Test Tape',quantity:'2',unit:'Pcs',
       soldBaseQuantity:2,returnableQuantity:2,price:50,total:100,netSaleTotal:100}],
      items:1,subtotal:100,discount:0,rounding:0,total:100,paid:100,due:0});
    updateSalesPreview('invoices',rows=>[make('WALK-A','01712345678'),make('WALK-B','+8801712345678'),...rows]);
   });
   const lookup=page.getByRole('textbox',{name:/Search invoices by number or phone/});
   await lookup.fill('INV-WALK-A');
   await page.getByRole('checkbox',{name:'Select invoice INV-WALK-A'}).check();
   await lookup.fill('');
   assert.equal(await page.getByRole('checkbox',{name:'Select invoice INV-WALK-B'}).count(),1);
   await page.getByRole('checkbox',{name:'Select invoice INV-WALK-B'}).check();
   assert.equal(await page.getByText('Test Tape',{exact:true}).count(),2);
   const inputs=page.getByRole('textbox',{name:/Return qty · Test Tape/});
   assert.equal(await inputs.count(),2);
   await inputs.nth(0).fill('1');await inputs.nth(1).fill('1');
   const prices=page.getByRole('textbox',{name:/Return price.*Test Tape/});
   assert.equal(await prices.count(),2);
   await prices.nth(0).fill('60');
   await page.getByRole('textbox',{name:/Reason for extra refund · Test Tape/}).fill('Goodwill adjustment');
   await page.getByRole('combobox',{name:'Settlement'}).click();
   await page.getByRole('option',{name:'Cash refund'}).click();
   await page.getByRole('button',{name:'Complete return'}).click();
   const review=page.getByRole('dialog',{name:'Confirm Sales Return'});
   await review.waitFor();
   assert.match(await review.innerText(),/Customer Compensation Expense/);
   await review.getByRole('button',{name:'Confirm return'}).click();
   await page.getByText('RTN-000015',{exact:true}).waitFor();
   await page.goto('http://127.0.0.1:4869/#/app/expenses');
   await page.getByText('EXP-RTN-000015',{exact:true}).waitFor();
   assert.deepEqual(failures,[]);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true);
   await page.close();
  }
 }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
