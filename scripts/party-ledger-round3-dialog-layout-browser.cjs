/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires -- standalone browser evidence */
const {chromium}=require('playwright');
const {expect}=require('playwright/test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const out=process.env.PARTY_LEDGER_EVIDENCE||'/tmp/party-dialog-layout';
const base=process.env.PARTY_LEDGER_URL||'http://127.0.0.1:4311';
const results=[];
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  for(const width of (process.env.PARTY_LEDGER_WIDTHS||'320,390').split(',').map(Number))for(const theme of (process.env.PARTY_LEDGER_THEMES||'light,dark').split(','))for(const language of (process.env.PARTY_LEDGER_LANGUAGES||'English,English + Bangla,Bangla').split(',')){
   const context=await browser.newContext({viewport:{width,height:900},hasTouch:true,colorScheme:theme,reducedMotion:'reduce'});
   await context.addInitScript(({theme,language})=>{localStorage.setItem('hisabiq-theme',theme);localStorage.setItem('theme',theme);localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language,density:'Compact',terminology:'simple',dateView:'transaction'}));},{theme,language});
   const page=await context.newPage();page.setDefaultTimeout(10000);
   const t=(en,bn)=>language==='Bangla'?bn:en;
   const tag=`${width}-${theme}-${language.replaceAll(' ','-')}`;
   const dialog=(en,bn)=>page.getByRole('dialog',{name:t(en,bn),exact:true});
   const input=(d,en,bn)=>d.getByRole('textbox',{name:t(en,bn),exact:true});
   const button=(d,en,bn)=>d.getByRole('button',{name:t(en,bn),exact:true});
   const act=async(locator,keyboard=false)=>{if(keyboard){await locator.focus();await locator.press('Enter');}else await locator.tap();};
   const go=async(id='c4',role='Customer')=>{await page.goto(`${base}/#/app/parties?id=${id}&role=${role}`,{waitUntil:'domcontentloaded'});await page.reload({waitUntil:'domcontentloaded'});await page.getByRole('tab',{name:language==='Bangla'?/^খাতা/:/^Ledger/}).first().waitFor();};
   const more=async(en,bn)=>{const direct=page.getByRole('button',{name:t(en,bn),exact:true}).filter({visible:true});if(await direct.count())return act(direct.first());await act(page.getByRole('button',{name:/^(More|More actions|আরও|আরও কাজ)$/}).first());await act(page.getByRole('menuitem',{name:t(en,bn),exact:true}).or(page.getByRole('button',{name:new RegExp('^'+t(en,bn))})).first());};
   const bounds=async(d,state)=>{
    await d.evaluate(el=>{el.scrollLeft=0;});
    const geometry=await d.evaluate(el=>{const r=el.getBoundingClientRect();return {dialog:{left:r.left,right:r.right,clientWidth:el.clientWidth,scrollWidth:el.scrollWidth},footer:[...(el.querySelector('div.flex.flex-wrap.justify-end')?.querySelectorAll(':scope > button')||[])].map(n=>({fontSize:getComputedStyle(n).fontSize,lineHeight:getComputedStyle(n).lineHeight,height:n.getBoundingClientRect().height,clientHeight:n.clientHeight,scrollHeight:n.scrollHeight,clientWidth:n.clientWidth,scrollWidth:n.scrollWidth})),controls:[...el.querySelectorAll('button,input,[role=combobox]')].filter(n=>n.getBoundingClientRect().width>0).map(n=>{const b=n.getBoundingClientRect();return {name:n.getAttribute('aria-label')||n.textContent.trim(),left:b.left,right:b.right,width:b.width,height:b.height};})};});
    const failures=[];
    if(geometry.dialog.scrollWidth>geometry.dialog.clientWidth+1)failures.push('dialog needs sideways scrolling');
    for(const control of geometry.footer){if(control.fontSize!=='14px'||control.lineHeight!=='20px')failures.push('footer typography changed');if(Math.abs(control.height-36)>1)failures.push('footer control height changed');if(control.scrollHeight>control.clientHeight+1||control.scrollWidth>control.clientWidth+1)failures.push('footer label clips');}
    for(const control of geometry.controls)if(control.left<geometry.dialog.left-1||control.right>geometry.dialog.right+1||control.left<0||control.right>width+1)failures.push('offscreen control '+control.name);
    await page.screenshot({path:path.join(out,`${tag}-${state}.png`),fullPage:false});await expect(d).toBeVisible();
    if(state.endsWith('-review')){await d.locator('div.flex.flex-wrap.justify-end > button').last().scrollIntoViewIfNeeded();assert.equal(await d.evaluate(el=>el.scrollLeft),0,'footer is reachable without horizontal scrolling');await page.screenshot({path:path.join(out,`${tag}-${state}-footer.png`),fullPage:false});await expect(d).toBeVisible();}
    results.push({name:`${tag} ${state}`,status:failures.length?'failed':'passed',geometry,failures});
   };
   try{
    await go();
    await act(button(page,'Receive payment','টাকা নিন'));
    let d=dialog('Party payment','পক্ষের পেমেন্ট');
    await bounds(d,'payment-blank');
    await act(button(d,'Review payment','পেমেন্ট যাচাই করুন'));
    await expect(input(d,'Payment amount','পেমেন্টের টাকা')).toBeFocused();await bounds(d,'payment-error');
    await input(d,'Payment amount','পেমেন্টের টাকা').fill('200000');
    await act(button(d,'Review payment','পেমেন্ট যাচাই করুন'),true);await bounds(d,'payment-review');
    await expect(input(d,'Payment amount','পেমেন্টের টাকা')).toHaveValue('200000');
    await act(button(d,'Confirm receive payment','ক্রেতার টাকা নেওয়া নিশ্চিত করুন'));await expect(d).toBeHidden();
    for(const reverse of [false,true]){
     await act(page.getByRole('button',{name:/^(Actions for PAYMENT:|কাজ PAYMENT:)/}).filter({visible:true}).first());
     await act(button(page,reverse?'Delete / reverse':'Edit',reverse?'মুছুন / উল্টো এন্ট্রি':'সম্পাদনা').first());
     d=dialog('Party transaction editor','লেনদেন সংশোধন');
     const review=button(d,reverse?'Review reversal':'Review correction',reverse?'উল্টো লেনদেন যাচাই':'সংশোধন যাচাই');
     await bounds(d,reverse?'reversal-blank':'correction-blank');await act(review);
     await expect(input(d,'Correction reason','সংশোধনের কারণ')).toBeFocused();await bounds(d,reverse?'reversal-error':'correction-error');
     await input(d,'Correction reason','সংশোধনের কারণ').fill('Layout draft · বাংলা');
     if(!reverse)await input(d,'Corrected payment amount','সংশোধিত পেমেন্টের টাকা').fill('200001');
     await act(review,true);await bounds(d,reverse?'reversal-review':'correction-review');
     await expect(input(d,'Correction reason','সংশোধনের কারণ')).toHaveValue('Layout draft · বাংলা');
     await act(button(d,reverse?'Confirm reversal':'Confirm correction',reverse?'উল্টো লেনদেন নিশ্চিত করুন':'সংশোধন নিশ্চিত করুন'));await expect(d).toBeHidden();
    }
    await go();await act(button(page,'Receive payment','টাকা নিন'));d=dialog('Party payment','পক্ষের পেমেন্ট');await input(d,'Payment amount','পেমেন্টের টাকা').fill('200000');await act(button(d,'Review payment','পেমেন্ট যাচাই করুন'));await act(button(d,'Confirm receive payment','ক্রেতার টাকা নেওয়া নিশ্চিত করুন'));await expect(d).toBeHidden();
    await more('Refund credit','জমা টাকা ফেরত');d=dialog('Party credit refund','অগ্রিম টাকা ফেরত');await bounds(d,'refund-blank');await act(button(d,'Review refund','ফেরত যাচাই করুন'));await bounds(d,'refund-error');await input(d,'Credit refund amount','ফেরতের টাকা').fill('10');await input(d,'Credit refund reason','ফেরতের কারণ').fill('Refund draft · বাংলা');await act(button(d,'Review refund','ফেরত যাচাই করুন'),true);await bounds(d,'refund-review');await expect(input(d,'Credit refund reason','ফেরতের কারণ')).toHaveValue('Refund draft · বাংলা');await act(button(d,'Confirm credit refund','ফেরত নিশ্চিত করুন'));await expect(d).toBeHidden();
    await go('s1','Supplier');await act(button(page,'Make payment','টাকা দিন'));d=dialog('Party payment','পক্ষের পেমেন্ট');await bounds(d,'supplier-blank');await act(button(d,'Review payment','পেমেন্ট যাচাই করুন'));await bounds(d,'supplier-error');await input(d,'Payment amount','পেমেন্টের টাকা').fill('50');await act(button(d,'Review payment','পেমেন্ট যাচাই করুন'),true);await bounds(d,'supplier-review');await act(button(d,'Confirm pay supplier','সরবরাহকারীকে টাকা দেওয়া নিশ্চিত করুন'));await expect(d).toBeHidden();
    await go('o1','Owner');await act(button(page,'Add capital','মূলধন যোগ'));d=dialog('Party finance transaction','ঋণ বা মূলধনের লেনদেন');await bounds(d,'finance-blank');await input(d,'Finance note','লেনদেনের মন্তব্য').fill('Finance draft · বাংলা');await act(button(d,'Review finance transaction','লেনদেন যাচাই করুন'));await bounds(d,'finance-error');await input(d,'Finance amount','টাকার পরিমাণ').fill('100');await act(button(d,'Review finance transaction','লেনদেন যাচাই করুন'),true);await bounds(d,'finance-review');await expect(input(d,'Finance note','লেনদেনের মন্তব্য')).toHaveValue('Finance draft · বাংলা');await act(button(d,'Confirm finance transaction','লেনদেন নিশ্চিত করুন'));await expect(d).toBeHidden();
    await go('py1','Payee');await more('Opening balance','শুরুর জের');d=dialog('Party opening balance','পার্টির শুরুর জের');await bounds(d,'opening-blank');await input(d,'Opening balance amount','শুরুর জেরের টাকা').fill('');await input(d,'Opening balance note','শুরুর জেরের নোট').fill('Opening draft · বাংলা');await act(button(d,'Save opening balance','শুরুর জের রাখুন'));await bounds(d,'opening-error');await expect(input(d,'Opening balance note','শুরুর জেরের নোট')).toHaveValue('Opening draft · বাংলা');await input(d,'Opening balance amount','শুরুর জেরের টাকা').fill('100');await bounds(d,'opening-save');await act(button(d,'Save opening balance','শুরুর জের রাখুন'),true);await expect(d).toBeHidden();
   }catch(error){results.push({name:tag+' workflow',status:'failed',error:error.message});console.error(tag+': '+error.message.split('\n')[0]);}
   await context.close();
  }
 }finally{await browser.close();fs.writeFileSync(path.join(out,'dialog-layout-results.json'),JSON.stringify(results,null,2));}
 const failed=results.filter(x=>x.status==='failed');console.log(`Party financial dialog layout: ${results.length-failed.length}/${results.length} passed`);assert.equal(failed.length,0,JSON.stringify(failed.map(x=>({name:x.name,failures:x.failures,error:x.error})),null,2));
})().catch(error=>{console.error(error);process.exitCode=1;});
