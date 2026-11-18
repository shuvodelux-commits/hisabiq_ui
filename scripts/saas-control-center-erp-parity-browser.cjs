const { createServer } = require('vite');
const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const routes = [
  'home', 'tenants', 'subscriptions', 'invoices', 'payments', 'refunds',
  'plans', 'addons', 'offers', 'tickets', 'support', 'services', 'sms',
  'data-requests', 'knowledge', 'team', 'announcements', 'reports',
  'audit', 'settings',
];

async function main() {
  const server = await createServer({
    server: { host: '127.0.0.1', port: 4197, strictPort: true },
  });
  await server.listen();
  const browser = await chromium.launch({
    executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    headless: true,
    args: ['--no-sandbox'],
  });

  try {
    for (const width of [320, 390, 768, 1024, 1440]) {
      for (const theme of ['light', 'dark']) {
        const page = await browser.newPage({ viewport: { width, height: 900 } });
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.addInitScript(t => localStorage.setItem('hisabiq-theme', t), theme);

        await page.goto('http://127.0.0.1:4197/#/saas/home');
        await page.getByRole('heading', { name: /My work/ }).waitFor({ timeout: 15000 });
        if (width >= 1024) {
          const sidebar = page.locator('[data-saas-sidebar]');
          await sidebar.waitFor();
          assert.equal(Math.round((await sidebar.boundingBox()).width), 256,
            width + '/' + theme + ': ERP-expanded sidebar must be 256px');
          await page.getByRole('button', { name: 'Collapse Control Center sidebar' }).click();
          await page.waitForTimeout(280);
          assert.equal(Math.round((await sidebar.boundingBox()).width), 64,
            width + '/' + theme + ': collapsed sidebar must be 64px');
          await page.getByRole('button', { name: 'Expand Control Center sidebar' }).click();
          await page.waitForTimeout(280);
          assert.equal(Math.round((await sidebar.boundingBox()).width), 256);
          await page.keyboard.press('Control+b');
          await page.waitForTimeout(280);
          assert.equal(Math.round((await sidebar.boundingBox()).width), 64, 'Ctrl+B must collapse the sidebar');
          await page.keyboard.press('Control+b');
          await page.waitForTimeout(280);
          assert.equal(Math.round((await sidebar.boundingBox()).width), 256, 'Ctrl+B must expand the sidebar');
        } else {
          const open = page.getByRole('button', { name: 'Open Control Center navigation' });
          await open.waitFor();
          await open.click();
          const drawer = page.getByRole('dialog', { name: 'Control Center navigation' });
          await drawer.waitFor();
          assert.equal(await drawer.getByRole('link', { name: /Businesses/ }).count(), 1);
          const focusables = drawer.locator('a[href],button:not([disabled])');
          await focusables.first().focus();
          await page.keyboard.press('Shift+Tab');
          assert.equal(await focusables.last().evaluate(el => document.activeElement === el), true,
            'Shift+Tab should wrap to the final drawer control');
          await page.keyboard.press('Tab');
          assert.equal(await focusables.first().evaluate(el => document.activeElement === el), true,
            'Tab should wrap to the first drawer control');
          await page.keyboard.press('Escape');
          await drawer.waitFor({ state: 'hidden' });
          assert.equal(await open.evaluate(el => document.activeElement === el), true,
            width + '/' + theme + ': Escape must restore focus to navigation trigger');
          await open.click();
          await drawer.getByRole('link', { name: /Businesses/ }).click();
          await page.waitForURL('**/#/saas/tenants');
          await drawer.waitFor({ state: 'hidden' });
        }

        for (const route of routes) {
          await page.goto('http://127.0.0.1:4197/#/saas/' + route);
          await page.getByRole('navigation', { name: 'Control Center', exact: true })
            .waitFor({ timeout: 15000 });
          await page.locator('main').waitFor();
          await page.waitForTimeout(60);
          const overflow = await page.evaluate(() =>
            Math.max(0, document.documentElement.scrollWidth - innerWidth));
          assert.equal(overflow, 0, 'horizontal overflow on ' + route + ' ' + width + '/' + theme);
        }
        assert.deepEqual(errors, [], width + '/' + theme + ': pageerrors on SaaS routes');
        console.log('PASS ' + width + '/' + theme + ': navigation and ' + routes.length + ' routes');
        await page.close();
      }
    }
    const touchContext = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const touch = await touchContext.newPage();
    await touch.goto('http://127.0.0.1:4197/#/saas/home');
    await touch.getByRole('button', { name: 'Open Control Center navigation' }).tap();
    const touchDrawer = touch.getByRole('dialog', { name: 'Control Center navigation' });
    await touchDrawer.waitFor();
    await touchDrawer.getByRole('link', { name: /Businesses/ }).tap();
    await touchDrawer.waitFor({ state: 'hidden' });
    assert.equal(new URL(touch.url()).hash, '#/saas/tenants');
    await touchContext.close();
    console.log('PASS: SaaS shell ERP parity, keyboard trap, touch drawer, and route matrix');
  } finally {
    await browser.close();
    await server.close();
  }
}

main().catch(e => { console.error(e); process.exitCode = 1; });
