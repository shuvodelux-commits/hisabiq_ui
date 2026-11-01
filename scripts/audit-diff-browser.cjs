const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({
    server: { host: '127.0.0.1', port: 4399, strictPort: true }
  });
  await server.listen();
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || '/usr/bin/chromium',
    args: ['--no-sandbox']
  });

  try {
    for (const width of [390, 1024]) {
      for (const colorScheme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: { width, height: 900 }, colorScheme
        });
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto('http://127.0.0.1:4399/#/app/audit-ledger');
        await page.getByRole('heading', { name: 'Audit Ledger' }).waitFor();

        const row = page.locator('main tbody tr').filter({ hasText: 'INV-000239' });
        await row.getByRole('button', { name: 'Actions for INV-000239' }).click();
        await page.getByRole('button', { name: 'Correct', exact: true }).click();

        const dialog = page.getByRole('dialog', { name: 'Correct transaction' });
        await dialog.getByRole('textbox', { name: /Quantity/ }).fill('6');
        const splitInputs = dialog.getByPlaceholder('0');
        assert.equal(await splitInputs.count(), 2);
        await splitInputs.nth(0).fill('3500');
        await splitInputs.nth(1).fill('2500');
        await dialog.getByRole('textbox', { name: /Reason for change/ })
          .fill('Correct split and quantity');
        await dialog.getByRole('button', { name: 'Review changes' }).click();

        await dialog.getByText('Payment accounts', { exact: true }).waitFor();
        const preview = await dialog.innerText();
        assert.match(preview, /bKash Business · 412 · ৳4,000/);
        assert.match(preview, /Main Cash Counter · ৳2,000/);
        assert.match(preview, /bKash Business · 412 · ৳3,500/);
        assert.match(preview, /Main Cash Counter · ৳2,500/);
        assert.match(preview, /Quantity[\s\S]*Before[\s\S]*5[\s\S]*After[\s\S]*6/);
        assert.doesNotMatch(preview, /\[object Object\]|৳5\b|৳6\b/);

        await dialog.getByRole('button', { name: 'Save changes' }).click();
        await row.getByRole('button', { name: 'Actions for INV-000239' }).click();
        await page.getByRole('button', { name: 'Open', exact: true }).click();

        const detail = page.getByRole('dialog', { name: /INV-000239 Posted/ });
        await detail.getByText('Audit history').waitFor();
        const history = await detail.innerText();
        assert.match(history, /Payment accounts/);
        assert.match(history, /Before:/);
        assert.match(history, /bKash Business · 412 · ৳4,000/);
        assert.match(history, /bKash Business · 412 · ৳3,500/);
        assert.doesNotMatch(history, /\[object Object\]/);
        assert.deepEqual(errors, []);
        await context.close();
      }
    }
    console.log('Audit before/after and timeline readable at phone/desktop in light/dark');
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
