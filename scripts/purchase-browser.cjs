/* Purchase UI smoke test. No API/network persistence expected in this phase. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4177, strictPort: true } });
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1400, height: 950 }, reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:4177/#/app/purchases');
    await page.getByRole('button', { name: 'New purchase' }).click();
    await page.getByRole('heading', { name: /New purchase/ }).waitFor();
    assert.equal(await page.locator('[role="dialog"]').count(), 0, 'purchase editor must not be a modal');

    await page.getByRole('button', { name: 'Quick add supplier' }).click();
    const supplierDialog = page.locator('[data-slot="dialog-content"]').last();
    await supplierDialog.waitFor({ timeout: 8000 });
    await supplierDialog.getByPlaceholder('Supplier or business name').fill('Browser QA Supplier');
    await supplierDialog.getByPlaceholder('01XXXXXXXXX').fill('01700000123');
    await supplierDialog.getByRole('button', { name: 'Add supplier' }).click();
    await supplierDialog.waitFor({ state: 'hidden' });
    await page.getByRole('combobox', { name: 'Supplier' }).selectOption({ label: 'Browser QA Supplier' });

    await page.getByRole('button', { name: 'New product' }).click();
    const productDialog = page.locator('[data-slot="dialog-content"]').last();
    await productDialog.waitFor();
    await productDialog.getByRole('button', { name: 'Close', exact: true }).click();
    await productDialog.waitFor({ state: 'hidden' });

    assert.ok(await page.getByRole('button', { name: /^Quick add/ }).count() >= 6, 'Quick Items must be touch-friendly');
    await page.getByRole('combobox', { name: 'Search product to add to purchase' }).fill('LED Bulb 12W');
    await page.getByRole('option', { name: /LED Bulb 12W/ }).click();
    await page.getByLabel('Box quantity for LED Bulb 12W').fill('2');
    await page.getByLabel('Pcs quantity for LED Bulb 12W').fill('5');
    await page.getByLabel('Purchase cost for LED Bulb 12W').fill('1500');
    const lotSellInput = page.getByLabel('Lot selling price for LED Bulb 12W');
    if (!(await lotSellInput.isVisible())) await page.getByRole('button', { name: /Lot details for LED Bulb 12W/ }).click();
    await lotSellInput.fill('185');
    assert.equal(await page.getByTestId('purchase-cart-row').count(), 1);
    assert.equal(await page.getByTestId('purchase-cart').locator(':scope > *').last().getAttribute('data-testid'), 'purchase-add-row');
    assert.match(await page.locator('aside').last().innerText(), /3,750/);

    await page.getByRole('button', { name: /Quick add PVC Pipe/ }).first().click();
    assert.equal(await page.getByTestId('purchase-cart-row').count(), 2);
    assert.equal(await page.getByTestId('purchase-cart').locator(':scope > *').last().getAttribute('data-testid'), 'purchase-add-row');
    await page.getByRole('button', { name: 'Pay full' }).click();
    assert.match(await page.locator('aside').last().innerText(), /Supplier due/);
    await page.getByRole('button', { name: 'Complete purchase' }).click();
    await page.getByRole('heading', { name: 'Purchases', exact: true }).waitFor();
    await page.getByText('Browser QA Supplier', { exact: true }).first().waitFor();

    await page.goto('http://127.0.0.1:4177/#/app/parties');
    await page.getByText('Browser QA Supplier', { exact: true }).first().waitFor();
    await page.goto('http://127.0.0.1:4177/#/app/purchases/new');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('combobox', { name: 'Search product to add to purchase' }).waitFor();
    await page.goto('http://127.0.0.1:4177/#/app/pos');
    const posCart = page.getByTestId('pos-cart');
    const posOrder = await posCart.locator(':scope > *').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-testid')));
    assert.equal(posOrder[posOrder.length - 1], 'pos-add-row', 'POS inline search must be last');
    assert.equal(posOrder.filter((item) => item === 'pos-cart-row').length >= 1, true, 'existing sale rows remain ahead of POS search');
    assert.deepEqual(errors, []);
    console.log('Purchase full page, supplier quick-add, multi-unit cart, payment and navigation smoke test passed.');
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
