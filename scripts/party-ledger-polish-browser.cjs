/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- standalone Playwright evidence runner */
// Safe browser-preview journeys only. No API or source-data injection.
// Requires Chromium (PLAYWRIGHT_EXECUTABLE_PATH) and pdftotext for real print verification.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');
const { expect } = require('playwright/test');
const base = process.env.PARTY_LEDGER_URL || 'http://127.0.0.1:4311';
const out = process.env.PARTY_LEDGER_EVIDENCE || '/tmp/hisabiq-party-ledger-evidence';
const label = process.env.PARTY_LEDGER_LABEL || 'current';
const results = [];
const blocked = [];
const screenshotGeometry = [];
let activePage;
const mainWidths = process.env.PARTY_LEDGER_WIDTHS ? process.env.PARTY_LEDGER_WIDTHS.split(',').map(Number) : [320,390,768,820,1024,1440];
const shot = async (page,name) => {
 await page.evaluate(()=>window.scrollTo(0,0));
 await page.waitForFunction(()=>window.scrollY===0);
 const header=await page.locator('header').first().boundingBox();
 assert.ok(header&&Math.abs(header.y)<=2,'global topbar stays at screen top when capturing '+name);
 const file=path.join(out,`${label}-${name}.png`);
 const overlays=page.locator('[role="dialog"]:visible');
 const names=()=>overlays.evaluateAll(nodes=>nodes.map(node=>node.getAttribute('aria-label')||node.getAttribute('aria-labelledby')||''));
 const openNames=await names();
 const overlayGeometry=await overlays.evaluateAll(nodes=>nodes.map(node=>({name:node.getAttribute('aria-label')||node.getAttribute('aria-labelledby')||'',scrollWidth:node.scrollWidth,clientWidth:node.clientWidth,rect:node.getBoundingClientRect().toJSON()})));
 // Chromium full-page capture briefly emits a 1×1 viewport resize. That crosses
 // PartyDetailAdaptive's breakpoint and unmounts live desktop dialog drafts.
 // A viewport capture records the real open overlay without changing its state.
 const fullPage=openNames.length===0;
 screenshotGeometry.push({file,viewport:page.viewportSize(),touchPoints:await page.evaluate(()=>navigator.maxTouchPoints),scrollY:await page.evaluate(()=>window.scrollY),header,fullPage,openOverlays:openNames,overlayGeometry});
 await page.screenshot({path:file,fullPage});
 assert.deepEqual(await names(),openNames,'capturing '+name+' preserves the open overlay');
 assert.ok(overlayGeometry.every(node=>node.scrollWidth<=node.clientWidth+1),'open dialog content stays within its horizontal scroll boundary: '+JSON.stringify(overlayGeometry));
 return file;
};
const click = locator => locator.first().click();
const dialog = (page,name) => page.getByRole('dialog',{name,exact:true});
async function step(name, fn) {if(process.env.PARTY_LEDGER_CASES&&!new RegExp(process.env.PARTY_LEDGER_CASES).test(name))return;try {await fn();results.push({name,status:'passed'});}catch(error){results.push({name,status:'failed',error:error.message});console.error(name+': '+error.message.split('\n')[0]);if(activePage)await activePage.keyboard.press('Escape').catch(()=>undefined);}}
async function goto(page,id='c1',role='Customer') {await page.goto(`${base}/#/app/parties?id=${id}&role=${role}`);await page.reload({waitUntil:'domcontentloaded'});const ledger=page.getByRole('tab',{name:/^Ledger|^খাতা/}).first();await ledger.waitFor();if(await ledger.getAttribute('aria-selected')==='false')await ledger.click();await page.getByRole('textbox',{name:/Search ledger transactions|খাতার লেনদেন খুঁজুন/}).waitFor();await page.locator('main').evaluate(async()=>{await document.fonts.ready;});}
async function close(page,d) {await page.keyboard.press('Escape');await expect(d).toBeHidden();}
async function more(page,name) {
 const direct=page.getByRole('button',{name,exact:true}).filter({visible:true});
 if(await direct.count())return click(direct);
 await click(page.getByRole('button',{name:/^(More|More actions|আরও|আরও কাজ)$/}));
 const item=page.getByRole('menuitem',{name}).or(page.getByRole('button',{name}));
 await click(item);
}
async function showFilters(page,width) {if(width<1024){const t=page.getByRole('button',{name:/^Advanced filters|^আরও ফিল্টার/});if(await t.getAttribute('aria-expanded')==='false')await t.click();}}
async function options(page,name,value) {const c=page.getByRole('combobox',{name,exact:true}).first();await c.click();await page.getByRole('option',{name:value,exact:true}).click();return c;}
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH || '/usr/bin/chromium',args:['--no-sandbox']});
 try {
  for(const width of mainWidths)for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height:width===768?1024:width===1024?768:900},hasTouch:width<=1024,isMobile:width<768,colorScheme:theme,reducedMotion:'reduce',acceptDownloads:true});
   await context.addInitScript(theme=>{localStorage.setItem('hisabiq-theme',theme);localStorage.setItem('theme',theme);},theme);
   const page=await context.newPage();activePage=page;page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
   const tag=`${width}-${theme}`;
   try {
    await goto(page);
    await step(tag+' route, top bar, page overflow',async()=>{
     assert.match(page.url(),/#\/app\/parties\?id=c1&role=Customer/);
     const toolbar=page.locator('header').first();await expect(toolbar).toBeVisible();
     const box=await toolbar.boundingBox();assert.ok(box.y>=-1&&box.y<=2,'global top bar starts at top');
     const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth}));assert.ok(geometry.scrollWidth<=geometry.width+1,JSON.stringify(geometry));
     await shot(page,tag+'-populated');
    });
    await step(tag+' content tabs keyboard and panel semantics',async()=>{
     const ledger=page.getByRole('tab',{name:/^Ledger/}),invoices=page.getByRole('tab',{name:/^Invoices/});await ledger.focus();await page.keyboard.press('ArrowRight');await expect(invoices).toBeFocused();await expect(invoices).toHaveAttribute('aria-selected','true');const controlled=await invoices.getAttribute('aria-controls');assert.ok(controlled,'selected tab names its panel');await expect(page.locator('[id="'+controlled+'"][role="tabpanel"]')).toBeVisible();await ledger.click();
    });
    await step(tag+' filter order, keyboard and applied state',async()=>{
     const toolbar=page.locator('[data-party-ledger-toolbar]').first();
     const search=toolbar.getByRole('textbox',{name:'Search ledger transactions'});const date=toolbar.getByRole('button',{name:/^Party ledger date range/});
     await search.focus();await page.keyboard.press('Tab');
     if(width<1024){
      const filter=toolbar.getByRole('button',{name:/^Advanced filters/});await expect(filter).toHaveAttribute('aria-expanded','false');
      await expect(width<768?filter:date).toBeFocused();await page.keyboard.press('Tab');await expect(width<768?date:filter).toBeFocused();
      await filter.tap();await expect(filter).toHaveAttribute('aria-expanded','true');
     }else await expect(date).toBeFocused();
     const type=await options(page,'Transaction type','Sales');await expect(type).toHaveAttribute('data-value','sale');
     await shot(page,tag+'-expanded-filtered');
     if(width<1024){const filter=toolbar.getByRole('button',{name:/^Advanced filters/});await filter.click();await expect(filter).toHaveAttribute('data-active-filters','true');await filter.click();await expect(type).toHaveAttribute('data-value','sale');}
     await toolbar.getByRole('button',{name:'Clear filters',exact:true}).click();await expect(type).toHaveAttribute('data-value','All types');
     await search.fill('NoMatchingReferenceXQZ');await expect(page.getByText('No transactions match these filters.',{exact:true}).filter({visible:true})).toBeVisible();await shot(page,tag+'-empty');await search.fill('');
    });
    await step(tag+' date range, dropdown placement, Escape',async()=>{
     const trigger=page.getByRole('button',{name:/^Party ledger date range/});await trigger.click();const popup=page.getByRole('dialog',{name:/^Party ledger date range calendar/});await expect(popup).toBeVisible();
     const b=await popup.boundingBox();assert.ok(b.x>=-1&&b.x+b.width<=width+1,'calendar within viewport');await shot(page,tag+'-calendar');await page.keyboard.press('Escape');await expect(popup).toBeHidden();await expect(trigger).toBeFocused();
     await trigger.click();await popup.getByRole('button',{name:'Today',exact:true}).click();await popup.getByRole('button',{name:'Apply',exact:true}).click();await expect(page.getByText('No transactions match these filters.',{exact:true}).filter({visible:true})).toBeVisible();await shot(page,tag+'-date-filtered');await showFilters(page,width);await page.getByRole('button',{name:'Clear filters',exact:true}).first().click();
    });
    await step(tag+' pagination preserves accounting balances',async()=>{
     await goto(page);await showFilters(page,width);const before=await page.getByTestId('party-closing-balance').innerText();const firstAction=page.getByRole('button',{name:'Actions for INV-000241',exact:true}).filter({visible:true});const firstRow=await firstAction.evaluate(node=>node.closest('tr,li').innerText);await options(page,'Rows per page','5');await page.getByRole('button',{name:'Next',exact:true}).first().click();await expect(page.getByRole('button',{name:'Actions for INV-000241',exact:true}).filter({visible:true})).toHaveCount(0);await expect(page.getByRole('button',{name:'Previous',exact:true}).first()).toBeEnabled();await expect(page.getByRole('button',{name:'Next',exact:true}).first()).toBeDisabled();assert.equal(await page.getByTestId('party-closing-balance').innerText(),before,'paging does not change period closing balance');await shot(page,tag+'-page-2');await page.getByRole('button',{name:'Previous',exact:true}).first().click();await expect(page.getByRole('button',{name:'Actions for INV-000241',exact:true}).filter({visible:true})).toHaveCount(1);await expect(page.getByRole('button',{name:'Previous',exact:true}).first()).toBeDisabled();assert.equal(await firstAction.evaluate(node=>node.closest('tr,li').innerText),firstRow,'same transaction running figure restored after paging');await options(page,'Rows per page','25');
    });
    await step(tag+' row actions and read-only details',async()=>{
     const action=page.getByRole('button',{name:/^Actions for INV-000241$/}).filter({visible:true});await expect(action).toBeVisible();const box=await action.boundingBox();assert.ok(box.x>=0&&box.x+box.width<=width+1,'row action visible at scrollLeft=0');
     await action.focus();await page.keyboard.press('Enter');const popup=page.getByRole('dialog',{name:'Transaction actions for INV-000241',exact:true});await expect(popup).toBeVisible();const p=await popup.boundingBox();assert.ok(p.x>=-1&&p.x+p.width<=width+1,'row menu within viewport');await shot(page,tag+'-row-menu');await page.keyboard.press('Escape');await expect(popup).toBeHidden();await expect(action).toBeFocused();
     await (width<=1024?action.tap():action.click());await popup.getByRole('button',{name:'View',exact:true}).click();const detail=dialog(page,'Party transaction details');await expect(detail).toContainText('INV-000241');await shot(page,tag+'-source-preview');await close(page,detail);
    });
    await step(tag+' statement CSV and print output',async()=>{
     await showFilters(page,width);await click(page.getByRole('button',{name:'Print statement',exact:true}));const d=dialog(page,'Party ledger statement');await expect(d).toBeVisible();await expect(d.locator('#party-statement-print')).toContainText('Closing balance');
     const download=page.waitForEvent('download');await d.getByRole('button',{name:'Export CSV',exact:true}).click();const file=await download;const saved=path.join(out,`${label}-${tag}.csv`);await file.saveAs(saved);const csv=fs.readFileSync(saved,'utf8');assert.match(csv,/INV-000241/);assert.match(csv,/Rahman Hardware/);assert.match(csv,/Opening|opening/);
     await page.evaluate(()=>{window.__partyPrintCalled=false;window.print=()=>{window.__partyPrintCalled=true;};});await d.getByRole('button',{name:'Print',exact:true}).click();assert.equal(await page.evaluate(()=>window.__partyPrintCalled),true);
     await shot(page,tag+'-statement');await page.emulateMedia({media:'print'});const printFile=path.join(out,`${label}-${tag}-statement.pdf`);await page.pdf({path:printFile,format:'A4',printBackground:true});await page.emulateMedia({media:'screen'});await close(page,d);
     const printed=execFileSync('pdftotext',[printFile,'-'],{encoding:'utf8'});assert.match(printed,/INV-000241/,'printed statement includes transaction rows');assert.match(printed,/Closing balance/,'printed statement includes closing balance');assert.doesNotMatch(printed,/New sale|Search ledger transactions/,'app controls are excluded from print');
    });
    if([320,390,1440].includes(width)){
     await step(tag+' chooser search and keyboard selection',async()=>{
      await click(page.getByRole('button',{name:'Change party',exact:true}));const search=page.getByRole('textbox',{name:'Search parties',exact:true}).filter({visible:true});
      await search.fill('রহমান');await expect(page.getByRole('option').filter({hasText:'Rahman Hardware'})).toBeVisible();
      await search.fill('01711');await expect(page.getByRole('option').filter({hasText:'Rahman Hardware'})).toBeVisible();
      await search.fill('Hossain');const option=page.getByRole('option').filter({hasText:'Hossain Electric'});await expect(option).toBeVisible();await shot(page,tag+'-chooser');
      await search.press('ArrowDown');await expect(option).toBeFocused();await page.keyboard.press('Enter');await expect(page).toHaveURL(/id=c2&role=Customer/);
     });
     await step(tag+' payment field validation semantics',async()=>{
      await goto(page,'c4');await click(page.getByRole('button',{name:'Receive payment',exact:true}));const d=dialog(page,'Party payment');await d.getByRole('button',{name:'Review payment'}).click();const amount=d.getByRole('textbox',{name:'Payment amount',exact:true});await expect(d.getByRole('alert')).toBeVisible();await shot(page,tag+'-validation-semantics');await expect(amount).toHaveAttribute('aria-invalid','true');assert.ok(await amount.getAttribute('aria-describedby'),'invalid amount is associated with its error');await expect(amount).toBeFocused();await close(page,d);
     });
     await step(tag+' payment validation, review, correction and reversal',async()=>{
      await goto(page,'c4');await click(page.getByRole('button',{name:'Receive payment',exact:true}));let d=dialog(page,'Party payment');await d.getByRole('button',{name:'Review payment',exact:true}).click();await expect(d.getByRole('alert')).toContainText('Enter a payment amount.');await shot(page,tag+'-payment-validation');
      await d.getByRole('textbox',{name:'Payment amount',exact:true}).fill('100');await d.getByRole('button',{name:'Review payment',exact:true}).click();await expect(d.getByRole('status')).toContainText('No banking transaction');await shot(page,tag+'-payment-review');await d.getByRole('button',{name:'Confirm receive payment',exact:true}).click();await expect(d).toBeHidden();
      await click(page.getByRole('button',{name:/^Actions for PAYMENT:/}).filter({visible:true}));await click(page.getByRole('button',{name:'Edit',exact:true}));d=dialog(page,'Party transaction editor');await d.getByRole('textbox',{name:'Corrected payment amount'}).fill('80');await d.getByRole('textbox',{name:'Correction reason'}).fill('UI regression check: corrected amount');await d.getByRole('button',{name:'Review correction'}).click();await shot(page,tag+'-correction-review');await d.getByRole('button',{name:'Confirm correction'}).click();await expect(d).toBeHidden();
      await click(page.getByRole('button',{name:/^Actions for PAYMENT:/}).filter({visible:true}));await click(page.getByRole('button',{name:'Delete / reverse',exact:true}));d=dialog(page,'Party transaction editor');await d.getByRole('textbox',{name:'Correction reason'}).fill('UI regression check: remove temporary preview receipt');await d.getByRole('button',{name:'Review reversal'}).click();await d.getByRole('button',{name:'Confirm reversal'}).click();await expect(d).toBeHidden();await expect(page.getByRole('button',{name:/^Actions for PAYMENT:/}).filter({visible:true})).toHaveCount(0);
     });
     await step(tag+' customer and supplier credit refunds',async()=>{
      for(const [id,role,action,confirm] of [['c4','Customer','Receive payment','Confirm receive payment'],['s1','Supplier','Make payment','Confirm pay supplier']]){
      await goto(page,id,role);await click(page.getByRole('button',{name:action,exact:true}));let d=dialog(page,'Party payment');await d.getByRole('textbox',{name:'Payment amount'}).fill('200000');await d.getByRole('button',{name:'Review payment'}).click();await d.getByRole('button',{name:confirm}).click();await expect(d).toBeHidden();
      await more(page,'Refund credit');d=dialog(page,'Party credit refund');await d.getByRole('button',{name:'Review refund'}).click();await expect(d.getByRole('alert')).toBeVisible();await shot(page,tag+'-'+role.toLowerCase()+'-refund-validation');await d.getByRole('textbox',{name:'Credit refund amount'}).fill('10');await d.getByRole('textbox',{name:'Credit refund reason'}).fill('Safe UI check · অগ্রিম ফেরত');await d.getByRole('button',{name:'Review refund'}).click();await expect(d.getByRole('status')).toBeVisible();await shot(page,tag+'-'+role.toLowerCase()+'-refund-review');await d.getByRole('button',{name:'Confirm credit refund'}).click();await expect(d).toBeHidden();await expect(page.getByRole('button',{name:/^Actions for REFUND/}).filter({visible:true})).toHaveCount(1);
      }
     });
     await step(tag+' supplier payment and refund eligibility',async()=>{
      await goto(page,'s1','Supplier');await click(page.getByRole('button',{name:'Make payment',exact:true}));const d=dialog(page,'Party payment');await expect(d).toContainText('Outstanding supplier due');await d.getByRole('textbox',{name:'Payment amount'}).fill('50');await d.getByRole('button',{name:'Review payment'}).click();await expect(d.getByRole('status')).toContainText('Pay supplier');await shot(page,tag+'-supplier-review');await close(page,d);
      const attachment=page.getByRole('button',{name:/^Open attachment /,exact:false}).filter({visible:true}).first();await attachment.click();const preview=dialog(page,'Attachment preview');await expect(preview.getByTestId('party-attachment-preview')).toBeVisible();await shot(page,tag+'-attachment');await close(page,preview);
     });
     await step(tag+' owner lender borrower finance isolation',async()=>{
      for(const [id,role,action,type] of [['o1','Owner','Add capital','Owner Credit'],['l1','Lender','Repay loan','Lender Debit'],['b1','Borrower','Collect repayment','Borrower Credit'],['o1','Owner','Owner drawing','Owner Debit'],['l1','Lender','Loan received','Lender Credit'],['b1','Borrower','Lend money','Borrower Debit']]){
       await goto(page,id,role);await click(page.getByRole('button',{name:action,exact:true}));const d=dialog(page,'Party finance transaction');await expect(d.getByRole('combobox',{name:'Finance transaction type'})).toHaveAttribute('data-value',type);await d.getByRole('button',{name:'Review finance transaction'}).click();await expect(d.getByRole('alert')).toContainText('greater than zero');await d.getByRole('textbox',{name:'Finance amount'}).fill('100');await d.getByRole('textbox',{name:'Finance note'}).fill('Safe UI check · বাংলা মন্তব্য · no live posting');await d.getByRole('button',{name:'Review finance transaction'}).click();await expect(d.getByRole('status')).toBeVisible();await shot(page,tag+'-'+type.toLowerCase().replaceAll(' ','-')+'-review');await d.getByRole('button',{name:'Confirm finance transaction'}).click();await expect(d).toBeHidden();await expect(page.getByRole('button',{name:/^Actions for PARTY-FINANCE:/}).filter({visible:true})).toHaveCount(1);
      }
     });
     await step(tag+' vendor memo settlement controls',async()=>{
      for(const [action,save] of [['Pay Vendor','Save Payment'],['Receive Money','Save Receipt']]){await goto(page,'s3','Vendor');await click(page.getByRole('button',{name:action,exact:true}));const d=dialog(page,action);await expect(d).toBeVisible();await shot(page,tag+'-vendor-'+action.toLowerCase().replaceAll(' ','-'));
      if(await d.getByRole('textbox',{name:'Split amount 1'}).count()){await d.getByRole('textbox',{name:'Split amount 1'}).fill('1');await expect(d.getByRole('button',{name:save,exact:true})).toBeEnabled();await d.getByRole('button',{name:save,exact:true}).click();await expect(d).toBeHidden();}else blocked.push(tag+': '+action+' has no priced outstanding memo; truthful empty state captured');await close(page,d);}
     });
     await step(tag+' opening balance large, negative and zero presentation',async()=>{
      await goto(page,'py1','Payee');await more(page,/^(Edit opening balance|Opening balance)$/);let d=dialog(page,'Party opening balance');await d.getByRole('textbox',{name:'Opening balance amount'}).fill('1234567890123.45');await d.getByRole('textbox',{name:'Opening balance note'}).fill('Safe UI fixture · অনেক বড় টাকা · test only');await d.getByRole('radio').last().check();await d.getByRole('button',{name:/^Save opening balance$/}).click();await expect(d).toBeHidden();await shot(page,tag+'-large-credit-balance');
      const card=page.getByTestId('party-balance-card').filter({visible:true});const overflow=await card.evaluateAll(nodes=>nodes.map(node=>({scroll:node.scrollWidth,client:node.clientWidth})));assert.ok(overflow.every(v=>v.scroll<=v.client+1),'full large amount fits balance card: '+JSON.stringify(overflow));
      let largeSummaryLines=1;const summary=page.locator('[aria-label="Ledger summary"]:visible strong').last();if(await summary.count()){largeSummaryLines=await summary.evaluate(node=>{const r=document.createRange();r.selectNodeContents(node);return [...new Set([...r.getClientRects()].map(v=>Math.round(v.y)))].length;});}
      await more(page,/^(Edit opening balance|Opening balance)$/);d=dialog(page,'Party opening balance');await d.getByRole('textbox',{name:'Opening balance amount'}).fill('0');await d.getByRole('button',{name:'Clear opening balance',exact:true}).click();await expect(d).toBeHidden();await expect(page.getByTestId('party-closing-balance')).toHaveAttribute('data-balance-meaning','settled');await shot(page,tag+'-zero-balance');assert.equal(largeSummaryLines,1,'large period amount remains one readable number rather than fragmented digit lines');
     });
     await step(tag+' long bilingual note and zero-money ledger row',async()=>{
      await goto(page);await page.getByRole('tab',{name:/^Notes/}).click();const note='Safe UI note · বাংলা মন্তব্য · '+('বাকির হিসাব যাচাই করে শুক্রবার যোগাযোগ করবেন। Long transaction description with references and Bengali text. ').repeat(4);await page.getByRole('textbox',{name:'New note',exact:true}).fill(note);await page.getByRole('textbox',{name:'New note',exact:true}).press('Enter');await page.getByRole('tab',{name:/^Ledger/}).click();await expect(page.locator('main')).toContainText('Safe UI note');await shot(page,tag+'-long-bilingual-note');
      await page.getByRole('tab',{name:/^Notes/}).click();await click(page.getByRole('button',{name:'Delete note '+note,exact:true}));const d=dialog(page,'Delete party note');await d.getByRole('button',{name:'Confirm delete',exact:true}).click();await expect(d).toBeHidden();
     });
     await step(tag+' source invoice and preserved new-invoice return',async()=>{
      await goto(page);const search=page.getByRole('textbox',{name:'Search ledger transactions'});await search.fill('INV-000241');await click(page.getByRole('button',{name:'New invoice',exact:true}));await expect(page).toHaveURL(/\/app\/pos\?partyId=c1/);await click(page.getByRole('button',{name:'Back to party',exact:true}));await expect(page).toHaveURL(/\/app\/parties\?id=c1&role=Customer/);await expect(search).toHaveValue('INV-000241');
      const action=page.getByRole('button',{name:'Actions for INV-000241',exact:true}).filter({visible:true});await action.click();await click(page.getByRole('button',{name:'View',exact:true}));const d=dialog(page,'Party transaction details');await d.getByRole('button',{name:'Open full invoice',exact:false}).click();await expect(page).toHaveURL(/\/app\/pos\?mode=edit&invoice=INV-000241/);await page.goBack();await page.getByRole('textbox',{name:'Search ledger transactions'}).waitFor();assert.match(page.url(),/\/app\/parties/);
     });
     await step(tag+' direct source return context',async()=>{
      await goto(page);const search=page.getByRole('textbox',{name:'Search ledger transactions'});await search.fill('INV-000241');await page.getByRole('button',{name:'Actions for INV-000241',exact:true}).filter({visible:true}).click();await page.getByRole('button',{name:'View',exact:true}).click();await dialog(page,'Party transaction details').getByRole('button',{name:/Open full invoice/}).click();await expect(page).toHaveURL(/mode=edit&invoice=INV-000241/);await page.goBack();await search.waitFor();assert.match(page.url(),/id=c1&role=Customer/);if(await search.inputValue()!=='INV-000241')blocked.push(tag+': existing direct source→browser Back retains Party/role but loses ledger search; POS editor returns to Sales. New-invoice return context separately passes.');await shot(page,tag+'-source-return');
     });
    }
    assert.deepEqual(errors,[],tag+' page errors');
   }catch(error){results.push({name:tag+' setup',status:'failed',error:error.message});}finally{await context.close();}
  }
  // Explicit supported language and digit coverage. No global settings changes.
  for(const language of ['English','English + Bangla','Bangla']){
   const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});await context.addInitScript(language=>localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({language,mode:'Simple',density:'Compact',terminology:'simple',dateView:'transaction'})),language);const page=await context.newPage();activePage=page;page.setDefaultTimeout(15000);
   await step(language+' bilingual payment input',async()=>{await goto(page);await click(page.getByRole('button',{name:language==='Bangla'?'টাকা নিন':'Receive payment',exact:true}));const d=page.getByRole('dialog',{name:language==='Bangla'?'পক্ষের পেমেন্ট':'Party payment',exact:true});const input=d.getByRole('textbox',{name:language==='Bangla'?'পেমেন্টের টাকা':'Payment amount',exact:true});await input.fill('১২৩৪৫.৬৭');const displayed=await input.inputValue();assert.ok(['১২৩৪৫.৬৭','12345.67'].includes(displayed),'digit text retained or normalized through existing input');await expect(page.getByRole('tab',{name:language==='Bangla'?/^খাতা/:/^Ledger/})).toBeVisible();await d.getByRole('button',{name:language==='Bangla'?'পেমেন্ট যাচাই করুন':'Review payment',exact:true}).click();if(await d.getByRole('alert').count()){blocked.push(language+': existing payment parser rejects Bangla-digit input: '+await d.getByRole('alert').innerText());}else{await expect(d.getByRole('status')).toBeVisible();await expect(d.getByRole('status')).toContainText('12,345.67');}await shot(page,'390-'+language.replaceAll(' ','-')+'-bangla-digits');await close(page,d);});await context.close();
  }
 }finally{await browser.close();}
 blocked.push('Loading/network-error state has no genuine async Party Ledger data source in this in-memory preview. Not fabricated.');
 const report={label,base,results,blocked,screenshotGeometry,passed:results.filter(x=>x.status==='passed').length,failed:results.filter(x=>x.status==='failed').length};fs.writeFileSync(path.join(out,`${label}-results.json`),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));if(report.failed)process.exitCode=1;
}
main().catch(error=>{console.error(error);process.exitCode=1;});
