/* Shared Sabab motion UI contract: standard selects, calendars, switches and date segment.
 * Real browser / no financial posting.
 */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

async function main(){
  const browser=await chromium.launch({args:['--no-sandbox']});
  const origin=process.env.SABAB_CONTROLS_URL||'http://127.0.0.1:4311';
  const cases=[
    {width:320,theme:'light',reduce:false},
    {width:390,theme:'dark',reduce:true},
    {width:768,theme:'dark',reduce:false},
    {width:1024,theme:'light',reduce:true},
    {width:1440,theme:'light',reduce:false}
  ];
  try {
    for(const c of cases){
      const context=await browser.newContext({
        viewport:{width:c.width,height:900},
        colorScheme:c.theme,reducedMotion:c.reduce?'reduce':'no-preference',
        isMobile:c.width<768,hasTouch:c.width<1024
      });
      await context.addInitScript(t=>{
        localStorage.setItem('hisabiq-theme',t);
        localStorage.setItem('theme',t);
        localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
          mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'
        }));
      },c.theme);
      const page=await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      try{
        await page.goto(origin+'/#/app/daybook',{waitUntil:'networkidle'});
        const segment=page.getByRole('radiogroup',{name:'Date basis'});
        await expect(segment).toBeVisible();
        const created=segment.getByRole('radio',{name:'Created Date'});
        await created.click();
        await expect(created).toHaveAttribute('aria-checked','true');
        await expect(created.locator('[data-sabab-segmented-thumb]')).toBeVisible();
        await segment.getByRole('radio',{name:'Transaction Date'}).click();
        await expect(segment.getByRole('radio',{name:'Transaction Date'})).toHaveAttribute('aria-checked','true');

        if(c.width<1024){
          const filter=page.getByRole('button',{name:/Advanced filters/}).first();
          await filter.click();
          await expect(page.locator('#daybook-advanced-filters')).toBeVisible();
        }
        const select=page.getByRole('combobox',{name:/Account/}).first();
        await select.click();
        const list=page.locator('[data-sabab-select-motion="menu"]:visible');
        await expect(list).toBeVisible();
        const box=await list.boundingBox();
        assert(box&&box.x>=-1&&box.x+box.width<=c.width+1,'Dropdown remains inside viewport');
        assert(await list.getAttribute('role')==='listbox','Dropdown preserves listbox semantics');
        await select.press('Escape');
        await expect(list).toBeHidden();
        await expect(select).toBeFocused();

        const date=page.getByRole('button',{name:/Date range|Daybook date/}).first();
        if(await date.count()){
          await date.click();
          const calendar=page.locator('[data-sabab-select-motion="calendar"]:visible');
          await expect(calendar).toBeVisible();
          await expect(calendar.getByRole('button',{name:/Cancel/})).toBeVisible();
          await calendar.getByRole('button',{name:/Cancel/}).click();
          await expect(calendar).toBeHidden();
        }

        await page.goto(origin+'/#/app/settings/invoices',{waitUntil:'networkidle'});
        const toggle=page.locator('[data-sabab-switch] input:visible').first();
        // The switch input is visually hidden for accessibility: inspect the visible label instead.
        const switchLabel=page.locator('[data-sabab-switch]:visible').first();
        await expect(switchLabel).toBeVisible();
        const input=switchLabel.locator('input[type="checkbox"]').first();
        const before=await input.isChecked();
        await switchLabel.click();
        await expect(input).toBeChecked({checked:!before});
        await expect(switchLabel.locator('[data-sabab-switch-thumb]')).toBeVisible();
        await switchLabel.click();
        await expect(input).toBeChecked({checked:before});
        assert.deepEqual(errors,[],'No runtime errors at '+c.width+' '+c.theme);
        console.log('PASS Sabab shared controls',c.width,c.theme,c.reduce?'reduced':'normal');
      }finally{await context.close();}
    }
  }finally{await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
