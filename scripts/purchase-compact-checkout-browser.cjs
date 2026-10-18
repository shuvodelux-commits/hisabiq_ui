const {chromium}=require('playwright');
const assert=require('node:assert/strict');

async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4289,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({
  executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']
 });
 try{
  for(const width of [390,768,1024,1440])for(const theme of ['light','dark']){
   const page=await browser.newPage({viewport:{width,height:900},colorScheme:theme,reducedMotion:'reduce'});
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4289/#/app/purchases/new');
   const panel=page.getByTestId('purchase-payment-panel');
   await panel.waitFor();
   const summary=page.getByTestId('purchase-payable-summary');
   await summary.waitFor();
   assert.equal(await panel.locator('.bg-inverse').count(),0,'No dark navy total block');
   assert.equal(await summary.locator('[data-amount-words-variant="default"]').count(),1,
    'Mint summary must use normal readable Bangla amount words');
   assert.ok(await summary.getByTestId('purchase-net-total').isVisible(),'Total is visible');
   const ratio=await summary.evaluate(node=>{
    const rect=node.getBoundingClientRect();
    const style=getComputedStyle(node);
    return {height:rect.height,width:rect.width,bg:style.backgroundColor};
   });
   assert.ok(ratio.height<150,'Mint payable summary must be compact: '+JSON.stringify(ratio));
   assert.ok(ratio.width>260,'Payable summary must remain readable at '+width);
   const payment=page.getByTestId('purchase-payment-row').first();
   const method=payment.getByRole('combobox').first();
   const account=payment.getByRole('combobox').nth(1);
   const amount=payment.getByRole('textbox',{name:'Paid amount 1'});
   const remainder=payment.getByRole('button',{name:'Remaining'});
   const boxes=await Promise.all([method,account,amount,remainder].map(x=>x.boundingBox()));
   assert.ok(boxes.every(Boolean),'All payment controls should be visible');
   if(width>=768){
    assert.ok(Math.abs(boxes[0].y-boxes[2].y)<2,
     'Desktop/tablet payment method, account and amount should share a row at '+width);
   }else{
    assert.ok(boxes[2].y>boxes[0].y+5,
     'Phone payment amount should occupy the next compact row');
    assert.ok(Math.abs(boxes[2].y-boxes[3].y)<2,'Remaining action aligns with phone amount');
   }
   await amount.fill('125.50');
   assert.equal(await amount.inputValue(),'125.50','Decimal payments must not be stripped');
   await page.keyboard.press('F8');
   assert.equal(await amount.evaluate(node=>document.activeElement===node),true,'F8 still focuses first payment');
   await panel.getByRole('button',{name:'Add',exact:true}).click();
   assert.equal(await panel.getByTestId('purchase-payment-row').count(),2,'Split payments remain available');
   await panel.getByRole('button',{name:'Remove payment 2'}).click();
   assert.equal(await panel.getByTestId('purchase-payment-row').count(),1);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),
    'No whole-page horizontal overflow at '+width+' '+theme);
   assert.deepEqual(errors,[],width+' '+theme+' runtime errors');
   await page.close();
   console.log('Purchase compact mint checkout '+width+'px '+theme+' passed');
  }
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
