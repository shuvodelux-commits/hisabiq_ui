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
async function capture(browser,name,url,route,out,showSababNav=false,showFloatingPanel=false,showDaybookActionMenu=false,showExpenseDialog=false,showSalesFilter=false,showErpActions=false,showSababMotion=false,showPurchasesDaybook=false,showPartyLedger=false,showAuditFilters=false,showPosCombobox=false,showExpenses=false){
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
      await page.goto(showPartyLedger ? url+'/#/app/parties?id=c1&role=Customer' : url+'/'+route,{waitUntil:'networkidle',timeout:120000});
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
      shots.push({filename,width,theme,state:'default',...details});
      if(showSababMotion){
        // Compare true opened-state controls, preserving original app data/semantics.
        await page.setViewportSize({width,height});
        const filter=page.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).first();
        if(width<1024 && await filter.count() && await filter.isVisible())await filter.click();
        await page.waitForTimeout(220);
        const filterFile=name+'-daybook-motion-filter-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,filterFile),animations:'disabled'});
        shots.push({filename:filterFile,width,theme,state:'daybook-motion-filter',...details});
        const account=page.getByRole('combobox',{name:/Account|হিসাব/}).first();
        await account.click();
        const popup=page.getByRole('listbox',{name:/Account options|হিসাব options/}).first();
        await popup.waitFor({state:'visible'});
        await page.waitForTimeout(140);
        const selectFile=name+'-daybook-motion-dropdown-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,selectFile),animations:'disabled'});
        shots.push({filename:selectFile,width,theme,state:'daybook-motion-dropdown',...details});
        await account.press('Escape');
        const created=page.getByRole('radio',{name:/Created Date|লেখার তারিখ/}).first();
        if(await created.count())await created.click();
        else await page.getByRole('button',{name:/Created Date|লেখার তারিখ/}).first().click();
        await page.waitForTimeout(320);
        const dateFile=name+'-daybook-motion-date-switch-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,dateFile),animations:'disabled'});
        shots.push({filename:dateFile,width,theme,state:'daybook-motion-date-switch',...details});
      }
      if(showPosCombobox){
        const input = page.getByRole('combobox',{name:/Add product|পণ্য যোগ করুন/}).first();
        await input.click();
        const popup = page.locator('#pos-product-list:visible').first();
        await popup.waitFor({state:'visible',timeout:8000});
        await page.waitForTimeout(190);
        const file = name+'-pos-product-suggestions-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,file),animations:'disabled'});
        shots.push({filename:file,width,theme,state:'pos-product-suggestions',...details});
      }
      if(showExpenses){
        const filter=page.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).first();
        if(await filter.count()&&await filter.isVisible())await filter.click();
        await page.waitForTimeout(190);
        const filtersFile=name+'-expenses-expanded-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,filtersFile),fullPage:true,animations:'disabled'});
        shots.push({filename:filtersFile,width,theme,state:'expenses-expanded',...details});
        const trigger=page.getByRole('button',{name:/^Actions for /}).first();
        await trigger.scrollIntoViewIfNeeded();
        await trigger.click();
        const dialog=page.getByRole('dialog',{name:/^Actions for /}).first();
        await dialog.waitFor({state:'visible'});
        await page.waitForTimeout(160);
        const actionFile=name+'-expenses-action-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,actionFile),animations:'disabled'});
        shots.push({filename:actionFile,width,theme,state:'expenses-action',...details});
        await page.keyboard.press('Escape');
        await dialog.waitFor({state:'hidden'});
      }
      if(showAuditFilters){
        const newToggle=page.locator('[data-audit-filter-toggle]:visible').first();
        if(await newToggle.count())await newToggle.click();
        else{
          const oldToggle=page.getByRole('button',{name:/More filters/i}).first();
          if(await oldToggle.count()&&await oldToggle.isVisible())await oldToggle.click();
        }
        await page.waitForTimeout(120);
        const file=name+'-audit-advanced-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,file),fullPage:true,animations:'disabled'});
        shots.push({filename:file,width,theme,state:'audit-advanced',...details});
      }
      if(showSalesFilter){
        // Baseline and candidate: show the real expanded filters, plus an opened invoice action.
        // No invented mock data; the current Sales preview records are used.
        const salesToggle=page.locator('[data-sales-filter-toggle]').first();
        if(await salesToggle.count() && await salesToggle.isVisible()){
          await salesToggle.click();
        }else{
          const originalToggle=page.getByRole('button',{name:'Filters',exact:true}).first();
          if(await originalToggle.count() && await originalToggle.isVisible())await originalToggle.click();
        }
        await page.waitForTimeout(200);
        const expandedName=name+'-sales-filters-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,expandedName),fullPage:true,animations:'disabled'});
        shots.push({filename:expandedName,width,theme,state:'sales-filters',...details});
        const invoiceActions=page.getByRole('button',{name:/^Actions for /}).first();
        if(await invoiceActions.count()){
          await invoiceActions.click();
          // Wait for the actual portal and viewport placement, not just trigger click.
          await page.locator('[data-floating-panel-motion="sabab"]:visible [data-action-menu]:visible').first()
            .waitFor({state:'visible',timeout:5000});
          await page.waitForTimeout(120);
          const actionName=name+'-sales-actions-'+width+'-'+theme+'.png';
          await page.screenshot({path:path.join(out,actionName),fullPage:true,animations:'disabled'});
          shots.push({filename:actionName,width,theme,state:'sales-actions',...details});
          await page.keyboard.press('Escape');
        }
      }
      if(showErpActions){
        // True opened-state comparison: main opens legacy Finance action modal;
        // candidate opens Daybook-style compact menu on the same transaction.
        await page.goto(url+'/#/app/finance?tab=transactions',{waitUntil:'networkidle'});
        const action=page.getByRole('button',{name:/Actions for|কাজ/}).first();
        await action.scrollIntoViewIfNeeded();
        await action.click();
        const target=name+'-erp-action-menu-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,target),animations:'disabled'});
        shots.push({filename:target,width,theme,state:'erp-action-menu',...details});
      }
      if(showPartyLedger){
        // Explicit selected Customer statement on BOTH before/after; no invented fixtures.
        const toolbar=page.locator('[data-party-ledger-toolbar], [data-hisabiq-field-group="party-ledger"]').first();
        const toggle=toolbar.getByRole('button',{name:/Advanced filters|Filters|আরও ফিল্টার|ফিল্টার/}).first();
        if(width<1024 && await toggle.count() && await toggle.isVisible())await toggle.click();
        await page.waitForTimeout(100);
        const expandedName=name+'-party-ledger-filters-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,expandedName),fullPage:true,animations:'disabled'});
        shots.push({filename:expandedName,width,theme,state:'party-ledger-filters',...details});
        const trigger=page.getByRole('button',{name:/^Actions for |^কাজ /}).first();
        await trigger.scrollIntoViewIfNeeded();
        await trigger.click();
        const dialog=page.getByRole('dialog',{name:/Transaction actions for|লেনদেনের কাজ/}).first();
        await dialog.waitFor({state:'visible'});
        await page.waitForTimeout(100);
        const actionName=name+'-party-ledger-actions-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,actionName),animations:'disabled'});
        shots.push({filename:actionName,width,theme,state:'party-ledger-actions',...details});
        await page.keyboard.press('Escape');
        await dialog.waitFor({state:'hidden'});
      }
      if(showPurchasesDaybook){
        const toggle=page.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).first();
        if(width<1024 && await toggle.count() && await toggle.isVisible()) await toggle.click();
        await page.waitForTimeout(100);
        const filtersName=name+'-purchases-filters-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,filtersName),fullPage:true,animations:'disabled'});
        shots.push({filename:filtersName,width,theme,state:'purchases-filters',...details});
        const action=page.getByRole('button',{name:/Actions for|কাজ/}).first();
        await action.scrollIntoViewIfNeeded();
        await action.click();
        await page.getByRole('dialog',{name:/Actions for|কাজ/}).first().waitFor({state:'visible'});
        const actionName=name+'-purchases-actions-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,actionName),animations:'disabled'});
        shots.push({filename:actionName,width,theme,state:'purchases-actions',...details});
        await page.keyboard.press('Escape');
      }
      if(showSababNav && width<1024){
        // Preserve viewport-sized mobile menu screenshots, not huge page captures.
        await page.setViewportSize({width,height});
        const strip=page.locator('[data-sabab-nav-strip]');
        if(await strip.count()){
          const sales=strip.locator('li[data-module-id="sales"]');
          await sales.scrollIntoViewIfNeeded();
          await sales.getByRole('button',{name:'Sales tabs'}).click();
          await page.getByRole('menu',{name:'Sales tabs'}).waitFor({state:'visible'});
        }
        const menuFilename=name+'-sabab-menu-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,menuFilename),animations:'disabled'});
        shots.push({filename:menuFilename,width,theme,state:'sabab-module-menu',...details});
        if(await strip.count())await page.keyboard.press('Escape');
        const openButton=page.locator('button[aria-controls="erp-mobile-drawer"]');
        await openButton.click();
        const drawer=page.locator('#erp-mobile-drawer');
        await drawer.waitFor({state:'visible'});
        await page.waitForTimeout(350);
        const drawerFilename=name+'-sabab-drawer-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,drawerFilename),animations:'disabled'});
        shots.push({filename:drawerFilename,width,theme,state:'sabab-mobile-drawer',...details});
        await page.keyboard.press('Escape');
        await drawer.waitFor({state:'hidden'});
        assert.equal(await openButton.evaluate(el=>el===document.activeElement),true,
          'Escape returns focus to HisabIQ mobile navigation trigger');
      }
      if(showFloatingPanel){
        await page.setViewportSize({width,height});
        const appearance=page.getByRole('button',{name:/^Appearance:/});
        await appearance.click();
        const appearancePanel=page.getByRole('dialog',{name:'Appearance',exact:true});
        await appearancePanel.waitFor({state:'visible'});
        await page.waitForTimeout(200);
        const appearanceName=name+'-floating-appearance-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,appearanceName),animations:'disabled'});
        shots.push({filename:appearanceName,width,theme,state:'floating-appearance',...details});
        await page.keyboard.press('Escape');
        await appearancePanel.waitFor({state:'hidden'});
        const calculator=page.getByRole('button',{name:'Calculator',exact:true});
        await calculator.click();
        const calculatorPanel=page.getByRole('dialog',{name:'Calculator',exact:true});
        await calculatorPanel.waitFor({state:'visible'});
        await page.waitForTimeout(200);
        const calculatorName=name+'-floating-calculator-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,calculatorName),animations:'disabled'});
        shots.push({filename:calculatorName,width,theme,state:'floating-calculator',...details});
        await page.keyboard.press('Escape');
        await calculatorPanel.waitFor({state:'hidden'});
      }
      if(showDaybookActionMenu && width < 1024){
        // Both baseline and candidate: capture the expanded advanced-filter state.
        // Legacy main already shows all dropdowns; refined UI opens with the square icon.
        await page.setViewportSize({width,height});
        const toggle=page.getByRole('button',{name:/Advanced filters|আরও ফিল্টার/}).first();
        if(await toggle.count() && await toggle.isVisible()) await toggle.click();
        const expandedFilename=name+'-daybook-filter-expanded-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,expandedFilename),animations:'disabled'});
        shots.push({filename:expandedFilename,width,theme,state:'daybook-filter-expanded',...details});
        if(await toggle.count() && await toggle.isVisible())await toggle.click();
      }
      if(showDaybookActionMenu){
        // Opt-in open state: ordinary Daybook page screenshots do not expose the action menu.
        await page.setViewportSize({width,height});
        const trigger=page.getByRole('button',{name:/^Actions for /}).first();
        await trigger.scrollIntoViewIfNeeded();
        await trigger.click();
        const menu=page.getByRole('dialog',{name:/^Actions for /}).first();
        await menu.waitFor({state:'visible'});
        await page.waitForTimeout(200);
        const menuFilename=name+'-daybook-action-menu-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,menuFilename),animations:'disabled'});
        shots.push({filename:menuFilename,width,theme,state:'daybook-action-menu-open',...details});
        await page.keyboard.press('Escape');
        await menu.waitFor({state:'hidden'});
      }
      if(showExpenseDialog){
        await page.setViewportSize({width,height});
        const trigger=page.getByRole('button',{name:/Add expense/i}).first();
        await trigger.click();
        const modal=page.getByRole('dialog',{name:/Add expense/i}).first();
        await modal.waitFor({state:'visible'});
        await page.waitForTimeout(250);
        const nameOpen=name+'-expense-dialog-'+width+'-'+theme+'.png';
        await page.screenshot({path:path.join(out,nameOpen),animations:'disabled'});
        shots.push({filename:nameOpen,width,theme,state:'expense-dialog-open',...details});
        await page.keyboard.press('Escape');
        await modal.waitFor({state:'hidden'});
        assert.equal(await trigger.evaluate(el=>el===document.activeElement),true,
          'Escape returns focus to Add expense');
      }
    }finally{await ctx.close();}
  }
  return shots;
}
function indexHtml(route,baseSha,prSha,showSababNav=false,showFloatingPanel=false,showDaybookActionMenu=false,showExpenseDialog=false,showSalesFilter=false,showErpActions=false,showSababMotion=false,showPurchasesDaybook=false,showPartyLedger=false,showAuditFilters=false,showPosCombobox=false,showExpenses=false){
  const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const configs=widths.flatMap(width=>themes.map(theme=>({width,theme,mode:'default'})));
  if(showSababNav)for(const width of widths.filter(w=>w<1024))for(const theme of themes)
    for(const mode of ['sabab-menu','sabab-drawer'])configs.push({width,theme,mode});
  if(showFloatingPanel)for(const width of widths)for(const theme of themes)
    for(const mode of ['floating-appearance','floating-calculator'])configs.push({width,theme,mode});
  if(showDaybookActionMenu)for(const width of widths)for(const theme of themes)
    configs.push({width,theme,mode:'daybook-action-menu'});
  if(showDaybookActionMenu)for(const width of widths.filter(w=>w<1024))for(const theme of themes)
    configs.push({width,theme,mode:'daybook-filter-expanded'});
  if(showExpenseDialog)for(const width of widths)for(const theme of themes)
    configs.push({width,theme,mode:'expense-dialog'});
  if(showSalesFilter)for(const width of widths)for(const theme of themes)
    for(const mode of ['sales-filters','sales-actions'])configs.push({width,theme,mode});
  if(showErpActions)for(const width of widths)for(const theme of themes)
    configs.push({width,theme,mode:'erp-action-menu'});
  if(showPurchasesDaybook)for(const width of widths)for(const theme of themes)
    for(const mode of ['purchases-filters','purchases-actions'])configs.push({width,theme,mode});
  if(showSababMotion)for(const width of widths)for(const theme of themes)
    for(const mode of ['daybook-motion-filter','daybook-motion-dropdown','daybook-motion-date-switch'])configs.push({width,theme,mode});
  if(showPartyLedger)for(const width of widths)for(const theme of themes)
    for(const mode of ['party-ledger-filters','party-ledger-actions'])configs.push({width,theme,mode});
  if(showPosCombobox)for(const width of widths)for(const theme of themes)
    configs.push({width,theme,mode:'pos-product-suggestions'});
  if(showExpenses)for(const width of widths)for(const theme of themes)
    for(const mode of ['expenses-expanded','expenses-action'])configs.push({width,theme,mode});
  if(showAuditFilters)for(const width of widths)for(const theme of themes)
    configs.push({width,theme,mode:'audit-advanced'});
  const rows=configs.map(({width,theme,mode})=>{
    const suffix=(mode==='default'?'':mode+'-')+width+'-'+theme+'.png';
    const before='before-'+suffix;
    const after='after-'+suffix;
    return '<section><h2>'+width+'px / '+theme+' / '+mode+'</h2><div class="pair"><figure><figcaption>Main (before)</figcaption><img src="'+before+'"></figure><figure><figcaption>PR (after)</figcaption><img src="'+after+'"></figure></div></section>';
  }).join('\n');
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
  const showSababNav=/^[ \\t]*UI-REFINE-STATE:[ \\t]*sabab-navigation[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showFloatingPanel=/^[ \\t]*UI-REFINE-STATE:[ \\t]*floating-panel[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showExpenseDialog=/^[ \\t]*UI-REFINE-STATE:[ \\t]*expense-dialog[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showErpActions=/^[ \\t]*UI-REFINE-STATE:[ \\t]*erp-action-menus[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showSalesFilter=/^[ \\t]*UI-REFINE-STATE:[ \\t]*sales-invoice-filter[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showPartyLedger=/^[ \\t]*UI-REFINE-STATE:[ \\t]*party-ledger-daybook[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showDaybookActionMenu=/^[ \\t]*UI-REFINE-STATE:[ \\t]*daybook-row-menu[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showPurchasesDaybook=/^[ \\t]*UI-REFINE-STATE:[ \\t]*purchases-daybook[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showPosCombobox=/^[ \\t]*UI-REFINE-STATE:[ \\t]*pos-product-suggestion-motion[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showExpenses=/^[ \\t]*UI-REFINE-STATE:[ \\t]*expenses-reconciliation[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showAuditFilters=/^[ \\t]*UI-REFINE-STATE:[ \\t]*audit-compact-filters[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  const showSababMotion=/^[ \\t]*UI-REFINE-STATE:[ \\t]*sabab-motion-daybook[ \\t]*$/m.test(process.env.UI_REFINE_PR_BODY||'');
  let before,after;
  try{
    before=await capture(browser,'before',process.env.UI_REFINE_BASE_URL||'http://127.0.0.1:4310',route,out,showSababNav,showFloatingPanel,showDaybookActionMenu,showExpenseDialog,showSalesFilter,showErpActions,showSababMotion,showPurchasesDaybook,showPartyLedger,showAuditFilters,showPosCombobox,showExpenses);
    after=await capture(browser,'after',process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311',route,out,showSababNav,showFloatingPanel,showDaybookActionMenu,showExpenseDialog,showSalesFilter,showErpActions,showSababMotion,showPurchasesDaybook,showPartyLedger,showAuditFilters,showPosCombobox,showExpenses);
    if(showExpenseDialog){
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/dialog-motion-browser.cjs')],{
        cwd:candidate,env:{...process.env,DIALOG_MOTION_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:180000
      });
      await fsp.writeFile(path.join(out,'dialog-motion-playwright.log'),log);
    }
    if(showDaybookActionMenu){
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/daybook-action-menu-refine-browser.cjs')],{
        cwd:candidate,
        env:{...process.env,DAYBOOK_ACTION_MENU_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:240000
      });
      await fsp.writeFile(path.join(out,'daybook-action-menu-playwright.log'),log);
      const mobileLog=execFileSync(process.execPath,[path.join(candidate,'scripts/daybook-mobile-layout-browser.cjs')],{
        cwd:candidate,
        env:{...process.env,DAYBOOK_MOBILE_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:240000
      });
      await fsp.writeFile(path.join(out,'daybook-mobile-layout-playwright.log'),mobileLog);
    }
    if(showFloatingPanel){
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/floating-panels-browser.cjs')],{
        cwd:candidate,
        env:{...process.env,FLOATING_PANEL_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:180000
      });
      await fsp.writeFile(path.join(out,'floating-panels-playwright.log'),log);
    }
    if(showErpActions){
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/erp-row-action-menu-browser.cjs')],{
        cwd:candidate,env:{...process.env,ERP_ACTION_MENU_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:180000
      });
      await fsp.writeFile(path.join(out,'erp-action-menu-playwright.log'),log);
    }
    if(showSababNav){
      // Opt-in targeted Playwright interaction gate; preserves the original workflow YAML.
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/sabab-navigation-browser.cjs')],{
        cwd:candidate,env:{...process.env,SABAB_NAV_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:180000
      });
      await fsp.writeFile(path.join(out,'sabab-navigation-playwright.log'),log);
    }
    if(showPartyLedger){
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/party-ledger-daybook-refine-browser.cjs')],{
        cwd:candidate,env:{...process.env,PARTY_LEDGER_DAYBOOK_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:240000
      });
      await fsp.writeFile(path.join(out,'party-ledger-daybook-playwright.log'),log);
    }
      if(showPurchasesDaybook){
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/purchases-daybook-refine-browser.cjs')],{
        cwd:candidate,env:{...process.env,PURCHASES_DAYBOOK_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:240000
      });
      await fsp.writeFile(path.join(out,'purchases-daybook-playwright.log'),log);
    }
    if(showSababMotion){
      const motionLog=execFileSync(process.execPath,[path.join(candidate,'scripts/sabab-motion-daybook-browser.cjs')],{
        cwd:candidate,env:{...process.env,SABAB_MOTION_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:180000
      });
      await fsp.writeFile(path.join(out,'sabab-motion-daybook-playwright.log'),motionLog);
      const controlsLog=execFileSync(process.execPath,[path.join(candidate,'scripts/sabab-shared-controls-browser.cjs')],{
        cwd:candidate,env:{...process.env,SABAB_CONTROLS_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:180000
      });
      await fsp.writeFile(path.join(out,'sabab-shared-controls-playwright.log'),controlsLog);
    }
    if(showPosCombobox){
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/pos-product-combobox-motion-browser.cjs')],{
        cwd:candidate,
        env:{...process.env,POS_COMBOBOX_MOTION_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:210000
      });
      await fsp.writeFile(path.join(out,'pos-product-combobox-motion-playwright.log'),log);
    }
    if(showExpenses){
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/expenses-reconciliation-browser.cjs')],{
        cwd:candidate,
        env:{...process.env,EXPENSES_RECON_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:300000
      });
      await fsp.writeFile(path.join(out,'expenses-reconciliation-browser.log'),log);
    }
    if(showAuditFilters){
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/audit-compact-filters-browser.cjs')],{
        cwd:candidate,env:{...process.env,AUDIT_FILTER_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:180000
      });
      await fsp.writeFile(path.join(out,'audit-compact-filters-playwright.log'),log);
    }
    if(showSalesFilter){
      // Target-specific responsive and keyboard gate; no unrelated modules are changed.
      const log=execFileSync(process.execPath,[path.join(candidate,'scripts/sales-daybook-refine-browser.cjs')],{
        cwd:candidate,env:{...process.env,SALES_DAYBOOK_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:180000
      });
      await fsp.writeFile(path.join(out,'sales-daybook-playwright.log'),log);
      const menuLog=execFileSync(process.execPath,[path.join(candidate,'scripts/sales-action-menu-browser.cjs')],{
        cwd:candidate,env:{...process.env,SALES_ACTION_MENU_URL:process.env.UI_REFINE_PR_URL||'http://127.0.0.1:4311'},
        encoding:'utf8',timeout:180000
      });
      await fsp.writeFile(path.join(out,'sales-action-menu-playwright.log'),menuLog);
    }
  }finally{await browser.close();}
  const sha=cwd=>execFileSync('git',['rev-parse','HEAD'],{cwd,encoding:'utf8'}).trim();
  const baseSha=sha(baseline),prSha=sha(candidate);
  await fsp.writeFile(path.join(out,'manifest.json'),JSON.stringify({
    route,baseSha,prSha,before,after,
    warning:'Screenshots must be visually inspected in ChatGPT; do not claim automated Impeccable reviews ran.'
  },null,2));
  await fsp.writeFile(path.join(out,'compare.html'),indexHtml(route,baseSha,prSha,showSababNav,showFloatingPanel,showDaybookActionMenu,showExpenseDialog,showSalesFilter,showErpActions,showSababMotion,showPurchasesDaybook,showPartyLedger,showAuditFilters,showPosCombobox,showExpenses));
  console.log('Captured '+before.length+' baseline and '+after.length+' PR images: '+route);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
