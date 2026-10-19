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

    async function chooseUnit(selector, value) {
      await selector.click();
      await page.getByRole('option', { name: value, exact: true }).click();
    }
    async function selectedText(selector) { return (await selector.innerText()).trim(); }
    async function quickAdd(field, value) {
      await product.getByRole('button', { name: 'Quick add ' + field.toLowerCase() }).click();
      const quick = page.locator('[data-slot="dialog-content"]').last();
      await quick.getByPlaceholder(field + ' name').fill(value);
      await quick.getByRole('button', { name: 'Add ' + field.toLowerCase() }).click();
      await page.getByPlaceholder(field + ' name').waitFor({ state: 'hidden' });
    }
    async function addUnit(value, symbol) {
      await product.getByRole('button',{name:'Manage Units'}).click();
      await product.getByRole('textbox',{name:'New unit name'}).fill(value);
      await product.getByRole('textbox',{name:'Unit symbol'}).fill(symbol);
      await product.getByRole('button',{name:'Add',exact:true}).click();
    }
    await quickAdd('Category', 'QA Components');
    await quickAdd('Brand', 'QA Manufacturer');
    await addUnit('Sample Unit', 'su');
    await addUnit('Bundle', 'bdl');
    const largerUnit = product.getByRole('combobox',{name:'Larger unit 1 unit'});
    const smallerUnit = product.getByRole('combobox',{name:'Smaller unit 1 unit'});
    await chooseUnit(largerUnit,'bdl');
    await chooseUnit(smallerUnit,'su');
    assert.equal(await selectedText(largerUnit),'bdl');
    assert.equal(await selectedText(smallerUnit),'su');
    assert.equal(await product.getByRole('button',{name:'Add another unit'}).count(),1);
    const advanced = product.getByRole('button', { name: /Advanced/ });
    assert.equal(await advanced.getAttribute('aria-expanded'), 'false', 'advanced fields start collapsed for a simple product form');
    await advanced.click();
    assert.equal(await advanced.getAttribute('aria-expanded'), 'true');
    assert.equal(await selectedText(product.getByRole('combobox', { name: 'Category' })), 'QA Components');
    assert.equal(await selectedText(product.getByRole('combobox', { name: 'Brand' })), 'QA Manufacturer');

    const selling = product.getByRole('textbox', { name: 'Selling price', exact: true });
    const sellingUnit = product.getByRole('combobox', { name: 'Selling price unit' });
    const buying = product.getByRole('textbox', { name: 'Purchase price', exact: true });
    const buyingUnit = product.getByRole('combobox', { name: 'Purchase price unit' });
    assert.equal(await selling.locator('xpath=ancestor::*[@data-numeric-joined][1]').getByRole('combobox').count(), 1,
      'amount and unit must be a single connected control');
    assert.equal(await buying.locator('xpath=ancestor::*[@data-numeric-joined][1]').getByRole('combobox').count(), 1,
      'purchase amount and unit must share one border');

    await chooseUnit(sellingUnit, 'bdl');
    await selling.fill('160');
    await chooseUnit(sellingUnit, 'su');
    assert.equal(await selling.inputValue(), '10', 'unit switching preserves base selling price');
    await chooseUnit(sellingUnit, 'bdl');
    assert.equal(await selling.inputValue(), '160');
    await chooseUnit(buyingUnit, 'bdl');
    await buying.fill('80');
    await chooseUnit(buyingUnit, 'su');
    assert.equal(await buying.inputValue(), '5', 'unit switching preserves base purchase price');

    const opening = product.getByRole('textbox', { name: 'Opening stock', exact: true });
    const openingUnit = product.getByRole('combobox', { name: 'Opening stock unit' });
    const minimum = product.getByRole('textbox', { name: 'Minimum stock', exact: true });
    const minimumUnit = product.getByRole('combobox', { name: 'Minimum stock unit' });
    assert.equal(await opening.locator('xpath=ancestor::*[@data-numeric-joined][1]').getByRole('combobox').count(), 1,
      'opening stock amount and unit share one connected border');
    assert.equal(await minimum.locator('xpath=ancestor::*[@data-numeric-joined][1]').getByRole('combobox').count(), 1,
      'minimum stock amount and unit share one connected border');
    assert.equal(await opening.locator('xpath=ancestor::*[@data-numeric-joined][1]').getByText('৳').count(), 0,
      'stock quantity must not show a currency symbol');
    await chooseUnit(openingUnit, 'bdl');
    await opening.fill('2');
    await chooseUnit(openingUnit, 'su');
    assert.equal(await opening.inputValue(), '32', 'opening stock converts to base quantity');
    await chooseUnit(openingUnit, 'bdl');
    assert.equal(await opening.inputValue(), '2', 'opening stock restores larger unit');
    await chooseUnit(minimumUnit, 'bdl');
    await minimum.fill('0.5');
    await chooseUnit(minimumUnit, 'su');
    assert.equal(await minimum.inputValue(), '8', 'minimum stock converts to base quantity');
    await chooseUnit(minimumUnit, 'bdl');
    assert.equal(await minimum.inputValue(), '0.5', 'minimum stock restores larger unit');

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
