const { createServer } = require('vite');
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
async function main() {
  const dir=path.resolve('.superpowers/saas-refine/interactions');
  fs.mkdirSync(dir,{recursive:true});
  const server=await createServer({server:{host:'127.0.0.1',port:4185,strictPort:true}});
  await server.listen();
  const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
  try {
    for(const width of [320,390,1440])for(const theme of ['light','dark']){
      const page=await browser.newPage({viewport:{width,height:900}});
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.addInitScript(t=>localStorage.setItem('hisabiq-theme',t),theme);
      await page.goto('http://127.0.0.1:4185/#/saas/home');
      await page.getByRole('heading',{name:/My work/}).waitFor();
      const search=page.getByRole('combobox',{name:/Search businesses/});
      await page.keyboard.press('Control+k');
      assert.equal(await search.evaluate(e=>e===document.activeElement),true,'Ctrl+K focuses SaaS search');
      await search.fill('Rahman');
      await page.locator('#cc-search-results').waitFor({state:'visible'});
      assert.match(await page.locator('#cc-search-results').innerText(),/Rahman/);
      await page.screenshot({path:path.join(dir,`search-${width}-${theme}.png`),fullPage:false});
      await page.keyboard.press('Escape');
      await page.locator('#cc-search-results').waitFor({state:'hidden'});
      const staff=page.locator('header button[aria-expanded]').first();
      await staff.click();
      await page.getByRole('listbox',{name:'View as staff member'}).waitFor();
      await page.waitForTimeout(250);
      const panel = await page.locator('header [role="dialog"]').first().boundingBox();
      assert.ok(panel && panel.x >= -1 && panel.x + panel.width <= width + 1, `Staff menu must remain inside ${width}px viewport: ${JSON.stringify(panel)}`);
      await page.screenshot({path:path.join(dir,`staff-${width}-${theme}.png`),fullPage:false});
      await page.keyboard.press('Escape');
      await page.getByRole('listbox',{name:'View as staff member'}).waitFor({state:'hidden'});
      assert.equal(await staff.evaluate(el => document.activeElement === el), true, 'Escape must return focus to staff menu trigger');
      await page.goto('http://127.0.0.1:4185/#/saas/tenants');
      await page.getByRole('navigation',{name:'Control Center'}).waitFor();
      await page.getByRole('button',{name:'Add business'}).click();
      await page.getByRole('dialog').waitFor();
      await page.waitForTimeout(250);
      await page.screenshot({path:path.join(dir,`business-dialog-${width}-${theme}.png`),fullPage:false});
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({state:'hidden'});
      const dimensions=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));
      assert.ok(dimensions.scrollWidth<=dimensions.width,`horizontal document overflow: ${JSON.stringify(dimensions)}`);
      assert.deepEqual(errors,[],`page errors at ${width}/${theme}`);
      console.log(JSON.stringify({width,theme,search:'pass',staff:'pass',dialog:'pass',errors,dimensions}));
      await page.close();
    }
  } finally {await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
