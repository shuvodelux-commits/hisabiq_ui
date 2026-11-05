/* Playwright regression for exact Sabab-sourced dialog entrance, no financial posting. */
'use strict';
const assert=require('node:assert/strict');
const { chromium }=require('playwright');
const { expect }=require('playwright/test');

(async()=>{
  const browser=await chromium.launch({args:['--no-sandbox']});
  const url=process.env.DIALOG_MOTION_URL||'http://127.0.0.1:4311';
  const specs=[
    {width:320,height:700,theme:'light',reduce:'reduce'},
    {width:390,height:844,theme:'light',reduce:'no-preference'},
    {width:390,height:844,theme:'dark',reduce:'reduce'},
    {width:768,height:1000,theme:'dark',reduce:'no-preference'},
    {width:1024,height:768,theme:'light',reduce:'no-preference'},
    {width:1440,height:900,theme:'light',reduce:'no-preference'}
  ];
  try{
    for(const spec of specs){
      const context=await browser.newContext({
        viewport:{width:spec.width,height:spec.height},
        colorScheme:spec.theme,
        reducedMotion:spec.reduce,
        hasTouch:spec.width<1024
      });
      await context.addInitScript(theme=>{
        localStorage.setItem('hisabiq-theme',theme);
        localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
          mode:'Simple',language:'English',density:'Compact',
          terminology:'simple',dateView:'transaction'
        }));
      },spec.theme);
      const page=await context.newPage();const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url+'/#/app/expenses',{waitUntil:'networkidle'});
      const trigger=page.getByRole('button',{name:/Add expense/i}).first();
      await expect(trigger).toBeVisible();
      await trigger.click();
      const dialog=page.getByRole('dialog',{name:/Add expense/i}).first();
      await expect(dialog).toBeVisible();
      // First red test: the current Magic Patterns entry differs from Sabab.
      await expect(dialog).toHaveAttribute('data-dialog-entry','sabab');
      await expect(dialog).toHaveAttribute('data-dialog-entry-duration',spec.reduce==='reduce'?'0':'180');
      const box=await dialog.boundingBox();
      assert.ok(box,'dialog has measurable bounding rectangle');
      assert.ok(box.x>=-1&&box.x+box.width<=spec.width+1,'dialog fits horizontally');
      assert.ok(box.y>=-1&&box.y+box.height<=spec.height+1,'dialog fits vertically');
      if(spec.reduce!=='reduce'){
        const measured=await dialog.evaluate(el=>el.getAnimations().map(a=>a.effect&&a.effect.getTiming().duration));
        assert.ok(measured.some(d=>d===180),'entrance duration is exactly 180ms');
      }
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      assert.deepEqual(errors,[],'no browser exceptions');
      await context.close();
      console.log('Sabab dialog verified:',spec.width,spec.theme,spec.reduce);
    }
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
