const { chromium } = require('playwright');
const assert = require('node:assert/strict');
async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4179, strictPort: true } });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto('http://127.0.0.1:4179/#/saas/home');
    await page.getByRole('navigation', { name: 'Control Center' }).waitFor({ timeout: 15000 });
    await page.getByText('My work', { exact: true }).first().waitFor();
    assert.equal(await page.locator('iframe').count(),0,'SaaS must be native React, not iframe');
    await page.goto('http://127.0.0.1:4179/#/saas/tenants');
    await page.getByRole('navigation', { name: 'Control Center' }).waitFor();
    await page.goto('http://127.0.0.1:4179/#/app/dashboard');
    assert.equal(await page.getByRole('navigation', { name: 'Control Center' }).count(),0,'ERP must be independent');
    assert.deepEqual(errors, [], `Browser errors: ${errors.join('; ')}`);
    process.stdout.write('Magic SaaS routes and ERP isolation smoke passed\\n');
  } finally { await browser?.close(); await server.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
