/* Test-first Sabab Popover → HisabIQ FloatingPanel integration. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

async function run() {
  const browser = await chromium.launch({args:['--no-sandbox']});
  const baseUrl = process.env.FLOATING_PANEL_URL || 'http://127.0.0.1:4311';
  try {
    for (const { width, theme, reducedMotion } of [
      {width:320,theme:'light',reducedMotion:'reduce'},
      {width:390,theme:'dark',reducedMotion:'reduce'},
      {width:390,theme:'light',reducedMotion:'no-preference'},
      {width:768,theme:'light',reducedMotion:'no-preference'},
      {width:1024,theme:'dark',reducedMotion:'no-preference'},
      {width:1440,theme:'light',reducedMotion:'no-preference'}
    ]) {
      const ctx = await browser.newContext({
        viewport:{width,height:width===320?710:900},
        colorScheme:theme,reducedMotion,hasTouch:width<=768
      });
      const errors=[];
      const page=await ctx.newPage();
      page.on('pageerror',e=>errors.push(e.message));
      await ctx.addInitScript(value=>{
        localStorage.setItem('hisabiq-theme',value);
        localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
          mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'
        }));
      },theme);
      await page.goto(baseUrl+'/#/app/dashboard',{waitUntil:'networkidle'});
      const appearance=page.getByRole('button',{name:/^Appearance:/});
      const calculator=page.getByRole('button',{name:'Calculator',exact:true});
      await appearance.click();
      const appearancePanel=page.getByRole('dialog',{name:'Appearance',exact:true});
      await expect(appearancePanel).toBeVisible();
      // Must fail on unrefined main: the Sabab motion contract is not yet present.
      await expect(appearancePanel).toHaveAttribute('data-floating-panel-motion','sabab');
      await expect(appearancePanel).toHaveAttribute('data-reduced-motion',reducedMotion==='reduce'?'true':'false');
      const box=await appearancePanel.boundingBox();
      assert.ok(box && box.x>=-1 && box.x+box.width<=width+1,'Popover within viewport');
      assert.ok(box.y>=-1 && box.y+box.height<=page.viewportSize().height+1,'Popover vertically clamped');

      // Keyboard opening another panel emits no outside mousedown: exactly one can remain.
      await calculator.focus();
      await page.keyboard.press('Enter');
      const calculatorPanel=page.getByRole('dialog',{name:'Calculator',exact:true});
      await expect(calculatorPanel).toBeVisible();
      await expect(appearancePanel).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(calculatorPanel).toHaveCount(0);
      await expect(calculator).toBeFocused();
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),'No horizontal overflow');
      assert.deepEqual(errors,[],'No console errors');

      // Route changes must not leave old global popovers over the new workspace.
      await appearance.click();
      await expect(appearancePanel).toBeVisible();
      await page.evaluate(()=>{ location.hash='#/app/products'; });
      await page.waitForURL(/#\/app\/products/);
      await expect(appearancePanel).toHaveCount(0);
      console.log('Floating panel passed',width,theme,reducedMotion);
      await ctx.close();
    }
  } finally {await browser.close();}
}
run().catch(error=>{console.error(error);process.exitCode=1;});
