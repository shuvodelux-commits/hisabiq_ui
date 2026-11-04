/* Exact Magic Patterns Sabab navigation port: behavior and responsive acceptance. */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');

async function main() {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const errors = [];
  const url = process.env.SABAB_NAV_URL || 'http://127.0.0.1:4311';
  try {
    for (const {width, height=900, reducedMotion, theme} of [
      {width:320,reducedMotion:'reduce',theme:'light'},
      {width:320,height:375,reducedMotion:'reduce',theme:'light'},
      {width:390,reducedMotion:'no-preference',theme:'light'},
      {width:390,reducedMotion:'reduce',theme:'dark'},
      {width:768,reducedMotion:'no-preference',theme:'dark'},
      {width:1024,reducedMotion:'no-preference',theme:'light'},
      {width:1440,reducedMotion:'no-preference',theme:'light'}
    ]) {
      const context=await browser.newContext({viewport:{width,height},colorScheme:theme,
        reducedMotion,hasTouch:width<1024});
      await context.addInitScript(t=>{
        localStorage.setItem('hisabiq-theme',t);
        // Test the exact module labels in English; separate bilingual suites cover mixed display.
        localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
          mode:'Simple',language:'English',density:'Compact',terminology:'simple',dateView:'transaction'
        }));
      },theme);
      const page=await context.newPage();
      page.on('pageerror',error=>errors.push(error.message));
      await page.goto(url+'/#/app/dashboard',{waitUntil:'networkidle'});
      await expect(page.locator('main')).toBeVisible();
      if(width===320){
        const calculator=await page.getByRole('button',{name:'Calculator',exact:true}).boundingBox();
        assert.ok(calculator && calculator.y<44,
          'Calculator must remain in the first header row on short 320px phones');
      }
      if(width<=390){
        const topRow=page.locator('header.sticky > div').first();
        const box=await topRow.boundingBox();
        assert.ok(box && box.height <= (width===390?65:112),
          'Sabab top bar must remain compact before the module strip: '+width+'px, '+box?.height+'px');
      }
      if(width===390 && theme==='light'){
        const search=page.getByRole('combobox',{name:'Global search'});
        await search.fill('valve');
        const results=page.getByRole('listbox',{name:'Global search suggestions'});
        await expect(results).toBeVisible();
        const bounds=await results.boundingBox();
        assert.ok(bounds && bounds.width>=Math.min(300,width-24),
          'Mobile global search results must be wide enough to read: '+bounds?.width);
        await search.press('Escape');
        await search.fill('');
        await search.blur();
      }
      if(width>=1024){
        const desktop=page.locator('aside[data-sidebar="sidebar"]');
        const nav=desktop.locator('[data-sabab-nav-tree]');
        await expect(nav).toBeVisible();
        await expect(page.locator('[data-sabab-nav-strip]')).toBeHidden();
        await nav.getByRole('link',{name:/Sales/i}).first().click();
        await expect(page).toHaveURL(/\/app\/sales/);
        await expect(nav.getByRole('link',{name:/^Sales History/})).toBeVisible();
        await page.keyboard.press('Control+b');
        await expect(desktop).toHaveCSS('width','64px');
        await page.keyboard.press('Control+b');
        await expect(desktop).toHaveCSS('width','256px');
      } else {
        const strip=page.locator('[data-sabab-nav-strip]');
        await expect(strip).toBeVisible();
        const sales=strip.locator('li[data-module-id="sales"]');
        await sales.scrollIntoViewIfNeeded();
        await sales.getByRole('button',{name:/Sales tabs/i}).click();
        const menu=page.getByRole('menu',{name:/Sales tabs/i});
        await expect(menu).toBeVisible();
        const menuBounds=await menu.boundingBox();
        assert.ok(menuBounds && menuBounds.y+menuBounds.height<=height-6,
          'Module menu must fit short viewport: '+width+'x'+height);
        await expect(menu.getByRole('menuitem',{name:/^Sales Returns/})).toBeVisible();
        await page.keyboard.press('Escape');
        await expect(menu).toBeHidden();
        const trigger=page.getByRole('button',{name:/Open ERP navigation/i});
        await trigger.click();
        const drawer=page.getByRole('dialog',{name:/ERP navigation/i});
        await expect(drawer).toHaveAttribute('data-sabab-drawer','');
        await expect(drawer).toBeVisible();
        const rect=await drawer.boundingBox();
        assert.ok(rect && rect.width<=301,'Sabab drawer width is 300px max');
        await page.keyboard.press('Escape');
        await expect(drawer).toBeHidden();
        await expect(trigger).toBeFocused();
        assert.equal(await page.evaluate(()=>document.body.style.overflow),'','body scroll restored');
      }
      assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),
        'navigation cannot overflow horizontal viewport '+width);
      await context.close();
      console.log('Sabab navigation contract:',width,theme,reducedMotion);
    }
    assert.deepEqual(errors,[],'No browser exceptions');
  } finally { await browser.close(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
