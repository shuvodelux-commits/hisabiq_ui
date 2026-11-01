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
function routeFromBody(body,appFile){
  const match=(body||'').match(/^\s*UI-REFINE-ROUTE:\s*(#\/app\/[a-z0-9/-]+)\s*$/m);
  if(!match || !/^#\/app\/[a-z][a-z0-9-]*(?:\/[a-z0-9-]+)*$/.test(match[1]))
    throw Error('PR body must include UI-REFINE-ROUTE: #/app/<existing-route>');
  const source=fs.readFileSync(appFile,'utf8');
  const start=source.indexOf('<Route path="/app"');
  const end=source.indexOf('<Route path="*"',start);
  if(start<0||end<0)throw Error('Cannot find React /app route definitions');
  const choices=[...source.slice(start,end).matchAll(/<Route\s+path="([^"]+)"/g)].map(x=>x[1]);
  const sub=match[1].slice('#/app/'.length);
  const exists=choices.some(p=>p===sub||(p.includes(':')&&
    new RegExp('^'+p.replace(/:[a-zA-Z_]\w*/g,'[a-z0-9-]+')+'$').test(sub)));
  if(!exists)throw Error('Missing actual React /app route: '+match[1]);
  return match[1];
}
function test(){
  const file=path.resolve(__dirname,'../src/App.tsx');
  assert.equal(routeFromBody('UI-REFINE-ROUTE: #/app/expenses',file),'#/app/expenses');
  assert.equal(routeFromBody('Header\nUI-REFINE-ROUTE: #/app/audit-ledger\n',file),'#/app/audit-ledger');
  assert.throws(()=>routeFromBody('UI-REFINE-ROUTE: #/app/../../etc',file));
  assert.throws(()=>routeFromBody('UI-REFINE-ROUTE: #/app/does-not-exist',file));
  assert.throws(()=>routeFromBody('Refine expenses',file));
  console.log('Auto screenshot route parsing: OK');
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
