/* Account security keeps the existing authenticated-action preview while
 * the modern Settings navigation is used. No PIN, device or server mutation.
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
    await page.goto(root + '/app/settings/security');
    const section = page.getByTestId('account-security-settings');
    await section.waitFor();
    await section.getByText(/Authentication UI preview/).waitFor();
    const preview = section.getByRole('switch', { name: /Preview auto-lock after 30 minutes/ });
    assert.equal(await preview.isChecked(), true);
    // The shared Switch visually wraps a screen-reader-only native input;
    // keyboard Space is the accessible action and avoids clicking through its label.
    await preview.focus();
    await page.keyboard.press('Space');
    assert.equal(await preview.isChecked(), false, 'Keyboard Space toggles the existing preview control');
    await section.getByText(/Preview: Off/).waitFor();
    await section.getByRole('button', { name: 'Preview setup' }).click();
    const modal = page.getByRole('dialog', { name: /Set a 6-digit PIN/ });
    await modal.waitFor();
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await modal.waitFor({ state: 'hidden' });
    assert.deepEqual(writes, [], 'No server PIN or device writes');
    const screenshotDir = process.env.AUTH_SCREENSHOT_DIR;
    if (screenshotDir) {
      mkdirSync(screenshotDir, { recursive: true });
      await page.screenshot({ path: screenshotDir + '/security-desktop.png', fullPage: true });
    }
    await page.reload();
    await section.waitFor();
    assert.equal(await preview.isChecked(), true, 'Preview auto-lock resets without changing actual credentials');
    const stored = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage)]));
    assert.ok(!stored.includes('preview-secret-pin'), 'No PIN is stored');
    for (const [width, height] of [[390,844],[320,700],[900,1000],[1365,900]]) {
      await page.setViewportSize({ width, height });
      await page.goto(root + '/app/settings/security');
      await section.waitFor();
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        width + 'px account security layout does not overflow');
      if (screenshotDir && width === 390) await page.screenshot({ path: screenshotDir + '/security-mobile.png', fullPage: true });
    }
    assert.deepEqual(errors, [], 'No uncaught account security errors');
    console.log('Settings security: original non-mutating PIN, lock and device preview within current navigation passed.');
  } finally {
    await browser?.close();
    await server.close();
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
