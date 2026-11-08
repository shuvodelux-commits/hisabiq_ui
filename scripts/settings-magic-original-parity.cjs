/* Read-only paired capture: original published Magic Patterns preview vs draft HisabIQ UI.
 * Never use an editor/canvas URL or infer a reference from the GitHub baseline.
 * No publishing or modifying the source; no logins, clicks or tenant writes.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const EDITOR = 't6q3mxi6nhuak3qjvx8cwn';
const PINNED_ARTIFACT = '238f01b4-0e3b-4eda-aac5-6d542fbf85cd';
const WIDTHS = [320,390,768,1024,1440];
const THEMES = ['light','dark'];
const ROUTES = [
  ['home','', 'Settings'],
  ['interface','interface','Interface & workflows'],
  ['team','team','Users & roles'],
  ['data','data','Data & backup'],
  ['sessions','sessions','Logged-in devices'],
  ['activity','activity','Staff activity'],
  ['offline','offline','Offline selling'],
  ['invoices','invoices','Invoices & printing']
];

function readReference(body) {
  const match = (body || '').match(/^[ \t]*MAGIC-SOURCE-PREVIEW-URL:[ \t]*(\S+)[ \t]*$/m);
  if (!match) throw Error('No MAGIC-SOURCE-PREVIEW-URL: <published-url> entry in PR body. Exact source image parity remains blocked.');
  const input = new URL(match[1]);
  assert.equal(input.protocol,'https:','Reference must be HTTPS');
  assert.ok(/^[a-z0-9-]+\.magicpatterns\.app$/i.test(input.hostname),
    'Reference must be a published project-*.magicpatterns.app preview (not an editor, canvas, arbitrary host or private IP)');
  assert.equal(input.username,'','Reference URL must not include credentials');
  assert.equal(input.password,'','Reference URL must not include credentials');
  assert.equal(input.search,'','Reference URL must be the published site root, without query');
  assert.equal(input.hash,'','Reference URL must be the published site root, without hash');
  assert.equal(input.pathname,'/','Reference URL must be the published site root (source uses BrowserRouter)');
  assert.equal(input.port,'','Reference URL must use default HTTPS port');
  return input.origin;
}

function selfTest() {
  const ok='https://project-hisabiq.magicpatterns.app/';
  assert.equal(readReference('MAGIC-SOURCE-PREVIEW-URL: '+ok),ok.slice(0,-1));
  for (const wrong of [
    'https://www.magicpatterns.com/c/'+EDITOR,
    'http://project-example.magicpatterns.app/',
    'https://project-example.magicpatterns.app:8443/',
    'https://project-example.magicpatterns.app/#/app/settings',
    'https://project-example.magicpatterns.app/path',
    'https://example.com',
    'https://127.0.0.1',
    'https://project-example.magicpatterns.app.evil.invalid/'
  ]) assert.throws(()=>readReference('MAGIC-SOURCE-PREVIEW-URL: '+wrong),wrong);
  assert.throws(()=>readReference(''));
  assert.equal(ROUTES.length,8);
  console.log('Settings published-reference URL validation OK: editor, private hosts and false lookalikes rejected');
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

async function capturePage(browser,site,route,width,height,theme,out,filename,sourceOrigin) {
  const context=await browser.newContext({
    viewport:{width,height},deviceScaleFactor:1,colorScheme:theme,
    reducedMotion:'reduce',isMobile:width<=390,hasTouch:width<=768
  });
  try {
    await context.addInitScript(t=>{
      // Fresh per-screenshot context; these are UI theme hints, not user data.
      localStorage.setItem('theme',t);
      localStorage.setItem('hisabiq-theme',t);
    },theme);
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',err=>errors.push(err.message));
    const target=site==='source'
      ? new URL('/app/settings'+(route[1]?'/'+route[1]:''),sourceOrigin).href
      : process.env.SETTINGS_IMPLEMENTATION_URL.replace(/\/$/,'')+'/#/app/settings'+(route[1]?'/'+route[1]:'');
    const resp=await page.goto(target,{waitUntil:'domcontentloaded',timeout:45000});
    assert.ok(!resp || resp.ok(),'Reference preview returned HTTP '+(resp?.status()||'unknown')+' for '+route[0]);
    await page.locator('#root,main').first().waitFor({state:'visible',timeout:25000});
    await page.evaluate(t=>{
      document.documentElement.classList.toggle('dark',t==='dark');
      document.documentElement.classList.toggle('light',t==='light');
      document.documentElement.dataset.theme=t;
      document.documentElement.style.colorScheme=t;
    },theme);
    await page.evaluate(async()=>{await document.fonts.ready;});
    await page.waitForTimeout(300);
    const details=await page.evaluate(()=>({
      heading:(document.querySelector('main h1,main h2,h1,h2')?.textContent||'').trim(),
      visibleText:(document.body.innerText||'').slice(0,240),
      documentWidth:document.documentElement.scrollWidth,
      viewportWidth:window.innerWidth,
      pagePath:location.pathname,
      pageHash:location.hash,
      title:document.title,
      darkClass:document.documentElement.classList.contains('dark')
    }));
    assert.ok(details.visibleText.length>60,'Reference or candidate is blank/blocked on '+site+': '+target);
    assert.ok(details.visibleText.toLowerCase().includes(route[2].toLowerCase().split(' ')[0])||details.visibleText.includes('Settings'),
      'Expected Settings screen not present: '+site+' '+route[0]+' '+JSON.stringify(details));
    assert.equal(errors.length,0,site+' JavaScript errors on '+route[0]+': '+errors.join('; '));
    await page.screenshot({path:path.join(out,filename),fullPage:true,animations:'disabled'});
    return {filename,details};
  } finally {await context.close();}
}

function makeHTML(captures,sourceOrigin) {
  const rows=captures.map(x=>[
    '<section><h2>',escapeHTML(x.route),' · ',x.width,'px · ',escapeHTML(x.theme),
    '</h2><div class="pair"><figure><figcaption>Original Magic Patterns preview</figcaption><img loading="lazy" src="',escapeHTML(x.source.filename),
    '" alt="Original preview ',escapeHTML(x.route),'"></figure><figure><figcaption>HisabIQ UI PR #272</figcaption><img loading="lazy" src="',escapeHTML(x.implementation.filename),
    '" alt="GitHub implementation ',escapeHTML(x.route),'"></figure></div></section>'
  ].join('')).join('\n');
  return [
    '<!doctype html><html lang="en"><meta charset="utf-8"><title>HisabIQ Settings original-reference comparison</title>',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<style>body{font-family:system-ui,sans-serif;max-width:1600px;margin:24px auto;padding:0 16px;color:#182437;background:#f5f7fa}',
    'h1{font-size:23px}h2{font-size:17px;margin:36px 0 12px}p{line-height:1.5}',
    '.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start}',
    'figure{margin:0;min-width:0;background:white;border:1px solid #c5cbd3;padding:10px;overflow:auto}',
    'figcaption{font-weight:600;font-size:13px;margin:4px 0 12px}img{display:block;width:100%;height:auto}',
    '@media(max-width:780px){.pair{grid-template-columns:1fr}}</style>',
    '<h1>Settings · original Magic Patterns vs PR #272</h1>',
    '<p>Read-only source: ',escapeHTML(sourceOrigin),'. Pinned editor ',escapeHTML(EDITOR),
    ', artifact ',escapeHTML(PINNED_ARTIFACT),'. Version equivalence of the published site must be confirmed by the design owner.</p>',
    '<p><strong>Evidence, not certification:</strong> source and port are separate applications with different sample data,',
    ' BrowserRouter vs HashRouter, and possibly different fonts/build artifacts. Differences are not automatically port defects.',
    ' Only 8 default-state screens are captured. Dialogs, dropdowns, and screen-reader speech still need manual comparison.</p>',
    rows,'</html>'
  ].join('\n');
}

async function run() {
  const sourceOrigin=readReference(process.env.UI_REFINE_PR_BODY);
  assert.ok(process.env.SETTINGS_IMPLEMENTATION_URL,'Missing implementation URL');
  const candidate=new URL(process.env.SETTINGS_IMPLEMENTATION_URL);
  assert.equal(candidate.hostname,'127.0.0.1','Candidate must be the already-running local PR preview');
  assert.equal(candidate.protocol,'http:','Candidate must use the local HTTP Vite server');
  const out=path.resolve(process.env.SETTINGS_PARITY_OUT || 'settings-original-reference');
  fs.mkdirSync(out,{recursive:true});
  const {chromium}=require('playwright');
  const browser=await chromium.launch({args:['--no-sandbox']});
  const captures=[];
  try {
    for(const width of WIDTHS)for(const theme of THEMES)for(const route of ROUTES){
      const height=width===1024?768:width===768?1024:width===1440?900:844;
      const stub=route[0]+'-'+width+'-'+theme+'.png';
      const source=await capturePage(browser,'source',route,width,height,theme,out,'source-'+stub,sourceOrigin);
      const implementation=await capturePage(browser,'implementation',route,width,height,theme,out,'implementation-'+stub,sourceOrigin);
      captures.push({route:route[0],width,theme,source,implementation});
      console.log('Captured '+route[0]+' '+width+'px '+theme);
    }
  } finally {await browser.close();}
  const report={
    kind:'read-only-original-source-visual-evidence',captureCount:captures.length,
    sourceOrigin,pinnedEditorId:EDITOR,pinnedArtifactId:PINNED_ARTIFACT,
    caveats:['Published version cannot be proven equal to pinned editor version automatically',
      'Seed data and layout shell may differ','No pixel parity or accessibility certification is asserted'],
    captures
  };
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify(report,null,2));
  fs.writeFileSync(path.join(out,'compare.html'),makeHTML(captures,sourceOrigin));
  console.log('Produced '+captures.length+' matched original-vs-PR pairs; inspect compare.html before approval');
}

if(process.argv.includes('--self-test'))selfTest();
else run().catch(e=>{console.error(e.stack||e);process.exitCode=1;});
