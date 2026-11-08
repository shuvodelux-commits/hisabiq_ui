/* Phase 1 security UI regression: the approved Magic Patterns form is preview-only.
 * Original authenticated settings behavior is preserved in auth-settings-legacy-browser.cjs
 * for Phase 2 reconnection. Do not treat this test as security-backend coverage.
 */
const { chromium } = require('playwright');
const { mkdirSync } = require('node:fs');
const assert = require('node:assert/strict');
async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host: '127.0.0.1', port: 4246, strictPort: true } });
  await server.listen();
  let browser;
  try {
    browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args: ['--no-sandbox'] });
    const page = await browser.newPage({ viewport: { width: 1365, height: 900 }, reducedMotion: 'reduce' });
    const errors = [], writes = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', req => { if (req.method() !== 'GET') writes.push(req.url()); });
    const root = 'http://127.0.0.1:4246/#';
    await page.goto(root + '/app/settings/business');
    await page.locator('[data-settings-section="security"]:visible').click();
    assert.match(page.url(), /#\/app\/settings\/security/);
    const section = page.locator('[data-settings-magic-general="security"]');
    await section.waitFor();
    await section.getByRole('heading', { name: /Account & security/ }).waitFor();
    const lock = section.getByRole('switch', { name: /Lock the screen when idle/ });
    const pin = section.getByRole('switch', { name: /Allow 6-digit PIN sign-in/ });
    const minutes = section.getByRole('spinbutton', { name: 'Lock after (minutes)' });
    const trusted = section.getByRole('spinbutton', { name: 'Trust a device for (days)' });
    assert.equal(await lock.isChecked(), false, 'Source default is a UI-only value');
    await lock.check();
    await pin.check();
    await minutes.fill('45');
    await trusted.fill('90');
    await section.getByRole('button', { name: 'Save', exact: true }).click();
    await section.getByText(/Saving to the business will be connected/).first().waitFor();
    assert.deepEqual(writes, [], 'The source preview must not POST account or device changes');
    const screenshotDir = process.env.AUTH_SCREENSHOT_DIR;
    if (screenshotDir) {
      mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({ path: screenshotDir + '/security-desktop.png', fullPage: true });
    }
    await page.reload();
    await section.waitFor();
    assert.equal(await lock.isChecked(), false, 'Preview PIN/lock settings must not persist as security credentials');
    assert.equal(await pin.isChecked(), false, 'No PIN enrollment happens in Phase 1');
    assert.equal(await minutes.inputValue(), '30', 'Unsaved preview minutes reset to the source default');
    const stored = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
    assert.ok(!stored.includes('preview-secret-pin'), 'No PIN is stored');
    for (const [width, height] of [[390,844],[320,700],[900,1000],[1365,900]]) {
      await page.setViewportSize({ width, height });
      await page.goto(root + '/app/settings/security');
      await section.waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), width + 'px security UI must not overflow');
      if (screenshotDir && width === 390) await page.screenshot({ path: screenshotDir + '/security-mobile.png', fullPage: true });
    }
    assert.deepEqual(errors, [], 'No uncaught errors on Magic security route');
    console.log('Magic Account & security UI: fields, draft-only changes, no account writes and responsive rendering passed. Original secure flow remains a Phase-2 reconnection test.');
  } finally {
    await browser?.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
