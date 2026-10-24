/* Verify visible POS-style multi-unit return quantity and conditional price reset. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4868,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try {
  for(const width of [390,768,1440]){
   const page=await browser.newPage({viewport:{width,height:840}});
   await page.goto('http://127.0.0.1:4868/#/app/sales?tab=return');
   await page.evaluate(async()=>{
    const {getSalesPreviewSnapshot,updateSalesPreview}=await import('/src/data/salesPreviewStore.ts');
    updateSalesPreview('invoices',current=>current.map(invoice=>({
     ...invoice,lines:invoice.lines.map(line=>line.id==='sl241-2'?{...line,
      quantity:'3 Box 6 Pcs',soldBaseQuantity:42,returnableQuantity:42,
      unitSnapshot:{baseUnit:'Pcs',factors:{Box:12,Pcs:1},sellingPrices:{Box:300,Pcs:25},purchasePrices:{Box:180,Pcs:15}}}:line)
    })));
   });
   await page.getByRole('checkbox').first().check();
   const box=page.getByRole('textbox',{name:/Box (return )?quantity|Quantity in Box/});
   const pcs=page.getByRole('textbox',{name:/Pcs (return )?quantity|Quantity in Pcs/});
   assert.equal(await box.count(),1,'Box input always visible');
   assert.equal(await pcs.count(),1,'Pcs input always visible');
   const price=page.getByRole('textbox',{name:/Return price for Teflon Tape|Return price.*Teflon Tape/});
   assert.equal(await price.count(),1);
   assert.equal(await price.isDisabled(),false,'price editable');
   assert.equal(await page.getByRole('button',{name:'Reset historical net price'}).count(),0);
   await box.fill('1');await pcs.fill('5');
   await price.fill('30');
   assert.equal(await page.getByRole('button',{name:'Reset historical net price'}).count(),1);
   await page.getByRole('button',{name:'Reset historical net price'}).click();
   assert.equal(await page.getByRole('button',{name:'Reset historical net price'}).count(),0);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,'no horizontal overflow');
   await page.close();
  }
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1});
