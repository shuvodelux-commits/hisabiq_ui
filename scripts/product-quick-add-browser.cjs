/* Quick Add integration is shared by Products and Purchase. Preview-only persistence. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4181, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1370, height: 950 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  try {
    await page.goto('http://127.0.0.1:4181/#/app/products');
    await page.getByRole('button', { name: 'Add product' }).click();
    const product = page.locator('[data-slot="dialog-content"]').last();
    await product.waitFor({ state: 'visible' });

    async function quickAdd(field, value, symbol) {
      await product.getByRole('button', { name: 'Quick add ' + field.toLowerCase() }).click();
      const quick = page.locator('[data-slot="dialog-content"]').last();
      const namePlaceholder = field === 'Base unit' ? 'Unit name, e.g. Meter' :
        field === 'Larger unit' ? 'e.g. Box or Gauge' : field + ' name';
      await quick.getByPlaceholder(namePlaceholder).fill(value);
      if (symbol) await quick.getByPlaceholder('e.g. pcs, ft, m · defaults to name').fill(symbol);
      await quick.getByRole('button', { name: 'Add ' + field.toLowerCase() }).click();
      await page.getByPlaceholder(namePlaceholder).waitFor({ state: 'hidden' });
    }
    await quickAdd('Category', 'QA Components');
    await quickAdd('Brand', 'QA Manufacturer');
    await quickAdd('Base unit', 'Sample Unit', 'su');
    assert.equal(await product.getByRole('combobox', { name: 'Base unit' }).inputValue(), 'su');
    await quickAdd('Larger unit', 'Bundle', 'bdl');
    assert.equal(await product.getByRole('combobox', { name: 'Larger unit' }).inputValue(), 'bdl');
    assert.equal(await product.getByRole('combobox', { name: 'Category' }).inputValue(), 'QA Components');
    assert.equal(await product.getByRole('combobox', { name: 'Brand' }).inputValue(), 'QA Manufacturer');

    const selling = product.getByRole('textbox', { name: 'Selling price', exact: true });
    const sellingUnit = product.getByRole('combobox', { name: 'Selling price unit' });
    const buying = product.getByRole('textbox', { name: 'Purchase price', exact: true });
    const buyingUnit = product.getByRole('combobox', { name: 'Purchase price unit' });
    assert.equal(await selling.locator('xpath=..').locator('select').count(), 1,
      'amount and unit must be a single connected control');
    assert.equal(await buying.locator('xpath=..').locator('select').count(), 1,
      'purchase amount and unit must share one border');

    await sellingUnit.selectOption('bdl');
    await selling.fill('160');
    await sellingUnit.selectOption('su');
    assert.equal(await selling.inputValue(), '10', 'unit switching preserves base selling price');
    await sellingUnit.selectOption('bdl');
    assert.equal(await selling.inputValue(), '160');
    await buyingUnit.selectOption('bdl');
    await buying.fill('80');
    await buyingUnit.selectOption('su');
    assert.equal(await buying.inputValue(), '5', 'unit switching preserves base purchase price');

    await product.getByPlaceholder('e.g. LED Bulb 12W').fill('QA Sample Lamp');
    await product.getByRole('button', { name: 'Save product', exact: true }).click();
    await product.waitFor({ state: 'hidden' });
    await page.getByText('QA Sample Lamp', { exact: true }).first().waitFor();
    await page.getByText('QA Manufacturer', { exact: true }).first().waitFor();

    await page.getByRole('tab', { name: /Product settings/ }).click();
    await page.getByText('QA Components', { exact: true }).first().waitFor();
    await page.getByRole('tab', { name: /Brands/ }).click();
    await page.getByText('QA Manufacturer', { exact: true }).first().waitFor();
    await page.getByRole('tab', { name: /Units/ }).click();
    await page.getByText('Sample Unit', { exact: true }).first().waitFor();
    await page.getByText('Bundle', { exact: true }).first().waitFor();

    await page.goto('http://127.0.0.1:4181/#/app/purchases/new');
    const search = page.getByRole('combobox', { name: 'Search product to add to purchase' });
    await search.fill('QA Sample Lamp');
    await page.getByRole('option', { name: /QA Sample Lamp/ }).click();
    assert.equal(await page.getByTestId('purchase-cart-row').count(), 1,
      'new product must be usable in Purchase without navigating to products again');
    assert.deepEqual(errors, []);
    console.log('Products quick add, joined price-unit controls, unit conversions and Purchase integration passed.');
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch((err) => { console.error(err); process.exitCode = 1; });
