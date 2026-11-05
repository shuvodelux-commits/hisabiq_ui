/* Mobile Daybook: approved collapsed filters + always-reachable row actions. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const baseUrl = process.env.DAYBOOK_MOBILE_URL || 'http://127.0.0.1:4311';
  try {
    for (const width of [320,390,768,1024,1440]) for (const theme of ['light','dark']) {
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

      const search=page.getByRole('textbox',{name:/Search transaction|লেনদেন/}).first();
      const date=page.getByRole('button',{name:/Daybook date range|দৈনিক খাতার তারিখ/}).first();
      await expect(search).toBeVisible();
      await expect(date).toBeVisible();

      const toggle=page.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).first();
      const advanced=page.locator('#daybook-advanced-filters');
      if (mobile) {
        // RED on current main: mobile filters are exposed and no compact trigger exists.
        await expect(toggle).toBeVisible();
        await expect(toggle).toHaveAttribute('aria-expanded','false');
        await expect(advanced).toBeHidden();
        const size=await toggle.boundingBox();
        assert.ok(size && size.width>=35 && size.width<=45 && size.height>=35 && size.height<=45,
          'advanced filter trigger is a small square 36px control');

        // The first row's action must be usable WITHOUT sideways table scrolling.
        const action=page.getByRole('button',{name:/Actions for |কাজ /}).first();
        await action.scrollIntoViewIfNeeded();
        const bounds=await action.boundingBox();
        assert.ok(bounds && bounds.x>=0 && bounds.x+bounds.width<=width+1,
          'row action remains inside mobile viewport');
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
      console.log('Approved mobile Daybook layout:',width,theme);
      await context.close();
    }
  } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
