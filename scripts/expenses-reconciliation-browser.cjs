/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- GitHub Playwright test uses CommonJS. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({args:['--no-sandbox']});
  const origin = process.env.EXPENSES_RECON_URL || 'http://127.0.0.1:4311';
  let checked = 0;
  try {
    for (const width of [320,390,768,820,1024,1440]) for (const theme of ['light','dark']) {
      const ctx = await browser.newContext({
        viewport:{width,height:width===768?1024:900},colorScheme:theme,reducedMotion:'reduce',
        hasTouch:width<=768,deviceScaleFactor:1
      });
      try {
        await ctx.addInitScript(t=>{localStorage.setItem('hisabiq-theme',t);localStorage.setItem('theme',t);},theme);
        const page=await ctx.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        await page.goto(origin+'/#/app/expenses',{waitUntil:'networkidle'});
        await page.getByText(/UI preview/).first().waitFor({state:'visible'});
        const tabs=page.getByRole('tablist',{name:'Expense sections'}).getByRole('tab');
        assert.equal(await tabs.count(),4,'Expenses four original tabs retained');
        const rects=await tabs.evaluateAll(els=>els.map(el=>{const r=el.getBoundingClientRect();return {x:r.x,y:r.y,right:r.right};}));
        assert.ok(Math.max(...rects.map(x=>x.y))-Math.min(...rects.map(x=>x.y))<2,width+'px: tabs wrap');
        if(width===320)assert.ok(rects[3].right<=width-4,width+'px: Reports tab clipped');
        await tabs.nth(0).focus();
        await page.keyboard.press('ArrowRight');
        assert.equal(await tabs.nth(1).getAttribute('aria-selected'),'true','ArrowRight');
        assert.ok(await tabs.nth(1).evaluate(el=>el===document.activeElement),'focus follows tabs');
        await page.keyboard.press('End');
        assert.equal(await tabs.nth(3).getAttribute('aria-selected'),'true','End');
        await page.keyboard.press('Home');
        assert.equal(await tabs.nth(0).getAttribute('aria-selected'),'true','Home');

        const toolbar=page.locator('[data-expenses-filter-toolbar]');
        const filter=toolbar.getByRole('button',{name:/Advanced filters/});
        const exportButton=toolbar.getByRole('button',{name:'Export'});
        assert.ok(await exportButton.isVisible(),'Export remains accessible');
        const category=toolbar.getByRole('combobox',{name:'Expense category filter'});
        const status=toolbar.getByRole('combobox',{name:'Expense status filter'});
        const reset=toolbar.getByRole('button',{name:'Reset filters'});
        if(width<1024){
          assert.ok(await filter.isVisible(),'funnel toggle visible on phone/tablet');
          assert.equal(await filter.getAttribute('aria-expanded'),'false','filters start collapsed');
          assert.equal(await category.isVisible(),false,'advanced controls collapsed');
          const filterRect=await filter.boundingBox();
          const searchRect=await toolbar.getByRole('textbox').boundingBox();
          assert.ok(searchRect&&filterRect&&Math.abs(filterRect.y-searchRect.y)<2,'Search/Filter share row');
          await filter.click();
          assert.equal(await filter.getAttribute('aria-expanded'),'true','filter toggle opens');
          await category.waitFor({state:'visible'});
        } else {
          assert.equal(await filter.isVisible(),false,'desktop has no redundant toggle');
          await category.waitFor({state:'visible'});
        }
        const search=await toolbar.getByRole('textbox').boundingBox();
        const categoryBox=await category.boundingBox();
        assert.ok(search&&categoryBox,'Search/category visible');
        assert.equal(search.x<categoryBox.x+categoryBox.width&&search.x+search.width>categoryBox.x&&search.y<categoryBox.y+categoryBox.height&&search.y+search.height>categoryBox.y,false,'Search overlaps category');
        const sb=await status.boundingBox(),rb=await reset.boundingBox();
        assert.ok(sb&&rb&&Math.abs(sb.y-rb.y)<3,'Reset inline with Status');
        assert.ok(rb.width>=35&&rb.height>=35,'Reset target 36px');

        await category.click();
        await page.getByRole('option',{name:'Salary',exact:true}).click();
        assert.equal(await page.locator('tbody tr').count(),1,'Category still filters');
        if(width<1024){
          await filter.click();
          assert.equal(await category.isVisible(),false,'collapsing hides only UI');
          assert.equal(await page.locator('tbody tr').count(),1,'category value persists on collapse');
          assert.match(await filter.getAttribute('aria-label'),/1/,'active-filter indicator available');
          await filter.click();
          await category.waitFor({state:'visible'});
        }
        await reset.click();
        assert.ok((await page.locator('tbody tr').count())>=6,'Reset restores list');

        async function actions(tabLabel,pattern) {
          if(tabLabel)await page.getByRole('tab',{name:tabLabel,exact:true}).click();
          const table=page.locator('table').first();
          const scroll=table.locator('xpath=ancestor::div[contains(@class,"overflow-x-auto")][1]');
          const head=page.getByRole('columnheader',{name:'Action',exact:true});
          const trigger=page.getByRole('button',{name:pattern}).first();
          const a=await head.boundingBox(),b=await trigger.boundingBox();
          assert.ok(a&&a.x>=-1&&a.x+a.width<=width+1,'sticky Action header within initial viewport');
          assert.ok(b&&b.x>=-1&&b.x+b.width<=width+1,'36px Action trigger reachable');
          assert.ok(b.width>=35&&b.height>=35,'row Action touch size');
          if(!tabLabel){
            const ref=table.locator('tbody tr').first().locator('td').first().locator('span.font-medium').first();
            assert.ok(await ref.evaluate(el=>el.scrollWidth<=el.clientWidth+1),'reference not clipped');
          }
          const left=a.x;
          await scroll.evaluate(el=>{el.scrollLeft=el.scrollWidth;el.dispatchEvent(new Event('scroll'));});
          const moved=await head.boundingBox();
          assert.ok(moved&&Math.abs(left-moved.x)<3,'Action header stays pinned');
          await trigger.click();
          const panel=page.getByRole('dialog',{name:/Actions for/}).last();
          await panel.waitFor({state:'visible'});
          assert.ok((await panel.locator('[data-action-menu-item]').count())>=2,'modern icon-first action menu preserved');
          await page.keyboard.press('Escape');
          await panel.waitFor({state:'hidden'});
          assert.ok(await trigger.evaluate(el=>el===document.activeElement),'Escape returns focus');
        }
        await actions(null,/^Actions for EXP-/);
        await actions('Categories',/^Actions for category/);
        await actions('Payees',/^Actions for payee/);
        await page.getByRole('tab',{name:/^Expense list/}).click();

        await page.getByRole('button',{name:'Add expense',exact:true}).click();
        const dialog=page.getByRole('dialog',{name:'Add expense',exact:true});
        await dialog.waitFor({state:'visible'});
        await page.keyboard.press('Escape');
        await dialog.waitFor({state:'hidden'});
        assert.deepEqual(errors,[],'runtime browser errors');
        checked++;
        console.log('PASS Expenses '+width+'px '+theme);
      } finally { await ctx.close(); }
    }
  } finally { await browser.close(); }
  console.log('Expenses reconciliation browser: '+checked+'/12 viewport/theme checks passed');
}
main().catch(err=>{console.error(err);process.exitCode=1;});
