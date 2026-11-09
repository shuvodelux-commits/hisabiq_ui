/* Finance Loans & Owners responsive UI and interaction gate. Browser data is seeded preview data only. */
/* eslint-env node */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {chromium}=require('playwright');
async function main(){
 const {createServer}=await import('vite');
 const port=49587;
 const server=await createServer({server:{host:'127.0.0.1',port,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({args:['--no-sandbox']});
 const out=path.join('test-results','finance-loans-refine');
 fs.mkdirSync(out,{recursive:true});
 let journeys=0;
 try{
  for(const width of [320,390,768,1024,1440])for(const theme of ['light','dark']){
   const ctx=await browser.newContext({viewport:{width,height:width===768?1024:900},colorScheme:theme,hasTouch:width<=768,reducedMotion:'reduce',deviceScaleFactor:1});
   const page=await ctx.newPage(),errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   await ctx.addInitScript(value=>{
     localStorage.setItem('hisabiq-theme',value);
     localStorage.setItem('theme',value);
     localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'}));
   },theme);
   const shot=name=>path.join(out,name+'-'+width+'-'+theme+'.png');
   try{
    await page.goto('http://127.0.0.1:'+port+'/#/app/finance',{waitUntil:'networkidle'});
    await page.getByRole('heading',{name:'Finance',exact:true}).waitFor();
    assert.equal(await page.locator('[data-finance-kpi]').count(),7,'all seven Finance money and loan summary KPIs retained');
    await page.screenshot({path:shot('overview'),fullPage:true,animations:'disabled'});
    const tabs=page.getByRole('tablist',{name:'Finance sections'}).getByRole('tab');
    assert.equal(await tabs.count(),4,'Finance 4 existing sections');
    const loans=tabs.filter({hasText:'Loans & Owners'});
    await loans.click();
    assert.equal(await loans.getAttribute('aria-selected'),'true','Loans tab selected');
    assert.match(page.url(),/tab=transactions/,'Finance tab persists in URL');
    const toolbar=page.locator('[data-finance-loans-toolbar]');
    const search=toolbar.getByRole('textbox',{name:/Search finance transaction/});
    const filter=toolbar.getByRole('button',{name:/Advanced filters/});
    const advanced=toolbar.locator('#finance-loans-advanced-filters');
    const type=advanced.getByRole('combobox',{name:/Finance transaction type/});
    const reset=advanced.getByRole('button',{name:/Reset filters/});
    assert.ok(await search.isVisible(),'search always visible');
    if(width<1024){
      assert.ok(await filter.isVisible(),'compact funnel button visible');
      assert.equal(await filter.getAttribute('aria-expanded'),'false','advanced type filter initially collapsed');
      assert.equal(await type.isVisible(),false,'type filter initially hidden');
      const a=await filter.boundingBox(),q=await search.boundingBox();
      assert.ok(a&&q&&Math.abs(a.y-q.y)<3&&a.width>=35&&a.width<=38,'Search and 36px Filter aligned on one row');
      await filter.click();
      assert.equal(await filter.getAttribute('aria-expanded'),'true','advanced filter opened');
    }else{
      assert.equal(await filter.isVisible(),false,'desktop avoids redundant funnel');
    }
    await type.waitFor({state:'visible'});
    const t=await type.boundingBox(),z=await reset.boundingBox();
    assert.ok(t&&z&&Math.abs(t.y-z.y)<5&&z.width>=35&&z.width<=39,'Reset aligned beside transaction type');
    await page.screenshot({path:shot('filter-open'),animations:'disabled'});
    await type.click();
    await page.getByRole('option',{name:'Owner Credit',exact:true}).click();
    const tbody=page.locator('[data-finance-loans-table] tbody');
    assert.equal(await tbody.locator('tr').count(),1,'type filter still selects only one known preview transaction');
    assert.match(await tbody.innerText(),/FIN-000188/,'source entry remains identifiable');
    if(width<1024){
      await filter.click();
      assert.equal(await type.isVisible(),false,'collapsing does not clear value');
      assert.equal(await tbody.locator('tr').count(),1,'filtered rows persist while collapsed');
      assert.match(await filter.getAttribute('aria-label'),/1/,'active filter indicated');
      await filter.click();
    }
    await reset.click();
    assert.equal(await search.inputValue(),'','reset clears query');
    assert.equal(await type.getAttribute('data-value'),'All transaction types','reset clears type');
    assert.equal(await tbody.locator('tr').count(),5,'reset restores all five seeded rows');
    await search.fill('missing-finance-record');
    assert.ok(await page.locator('[data-finance-loans-empty]').isVisible(),'filtered empty state explains recovery');
    await reset.click();
    assert.equal(await tbody.locator('tr').count(),5,'empty search recovers via Reset');
    const table=page.locator('[data-finance-loans-table]');
    const first=tbody.locator('tr').first();
    const action=first.getByRole('button',{name:/Actions for FIN-/});
    const id=(await action.getAttribute('aria-label')).match(/FIN-\d+/)?.[0];
    assert.equal(id,'FIN-000188','first seeded transaction id retained');
    const region=table.locator('xpath=ancestor::div[contains(@class,"overflow-x-auto")][1]');
    if(await region.count())await region.evaluate(el=>{el.scrollLeft=0;});
    const actionBox=await action.boundingBox();
    assert.ok(actionBox&&actionBox.x>=-1&&actionBox.x+actionBox.width<=width+1&&actionBox.width>=35,'Action visible at scrollLeft=0');
    const identity=first.locator('[data-finance-loans-identity]');
    assert.equal(await identity.isVisible(),width<1024,'compact identity only on phone/tablet');
    if(width<1024){
      const ref=first.locator('[data-finance-loans-ref]');
      assert.equal((await ref.textContent()).trim(),id,'full transaction ID visible');
      assert.ok(await ref.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'reference not clipped');
      assert.ok(await first.locator('[data-finance-loans-status]').isVisible(),'transaction status remains visible');
    }
    if(width>=1024&&await region.count())await region.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
    const amount=await first.locator('[data-finance-loans-amount]').boundingBox();
    const button=await action.boundingBox();
    assert.ok(amount&&button&&amount.x>=-1&&amount.x+amount.width<=button.x+2,'full amount does not overlap sticky Action: '+width+' '+JSON.stringify({amount,button}));
    await page.screenshot({path:shot('transactions'),fullPage:true,animations:'disabled'});
    await action.click();
    const menu=page.getByRole('dialog',{name:/Actions for FIN-/}).last();
    await menu.waitFor({state:'visible'});
    const m=await menu.boundingBox();
    assert.ok(m&&m.x>=-1&&m.x+m.width<=width+1,'opened row menu stays in viewport');
    assert.equal(await menu.locator('[data-action-menu-item]').count(),3,'view, edit and reversal commands preserved');
    await page.screenshot({path:shot('menu-open'),animations:'disabled'});
    await page.keyboard.press('Escape');
    await menu.waitFor({state:'hidden'});
    assert.ok(await action.evaluate(el=>document.activeElement===el),'Escape restores menu trigger focus');
    await action.click();
    await menu.getByRole('button',{name:/View transaction/}).click();
    const details=page.getByRole('dialog').last();
    await details.waitFor({state:'visible'});
    assert.match(await details.innerText(),/FIN-000188/,'transaction detail shows real reference');
    await page.screenshot({path:shot('detail-open'),animations:'disabled'});
    await page.keyboard.press('Escape');
    await details.waitFor({state:'hidden'});
    assert.deepEqual(errors,[],'no runtime errors: '+width+' '+theme);
    journeys++;console.log('Finance Loans refine PASS '+width+' '+theme);
   }finally{await ctx.close();}
  }
  console.log('Finance Loans refine '+journeys+'/10 responsive journeys, '+journeys*5+' real interaction screenshots');
 }finally{await browser.close();await server.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
