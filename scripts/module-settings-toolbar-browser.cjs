const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({
    server: { host: '127.0.0.1', port: 4241, strictPort: true },
  });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({
      executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage({
      viewport: { width: 1365, height: 860 },
      reducedMotion: 'reduce',
    });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    const base = 'http://127.0.0.1:4241/#';

    await page.goto(base + '/app/products');
    const settings = page.getByRole('button', { name: 'Settings', exact: true });
    const exportButton = page.getByRole('button', { name: 'Export', exact: true });
    await settings.waitFor();
    await exportButton.waitFor();

    const s = await settings.boundingBox();
    const e = await exportButton.boundingBox();
    assert.ok(s && e, 'Both Settings and Export must be visible');
    assert.ok(Math.abs((s.y + s.height / 2) - (e.y + e.height / 2)) < 6,
      'Products Settings and Export must be on the same toolbar row');
    assert.ok(s.x < e.x, 'Settings precedes Export');

    await settings.click();
    const back = page.getByRole('button', { name: /Back to Products/ });
    await back.waitFor();
    await back.click();
    await exportButton.waitFor();

    await page.goto(base + '/app/pos');
    await page.getByRole('button', { name: 'Settings', exact: true }).waitFor();
    await page.setViewportSize({ width: 390, height: 844 });
    const posSettings = page.getByRole('button', { name: 'Settings', exact: true });
    assert.ok(await posSettings.isVisible(), 'POS Settings remains visible on mobile');

    await posSettings.click();
    await page.getByRole('button', { name: /Back to POS/ }).waitFor();
    assert.deepEqual(pageErrors, [], 'No browser runtime errors');
    console.log('Module Settings inline toolbar, Settings navigation, and POS mobile entry passed.');
  } finally {
    await browser?.close();
    await server.close();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
