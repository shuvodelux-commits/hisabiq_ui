/* Add Product compact labels: touch/keyboard help, required state and mobile layout. */
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
      const errors = [];
      const page = await context.newPage();
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

      assert.match(await editor.locator('#pf-name-label').innerText(), /\*/);
      assert.match(await editor.locator('#pf-sell-label').innerText(), /\*/);
      assert.match(await editor.locator('#pf-buy-label').innerText(), language === 'Bangla' ? /ঐচ্ছিক/ : /optional/);
      assert.match(await editor.locator('#pf-min-label').innerText(), language === 'Bangla' ? /ঐচ্ছিক/ : /optional/);
      assert.ok(!(await editor.innerText()).includes('Optional. We warn you when stock falls to this.'), 'explanation does not take a permanent row');
      assert.equal(await editor.locator('#pf-advanced-button').getAttribute('aria-expanded'), 'false');
      assert.equal(await editor.locator('#pf-other-button').getAttribute('aria-expanded'), 'false');

      const helpName = language === 'Bangla' ? 'বিক্রয় মূল্য সম্পর্কে সাহায্য' : 'Help for Selling price';
      const help = editor.getByRole('button', { name: helpName, exact: true });
      if (width < 768) await help.tap(); else await help.click();
      const tooltip = page.getByRole('tooltip');
      await tooltip.waitFor({ state: 'visible' });
      assert.match(await tooltip.innerText(), language === 'Bangla' ? /সাধারণ দাম/ : /Normal price/);
      const bounds = await tooltip.boundingBox();
      assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= width + 1, 'tooltip stays inside viewport');
      assert.equal(await editor.locator('#pf-advanced-button').getAttribute('aria-expanded'), 'false', 'tooltip does not expand advanced stock');
      await help.press('Escape');
      await tooltip.waitFor({ state: 'hidden' });

      // Advanced help stays accessible without showing permanent explanatory paragraphs.
      await editor.locator('#pf-advanced-button').click();
      const multiHelp = editor.getByRole('button', {
        name: language === 'Bangla' ? 'একাধিক একক ব্যবহার সম্পর্কে সাহায্য' : 'Help for Use multiple units',
        exact: true
      });
      await multiHelp.click();
      await page.getByRole('tooltip').waitFor({ state: 'visible' });
      await multiHelp.press('Escape');
      await page.getByRole('tooltip').waitFor({ state: 'hidden' });
      assert.ok(!(await editor.innerText()).includes('Like Carton, Box, Pcs and Feet.'), 'multi-unit examples are in help only');

      await editor.locator('#pf-other-button').click();
      const warrantyHelp = editor.getByRole('button', {
        name: language === 'Bangla' ? 'ওয়ারেন্টি সম্পর্কে সাহায্য' : 'Help for Warranty',
        exact: true
      });
      await warrantyHelp.click();
      const warrantyPopup = page.getByRole('tooltip');
      await warrantyPopup.waitFor({ state: 'visible' });
      assert.match(await warrantyPopup.innerText(), language === 'Bangla' ? /ওয়ারেন্টি পেজে/ : /Warranty page/);
      await warrantyHelp.press('Escape');
      await warrantyPopup.waitFor({ state: 'hidden' });
      assert.ok(!(await editor.innerText()).includes('No serial numbers for this product.'), 'off-state serial explanation is removed');
      const photoHelp = editor.getByRole('button', {
        name: language === 'Bangla' ? 'ছবি সম্পর্কে সাহায্য' : 'Help for Photos',
        exact: true
      });
      await photoHelp.click();
      await page.getByRole('tooltip').waitFor({ state: 'visible' });
      await photoHelp.press('Escape');
      await page.getByRole('tooltip').waitFor({ state: 'hidden' });
      assert.ok(!(await editor.innerText()).includes('Optional. Up to 4.'), 'photo instructions are on demand');

      // Keep rare settings conditional: no fields before the multi-unit switch is enabled.
      assert.equal(await editor.locator('[data-product-unit-equation]').count(), 0);
      await editor.locator('#pf-multi-label').click();
      const equation = editor.locator('[data-product-unit-equation]').first();
      await equation.waitFor({ state: 'visible' });
      assert.equal((await equation.locator('.pf-unit-one').innerText()).trim(), '1');
      assert.equal((await equation.locator('.pf-unit-equals').innerText()).trim(), '=');
      assert.equal(await equation.locator('input').count(), 1, 'existing quantity input reused');
      const unitBox = await equation.locator('.pf-unit-select').boundingBox();
      const quantityBox = await equation.locator('.pf-unit-ratio').boundingBox();
      assert.ok(unitBox && quantityBox && unitBox.width >= 95 && quantityBox.width >= 95, 'multi-unit controls remain readable');
      if (width <= 390) assert.ok(quantityBox.y > unitBox.y, 'mobile keeps the equation as two lines');
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'equation does not overflow page');

      // Configured state is a short badge on the header, even when the panel closes.
      await editor.locator('#pf-advanced-button').click();
      assert.equal(await editor.locator('#pf-advanced-button').getAttribute('aria-expanded'), 'false');
      assert.ok((await editor.locator('#pf-advanced-button [data-product-option-status]').innerText()).length > 0);
      await page.screenshot({
        path: `test-results/add-product-help/${width}-${language.replace(/\W/g, '-')}-${scheme}-collapsed.png`,
        fullPage: true
      });

      // Submitting incomplete unit ratios must reveal advanced again, never trap a hidden error.
      await editor.locator('#pf-name').fill('Progressive UX verification');
      await editor.locator('#pf-sell').fill('180');
      await editor.getByRole('button', {
        name: language === 'Bangla' ? 'পণ্য সংরক্ষণ' : 'Save product',
        exact: true
      }).click();
      await page.waitForFunction(() => document.querySelector('#pf-advanced-button')?.getAttribute('aria-expanded') === 'true');
      assert.ok(await editor.locator('[data-product-unit-equation]').first().isVisible(), 'invalid ratio revealed');
      assert.ok(await editor.locator('#pf-advanced-button').getAttribute('aria-expanded') === 'true', 'advanced reopened for error');

      await editor.locator('#pf-buy').fill('120');
      await editor.locator('#pf-sell').fill('180');
      assert.equal(await editor.locator('#pf-buy').inputValue(), '120');
      assert.equal(await editor.locator('#pf-sell').inputValue(), '180');

      await page.screenshot({ path: `test-results/add-product-help/${width}-${language.replace(/\W/g, '-')}-${scheme}.png`, fullPage: true });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'no horizontal page overflow');
      assert.deepEqual(errors, [], language + ' ' + width + ' page errors');
      await context.close();
      console.log('Compact Add Product help: ' + language + ' @ ' + width + 'px (' + scheme + ') passed');
    }
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
