/* eslint-env node */
/* Vendor V2 in-context cart, keyboard, mobile/dark and protected V1 route. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4298,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({args:['--no-sandbox'],executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined});
 const out=process.env.VENDOR_V2_SHOTS_DIR;
 if(out)fs.mkdirSync(out,{recursive:true});
 try{
  for(const width of [390,1440])for(const theme of ['light','dark']){
   const ctx=await browser.newContext({viewport:{width,height:width===390?844:900},colorScheme:theme,
    isMobile:width===390,hasTouch:width===390,reducedMotion:'reduce'});
   await ctx.addInitScript(t=>{localStorage.setItem('hisabiq-theme',t);localStorage.setItem('theme',t);},theme);
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:4298/#/app/vendors-v2?partyId=v1',{waitUntil:'networkidle'});
   await page.locator('[data-vendor-v2]').waitFor();
   assert.equal(await page.locator('[role=tab][aria-selected]').count(),3,'Exactly Ledger, Taken, Given tabs');
   if(out)await page.screenshot({path:path.join(out,'vendor-v2-'+width+'-'+theme+'-ledger.png'),fullPage:true,animations:'disabled'});
   await page.getByRole('button',{name:/Take Goods/}).first().click();
   const cart=page.getByRole('form',{name:'Vendor V2 take goods cart'});
   await cart.waitFor();
   const search=cart.getByRole('combobox',{name:'Search products to add to Vendor V2 cart'});
   await search.fill('LED Bulb');await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
   assert.equal(await cart.locator('[data-vendor-v2-line]').count(),1,'Product search adds an inline cart row');
   assert.equal(await cart.locator('[data-multi-quantity]').count(),1,'Use shared compound/multi-unit input');
   await cart.getByRole('textbox',{name:/Unit price for/}).fill('');
   if(out)await page.screenshot({path:path.join(out,'vendor-v2-'+width+'-'+theme+'-take-cart.png'),fullPage:true,animations:'disabled'});
   await cart.getByRole('button',{name:/Save Taken Goods/}).click();
   await page.locator('[data-vendor-v2]').waitFor();
   assert.equal(await page.getByText('Price pending',{exact:true}).count()>0,true,'Unpriced sourcing remains visible');
   await page.getByRole('button',{name:/Give Goods/}).first().click();
   const given=page.getByRole('form',{name:'Vendor V2 give goods cart'});
   await given.waitFor();
   await given.getByRole('combobox',{name:'Search products to add to Vendor V2 cart'}).fill('LED Bulb');
   await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');
   assert.equal(await given.locator('[data-vendor-v2-line]').count(),1);
   if(out)await page.screenshot({path:path.join(out,'vendor-v2-'+width+'-'+theme+'-give-cart.png'),fullPage:true,animations:'disabled'});
   await given.getByRole('button',{name:/Save Given Goods/}).click();
   const msg=await page.locator('[role=alert]').allTextContents();
   assert(!msg.some(x=>/agreed cost/i.test(x)),'V2 given memo supports cost pending');
   assert.deepEqual(errors,[],'No browser exceptions');
   await page.getByRole('button',{name:'Vendor V1'}).first().click();
   await page.waitForURL(/#\/app\/vendors(?:\?|$)/);
   await ctx.close();
  }
  console.log('Vendor V2: source-bound cart, 3 tabs, pending cost both directions, theme/mobile and V1 navigation passed.');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
