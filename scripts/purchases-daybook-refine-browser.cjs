/* Purchases list: owner-approved Daybook responsive filter/action regression. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

const baseUrl = process.env.PURCHASES_DAYBOOK_URL || 'http://127.0.0.1:4311';
const widths = [320,390,768,820,1024,1440];
const themes = ['light','dark'];
const nearby = (a,b,tolerance=5)=>Math.abs(a-b)<=tolerance;

async function main(){
  const browser=await chromium.launch({args:['--no-sandbox']});
  let checked=0;
  try{
    for(const width of widths)for(const theme of themes){
      const context=await browser.newContext({
        viewport:{width,height:width===320?710:width===768?1024:900},
        colorScheme:theme,reducedMotion:'reduce',
        hasTouch:width<1024,isMobile:width<640,
      });
      await context.addInitScript(value=>{
        localStorage.setItem('hisabiq-theme',value);
        localStorage.setItem('theme',value);
      },theme);
      const page=await context.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      try{
        await page.goto(baseUrl+'/#/app/purchases',{waitUntil:'networkidle'});
        await expect(page.getByRole('heading',{name:'Purchases',exact:true})).toBeVisible();
        const search=page.getByRole('textbox',{name:/Search purchases|ক্রয়.*খুঁজ/}).first();
        await expect(search).toBeVisible();
        const toggle=page.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).first();
        const advanced=page.locator('#purchase-list-advanced-filters');
        const searchBox=await search.boundingBox();
        assert.ok(searchBox,'search control must render');

        if(width<1024){
          await expect(toggle).toBeVisible();
          await expect(toggle).toHaveAttribute('aria-expanded','false');
          await expect(advanced).toBeHidden();
          assert.equal(await page.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).count(),1,
            'only one responsive Filter trigger is present');
          const filterBox=await toggle.boundingBox();
          assert.ok(filterBox && nearby(searchBox.y,filterBox.y),
            'Search and square Filter share a single row on phone/tablet');
          assert.ok(filterBox.width>=35&&filterBox.width<=38&&filterBox.height>=35&&filterBox.height<=38,
            'Filter control must be 36px square');
          await search.focus();
          await page.keyboard.press('Tab');
          await expect(toggle).toBeFocused();
          await toggle.click();
          await expect(toggle).toHaveAttribute('aria-expanded','true');
          await expect(advanced).toBeVisible();
        }else{
          await expect(toggle).toBeHidden();
          await expect(advanced).toHaveCSS('display','contents');
        }

        const supplier=advanced.getByRole('combobox',{name:/Purchase supplier filter|সরবরাহকারী/}).first();
        const status=advanced.getByRole('combobox',{name:/Purchase status filter|অবস্থা/}).first();
        const reset=advanced.getByRole('button',{name:/Reset filters|ফিল্টার মুছুন/}).first();
        await expect(supplier).toBeVisible();
        await expect(status).toBeVisible();
        await expect(reset).toBeVisible();
        const statusBox=await status.boundingBox();
        const resetBox=await reset.boundingBox();
        assert.ok(statusBox&&resetBox&&nearby(statusBox.y,resetBox.y),
          'Status and compact Reset must share a row');
        assert.ok(resetBox.width>=35&&resetBox.width<=38,
          'Reset is a 36px icon control, not a full-width button');

        if(width>=1024){
          const supplierBox=await supplier.boundingBox();
          assert.ok(supplierBox&&nearby(searchBox.y,supplierBox.y)&&nearby(searchBox.y,statusBox.y),
            'desktop Search, Supplier, Status and Reset share one compact toolbar');
        }
        await status.click();
        await page.getByRole('option',{name:/^Due$|^বাকি$/}).click();
        await expect(status).toHaveAttribute('data-value','Due');
        if(width<1024){
          await toggle.click();
          await expect(advanced).toBeHidden();
          await expect(toggle).toHaveAttribute('aria-expanded','false');
          assert.equal(await toggle.getAttribute('data-active-filters'),'true',
            'hidden active filters remain indicated');
          await toggle.click();
          await expect(status).toHaveAttribute('data-value','Due');
        }
        await reset.click();
        await expect(status).toHaveAttribute('data-value','All status');
        await expect(search).toHaveValue('');

        const table=page.locator('[data-purchases-table]');
        await expect(table).toBeVisible();
        const wrapper=table.locator('..');
        await wrapper.evaluate(node=>{node.scrollLeft=0;});
        const firstAction=page.getByRole('button',{name:/Actions for|কাজ/}).first();
        await firstAction.evaluate(el=>{
          window.scrollTo({top:Math.max(0,el.getBoundingClientRect().top+window.scrollY-230)});
        });
        await expect(firstAction).toBeVisible();
        const actionBox=await firstAction.boundingBox();
        assert.ok(actionBox&&actionBox.x>=0&&actionBox.x+actionBox.width<=width+1,
          'first Purchase row action is visible without horizontal scrolling');
        assert.ok(actionBox.width>=35&&actionBox.width<=38,
          'row action uses the same 36px control as Daybook');
        if(width<768){
          const amount=table.locator('tbody tr').first().locator('td').nth(4).locator('span.whitespace-nowrap').first();
          const amountBox=await amount.boundingBox();
          assert.ok(amountBox&&amountBox.x+amountBox.width<=actionBox.x-2,
            'full mobile purchase total must not be clipped behind the pinned Action cell');
          const due=table.locator('tbody tr').first().locator('td').nth(4).locator('[data-table-helper]').first();
          const dueBox=await due.boundingBox();
          assert.ok(dueBox&&dueBox.x+dueBox.width<=actionBox.x-2,
            'full mobile supplier due must fit before the Action cell');
        }
        if(width<1024){
          const filterBox=await toggle.boundingBox();
          assert.ok(filterBox&&Math.abs(filterBox.x+filterBox.width-actionBox.x-actionBox.width)<=6,
            'Filter and pinned row action right edges align');
        }
        await firstAction.click();
        const dialog=page.getByRole('dialog',{name:/Actions for|কাজ/}).first();
        await expect(dialog).toBeVisible();
        await expect(dialog.getByRole('button',{name:/View bill|বিল দেখুন/})).toBeVisible();
        await expect(dialog.getByRole('button',{name:/Review return|ফেরত যাচাই/})).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(dialog).toBeHidden();
        await expect(firstAction).toBeFocused();

        const fullRef=table.locator('tbody tr').first().locator('td').first().locator('span').first();
        assert.ok(await fullRef.evaluate(el=>el.scrollWidth<=el.clientWidth+1),
          'purchase reference is readable without ellipsis');
        assert.deepEqual(errors,[], 'no runtime JS errors');
        checked++;
      }finally{await context.close();}
    }
  }finally{await browser.close();}
  console.log('Purchases Daybook responsive/interaction scenarios passed: '+checked+'/'+(widths.length*themes.length));
}
main().catch(error=>{console.error(error);process.exitCode=1;});
