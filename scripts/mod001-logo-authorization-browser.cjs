/* MOD-001 QA-SEC-01: mounted React permission and identity-transition regression.
 * Uses the real checked-in component, not a copy of its controller.
 * Run: PLAYWRIGHT_EXECUTABLE_PATH=/usr/bin/chromium node scripts/mod001-logo-authorization-browser.cjs
 * No tenant API, fixture database, financial route or production credential is used.
 */
const { strict: assert } = require('node:assert');
const http = require('node:http');
const path = require('node:path');
const esbuild = require('esbuild');
const { chromium } = require('playwright');

const entry = `
import React, {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ConnectedInvoiceLogoActions} from './src/settings/magic/invoice/ConnectedInvoiceLogoActions.tsx';

function Parent() {
  const [canEdit,setCanEdit] = useState(true);
  const [blocked,setBlocked] = useState(false);
  const [identity,setIdentity] = useState('tenant-A:user-1:epoch-1');
  const [selected,setSelected] = useState(false);
  const [busy,setBusy] = useState(false);
  const [unknown,setUnknown] = useState(false);
  return <section>
    <button id="revoke" onClick={()=>setCanEdit(false)}>Revoke</button>
    <button id="grant" onClick={()=>setCanEdit(true)}>Grant</button>
    <button id="block" onClick={()=>setBlocked(true)}>Block</button>
    <button id="unblock" onClick={()=>setBlocked(false)}>Unblock</button>
    <button id="switch" onClick={()=>setIdentity('tenant-B:user-2:epoch-2')}>Switch tenant</button>
    <output id="selected">{String(selected)}</output>
    <output id="busy">{String(busy)}</output>
    <output id="unknown">{String(unknown)}</output>
    <ConnectedInvoiceLogoActions identityKey={identity} accessToken={identity.startsWith('tenant-A')?'token-A':'token-B'} canEdit={canEdit} blocked={blocked} hasLogo={false} refreshKey={0}
      onSelectedChange={setSelected} onBusyChange={setBusy} onUnknownChange={setUnknown} onDenied={()=>{}} onConfirmed={()=>{}} />
  </section>;
}
createRoot(document.getElementById('root')).render(<Parent/>);
`;

async function main() {
  const root = path.resolve(__dirname, '..');
  const built = await esbuild.build({
    stdin: { contents: entry, sourcefile: 'mod001-logo-qa.tsx', loader: 'tsx', resolveDir: root },
    write: false, bundle: true, platform: 'browser', format: 'iife',
    jsx: 'automatic', target: 'es2022', define: {'process.env.NODE_ENV': '"development"'},
    logLevel: 'silent',
  });
  const js = built.outputFiles[0].text;
  const server = http.createServer((request, response) => {
    if (request.url === '/qa.js') {
      response.writeHead(200, { 'Content-Type': 'application/javascript' });
      response.end(js);
    } else {
      response.writeHead(200, { 'Content-Type': 'text/html' });
      response.end('<!doctype html><html><body><div id="root"></div><script src="/qa.js"></script></body></html>');
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({
      headless: true, executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined,
    });
    const page = await browser.newPage();
    const errors = [], apiWrites = [];
    page.on('console', message => {
      if (message.type() === 'warning' || message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => {
      if (/\/api\/v1\//.test(request.url()) && request.method() !== 'GET') apiWrites.push(request.url());
    });
    await page.goto('http://127.0.0.1:' + server.address().port);
    await page.locator('#revoke').waitFor();
    const file = { name: 'logo.png', mimeType: 'image/png', buffer: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/4XkAAAAASUVORK5CYII=', 'base64') };
    const select = async () => {
      await page.locator('input[type=file]').setInputFiles(file);
      await page.waitForFunction(() => document.querySelector('#selected')?.textContent === 'true');
    };
    const expectCleared = async label => {
      await page.waitForFunction(() => document.querySelector('#selected')?.textContent === 'false');
      assert.equal(await page.locator('input[type=file]').isDisabled(), true, label + ' must disable input');
      assert.equal(await page.locator('#busy').textContent(), 'false', label + ' must not be busy');
    };
    await select();
    await page.locator('#revoke').click();
    await expectCleared('revoked permission');
    await page.locator('#grant').click();
    await select();
    await page.locator('#block').click();
    await expectCleared('blocked editor');
    await page.locator('#unblock').click();
    await select();
    await page.locator('#switch').click();
    await page.waitForFunction(() => document.querySelector('#selected')?.textContent === 'false');
    assert.deepEqual(apiWrites, [], 'selection/revocation/identity switch never sends a mutation');
    const renderPhase = errors.filter(text => /Cannot update a component|while rendering a different component/.test(text));
    assert.deepEqual(renderPhase, [], 'no cross-component state updates during React render');
    assert.deepEqual(errors.filter(text => /PAGE_ERROR:|Too many re-renders/.test(text)), [], 'no render crash');
    console.log('PASS: real React Chromium revoke/block/tenant-switch; no render warnings or network writes');
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
