/* eslint-env node */
/* Portable GitHub-only UI refine screenshot capture; no OpenAI API and no local agent. */
'use strict';
const fs = require('node:fs');
const fsp = require('node:fs/promises');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const assert = require('node:assert/strict');
function routeFromPr(body, config) {
  const match = (body || '').match(/^[ \t]*UI-REFINE-ROUTE:[ \t]*(#?\/[a-zA-Z0-9/_-]+)[ \t]*$/m);
  if (!match) throw Error('PR body missing valid UI-REFINE-ROUTE: /page or #/app/page');
  const route = match[1];
  if (route.includes('..') || route.includes('//') || route.length > 256)
    throw Error('Unsafe screenshot route');
  if (!Array.isArray(config.allowedRoutePrefixes) ||
      !config.allowedRoutePrefixes.some(prefix => typeof prefix === 'string' && route.startsWith(prefix)))
    throw Error('Route not allowed by UI refine configuration: ' + route);
  return route;
}
function selfTest() {
  const config = { allowedRoutePrefixes: ['/orders', '#/app/'] };
  assert.equal(routeFromPr('UI-REFINE-ROUTE: /orders', config), '/orders');
  assert.equal(routeFromPr('A\nUI-REFINE-ROUTE: #/app/products\n', config), '#/app/products');
  assert.throws(() => routeFromPr('UI-REFINE-ROUTE: /account', config));
  assert.throws(() => routeFromPr('UI-REFINE-ROUTE: /orders/../../secret', config));
  assert.throws(() => routeFromPr('UI-REFINE-ROUTE: /orders?token=test', config));
  assert.throws(() => routeFromPr('Refine products', config));
  console.log('Portable route parser self-test: OK');
}
function browserUrl(base, route) {
  return base.replace(/\/+$/, '') + (route.startsWith('#') ? '/' + route : route);
}
async function capture(browser, config, origin, label, route, folder) {
  const out = [];
  const widths = config.viewports || [320, 390, 768, 1024, 1440];
  for (const width of widths) {
    if (!Number.isInteger(width) || width < 240 || width > 3000)
      throw Error('Invalid viewport width: ' + width);
    for (const theme of ['light', 'dark']) {
      const ctx = await browser.newContext({
        viewport: { width, height: config.captureHeight || 900 },
        colorScheme: theme,
        reducedMotion: 'reduce',
        hasTouch: width < 1024,
        deviceScaleFactor: 1
      });
      try {
        const t = config.theme || {};
        if (t.storageKey) await ctx.addInitScript(({ key, value }) => {
          localStorage.setItem(key, value);
        }, { key: t.storageKey, value: theme === 'dark' ? t.darkValue : t.lightValue });
        const page = await ctx.newPage();
        const errors = [];
        page.on('pageerror', e => errors.push(e.message));
        await page.goto(browserUrl(origin, route), { waitUntil: 'networkidle', timeout: 90000 });
        const selector = config.contentSelector || 'main';
        await page.locator(selector).first().waitFor({ state: 'visible', timeout: 20000 });
        const details = await page.evaluate((contentSelector) => ({
          hash: location.hash,
          pathname: location.pathname,
          title: document.title,
          contentLength: (document.querySelector(contentSelector)?.innerText || '').trim().length
        }), selector);
        const actual = route.startsWith('#') ? details.hash.split('?')[0] : details.pathname;
        assert.equal(actual, route, 'Page redirected away from requested route');
        assert.ok(details.contentLength >= 20, 'Target screen appears empty');
        assert.deepEqual(errors, [], 'JavaScript page errors');
        const filename = label + '-' + width + '-' + theme + '.png';
        await page.screenshot({ path: path.join(folder, filename), fullPage: true, animations: 'disabled' });
        out.push({ filename, width, theme, ...details });
      } finally {
        await ctx.close();
      }
    }
  }
  return out;
}
function html(route, widths) {
  const esc = s => String(s).replace(/[&<>"]/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[x]));
  const parts = widths.flatMap(w => ['light', 'dark'].map(t =>
    '<section><h2>' + w + 'px / ' + t + '</h2><div><figure><figcaption>Before</figcaption><img src="before-' + w + '-' + t + '.png"></figure><figure><figcaption>After</figcaption><img src="after-' + w + '-' + t + '.png"></figure></div></section>'
  )).join('\n');
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>UI refine comparison</title><style>body{font:14px system-ui;max-width:1300px;margin:auto;padding:16px}section{margin:24px 0}section div{display:grid;grid-template-columns:1fr 1fr;gap:14px}figure{margin:0;border:1px solid #ccc;padding:8px}img{max-width:100%}@media(max-width:720px){section div{grid-template-columns:1fr}}</style><h1>' + esc(route) + '</h1><p>GitHub PR screenshots only; visually inspect before claiming improvement.</p>' + parts + '</html>';
}
async function main() {
  if (process.argv.includes('--self-test')) return selfTest();
  const configPath = process.env.UI_REFINE_CONFIG || 'ui-refine-github.json';
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const route = routeFromPr(process.env.UI_REFINE_PR_BODY || '', config);
  const baseline = path.resolve(process.env.UI_REFINE_BASELINE || '../baseline');
  const candidate = path.resolve(process.env.UI_REFINE_CANDIDATE || '.');
  const folder = path.resolve(process.env.UI_REFINE_OUT || 'ui-refine-evidence');
  await fsp.mkdir(folder, { recursive: true });
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  let before, after;
  try {
    before = await capture(browser, config, config.baseUrl || 'http://127.0.0.1:4310', 'before', route, folder);
    after = await capture(browser, config, config.headUrl || 'http://127.0.0.1:4311', 'after', route, folder);
  } finally {
    await browser.close();
  }
  const sha = cwd => execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim();
  const manifest = {
    route, baseSha: sha(baseline), headSha: sha(candidate), before, after,
    warning: 'ChatGPT must inspect actual PNG pixels; this job does not run AI or independent model agents.'
  };
  await fsp.writeFile(path.join(folder, 'manifest.json'), JSON.stringify(manifest, null, 2));
  await fsp.writeFile(path.join(folder, 'compare.html'), html(route, config.viewports || [320, 390, 768, 1024, 1440]));
  console.log('Portable GitHub screenshot run: ' + before.length + ' baseline and ' + after.length + ' candidate screenshots.');
}
main().catch(error => { console.error(error); process.exitCode = 1; });
