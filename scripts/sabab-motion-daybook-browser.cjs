/* Sabab source-based ERP module-entry and Daybook filter motion regression. */
'use strict';
const { chromium } = require('playwright');
const { expect } = require('playwright/test');
const assert = require('node:assert/strict');

async function sampleFrames(locator, count=12){
  return await locator.evaluate(async el => {
    const frames=[];
    for(let i=0;i<12;i++){
      await new Promise(resolve=>requestAnimationFrame(resolve));
      const cs=getComputedStyle(el);
      frames.push({opacity:Number(cs.opacity),transform:cs.transform});
    }
    return frames;
  });
}
async function main(){
  const browser=await chromium.launch({args:['--no-sandbox']});
  const url=process.env.SABAB_MOTION_URL || 'http://127.0.0.1:4311';
  try{
    for(const width of [320,390,768,1024,1440]){
      for(const theme of ['light','dark']){
        const reduced = width === 390 || width === 1024;
        const context=await browser.newContext({
          viewport:{width,height:width===320?720:900},
          colorScheme:theme,reducedMotion:reduced?'reduce':'no-preference',
          isMobile:width<768,hasTouch:width<1024
        });
        await context.addInitScript(t=>{
          localStorage.setItem('hisabiq-theme',t);
          localStorage.setItem('theme',t);
          localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
            mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'
          }));
        },theme);
        const page=await context.newPage(),errors=[];
        page.on('pageerror',e=>errors.push(e.message));
        try {
          await page.goto(url+'/#/app/daybook',{waitUntil:'networkidle'});
          const module=page.locator('[data-erp-module-motion]');
          await expect(module).toBeVisible();
          await expect(module).toHaveAttribute('data-motion-module','daybook');
          const toggle=page.getByRole('button',{name:/Advanced filters/}).first();
          const advanced=page.locator('#daybook-advanced-filters');
          if(width<1024){
            await expect(advanced).toBeHidden();
            await toggle.click();
            await expect(toggle).toHaveAttribute('aria-expanded','true');
            await expect(advanced).toBeVisible();
            const reveal=page.locator('[data-sabab-motion="reveal"]');
            await expect(reveal).toBeVisible();
            const frames=await sampleFrames(reveal);
            await page.waitForTimeout(230);
            const final=await reveal.evaluate(el=>({opacity:Number(getComputedStyle(el).opacity),transform:getComputedStyle(el).transform}));
            assert(final.opacity>0.98, 'Filter reveal settles fully visible');
            if(!reduced){
              assert(frames.some(f=>f.opacity<0.99 || f.transform!=='none' && f.transform!=='matrix(1, 0, 0, 1, 0, 0)'), 'Filter reveal has actual intermediary transform/opacity');
            }else assert(frames.every(f=>f.opacity>0.98), 'Reduced motion disables visible fade');
            const status=advanced.getByRole('combobox',{name:/Status/});
            const reset=advanced.getByRole('button',{name:/Reset filters/});
            await expect(status).toBeVisible(); await expect(reset).toBeVisible();
            await toggle.click();
            await expect(advanced).toBeHidden();
            await expect(toggle).toHaveAttribute('aria-expanded','false');
          } else {
            await expect(advanced).toBeVisible();
            await expect(page.locator('[data-sabab-motion="reveal"]')).toBeVisible();
          }
          const expectedReference=page.getByText('EXP-000062',{exact:true}).first();
          await expect(expectedReference).toBeVisible();

          // Top-level module change should recreate a Sabab entrance; search change should not.
          const keyBefore=await module.evaluate(el=>el);
          await page.evaluate(()=>{window.location.hash='#/app/sales';});
          await expect(module).toHaveAttribute('data-motion-module','sales');
          const entry=await sampleFrames(module);
          await page.waitForTimeout(320);
          const settled=await module.evaluate(el=>({opacity:Number(getComputedStyle(el).opacity),transform:getComputedStyle(el).transform}));
          assert(settled.opacity>0.98,'ERP module entrance completes');
          if(!reduced)assert(entry.some(f=>f.opacity<0.99 || f.transform!=='none' && f.transform!=='matrix(1, 0, 0, 1, 0, 0)'),
            'Sabab module entry produces real intermediate frames');
          else assert(entry.every(f=>f.opacity>0.98),'Reduced motion disables module entrance');
          // Within-module query changes must not reset a module animation or its component tree.
          const id=await module.getAttribute('data-motion-module');
          await page.evaluate(()=>{window.location.hash='#/app/sales?from=motion-test';});
          await expect(module).toHaveAttribute('data-motion-module',id);
          await page.evaluate(()=>{window.location.hash='#/app/daybook';});
          await expect(module).toHaveAttribute('data-motion-module','daybook');
          assert.deepEqual(errors,[],'No runtime exceptions at '+width+' '+theme);
          console.log('PASS Sabab Daybook and ERP motion',width,theme,reduced?'reduced':'normal');
        } finally {await context.close();}
      }
    }
  } finally { await browser.close(); }
}
main().catch(err=>{console.error(err);process.exitCode=1;});
