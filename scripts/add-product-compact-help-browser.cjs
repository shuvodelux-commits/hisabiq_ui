/* Screenshot-faithful Add Product layout: English/Bangla, phone/tablet/desktop and keyboard. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4482, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args: ['--no-sandbox'] });
  try {
    fs.mkdirSync('test-results/add-product-help', { recursive: true });
    for (const { width, height, language, scheme } of [
      { width: 320, height: 700, language: 'English', scheme: 'light' },
      { width: 390, height: 844, language: 'English', scheme: 'light' },
      { width: 390, height: 844, language: 'Bangla', scheme: 'dark' },
      { width: 768, height: 960, language: 'English + Bangla', scheme: 'dark' },
      { width: 1280, height: 900, language: 'English', scheme: 'dark' },
      { width: 1280, height: 900, language: 'English + Bangla', scheme: 'light' }
    ]) {
      const context = await browser.newContext({ viewport: { width, height }, colorScheme: scheme, hasTouch: width < 768, reducedMotion: 'reduce' });
      const errors = [], page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(({ language, scheme }) => {
        localStorage.setItem('hisabiq-erp-personal-v1', JSON.stringify({ mode: 'Simple', language, density: 'Compact', terminology: 'simple', dateView: 'transaction' }));
        localStorage.setItem('hisabiq-theme', scheme);
      }, { language, scheme });
      await page.goto('http://127.0.0.1:4482/#/app/products');
      await page.getByRole('button', { name: language === 'Bangla' ? 'নতুন পণ্য' : 'Add product', exact: true }).click();
      const editor = page.locator('[data-product-editor]');
      await editor.waitFor();
      await editor.locator('#pf-sell').waitFor();

      // The screenshot has one border above Additional settings and no section separators.
      assert.match(await editor.locator('#pf-name-label').innerText(), /\*/);
      assert.match(await editor.locator('#pf-sell-label').innerText(), /\*/);
      assert.ok(!(await editor.locator('#pf-buy-label').innerText()).includes('optional'), 'compact cost label');
      assert.equal(await editor.locator('[data-product-additional-settings]').count(), 1);
      assert.equal(await editor.locator('[data-product-settings-row]').count(), 6, 'six rows when multiple units are off');
      assert.equal(await editor.locator('#pf-units-button').getAttribute('aria-expanded'), 'false');
      assert.equal(await editor.locator('#pf-warranty-button').getAttribute('aria-expanded'), 'false');
      if (width >= 768) {
        const boxes = await Promise.all(['brand','category','unit'].map(id => editor.locator('#pf-'+id+'-label').boundingBox()));
        assert.ok(boxes.every(Boolean), 'all three labels visible');
        assert.ok(Math.abs(boxes[0].y-boxes[1].y)<2 && Math.abs(boxes[1].y-boxes[2].y)<2, 'brand category unit share one row');
      }

      const helpName = language === 'Bangla' ? 'বিক্রয় মূল্য সম্পর্কে সাহায্য' : 'Help for Selling price';
      const help = editor.getByRole('button', { name: helpName, exact: true });
      if (width < 768) await help.tap(); else await help.click();
      const popup = page.getByRole('tooltip');
      await popup.waitFor({ state: 'visible' });
      const bounds = await popup.boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1);
      await help.press('Escape'); await popup.waitFor({ state: 'hidden' });

      // Independent icon rows, one expanded at a time.
      await editor.locator('#pf-units-button').click();
      const multiHelp = editor.getByRole('button', {
        name: language === 'Bangla' ? 'একাধিক একক ব্যবহার সম্পর্কে সাহায্য' : 'Help for Use multiple units', exact: true
      });
      await multiHelp.click(); await popup.waitFor({ state: 'visible' });
      await multiHelp.press('Escape'); await popup.waitFor({ state: 'hidden' });
      assert.equal(await editor.locator('[data-product-unit-equation]').count(), 0);
      await editor.locator('#pf-multi-label').click();
      const equation = editor.locator('[data-product-unit-equation]').first();
      await equation.waitFor({ state: 'visible' });
      assert.equal((await equation.locator('.pf-unit-one').innerText()).trim(), '1');
      assert.equal((await equation.locator('.pf-unit-equals').innerText()).trim(), '=');
      const unitBox = await equation.locator('.pf-unit-select').boundingBox();
      const qtyBox = await equation.locator('.pf-unit-ratio').boundingBox();
      assert.ok(unitBox && qtyBox && unitBox.width >= 90 && qtyBox.width >= 90, 'conversion fields readable');
      if (width <= 390) assert.ok(qtyBox.y > unitBox.y, 'phone wraps equation');
      await editor.locator('#pf-warranty-button').click();
      assert.equal(await editor.locator('#pf-units-button').getAttribute('aria-expanded'), 'false');
      assert.equal(await editor.locator('#pf-warranty-button').getAttribute('aria-expanded'), 'true');
      assert.ok((await editor.locator('#pf-units-button [data-product-option-status]').innerText()).length > 0);
      const warrantyHelp = editor.getByRole('button', {
        name: language === 'Bangla' ? 'ওয়ারেন্টি সম্পর্কে সাহায্য' : 'Help for Warranty', exact: true
      });
      await warrantyHelp.click(); await popup.waitFor({ state: 'visible' });
      await warrantyHelp.press('Escape'); await popup.waitFor({ state: 'hidden' });
      await editor.locator('#pf-photos-button').click();
      assert.equal(await editor.locator('#pf-warranty-button').getAttribute('aria-expanded'), 'false');
      const photoHelp = editor.getByRole('button', {
        name: language === 'Bangla' ? 'ছবি সম্পর্কে সাহায্য' : 'Help for Photos', exact: true
      });
      await photoHelp.click(); await popup.waitFor({ state: 'visible' });
      await photoHelp.press('Escape'); await popup.waitFor({ state: 'hidden' });

      await page.screenshot({ path: `test-results/add-product-help/${width}-${language.replace(/\W/g, '-')}-${scheme}-compact.png`, fullPage: true });
      await editor.locator('#pf-name').fill('Screenshot layout regression');
      await editor.locator('#pf-buy').fill('0'); // Explicitly free stock: new required-cost rule.
      await editor.locator('#pf-sell').fill('180');
      await editor.getByRole('button', { name: language === 'Bangla' ? 'পণ্য সংরক্ষণ' : 'Save product', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('#pf-units-button')?.getAttribute('aria-expanded') === 'true');
      assert.ok(await editor.locator('[data-product-unit-equation]').first().isVisible(), 'invalid unit conversion automatically revealed');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal overflow');
      assert.deepEqual(errors, [], language + ' ' + width + ' page errors');
      await context.close();
      console.log('Screenshot Add Product layout: ' + language + ' @ ' + width + 'px (' + scheme + ') passed');
    }
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
