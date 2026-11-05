/* Daybook-approved Audit Ledger Filter/Reset responsive contract, real Playwright. */
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const origin = process.env.AUDIT_FILTER_URL || 'http://127.0.0.1:4311';
  try {
    for (const width of [320,390,768,820,1024,1440]) for (const theme of ['light','dark']) {
      const context = await browser.newContext({
        viewport: {width,height:width===320?710:900},
        colorScheme: theme, reducedMotion:'reduce', hasTouch:width<1024, isMobile:width<768
      });
      await context.addInitScript(t=>{
        localStorage.setItem('hisabiq-theme',t);localStorage.setItem('theme',t);
        localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
          mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'
        }));
      },theme);
      const page = await context.newPage();
      const errors=[];page.on('pageerror',e=>errors.push(e.message));
      try {
        await page.goto(origin+'/#/app/audit-ledger',{waitUntil:'networkidle'});
        const search = page.getByRole('textbox',{name:'Search audit transactions'});
        const advanced = page.locator('#audit-more-filters');
        const bar = page.locator('[data-audit-filter-bar]');
        const date = page.locator('[data-audit-date]');
        const visibleToggles = page.locator('[data-audit-filter-toggle]:visible');
        await expect(search).toBeVisible();
        await expect(date).toBeVisible();
        if(width < 1024){
          await expect(visibleToggles).toHaveCount(1);
          const toggle=visibleToggles.first();
          await expect(toggle).toHaveAttribute('aria-expanded','false');
          await expect(toggle.locator('svg.lucide-filter')).toBeVisible();
          await expect(advanced).toBeHidden();
          const tb=await toggle.boundingBox(), sb=await search.boundingBox(), db=await date.boundingBox();
          assert(tb&&sb&&db&&tb.width>=35&&tb.width<=38&&tb.height>=35&&tb.height<=38,
            'Filter is 36px on '+width);
          assert(Math.abs(sb.y-tb.y)<=7, 'Search and Filter share primary row');
          if(width<768)assert(db.y>=tb.y+tb.height-4,'Phone date is on second row');
          else assert(Math.abs(db.y-tb.y)<=7,'Tablet Search → Date → Filter in one row');
          const action=page.locator('tbody button[aria-label^="Actions for"]').first();
          await expect(action).toBeVisible();
          const ab=await action.boundingBox();
          assert(ab && ab.x>=0 && ab.x+ab.width<=width+1,'Audit Action stays inside viewport');
          assert(Math.abs((tb.x+tb.width)-(ab.x+ab.width))<=14,'Filter and Action right edges align');
          await toggle.click();
          await expect(toggle).toHaveAttribute('aria-expanded','true');
        }else{
          await expect(visibleToggles).toHaveCount(0);
        }
        await expect(advanced).toBeVisible();
        const status=advanced.getByRole('combobox',{name:'Status'});
        const reset=advanced.getByRole('button',{name:'Reset filters'});
        await expect(status).toBeVisible();
        await expect(reset).toBeVisible();
        const st=await status.boundingBox(), rb=await reset.boundingBox();
        assert(st&&rb&&Math.abs(st.y-rb.y)<=7&&rb.x>=st.x+st.width-2&&rb.width>=35&&rb.width<=38,
          'Reset icon is adjacent to Status');
        await status.click();
        await page.getByRole('option',{name:'Posted',exact:true}).click();
        await expect(status).toHaveAttribute('data-value','Posted');
        await search.fill('UNKNOWN-AUDIT-999');
        await reset.focus();await page.keyboard.press('Enter');
        await expect(search).toHaveValue('');
        await expect(status).toHaveAttribute('data-value','All status');
        if(width<1024){
          await visibleToggles.first().click();
          await expect(advanced).toBeHidden();
        }
        assert.deepEqual(errors,[],'No Audit Ledger runtime exceptions');
        console.log('PASS audit compact filters',width,theme);
      }finally {await context.close();}
    }
  }finally {await browser.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
