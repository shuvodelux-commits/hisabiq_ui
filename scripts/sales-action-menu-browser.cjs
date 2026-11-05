/* Daybook/Audit action trigger parity across all Sales action surfaces.
 * Use the same live app and demo data as the Sales refine screenshot job.
 */
'use strict';
const assert = require('node:assert/strict');
const {chromium} = require('playwright');
const {expect} = require('playwright/test');

async function checkMenu(page, width, scope, required) {
  const trigger = page.locator('[data-action-menu-trigger]:visible').first();
  await expect(trigger).toBeVisible();
  await expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  const t = await trigger.boundingBox();
  assert(t && t.width >= 35 && t.width <= 38 && t.height >= 35 && t.height <= 38,
    scope + ' must use Daybook 36px action trigger');
  assert(t.x >= -1 && t.x+t.width <= width+1, scope + ' action is inside viewport');
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const panel = page.locator('[data-floating-panel-motion="sabab"]:visible').first();
  await expect(panel).toBeVisible();
  const menu = panel.locator('[data-action-menu]');
  await expect(menu).toBeVisible();
  const bounds = await panel.boundingBox(), viewport = page.viewportSize();
  assert(bounds && viewport &&
    bounds.x >= -1 && bounds.y >= -1 &&
    bounds.x+bounds.width <= viewport.width+1 &&
    bounds.y+bounds.height <= viewport.height+1,
    scope + ' action popup must stay inside screen');
  const items = menu.locator('[data-action-menu-item]:not(:disabled)');
  assert(await items.count()>0, scope + ' menu should have usable commands');
  for(const name of required) await expect(menu.getByRole('button',{name,exact:true})).toBeVisible();
  const first = items.first();
  await first.focus();
  if(await items.count()>1){
    await page.keyboard.press('ArrowDown');
    await expect(items.nth(1)).toBeFocused();
    await page.keyboard.press('Home');
    await expect(first).toBeFocused();
    await page.keyboard.press('End');
    await expect(items.last()).toBeFocused();
  }
  await page.keyboard.press('Escape');
  await expect(panel).toHaveCount(0);
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).toBeFocused();
}

async function main(){
  const browser=await chromium.launch({args:['--no-sandbox']});
  const url=process.env.SALES_ACTION_MENU_URL||'http://127.0.0.1:4311';
  try{
    for(const width of [320,390,768,820,1024,1440]){
      for(const theme of ['light','dark']){
        const ctx=await browser.newContext({
          viewport:{width,height:width===320?710:900},
          colorScheme:theme,reducedMotion:'reduce',
          hasTouch:width<1024,isMobile:width<768
        });
        await ctx.addInitScript(t=>{
          localStorage.setItem('hisabiq-theme',t);
          localStorage.setItem('theme',t);
          localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
            mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'
          }));
        },theme);
        const page=await ctx.newPage();
        const errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        try{
          await page.goto(url+'/#/app/sales',{waitUntil:'networkidle'});
          await checkMenu(page,width,'Invoice actions',['View invoice','Edit sale','Duplicate','Return items','Print']);
          const matrix=[
            ['Return history',['View return','Print']],
            ['Customer credit',['Customer ledger']],
            ['Drafts & templates',['Edit','Duplicate','Archive']]
          ];
          for(const [tab,actions] of matrix){
            await page.getByRole('tab',{name:new RegExp('^'+tab)}).click();
            await checkMenu(page,width,tab,actions);
          }
          if(width===390||width===1024){
            const templates=page.locator('[data-action-menu-trigger]:visible');
            assert(await templates.count()>1,'Draft and template triggers must both be visible');
            const templateTrigger=templates.last();
            await expect(templateTrigger).toHaveAttribute('aria-expanded','false');
            const box=await templateTrigger.boundingBox();
            assert(box&&box.width>=35&&box.width<=38,'Template trigger 36px');
            await templateTrigger.click();
            const menu=page.locator('[data-floating-panel-motion="sabab"]:visible [data-action-menu]');
            await expect(menu.getByRole('button',{name:'Edit template'})).toBeVisible();
            await expect(menu.getByRole('button',{name:'Delete'})).toBeVisible();
            await page.keyboard.press('Escape');
            await expect(templateTrigger).toBeFocused();
          }
          assert.deepEqual(errors,[],'Sales '+width+' '+theme+' runtime errors');
          console.log('PASS Sales action popup',width,theme);
        }finally{await ctx.close();}
      }
    }
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
