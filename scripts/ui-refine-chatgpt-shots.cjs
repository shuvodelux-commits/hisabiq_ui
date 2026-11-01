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
/** Real React Router validation across ERP, SaaS and auth routes. */
function routeFromBody(body, appFile) {
  const match=(body||'').match(/^[ \t]*UI-REFINE-ROUTE:[ \t]*(#\/[a-z0-9/-]+)[ \t]*$/m);
  if(!match||!/^#\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*$/.test(match[1]))
    throw Error('Provide UI-REFINE-ROUTE: #/app/<route> or another declared route');
  const route=match[1],source=fs.readFileSync(appFile,'utf8');
  const declared=[...source.matchAll(/<Route\s+path="([^"]+)"/g)].map(x=>({path:x[1],pos:x.index}));
  const app=declared.find(x=>x.path==='/app');
  const saas=declared.find(x=>x.path==='/saas');
  const end=declared.find(x=>x.path==='*'&&x.pos>(app?.pos||0));
  if(!app||!saas||!end||saas.pos>=app.pos)throw Error('Unrecognized React route tree');
  const target=route.slice(1),segments=target.split('/').filter(Boolean);
  let candidates,sub;
  if(segments[0]==='app'){
    candidates=declared.filter(x=>x.pos>app.pos&&x.pos<end.pos&&!x.path.startsWith('/'));
    sub=segments.slice(1).join('/');
  }else if(segments[0]==='saas'){
    candidates=declared.filter(x=>x.pos>saas.pos&&x.pos<app.pos&&!x.path.startsWith('/'));
    sub=segments.slice(1).join('/');
  }else{
    candidates=declared.filter(x=>x.pos<saas.pos&&x.path.startsWith('/')&&x.path!=='/');
    sub=target;
  }
  const valid=candidates.some(x=>x.path===sub||(x.path.includes(':')&&
    new RegExp('^'+x.path.replace(/:[A-Za-z_]\w*/g,'[a-z0-9-]+')+'$').test(sub)));
  if(!valid)throw Error('Not a declared HisabIQ route: '+route);
  return route;
}
function scopeFromBody(body,root,route){
  const m=(body||'').match(/^[ \t]*UI-REFINE-SCOPE:[ \t]*(src\/[A-Za-z0-9_/-]+\.(?:tsx|jsx|css))[ \t]*$/m);
  if(m){
    if(m[1].includes('..')||!fs.existsSync(path.resolve(root,m[1])))
      throw Error('Invalid UI-REFINE-SCOPE: '+m[1]);
    return m[1];
  }
  if(route.startsWith('#/app/'))return 'src/pages';
  if(route.startsWith('#/saas/'))return 'src/saas';
  return 'src/features/auth';
}
function test(){
  const file=path.resolve(__dirname,'../src/App.tsx');
  const good=['#/app/dashboard','#/app/pos','#/app/sales','#/app/products',
    '#/app/purchases','#/app/purchases/new','#/app/expenses',
    '#/app/audit-ledger','#/app/parties','#/app/daybook','#/app/reports',
    '#/app/settings/business','#/app/support/ticket-1',
    '#/saas/overview','#/saas/plans','#/saas/invoices/record-1',
    '#/saas/tenants','#/login','#/signup','#/design-system'];
  for(const x of good)assert.equal(routeFromBody('UI-REFINE-ROUTE: '+x,file),x);
  for(const x of ['#/app/does-not-exist','#/saas/missing','#/app/../../etc',
    '#/app/expenses?mode=1','#/app/expenses#bad','#/app','#/saas','#/nope']){
    assert.throws(()=>routeFromBody('UI-REFINE-ROUTE: '+x,file),x);
  }
  assert.throws(()=>routeFromBody('refine POS',file));
  const root=path.resolve(__dirname,'..');
  assert.equal(scopeFromBody('',root,'#/app/pos'),'src/pages');
  assert.equal(scopeFromBody('',root,'#/saas/plans'),'src/saas');
  assert.equal(scopeFromBody('UI-REFINE-SCOPE: src/pages/Pos.tsx',root,'#/app/pos'),'src/pages/Pos.tsx');
  assert.throws(()=>scopeFromBody('UI-REFINE-SCOPE: src/pages/not-real.tsx',root,'#/app/pos'));
  console.log('All-module route and Impeccable scope parser OK: '+good.length+' routes');
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
      const main = page.locator('main:visible').first();
      if(await main.count())await main.waitFor({state:'visible',timeout:20000});
      else await page.locator('#root:visible').first().waitFor({state:'visible',timeout:20000});
      await page.waitForTimeout(1000);
      const details=await page.evaluate(t=>{
        const h=document.documentElement;
        h.classList.toggle('dark',t==='dark');h.classList.toggle('light',t==='light');
        h.dataset.theme=t;h.style.colorScheme=t;
        return {hash:location.hash,
          contentLength:(document.querySelector('main')?.innerText||document.querySelector('#root')?.innerText||'').trim().length,
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
  if(process.argv.includes('--print-route')||process.argv.includes('--print-scope')){
    const root=path.resolve(process.env.UI_REFINE_CANDIDATE||'.');
    const route=routeFromBody(process.env.UI_REFINE_PR_BODY||'',path.join(root,'src/App.tsx'));
    console.log(process.argv.includes('--print-route')?route:scopeFromBody(process.env.UI_REFINE_PR_BODY||'',root,route));
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
    warning:'Screenshots must be visually inspected in ChatGPT; do not claim automated Impeccable reviews ran.'
  },null,2));
  await fsp.writeFile(path.join(out,'compare.html'),indexHtml(route,baseSha,prSha));
  console.log('Captured '+before.length+' baseline and '+after.length+' PR images: '+route);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
