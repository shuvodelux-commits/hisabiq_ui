/* Mobile Daybook: approved collapsed filters + always-reachable row actions. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const baseUrl = process.env.DAYBOOK_MOBILE_URL || 'http://127.0.0.1:4311';
  try {
    for (const width of [320,390,768,820,1024,1440]) for (const theme of ['light','dark']) {
      const mobile = width < 1024;
      const context = await browser.newContext({
        viewport: {width, height: width===320?710:width===768?1024:900},
        colorScheme: theme, reducedMotion: 'reduce',
        hasTouch: mobile, isMobile: width<640
      });
      await context.addInitScript(t=>{
        localStorage.setItem('hisabiq-theme',t);
        localStorage.setItem('theme',t);
      },theme);
      const page = await context.newPage();
      const errors=[];
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(baseUrl+'/#/app/daybook',{waitUntil:'networkidle'});
      await expect(page.getByRole('heading',{name:'Daybook'})).toBeVisible();

      // Owner screenshot: the module Settings icon belongs after Print, not in
      // a separate leading row above the date/export/print controls.
      const printHeader=page.getByRole('button',{name:'Print',exact:true}).first();
      const moduleSettings=page.getByRole('button',{name:'Settings',exact:true});
      await expect(printHeader).toBeVisible();
      await expect(moduleSettings).toHaveCount(1);
      const settingPosition=await moduleSettings.boundingBox();
      const printPosition=await printHeader.boundingBox();
      assert.ok(settingPosition && printPosition &&
        settingPosition.x > printPosition.x + printPosition.width &&
        Math.abs(settingPosition.y-printPosition.y)<10,
        'module Settings must appear immediately after Print in the same action row');
      assert.ok(await printHeader.evaluate((el)=>
        el.parentElement?.contains(document.querySelector('button[aria-label="Settings"]')) ?? false),
        'Print and module Settings must share the same compact wrapping group');

      const search=page.getByRole('textbox',{name:/Search transaction|লেনদেন/}).first();
      const date=page.getByRole('button',{name:/Daybook date range|দৈনিক খাতার তারিখ/}).first();
      await expect(search).toBeVisible();
      await expect(date).toBeVisible();

      // Owner-approved filter-bar layout contract for each responsive tier:
      // phone search + square filter, date below; tablet Search → Date → Filter;
      // desktop Search → Date, no redundant date-mode helper text.
      await expect(page.getByText(/Transaction Date ·|Created Date ·/)).toHaveCount(0);
      const searchBox=await search.boundingBox(), dateBox=await date.boundingBox();
      assert.ok(searchBox && dateBox,'search and date have visible bounds');
      const sameLine=(a,b)=>Math.abs(a.y-b.y)<=6;
      if(width >= 1024) {
        assert.ok(sameLine(searchBox,dateBox) && searchBox.x+searchBox.width<dateBox.x,
          'desktop: Search then Date on one line without repeated helper text');
      }


      const toggle=page.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).first();
      const advanced=page.locator('#daybook-advanced-filters');
      if (mobile) {
        // RED on current main: mobile filters are exposed and no compact trigger exists.
        await expect(toggle).toBeVisible();
        await expect(toggle).toHaveAttribute('aria-expanded','false');
        await expect(advanced).toBeHidden();
        const filterBox=await toggle.boundingBox();
        assert.ok(filterBox,'square filter icon has measurable bounds');
        if(width >= 768){
          assert.ok(sameLine(searchBox,dateBox) && sameLine(dateBox,filterBox) &&
            searchBox.x+searchBox.width<=dateBox.x &&
            dateBox.x+dateBox.width<=filterBox.x,
            'tablet: Search → Date → Filter are left-to-right in one horizontal row');
        }else{
          assert.ok(sameLine(searchBox,filterBox) && dateBox.y>searchBox.y+searchBox.height,
            'phone: Search + Filter first row, Date second row');
        }
        const size=await toggle.boundingBox();
        assert.ok(size && size.width>=35 && size.width<=45 && size.height>=35 && size.height<=45,
          'advanced filter trigger is a small square 36px control');

        // The first row's action must be usable WITHOUT sideways table scrolling.
        const action=page.getByRole('button',{name:/Actions for |কাজ /}).first();
        await action.scrollIntoViewIfNeeded();
        const bounds=await action.boundingBox();
        assert.ok(bounds && bounds.x>=0 && bounds.x+bounds.width<=width+1,
          'row action remains inside mobile viewport');
        // On 320px phones the full reference is business-critical; it must not ellipsize.
        const refText=page.locator('main tbody tr').first().locator('td:visible').nth(2).locator('span').first();
        assert.ok(await refText.evaluate(el => el.scrollWidth <= el.clientWidth + 1),
          'full transaction reference must fit the compact mobile column');
        const pane=page.locator('[data-daybook-table-scroll]').first();
        assert.ok(await pane.evaluate(el=>el.scrollWidth<=el.clientWidth+2),
          'mobile Daybook rows must not require horizontal scrolling to reach actions');
        await action.click();
        await expect(page.getByRole('dialog',{name:/Actions for |কাজ /}).first()).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(action).toBeFocused();

        // Filter choices are hidden until requested, then retain their existing behavior.
        await toggle.click();
        await expect(toggle).toHaveAttribute('aria-expanded','true');
        await expect(advanced).toBeVisible();
        await expect(advanced.getByRole('combobox',{name:/Transaction type|লেনদেনের ধরন/})).toBeVisible();
        await expect(advanced.getByRole('combobox',{name:/Account|হিসাব/})).toBeVisible();
        await expect(advanced.getByRole('combobox',{name:/Posted by|যিনি লিখেছেন/})).toBeVisible();
        await expect(advanced.getByRole('combobox',{name:/Status|অবস্থা/})).toBeVisible();
        await toggle.click();
        await expect(advanced).toBeHidden();
        await expect(search).toBeVisible();
        await expect(date).toBeVisible();
      } else {
        await expect(toggle).toBeHidden();
        await expect(advanced).toBeVisible();
        await expect(page.getByRole('columnheader',{name:/Money In|টাকা এসেছে/}).first()).toBeVisible();
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),
        'no page-wide horizontal overflow');
      assert.deepEqual(errors,[],'no browser exceptions');
      console.log('Approved responsive Daybook layout:',width,theme);
      await context.close();
    }
  } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
