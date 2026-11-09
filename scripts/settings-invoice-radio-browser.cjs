/* Browser regression of actual Settings components; read-only is a component prop,
 * not a fabricated user/authorization fixture. No backend data is written. */
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const base = process.env.SETTINGS_BASE_URL || 'http://127.0.0.1:39953';
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const failures = [];
  const check = (ok, message) => { if (!ok) failures.push(message); };
  try {
    for (const width of [320, 390, 768, 1024, 1440]) for (const theme of ['light', 'dark']) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
      page.on('pageerror', e => console.error(e));
      const mount = async readOnly => {
        await page.route('**/__settings-radio-fixture', route => route.fulfill({ contentType: 'text/html', body: '<html><head><link rel="stylesheet" href="/src/index.css"></head><body></body></html>' }));
        await page.goto(base + '/__settings-radio-fixture', { waitUntil: 'networkidle' });
        await page.evaluate(async ({ readOnly, theme }) => {
          const { default: RefreshRuntime } = await import('/@react-refresh');
          RefreshRuntime.injectIntoGlobalHook(window);
          window.$RefreshReg$ = () => {};
          window.$RefreshSig$ = () => type => type;
          window.__vite_plugin_react_preamble_installed__ = true;
          const { default: React } = await import('/node_modules/.vite/deps/react.js');
          const { default: { createRoot } } = await import('/node_modules/.vite/deps/react-dom_client.js');
          const studioSource = await (await fetch('/src/settings/magic/invoice/InvoiceStudio.tsx')).text();
          const routerUrl = studioSource.match(/from "([^"]*react-router-dom[^"]*)"/)[1];
          const { MemoryRouter } = await import(routerUrl);
          const { InvoiceStudio } = await import('/src/settings/magic/invoice/InvoiceStudio.tsx');
          const host = document.createElement('div');
          document.body.replaceChildren(host);
          document.documentElement.classList.toggle('dark', theme === 'dark');
          createRoot(host).render(React.createElement(MemoryRouter, null, React.createElement(InvoiceStudio, { canEdit: !readOnly, onDirtyChange: () => {} })));
        }, { readOnly, theme });
        await page.locator('[data-settings-magic-invoice-studio]').waitFor();
      };
      const oneStop = async group => group.getByRole('radio').evaluateAll(nodes => nodes.filter(n => !n.disabled && n.tabIndex === 0).length === 1);
      const selected = async radio => await radio.getAttribute('aria-checked') === 'true';
      const focused = async radio => radio.evaluate(el => el === document.activeElement);
      const shot = async state => { if (process.env.SETTINGS_EVIDENCE_DIR) await page.screenshot({ path: path.join(process.env.SETTINGS_EVIDENCE_DIR, `round-3-${state}-${width}-${theme}.png`), fullPage: true }); };
      await mount(false);
      const language = page.getByRole('radiogroup', { name: 'Document language', exact: true });
      assert.ok(await oneStop(language), `${width}/${theme} language one tab stop`);
      const english = language.getByRole('radio', { name: 'Full English', exact: true });
      await english.focus(); await english.press('ArrowRight');
      const mixed = language.getByRole('radio', { name: 'English + বাংলা', exact: true });
      check(await selected(mixed) && await focused(mixed), `${width}/${theme} language arrow selects/focuses`);
      await mixed.press('End');
      const bangla = language.getByRole('radio', { name: 'সম্পূর্ণ বাংলা', exact: true });
      check(await selected(bangla) && await focused(bangla), `${width}/${theme} language End`);
      await bangla.press('ArrowRight');
      check(await selected(english) && await focused(english), `${width}/${theme} language wraps`);
      await mixed.click(); await english.focus(); await english.press('Space');
      check(await selected(english), `${width}/${theme} language Space`);
      await mixed.focus(); await mixed.press('Enter');
      check(await selected(mixed), `${width}/${theme} language Enter`);
      await english.click(); // Existing mixed-language default: create a real local preview change.
      const compare = page.getByRole('radiogroup', { name: 'Compare', exact: true });
      check(await oneStop(compare), `${width}/${theme} compare one tab stop`);
      await compare.getByRole('radio', { name: 'New', exact: true }).press('ArrowRight');
      check(await selected(compare.getByRole('radio', { name: 'Current', exact: true })), `${width}/${theme} compare remains interactive`);
      const papers = page.getByRole('radiogroup', { name: 'Paper size', exact: true });
      check(await oneStop(papers), `${width}/${theme} paper one tab stop`);
      await papers.getByRole('radio', { name: /A4 page/ }).press('ArrowRight');
      const roll = papers.getByRole('radio', { name: /80mm roll/ });
      check(await selected(roll) && await focused(roll), `${width}/${theme} paper arrows`);
      await roll.press('End');
      await page.getByRole('dialog', { name: 'Premium invoice designs' }).waitFor();
      check(await selected(roll), `${width}/${theme} locked pad preserves selection`);
      await shot('invoice-pad-locked'); await page.keyboard.press('Escape');
      check(await oneStop(papers), `${width}/${theme} paper reachable after lock`);
      const gallery = page.getByRole('radiogroup', { name: 'Invoice design', exact: true });
      check(await oneStop(gallery), `${width}/${theme} gallery one tab stop`);
      await gallery.getByRole('radio').nth(0).press('ArrowRight');
      await page.getByRole('dialog', { name: 'Premium invoice designs' }).waitFor();
      check(await selected(gallery.getByRole('radio').nth(0)), `${width}/${theme} locked design preserves selection`);
      await shot('invoice-design-locked'); await page.keyboard.press('Escape');
      check(await focused(gallery.getByRole('radio').nth(1)), `${width}/${theme} locked design focus returns`);
      check(await oneStop(gallery), `${width}/${theme} gallery reachable after lock`);
      await gallery.getByRole('radio').nth(0).focus(); await shot('invoice-keyboard');
      await mount(true);
      for (const name of ['Invoice design', 'Paper size', 'Document language']) {
        const group = page.getByRole('radiogroup', { name, exact: true });
        check(await group.getByRole('radio').evaluateAll(nodes => nodes.every(n => n.disabled && n.tabIndex === -1)), `${width}/${theme} ${name} read-only disabled`);
      }
      await shot('invoice-readonly');
      await page.goto(base + '/#/app/settings/sessions', { waitUntil: 'networkidle' });
      const devices = page.getByRole('radiogroup', { name: 'Filter devices', exact: true });
      check(await oneStop(devices), `${width}/${theme} session filter one tab stop`);
      await devices.getByRole('radio', { name: 'All', exact: true }).press('ArrowRight');
      check(await selected(devices.getByRole('radio', { name: 'Online now', exact: true })), `${width}/${theme} session filter remains interactive`);
      await page.goto(base + '/#/app/settings/interface', { waitUntil: 'networkidle' });
      await page.getByRole('button', { name: 'Preview', exact: true }).click();
      await page.evaluate(t => document.documentElement.classList.toggle('dark', t === 'dark'), theme);
      const caption = page.getByText('Sample row · not your data', { exact: true });
      check(await caption.evaluate(el => getComputedStyle(el).fontSize === '12px' && getComputedStyle(el).lineHeight === '16px'), `${width}/${theme} exact preview caveat caption role`);
      await shot('preview-caption');
      await page.close();
    }
  } finally { await browser.close(); }
  console.log(JSON.stringify({ failures }, null, 2));
  assert.equal(failures.length, 0, 'Invoice radio keyboard regressions');
})().catch(error => { console.error(error); process.exitCode = 1; });
