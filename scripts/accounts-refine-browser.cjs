/* Accounts UI refinement: mobile voucher reachability, source fidelity and open interactions. */
/* eslint-env node */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:49456,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({args:['--no-sandbox']});
 const folder=path.join(process.cwd(),'test-results','accounts-refine');
 fs.mkdirSync(folder,{recursive:true});
 let verified=0;
 try{
  for(const width of [320,390,768,1024,1440])for(const theme of ['light','dark']){
   const ctx=await browser.newContext({viewport:{width,height:width===768?1024:900},hasTouch:width<=768,colorScheme:theme,reducedMotion:'reduce',deviceScaleFactor:1});
   await ctx.addInitScript(t=>{localStorage.setItem('hisabiq-theme',t);localStorage.setItem('theme',t);},theme);
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   const filename=kind=>path.join(folder,kind+'-'+width+'-'+theme+'.png');
   try{
    await page.goto('http://127.0.0.1:49456/#/app/accounts',{waitUntil:'networkidle'});
    await page.getByRole('heading',{name:'Accounts',exact:true}).waitFor();
    await page.screenshot({path:filename('overview'),animations:'disabled',fullPage:true});
    const recent=page.getByRole('button',{name:/^Open details for /}).first();
    const recentRef=(await recent.getAttribute('aria-label')).replace(/^Open details for /,'');
    await recent.click();
    const recentDetail=page.getByRole('dialog').filter({hasText:recentRef}).last();
    await recentDetail.waitFor({state:'visible'});
    await page.keyboard.press('Escape');
    await recentDetail.waitFor({state:'hidden'});
    // The shared Dialog asynchronously restores focus to its opener on close.
    // Wait for that real restoration before moving focus to the Accounts tablist.
    await page.waitForFunction(label=>document.activeElement?.getAttribute('aria-label')===label,
      `Open details for ${recentRef}`,{timeout:5000});
    const tabs=page.getByRole('tablist',{name:/Account sections|হিসাবের বিভাগ/}).getByRole('tab');
    assert.equal(await tabs.count(),7,'all seven visible Accounts tabs retained (Bank Entry is contextual)');
    const voucherTab=page.getByRole('tab',{name:'Vouchers',exact:true});
    await page.getByRole('tab',{name:'Overview',exact:true}).focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.activeElement?.getAttribute('data-accounts-tab') === 'money-accounts' && location.hash.includes('tab=money-accounts'),null,{timeout:6000});
    assert.equal(await page.getByRole('tab',{name:'Money Accounts'}).getAttribute('aria-selected'),'true','first ArrowRight selects the actual next tab');
    await page.keyboard.press('ArrowRight');
    await page.waitForFunction(() => document.activeElement?.getAttribute('data-accounts-tab') === 'vouchers' && location.hash.includes('tab=vouchers'),null,{timeout:6000});
    assert.ok(await voucherTab.evaluate(el=>el===document.activeElement),'ArrowRight keeps focus after tab route update');
    assert.equal(await voucherTab.getAttribute('aria-selected'),'true','Voucher tab selected');
    assert.match(page.url(),/tab=vouchers/,'tab selection survives URL state');
    const table=page.locator('table').first();
    await table.waitFor();
    const first=table.locator('tbody tr').first();
    assert.ok(await first.count(),'authentic accounting entry exists');
    const action=first.getByRole('button',{name:/^Actions for /});
    await action.waitFor();
    const refFromAction=(await action.getAttribute('aria-label')).replace(/^Actions for /,'');
    assert.ok(refFromAction.length>2,'source reference available for action');
    const compact=first.locator('[data-accounts-mobile-summary]');
    assert.equal(await compact.isVisible(),width<1024,'compact voucher identity on phone and tablet');
    if(width<1024){
      const fullRef=compact.locator('[data-accounts-mobile-ref]');
      assert.equal((await fullRef.textContent()).trim(),refFromAction,'complete reference shown without changing record');
      assert.ok(await fullRef.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'full mobile voucher reference not truncated');
      assert.ok(await first.locator('[data-accounts-mobile-status]').isVisible(),'voucher status remains visible with amount');
    }
    const region=table.locator('xpath=ancestor::div[contains(@class,"overflow-x-auto")][1]');
    if(await region.count())await region.evaluate(el=>{el.scrollLeft=0;});
    const a=await action.boundingBox();
    assert.ok(a&&a.width>=35&&a.height>=35&&a.x>=-1&&a.x+a.width<=width+1,'36px voucher action reachable without horizontal scroll: '+width);
    const amount=first.locator('[data-accounts-amount]');
    assert.ok(await amount.count(),'amount preserved');
    const amountRect=await amount.boundingBox();
    assert.ok(amountRect&&amountRect.x+amountRect.width<=a.x+2,
      'amount not hidden behind action: '+width+' / amount='+JSON.stringify(amountRect)+' / action='+JSON.stringify(a));
    await page.screenshot({path:filename('vouchers'),animations:'disabled',fullPage:true});
    await action.click();
    const menu=page.getByRole('dialog',{name:/^Actions for /}).last();
    await menu.waitFor({state:'visible'});
    const menuRect=await menu.boundingBox();
    assert.ok(menuRect&&menuRect.x>=-1&&menuRect.x+menuRect.width<=width+1,'opened menu fits viewport');
    await page.screenshot({path:filename('action-open'),animations:'disabled'});
    await page.keyboard.press('Escape');
    await menu.waitFor({state:'hidden'});
    assert.ok(await action.evaluate(el=>document.activeElement===el),'Escape returns focus to action');
    await action.click();
    await menu.getByRole('button',{name:/Open details|বিস্তারিত খুলুন/}).click();
    const details=page.getByRole('dialog').filter({hasText:refFromAction}).last();
    await details.waitFor({state:'visible'});
    await page.screenshot({path:filename('detail-open'),animations:'disabled'});
    await page.keyboard.press('Escape');
    await details.waitFor({state:'hidden'});
    assert.deepEqual(errors,[],'no page errors: '+width+'px '+theme);
    verified++;
    console.log('Accounts vouchers validated '+width+'px '+theme);
   }finally{await ctx.close();}
  }
  console.log('Accounts UI refine: '+verified+'/10 viewport/theme journeys; 40 true-state screenshots');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
