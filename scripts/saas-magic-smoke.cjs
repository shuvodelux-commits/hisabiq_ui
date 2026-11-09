const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
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
    await page.getByRole('heading', { name: /My work/ }).waitFor();
    assert.equal(await page.locator('iframe').count(),0,'SaaS must be native React, not iframe');
    await page.goto('http://127.0.0.1:4179/#/saas/tenants');
    await page.getByRole('navigation', { name: 'Control Center' }).waitFor();

    fs.mkdirSync('.superpowers/saas-magic', { recursive: true });
    await page.screenshot({ path: '.superpowers/saas-magic/tenants-desktop.png', fullPage: true });
    await page.getByRole('button', { name: 'Add business' }).click();
    await page.getByLabel('Business name').fill('Migration Smoke Shop');
    await page.getByLabel('Owner name').fill('Demo Owner');
    await page.getByLabel('Owner mobile').fill('01899123456');
    await page.getByLabel('District').fill('Dhaka');
    await page.getByRole('button', { name: 'Create & send invite' }).click();
    await page.getByText('Migration Smoke Shop', { exact: true }).first().waitFor({ timeout: 15000 });
    await page.screenshot({ path: '.superpowers/saas-magic/new-business.png', fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:4179/#/saas/home');
    await page.getByRole('navigation', { name: 'Control Center' }).waitFor();
    await page.screenshot({ path: '.superpowers/saas-magic/home-mobile.png', fullPage: true });
    await page.goto('http://127.0.0.1:4179/#/app/dashboard');
    assert.equal(await page.getByRole('navigation', { name: 'Control Center' }).count(),0,'ERP must be independent');
    assert.deepEqual(errors, [], `Browser errors: ${errors.join('; ')}`);
    process.stdout.write('Magic SaaS routes and ERP isolation smoke passed\\n');
  } finally { await browser?.close(); await server.close(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
