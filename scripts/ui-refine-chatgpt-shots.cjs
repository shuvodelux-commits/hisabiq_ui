/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- Node Playwright harness uses CJS. */
'use strict';
// ChatGPT + GitHub screenshot handoff; no API key and no manual workflow.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const fsp=require('node:fs/promises');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const widths=[320,390,768,1024,1440];
const themes=['light','dark'];
/**
 * Allow any existing HisabIQ route: ERP /app/*, Control Center /saas/*,
 * or top-level screens (login, signup, design system, recovery).
 * The source App.tsx is the authority, not a hard-coded Expense route list.
 * Refuse routes not declared by App.tsx and traversal / query injection.
 */
function routeFromBody(body, appFile) {
  const match = (body || '').match(/^[ \t]*UI-REFINE-ROUTE:[ \t]*(#[/][a-z0-9/-]+)[ \t]*$/m);
  if (!match || !/^#\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*$/.test(match[1])) {
    throw Error('PR body must contain UI-REFINE-ROUTE: #/app/<existing-route> or #/saas/<existing-route>');
  }
  const route = match[1];
  const source = fs.readFileSync(appFile, 'utf8');
  const target = route.slice(1);
  const declarations = [...source.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => ({
    path: m[1], at: m.index
  }));
  const groups = declarations.filter(d => d.path === '/saas' || d.path === '/app');
  if (groups.length !== 2) throw Error('App.tsx route layout is not recognized');
  const saas = groups.find(d => d.path === '/saas');
  const app = groups.find(d => d.path === '/app');
  if (saas.at >= app.at) throw Error('Unexpected App.tsx router structure');
  const end = declarations.find(d => d.at > app.at && d.path === '*')?.at;
  if (!end) throw Error('Cannot identify app routes boundary');
  const segments = target.split('/').filter(Boolean);
  if (segments.length < 1) throw Error('Missing route');
  let candidates;
  let pathName;
  if (segments[0] === 'saas') {
    candidates = declarations.filter(d => d.at > saas.at && d.at < app.at && !d.path.startsWith('/'));
    pathName = segments.slice(1).join('/');
  } else if (segments[0] === 'app') {
    candidates = declarations.filter(d => d.at > app.at && d.at < end && !d.path.startsWith('/'));
    pathName = segments.slice(1).join('/');
  } else {
    // A top-level route, e.g. /login or /design-system.
    candidates = declarations.filter(d => d.at < saas.at && d.path.startsWith('/') && d.path !== '/');
    pathName = target;
  }
  const valid = candidates.some(d => d.path === pathName || (
    d.path.includes(':') &&
    new RegExp('^' + d.path.replace(/:[a-zA-Z_]\w*/g, '[a-z0-9-]+') + 'async function capture(browser,name,url,route,out){
  const shots=[];
  for(const width of widths)for(const theme of themes){
    const height=width===1024?768:width===768?1024:width===1440?900:844;
    const ctx=await browser.newContext({
      viewport:{width,height},colorScheme:theme,reducedMotion:'reduce',
      hasTouch:width<=768,isMobile:width<=390,deviceScaleFactor:1
    });
    try{
      await ctx.addInitScript(t=>{
        localStorage.setItem('hisabiq-theme',t);
        localStorage.setItem('theme',t);
      },theme);
      const page=await ctx.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url+'/'+route,{waitUntil:'networkidle',timeout:120000});
      const root = page.locator('main:visible').first();
      if (await root.count()) await root.waitFor({state:'visible',timeout:20000});
      else await page.locator('#root:visible').first().waitFor({state:'visible',timeout:20000});
      await page.waitForTimeout(1000);
      const details=await page.evaluate(t=>{
        const h=document.documentElement;
        h.classList.toggle('dark',t==='dark');h.classList.toggle('light',t==='light');
        h.dataset.theme=t;h.style.colorScheme=t;
        return {hash:location.hash,
          contentLength:((document.querySelector('main')?.innerText
            || document.querySelector('#root')?.innerText || '')).trim().length,
          title:document.title};
      },theme);
      assert.equal(details.hash.split('?')[0],route,'Screen redirected from requested route');
      assert.ok(details.contentLength>20,'Blank screen or unsupported route');
      assert.equal(errors.length,0,'Browser errors: '+errors.join('; '));
      const longest=await page.evaluate(()=>{
        let max=document.documentElement.scrollHeight;
        for(const el of document.querySelectorAll('*')){
          if(['auto','scroll'].includes(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight)
            max=Math.max(max,el.scrollHeight+el.getBoundingClientRect().top);
        }
        return Math.min(Math.ceil(max),5500);
      });
      if(longest>height)await page.setViewportSize({width,height:longest});
      const filename=name+'-'+width+'-'+theme+'.png';
      await page.screenshot({path:path.join(out,filename),fullPage:true,animations:'disabled'});
      shots.push({filename,width,theme,...details});
    }finally{await ctx.close();}
  }
  return shots;
}
function indexHtml(route,baseSha,prSha){
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const rows=widths.flatMap(width=>themes.map(theme=>{
    const before='before-'+width+'-'+theme+'.png';
    const after='after-'+width+'-'+theme+'.png';
    return '<section><h2>'+width+'px / '+theme+'</h2><div class="pair"><figure><figcaption>Main (before)</figcaption><img src="'+before+'"></figure><figure><figcaption>PR (after)</figcaption><img src="'+after+'"></figure></div></section>';
  })).join('\n');
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>HisabIQ screenshots</title><style>body{font:14px system-ui;max-width:1200px;margin:20px auto;color:#16283d;padding:10px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0;padding:8px;border:1px solid #bbb}img{display:block;width:100%;height:auto}figcaption{padding:6px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>'+esc(route)+'</h1><p>Main '+baseSha.slice(0,8)+' vs PR '+prSha.slice(0,8)+'; visual preview only, not proof of backend posting.</p>'+rows+'</html>';
}
async function main(){
  if(process.argv.includes('--self-test'))return test();
  if(process.argv.includes('--print-route') || process.argv.includes('--print-scope')) {
    const root = path.resolve(process.env.UI_REFINE_CANDIDATE || '.');
    const route = routeFromBody(process.env.UI_REFINE_PR_BODY || '', path.join(root,'src/App.tsx'));
    if(process.argv.includes('--print-route')) console.log(route);
    else console.log(scopeFromBody(process.env.UI_REFINE_PR_BODY || '',root,route));
    return;
  }
  const candidate=path.resolve(process.env.UI_REFINE_CANDIDATE||'.');
  const baseline=path.resolve(process.env.UI_REFINE_BASELINE||'../baseline');
  const route=routeFromBody(process.env.UI_REFINE_PR_BODY,path.join(candidate,'src/App.tsx'));
  const out=path.resolve(process.env.UI_REFINE_OUT||'ui-refine-screenshots');
  await fsp.mkdir(out,{recursive:true});
  const {chromium}=require('playwright');
  const browser=await chromium.launch({args:['--no-sandbox']});
  let before,after;
  try{
    before=await capture(browser,'before',process.env.UI_REFINE_BASE_URL||'http://127.0.0.1:4310',route,out);
    after=await capture(browser,'after',process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311',route,out);
  }finally{await browser.close();}
  const sha=cwd=>execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8'}).trim();
  const baseSha=sha(baseline),prSha=sha(candidate);
  await fsp.writeFile(path.join(out,'manifest.json'),JSON.stringify({
    route,baseSha,prSha,before,after,
    warning:'All-module screenshots must be visually inspected in ChatGPT; do not claim original parallel agents or official Impeccable detector ran.'
  },null,2));
  await fsp.writeFile(path.join(out,'compare.html'),indexHtml(route,baseSha,prSha));
  console.log('Captured '+before.length+' baseline and '+after.length+' PR images: '+route);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
).test(pathName)
  ));
  if (!valid) throw Error('Not a declared HisabIQ React route: ' + route);
  return route;
}
function scopeFromBody(body, root, route) {
  const scope = (body || '').match(/^[ \t]*UI-REFINE-SCOPE:[ \t]*(src\/[A-Za-z0-9_/-]+\.(?:tsx|jsx|css))[ \t]*$/m);
  if (scope) {
    const file = scope[1];
    if (file.includes('..') || !fs.existsSync(path.resolve(root, file))) {
      throw Error('UI-REFINE-SCOPE is not a file within the checked-out project: ' + file);
    }
    return file;
  }
  // Fallback always includes every relevant module in the requested area,
  // rather than silently assuming the Expenses source file.
  if (route.startsWith('#/saas/')) return 'src/saas';
  if (route.startsWith('#/app/')) return 'src/pages';
  return 'src/features/auth';
}
function test() {
  const file = path.resolve(__dirname, '../src/App.tsx');
  const good = [
    '#/app/dashboard', '#/app/pos', '#/app/sales', '#/app/purchases',
    '#/app/purchases/new', '#/app/expenses', '#/app/audit-ledger',
    '#/app/products', '#/app/parties', '#/app/reports', '#/app/daybook',
    '#/app/settings/business', '#/app/support/ticket-1',
    '#/saas/overview', '#/saas/plans', '#/saas/tenants',
    '#/saas/invoices/record-1', '#/login', '#/signup', '#/design-system'
  ];
  for (const route of good) {
    assert.equal(routeFromBody('UI-REFINE-ROUTE: ' + route, file), route);
  }
  for (const bad of [
    '#/app/does-not-exist', '#/saas/not-a-module', '#/app/../../etc',
    '#/app/expenses?mode=1', '#/app/expenses#bad', '#/admin', '#/app',
    '#/saas', '#/missing', '#/app/EXPENSES'
  ]) assert.throws(() => routeFromBody('UI-REFINE-ROUTE: ' + bad, file), bad);
  assert.throws(() => routeFromBody('Refine Expenses please', file));
  const root = path.resolve(__dirname, '..');
  assert.equal(scopeFromBody('UI-REFINE-SCOPE: src/pages/Pos.tsx',root,'#/app/pos'),'src/pages/Pos.tsx');
  assert.equal(scopeFromBody('UI-REFINE-SCOPE: src/pages/Expenses.tsx',root,'#/app/expenses'),'src/pages/Expenses.tsx');
  assert.equal(scopeFromBody('',root,'#/app/products'),'src/pages');
  assert.equal(scopeFromBody('',root,'#/saas/overview'),'src/saas');
  assert.throws(() => scopeFromBody('UI-REFINE-SCOPE: src/pages/does-not-exist.tsx',root,'#/app/pos'));
  console.log('All-module GitHub screenshot route validation: ' + good.length + ' declared routes OK');
}
async function capture(browser,name,url,route,out){
  const shots=[];
  for(const width of widths)for(const theme of themes){
    const height=width===1024?768:width===768?1024:width===1440?900:844;
    const ctx=await browser.newContext({
      viewport:{width,height},colorScheme:theme,reducedMotion:'reduce',
      hasTouch:width<=768,isMobile:width<=390,deviceScaleFactor:1
    });
    try{
      await ctx.addInitScript(t=>{
        localStorage.setItem('hisabiq-theme',t);
        localStorage.setItem('theme',t);
      },theme);
      const page=await ctx.newPage();
      const errors=[];
      page.on('pageerror',e=>errors.push(e.message));
      await page.goto(url+'/'+route,{waitUntil:'networkidle',timeout:120000});
      await page.locator('main').first().waitFor({state:'visible',timeout:20000});
      await page.waitForTimeout(1000);
      const details=await page.evaluate(t=>{
        const h=document.documentElement;
        h.classList.toggle('dark',t==='dark');h.classList.toggle('light',t==='light');
        h.dataset.theme=t;h.style.colorScheme=t;
        return {hash:location.hash,
          contentLength:(document.querySelector('main')?.innerText||'').trim().length,
          title:document.title};
      },theme);
      assert.equal(details.hash.split('?')[0],route,'Screen redirected from requested route');
      assert.ok(details.contentLength>20,'Blank screen or unsupported route');
      assert.equal(errors.length,0,'Browser errors: '+errors.join('; '));
      const longest=await page.evaluate(()=>{
        let max=document.documentElement.scrollHeight;
        for(const el of document.querySelectorAll('*')){
          if(['auto','scroll'].includes(getComputedStyle(el).overflowY)&&el.scrollHeight>el.clientHeight)
            max=Math.max(max,el.scrollHeight+el.getBoundingClientRect().top);
        }
        return Math.min(Math.ceil(max),5500);
      });
      if(longest>height)await page.setViewportSize({width,height:longest});
      const filename=name+'-'+width+'-'+theme+'.png';
      await page.screenshot({path:path.join(out,filename),fullPage:true,animations:'disabled'});
      shots.push({filename,width,theme,...details});
    }finally{await ctx.close();}
  }
  return shots;
}
function indexHtml(route,baseSha,prSha){
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const rows=widths.flatMap(width=>themes.map(theme=>{
    const before='before-'+width+'-'+theme+'.png';
    const after='after-'+width+'-'+theme+'.png';
    return '<section><h2>'+width+'px / '+theme+'</h2><div class="pair"><figure><figcaption>Main (before)</figcaption><img src="'+before+'"></figure><figure><figcaption>PR (after)</figcaption><img src="'+after+'"></figure></div></section>';
  })).join('\n');
  return '<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>HisabIQ screenshots</title><style>body{font:14px system-ui;max-width:1200px;margin:20px auto;color:#16283d;padding:10px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0;padding:8px;border:1px solid #bbb}img{display:block;width:100%;height:auto}figcaption{padding:6px}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>'+esc(route)+'</h1><p>Main '+baseSha.slice(0,8)+' vs PR '+prSha.slice(0,8)+'; visual preview only, not proof of backend posting.</p>'+rows+'</html>';
}
async function main(){
  if(process.argv.includes('--self-test'))return test();
  const candidate=path.resolve(process.env.UI_REFINE_CANDIDATE||'.');
  const baseline=path.resolve(process.env.UI_REFINE_BASELINE||'../baseline');
  const route=routeFromBody(process.env.UI_REFINE_PR_BODY,path.join(candidate,'src/App.tsx'));
  const out=path.resolve(process.env.UI_REFINE_OUT||'ui-refine-screenshots');
  await fsp.mkdir(out,{recursive:true});
  const {chromium}=require('playwright');
  const browser=await chromium.launch({args:['--no-sandbox']});
  let before,after;
  try{
    before=await capture(browser,'before',process.env.UI_REFINE_BASE_URL||'http://127.0.0.1:4310',route,out);
    after=await capture(browser,'after',process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311',route,out);
  }finally{await browser.close();}
  const sha=cwd=>execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8'}).trim();
  const baseSha=sha(baseline),prSha=sha(candidate);
  await fsp.writeFile(path.join(out,'manifest.json'),JSON.stringify({
    route,baseSha,prSha,before,after,
    warning:'Screenshots must be visually inspected in ChatGPT; do not claim automated Impeccable reviews ran.'
  },null,2));
  await fsp.writeFile(path.join(out,'compare.html'),indexHtml(route,baseSha,prSha));
  console.log('Captured '+before.length+' baseline and '+after.length+' PR images: '+route);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
