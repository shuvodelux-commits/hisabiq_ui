const { chromium } = require('playwright');
const { strict: assert } = require('node:assert');
const path=require('path');
const fs=require('fs');
async function main(){
 const { createServer }=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4199,strictPort:true},cacheDir:'.superpowers/action-menu-missing-cache'});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const shots='docs/ui-refine/erp-action-menus';
 const tested=[];
 try{
 for(const [width,mode] of [[1440,'light'],[390,'dark']]){
  const ctx=await browser.newContext({viewport:{width,height:900},colorScheme:mode,hasTouch:true,reducedMotion:'reduce'});
  const page=await ctx.newPage();
  page.on('pageerror',e=>{throw e});
  await page.goto('http://127.0.0.1:4199/#/app/products',{waitUntil:'domcontentloaded'});
  await page.locator('tbody tr').first().waitFor();
  await page.locator('tbody tr').first().getByRole('button',{name:/Actions for/}).click();
  const menu=page.locator('[data-action-menu]').last();
  const deact=menu.getByRole('button',{name:'Deactivate',exact:true});
  await deact.waitFor();
  assert.equal(await deact.getAttribute('data-tone'),'destructive');
  assert.match(await deact.getAttribute('class'),/text-danger/);
  assert.ok(await menu.locator('[data-action-menu-divider]').count());
  await page.screenshot({path:path.join(shots,`after-products-deactivate-${width}-${mode}.png`),animations:'disabled'});
  await deact.click();
  await page.locator('tbody tr').first().getByRole('button',{name:/Actions for/}).click();
  const act=page.locator('[data-action-menu]').last().getByRole('button',{name:'Activate',exact:true});
  assert.equal(await act.getAttribute('data-tone'),'neutral');
  await act.click();
  tested.push('Products deactivate/activate '+width+'/'+mode);
  await page.goto('http://127.0.0.1:4199/#/app/products?view=settings&tab=categories',{waitUntil:'domcontentloaded'});
  await page.locator('tbody tr').first().waitFor();
  const row=page.locator('tbody tr').first();
  await row.getByRole('button',{name:/Actions for/}).click();
  const smenu=page.locator('[data-action-menu]').last();
  assert.equal(await smenu.locator('[data-action-menu-item]').count(),3);
  assert.equal(await smenu.locator('[data-action-menu-item] svg').count(),3);
  assert.equal(await smenu.getByRole('button',{name:'Deactivate',exact:true}).getAttribute('data-tone'),'destructive');
  assert.equal(await smenu.getByRole('button',{name:'Delete',exact:true}).getAttribute('data-tone'),'destructive');
  assert.equal(await smenu.locator('[data-action-menu-divider]').count(),2);
  await page.screenshot({path:path.join(shots,`after-product-settings-${width}-${mode}.png`),animations:'disabled'});
  await smenu.getByRole('button',{name:'Deactivate',exact:true}).click();
  await row.getByRole('button',{name:/Actions for/}).click();
  assert.equal(await page.locator('[data-action-menu]').last().getByRole('button',{name:'Activate',exact:true}).getAttribute('data-tone'),'neutral');
  await page.keyboard.press('Escape');
  tested.push('Product Settings '+width+'/'+mode);
  for(const setting of ['units','brands']){
   await page.goto('http://127.0.0.1:4199/#/app/products?view=settings&tab='+setting,{waitUntil:'domcontentloaded'});
   await page.locator('tbody tr').first().waitFor();
   await page.locator('tbody tr').first().getByRole('button',{name:/Actions for/}).click();
   const menu=page.locator('[data-action-menu]').last();
   assert.equal(await menu.locator('[data-action-menu-item] svg').count(),3);
   assert.ok(await menu.locator('[data-tone="destructive"]').count()>=1,setting+' keeps Delete red');
   if(await menu.getByRole('button',{name:'Deactivate',exact:true}).count())
     assert.equal(await menu.getByRole('button',{name:'Deactivate',exact:true}).getAttribute('data-tone'),'destructive');
   else assert.equal(await menu.getByRole('button',{name:'Activate',exact:true}).getAttribute('data-tone'),'neutral');
   await page.keyboard.press('Escape');
   tested.push(setting+' settings '+width+'/'+mode);
  }
  if(width===390){
   for(const [route,name] of [['online-sales','Online Sales'],['quotations','Quotations']]){
    await page.goto('http://127.0.0.1:4199/#/app/'+route,{waitUntil:'domcontentloaded'});
    const triggers=page.locator('button[aria-label*="actions"],button[aria-label*="Actions"]');
    await triggers.first().waitFor();
    await triggers.first().click();
    const menu=page.locator('[data-action-menu]').last();
    await menu.waitFor();
    assert.ok((await menu.locator('[data-action-menu-item] svg').count())>0,route+' menu icon');
    await page.screenshot({path:path.join(shots,`after-${route}-mobile-dark.png`),animations:'disabled'});
    await page.keyboard.press('Escape');
    tested.push(name+' mobile menu');
   }
  }
  await ctx.close();
 }
 }finally{await browser.close();await server.close();}
 console.log('PASSED',tested.length,tested);
}
main().catch(e=>{console.error(e);process.exitCode=1});
