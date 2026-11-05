/* Daybook/Audit action-menu parity for Finance, Money Accounts and Reconciliation.
 * Run against candidate Vite URL. Menu operations only: never confirm financial posting.
 */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

async function verifyMenu(page, width, route, testAction = true) {
  const trigger = page.locator('button[data-action-menu-trigger]').first();
  await expect(trigger).toBeVisible();
  const triggerBox = await trigger.boundingBox();
  assert(triggerBox &&
    triggerBox.width >= 35 && triggerBox.width <= 38 &&
    triggerBox.height >= 35 && triggerBox.height <= 38,
    route + ': compact 36px trigger');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const menu = page.locator('[data-action-menu]:visible').first();
  await expect(menu).toBeVisible();
  const dialog = page.getByRole('dialog', { name: /Actions for|কাজ/ }).first();
  await expect(dialog).toBeVisible();
  const box = await dialog.boundingBox();
  const vp = page.viewportSize();
  assert(box && vp && box.x >= -1 && box.y >= -1 &&
    box.x + box.width <= vp.width + 1 && box.y + box.height <= vp.height + 1,
    route + ': menu fully within viewport');
  const items = menu.locator('[data-action-menu-item]:not(:disabled)');
  assert(await items.count() >= 1, route + ': retained menu actions');
  const firstItem = items.first();
  await firstItem.focus();
  if (await items.count() > 1) {
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(firstItem).toBeFocused();
    await page.keyboard.press('End');
    await expect(items.last()).toBeFocused();
  }
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
  if (testAction) {
    await trigger.click();
    const openedMenu = page.locator('[data-action-menu]:visible').first();
    await openedMenu.locator('[data-action-menu-item]').first().click();
    await expect(openedMenu).toBeHidden();
    // The pre-existing details dialog opens; a menu click must never auto-post money.
    const details = page.getByRole('dialog').last();
    await expect(details).toBeVisible();
  }
  console.log('PASS action menu', route, width);
}

async function main() {
  const url = process.env.ERP_ACTION_MENU_URL || 'http://127.0.0.1:4311';
  const browser = await chromium.launch({args:['--no-sandbox']});
  const cases = [
    ...[320,390,768,1024,1440].flatMap(width => ['light','dark'].map(theme=>({width,theme,route:'/#/app/finance?tab=transactions',kind:'transactions'}))),
    {width:390,theme:'light',route:'/#/app/finance?tab=cheques',kind:'cheques'},
    {width:768,theme:'dark',route:'/#/app/finance?tab=cash',kind:'cash'},
    {width:390,theme:'dark',route:'/#/app/accounts?tab=money-accounts',kind:'accounts'},
    {width:1024,theme:'light',route:'/#/app/accounts?tab=money-accounts',kind:'accounts'},
    {width:390,theme:'light',route:'/#/app/reconciliation',kind:'reconciliation'},
    {width:1024,theme:'dark',route:'/#/app/reconciliation',kind:'reconciliation'}
  ];
  try {
    for (const item of cases) {
      const ctx = await browser.newContext({
        viewport:{width:item.width,height:item.width===320?710:900},
        colorScheme:item.theme,reducedMotion:'reduce',
        hasTouch:item.width<1024,isMobile:item.width<768
      });
      await ctx.addInitScript(({theme}) => {
        localStorage.setItem('hisabiq-theme',theme);
        localStorage.setItem('theme',theme);
        localStorage.setItem('hisabiq-erp-personal-v1',
          JSON.stringify({mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'}));
      },{theme:item.theme});
      const page = await ctx.newPage();
      const errors = [];
      page.on('pageerror',err=>errors.push(err.message));
      try {
        await page.goto(url+item.route,{waitUntil:'networkidle'});
        if(item.kind==='reconciliation') {
          await page.getByRole('tab',{name:'History'}).click();
        }
        await verifyMenu(page,item.width,item.kind);
        assert.deepEqual(errors,[],'no runtime errors: '+item.kind);
      } finally { await ctx.close(); }
    }
  } finally { await browser.close(); }
}
main().catch(err=>{console.error(err);process.exitCode=1;});
