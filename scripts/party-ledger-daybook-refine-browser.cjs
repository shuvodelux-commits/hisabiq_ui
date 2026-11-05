/* Party Ledger — Daybook-approved responsive controls and source-safe row actions.
 * Uses real Customer source rows, no mocked financial posting.
 */
'use strict';
const assert=require('node:assert/strict');
const {chromium}=require('playwright');
const {expect}=require('playwright/test');

const base=process.env.PARTY_LEDGER_DAYBOOK_URL||'http://127.0.0.1:4311';
const widths=[320,390,768,820,1024,1440];
const themes=['light','dark'];
const sameRow=(a,b)=>Math.abs(a.y-b.y)<=6;
const bounds=locator=>locator.boundingBox();

async function main(){
 const browser=await chromium.launch({args:['--no-sandbox']});
 let checked=0;
 try{
  for(const width of widths)for(const theme of themes){
   const context=await browser.newContext({
    viewport:{width,height:width===320?720:width===768?1024:900},
    colorScheme:theme,reducedMotion:'reduce',
    hasTouch:width<1024,isMobile:width<640
   });
   await context.addInitScript(v=>{
    localStorage.setItem('hisabiq-theme',v);
    localStorage.setItem('theme',v);
   },theme);
   const page=await context.newPage();
   const errors=[];
   page.on('pageerror',err=>errors.push(err.message));
   try{
    await page.goto(base+'/#/app/parties?id=c1&role=Customer',{waitUntil:'networkidle'});
    await expect(page.getByRole('tab',{name:/Ledger|খাতা/}).first()).toBeVisible();
    const toolbar=page.locator('[data-party-ledger-toolbar]').first();
    const search=toolbar.getByRole('textbox',{name:/Search ledger transactions|খাতার লেনদেন খুঁজুন/}).first();
    const date=toolbar.getByRole('button',{name:/Party ledger date range|পক্ষের খাতার তারিখ/}).first();
    const toggle=toolbar.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).first();
    const group=toolbar.locator('#party-ledger-filters');
    await expect(search).toBeVisible();
    await expect(date).toBeVisible();
    const sb=await bounds(search),db=await bounds(date);
    assert.ok(sb&&db,'Search and Date have actual screen bounds');
    if(width<1024){
     await expect(toggle).toBeVisible();
     await expect(toggle).toHaveAttribute('aria-expanded','false');
     await expect(group).toBeHidden();
     assert.equal(await toolbar.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).count(),1,'one visible Filter control');
     const tb=await bounds(toggle);
     assert.ok(tb&&tb.width>=35&&tb.width<=38&&tb.height>=35&&tb.height<=38,'36px Filter square');
     if(width<768)assert.ok(sameRow(sb,tb)&&db.y>=sb.y+sb.height-1,
      'phone shows Search + square Filter first row, Date second');
     else assert.ok(sameRow(sb,tb)&&sameRow(sb,db)&&sb.x+sb.width<=db.x+2&&db.x+db.width<=tb.x+2,
      'tablet shows Search → Date → Filter on one row');
     await search.focus();
     await page.keyboard.press('Tab');
     if(width<768)await expect(toggle).toBeFocused();
     else await expect(date).toBeFocused();
     await page.keyboard.press('Tab');
     if(width<768)await expect(date).toBeFocused();
     else await expect(toggle).toBeFocused();
     await toggle.click();
     await expect(toggle).toHaveAttribute('aria-expanded','true');
     await expect(group).toBeVisible();
    }else{
     await expect(toggle).toBeHidden();
     assert.ok(sameRow(sb,db)&&sb.x+sb.width<=db.x+3,'desktop Search then Date');
    }
    const kind=toolbar.getByRole('combobox',{name:/Transaction type|লেনদেনের ধরন/}).first();
    const rows=toolbar.getByRole('combobox',{name:/Rows per page|প্রতি পাতায়/}).first();
    const reset=toolbar.getByRole('button',{name:/Clear filters|ফিল্টার মুছুন/}).first();
    const print=toolbar.getByRole('button',{name:/Print statement|হিসাব প্রিন্ট/}).first();
    for(const control of [kind,rows,reset,print])await expect(control).toBeVisible();
    const resetBox=await bounds(reset);
    assert.ok(resetBox&&resetBox.width>=35&&resetBox.width<=38,'Reset is 36px icon-only');
    await kind.click();
    await page.getByRole('option',{name:/^Sales$|^বিক্রি$/}).first().click();
    await expect(kind).toHaveAttribute('data-value','sale');
    if(width<1024){
     await toggle.click();
     await expect(group).toBeHidden();
     assert.equal(await toggle.getAttribute('data-active-filters'),'true',
       'applied Type remains signaled while secondary filters are hidden');
     await toggle.click();
     await expect(kind).toHaveAttribute('data-value','sale');
    }
    await reset.click();
    await expect(kind).toHaveAttribute('data-value','All types');
    await expect(search).toHaveValue('');
    await print.click();
    const statement=page.getByRole('dialog',{name:/Party ledger statement|পার্টির খাতার বিবরণ/}).first();
    await expect(statement).toBeVisible();
    await page.keyboard.press('Escape');
    if(await statement.isVisible()){
     await statement.getByRole('button',{name:/Close|বন্ধ/}).first().click();
    }
    await expect(statement).toBeHidden();

    const action=page.getByRole('button',{name:/^Actions for |^কাজ /}).first();
    await expect(action).toBeVisible();
    const desktopTable=page.locator('[data-party-ledger-table-scroll]:visible, [data-party-ledger-desktop-scroll]:visible').first();
    if(width>=768&&await desktopTable.count()){
     await desktopTable.evaluate(node=>node.scrollLeft=0);
    }
    const ab=await bounds(action);
    assert.ok(ab&&ab.x>=0&&ab.x+ab.width<=width+1,
      'Party Ledger first ⋮ is reachable without horizontal scrolling: '+JSON.stringify({width,theme,rect:ab}));
    assert.ok(ab.width>=35&&ab.width<=38&&ab.height>=35,'Daybook 36px row action');
    if(width<1024){
     const filterRect=await bounds(toggle);
     assert.ok(filterRect&&Math.abs((filterRect.x+filterRect.width)-(ab.x+ab.width))<=8,
       'Filter and rightmost row ⋮ align: '+JSON.stringify({width,theme,filterRight:filterRect?.x+filterRect?.width,actionRight:ab.x+ab.width}));
    }
    if(width>=768&&width<1024){
     const outer=page.locator('[data-party-ledger-table-scroll]').first();
     if(await outer.count()){
      const isAtStart=await outer.evaluate(node=>node.scrollLeft===0);
      assert.equal(isAtStart,true,'table remains at its original horizontal scroll position');
     }
    }
    const visibleLedger=page.locator('[data-erp-table-view]:visible, [data-party-ledger-table-scroll]:visible, [data-erp-table]:visible').first();
    if(await visibleLedger.count()){
     assert.match(await visibleLedger.innerText(),/(INV-|RCV-|PAY-|Opening balance|Sales|Payment)/i,
       'visible ledger retains real transaction references and source context');
    }
    await action.click();
    const popup=page.getByRole('dialog',{name:/Transaction actions for|লেনদেনের কাজ/}).first();
    await expect(popup).toBeVisible();
    await expect(popup.locator('[data-action-menu-item]').first()).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(popup).toBeHidden();
    await expect(action).toBeFocused();
    assert.deepEqual(errors,[],'No JavaScript errors on Party Ledger');
    checked++;
   }finally{await context.close();}
  }
 }finally{await browser.close();}
 console.log('Party Ledger Daybook responsive and action Playwright passed: '+checked+'/'+(widths.length*themes.length));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
