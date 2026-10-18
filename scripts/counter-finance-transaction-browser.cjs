/* Counter → existing Finance transaction modal → confirm → Finance ledger.
 * Smoke across phone and desktop; the finance preview remains in memory while navigating.
 */
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

async function main() {
  const { createServer } = await import('vite');
  const port = 4473;
  const server = await createServer({ server: { host: '127.0.0.1', port, strictPort: true } });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({ args: ['--no-sandbox'] });
    for (const [width, height] of [[390, 844], [1280, 800]]) {
      const context = await browser.newContext({ viewport: { width, height }, hasTouch: width < 600 });
      try {
        const page = await context.newPage();
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        await page.goto(`http://127.0.0.1:${port}/#/app/counter`);
        const financeAction = page.getByRole('button', { name: /Finance transaction/ });
        await financeAction.waitFor({ state: 'visible' });
        assert.equal(await financeAction.getAttribute('aria-haspopup'), 'dialog');
        if (width < 600) await financeAction.tap(); else await financeAction.click();
        const modal = page.getByRole('dialog', { name: /New finance transaction/ });
        await modal.waitFor({ state: 'visible' });

        // The payment split defaults to the active Cash account and follows the amount.
        await modal.locator('input[inputmode="decimal"]').last().fill('175');
        await modal.getByRole('button', { name: 'Review transaction', exact: true }).click();
        await modal.getByText('Review finance transaction', { exact: true }).waitFor();
        await modal.getByRole('button', { name: 'Confirm finance transaction', exact: true }).click();
        await modal.waitFor({ state: 'hidden' });

        const preview = async () => page.evaluate(async () => {
          const { getFinancePreviewSnapshot } = await import('/src/data/financePreviewStore.ts');
          const snapshot = getFinancePreviewSnapshot();
          return {
            item: snapshot.transactions.find(row => row.id === 'FIN-000189'),
            cash: snapshot.accounts.find(row => row.id === 'acc-cash')?.balance
          };
        });
        const saved = await preview();
        assert.equal(saved.item?.type, 'Lender Credit');
        assert.equal(saved.item?.amount, 175);
        assert.equal(saved.cash, 48250 + 175);

        // Navigate without a page refresh; the same preview record remains visible.
        await page.evaluate(() => { window.location.hash = '/app/finance'; });
        const loansTab = page.getByRole('tab', { name: 'Loans & Owners', exact: true });
        await loansTab.waitFor({ state: 'visible' });
        await loansTab.click();
        await page.getByText('FIN-000189', { exact: true }).waitFor({ state: 'visible' });
        const afterNavigation = await preview();
        assert.equal(afterNavigation.item?.id, saved.item.id);
        assert.equal(afterNavigation.cash, saved.cash);
        assert.deepEqual(errors, [], `No page errors at ${width}px`);
        console.log(`Counter Finance transaction completed and retained at ${width}px`);
      } finally {
        await context.close();
      }
    }
  } finally {
    if (browser) await browser.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
