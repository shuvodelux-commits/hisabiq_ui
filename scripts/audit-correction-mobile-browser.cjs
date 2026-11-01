const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({
    server: { host: '127.0.0.1', port: 4398, strictPort: true }
  });
  await server.listen();
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox']
  });

  try {
    for (const [width, height] of [[320, 640], [390, 720], [768, 850], [1024, 850]]) {
      for (const colorScheme of ['light', 'dark']) {
        const context = await browser.newContext({ viewport: { width, height }, colorScheme, hasTouch: width < 768 });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto('http://127.0.0.1:4398/#/app/audit-ledger');
        await page.getByRole('heading', { name: 'Audit Ledger' }).waitFor();
        const source = page.locator('main tbody tr').filter({ hasText: 'INV-000239' });
        await source.getByRole('button', { name: 'Actions for INV-000239' }).click();
        await page.getByRole('button', { name: 'Correct', exact: true }).click();

        const dialog = page.getByRole('dialog', { name: 'Correct transaction' });
        const reviewButton = dialog.getByRole('button', { name: 'Review changes' });
        const rect = await reviewButton.boundingBox();
        assert.ok(rect && rect.y >= 0 && rect.y + rect.height <= height,
          `Review changes should remain in viewport on open at ${width}x${height}`);

        const account1 = dialog.getByRole('combobox', { name: 'Payment account 1' });
        const amount1 = dialog.getByRole('textbox', { name: 'Payment amount 1' });
        await account1.waitFor();
        await amount1.waitFor();
        const accountRect = await account1.boundingBox();
        assert.ok(accountRect && accountRect.width >= 120, 'Payment selector must remain usable on phones');
        const dialogRect = await dialog.boundingBox();
        assert.ok(dialogRect && accountRect.x >= dialogRect.x && accountRect.x + accountRect.width <= dialogRect.x + dialogRect.width,
          'Payment account control must stay inside the dialog');
        assert.equal(await dialog.evaluate(element => element.scrollWidth <= element.clientWidth + 1), true,
          'Correction dialog must not scroll horizontally');

        await dialog.getByRole('button', { name: 'Add', exact: true }).click();
        await dialog.getByRole('combobox', { name: 'Payment account 3' }).waitFor();
        await dialog.getByRole('button', { name: 'Remove payment 3' }).click();
        assert.equal(await dialog.getByRole('combobox', { name: 'Payment account 3' }).count(), 0,
          'Adding and removing a payment row preserves the existing rows');

        await dialog.getByRole('textbox', { name: /Reason for change/ }).fill('Mobile correction');
        await amount1.fill('3500');
        const amount2 = dialog.getByRole('textbox', { name: 'Payment amount 2' });
        await amount2.fill('2500');
        assert.equal(await amount1.inputValue(), '3500');

        const footerAfterEdit = await reviewButton.boundingBox();
        assert.ok(footerAfterEdit && footerAfterEdit.y + footerAfterEdit.height <= height,
          'review action stays visible when form inputs receive focus');

        await reviewButton.click();
        await dialog.getByRole('button', { name: 'Back' }).click();
        assert.equal(await dialog.getByRole('textbox', { name: 'Payment amount 1' }).inputValue(), '3500',
          'Back preserves unsaved correction data');
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
    console.log('Audit correction dialog mobile/desktop footer, payment rows and draft retention pass in light/dark');
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
