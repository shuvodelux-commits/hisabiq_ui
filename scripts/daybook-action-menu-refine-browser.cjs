'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

(async () => {
  const browser = await chromium.launch({args:['--no-sandbox']});
  const url = process.env.DAYBOOK_ACTION_MENU_URL || 'http://127.0.0.1:4311';
  try {
    for (const {width,theme} of [
      {width:320,theme:'light'}, {width:320,theme:'dark'},
      {width:390,theme:'light'}, {width:390,theme:'dark'},
      {width:768,theme:'light'}, {width:768,theme:'dark'},
      {width:1024,theme:'light'}, {width:1024,theme:'dark'},
      {width:1440,theme:'light'}, {width:1440,theme:'dark'},
    ]) {
      const context = await browser.newContext({
        viewport: {width,height:width===320?710:900},
        colorScheme:theme,
        reducedMotion: 'reduce',
        hasTouch: width<1024
      });
      await context.addInitScript(t => {
        localStorage.setItem('hisabiq-theme', t);
        localStorage.setItem('theme',t);
      },theme);
      const page = await context.newPage();
      const errors=[];
      page.on('pageerror', e => errors.push(e.message));
      await page.goto(url+'/#/app/daybook',{waitUntil:'networkidle'});
      await expect(page.getByRole('heading',{name:'Daybook'})).toBeVisible();
      const triggers=page.getByRole('button',{name:/Actions for /});
      assert.ok(await triggers.count()>1,'Daybook has more than one transaction row');
      const first=triggers.first();
      await first.scrollIntoViewIfNeeded();

      // Must fail on pre-refinement main: current Daybook trigger is only ~28px.
      await expect(first).toHaveAttribute('data-action-menu-trigger','');
      const size=await first.boundingBox();
      assert.ok(size && size.width>=35 && size.height>=35,'row trigger is 36px');

      await first.click();
      await expect(first).toHaveAttribute('aria-expanded','true');
      const dialog=page.getByRole('dialog',{name:/^Actions for /}).first();
      await expect(dialog).toBeVisible();
      const menu=dialog.locator('[data-action-menu]');
      await expect(menu).toBeVisible();
      const bounds=await dialog.boundingBox();
      const viewport=page.viewportSize();
      assert.ok(bounds && bounds.x>=-1 && bounds.y>=-1 &&
        bounds.x+bounds.width<=viewport.width+1 &&
        bounds.y+bounds.height<=viewport.height+1,'menu fits inside viewport');

      const items=menu.locator('[data-action-menu-item]:not(:disabled)');
      assert.ok(await items.count()>=3,'menu preserves available row commands');
      assert.equal(await menu.locator('[data-action-menu-divider]').count(),1,
        'destructive action preceded by a single divider');
      const last=items.last(), firstItem=items.first();
      await firstItem.focus();
      await page.keyboard.press('ArrowDown');
      await expect(items.nth(1)).toBeFocused();
      await page.keyboard.press('Home');
      await expect(firstItem).toBeFocused();
      await page.keyboard.press('ArrowUp');
      await expect(last).toBeFocused();
      await page.keyboard.press('Home');
      await expect(firstItem).toBeFocused();
      await page.keyboard.press('End');
      await expect(last).toBeFocused();

      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(first).toHaveAttribute('aria-expanded','false');
      await expect(first).toBeFocused();
      await first.click();
      await expect(dialog).toBeVisible();
      const second=triggers.nth(1);
      // Opening another row from the keyboard must close the previous popup.
      // A pointer cannot click through the first popup when it covers this row.
      await second.focus();
      await second.press('Enter');
      await expect(second).toHaveAttribute('aria-expanded','true');
      await expect(first).toHaveAttribute('aria-expanded','false');
      await expect(page.getByRole('dialog',{name:/^Actions for /})).toHaveCount(1);

      await page.getByRole('heading',{name:'Daybook'}).click();
      await expect(second).toHaveAttribute('aria-expanded','false');
      assert.equal(new URL(page.url()).hash.split('?')[0],'#/app/daybook','menu did not navigate or post');
      assert.deepEqual(errors,[],'no browser exceptions');
      console.log('Daybook row action menu passed',width,theme);
      await context.close();
    }
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
