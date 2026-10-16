/* Finance draft validation: real browser actions, frontend preview records only. */
const {chromium}=require('playwright');const {expect}=require('playwright/test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const sizes=process.env.DEEP_AUDIT_SMOKE?[[390,844]]:[[320,700],[360,800],[390,844],[430,932],[768,1024],[1024,768],[1280,800],[1440,900]];
const languages=process.env.DEEP_AUDIT_SMOKE?['English + Bangla']:['English','English + Bangla','Bangla'];
const port=Number(process.env.DEEP_AUDIT_PORT||4486),output=process.env.DEEP_AUDIT_OUTPUT||'.superpowers/deep-audit/finance-validation',results=[];
async function main(){
 const {createServer}=await import('vite');const server=await createServer({cacheDir:'.superpowers/finance-validation-cache-'+port,server:{host:'127.0.0.1',port,strictPort:true}});await server.listen();const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});fs.mkdirSync(output,{recursive:true});
 try{for(const [width,height]of sizes)for(const theme of ['light','dark'])for(const language of languages){
  const bn=language==='Bangla',id=width+'-'+theme+'-'+language.replaceAll(' ','');const context=await browser.newContext({viewport:{width,height},hasTouch:width<=1024,reducedMotion:'reduce',colorScheme:theme});await context.addInitScript(({theme,language})=>{localStorage.setItem('hisabiq-theme',theme);localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language,density:'Compact',terminology:'simple',dateView:'transaction'}));},{theme,language});await context.tracing.start({screenshots:true,snapshots:true,sources:true});const page=await context.newPage();page.setDefaultNavigationTimeout(60000);await page.route('https://fonts.googleapis.com/**',r=>r.abort());const errors=[];page.on('pageerror',e=>errors.push(e.message));
  const word=(en,bangla)=>bn?bangla:en;const act=e=>width<=1024?e.tap():e.click();
  const field=(d,en,bangla)=>d.locator('label').filter({hasText:new RegExp('^'+word(en,bangla))}).getByRole('textbox');
  const amount=d=>field(d,'Amount','টাকা');
  const button=(d,en,bangla)=>d.getByRole('button',{name:word(en,bangla),exact:true});
  let visit=0;
  const go=()=>page.goto(`http://127.0.0.1:${port}/?financeAudit=${++visit}#/app/finance`,{waitUntil:'domcontentloaded'});
  const accounts=async()=>act(page.getByRole('tab',{name:word('Money Accounts','টাকার হিসাব'),exact:true}));
  const check=async(name,run)=>{if(process.env.DEEP_AUDIT_CASE&&process.env.DEEP_AUDIT_CASE!==name)return;try{await run();assert.deepEqual(errors,[]);results.push({id,name,status:'passed'});}catch(e){results.push({id,name,status:'failed',error:e.message});console.error(id,name,e.message);await page.screenshot({path:path.join(output,id+'-'+name+'.png'),fullPage:true});}};
  const rejectedReview=async(d,review)=>{await act(review);await expect(d.getByRole('status'),'invalid draft cannot enter confirmation').toHaveCount(0);await expect(d).toBeVisible();};
  await check('new-finance',async()=>{
   await go();await act(button(page,'New transaction','নতুন লেনদেন'));const d=page.getByRole('dialog',{name:new RegExp(word('New finance transaction','নতুন টাকার লেনদেন'))});const input=amount(d);const review=button(d,'Review transaction','লেনদেন যাচাই করুন');
   for(const invalid of ['1.2.3','9'.repeat(400)]){await input.fill(invalid);await rejectedReview(d,review);}
   await input.fill('123');await act(review);
   await expect(d.getByRole('status')).toContainText('123');
   await act(button(d,'Cancel','বাতিল'));await expect(d).toBeHidden();
   await act(button(page,'New transaction','নতুন লেনদেন'));await expect(input).toHaveValue('123');await expect(d.getByRole('status')).toHaveCount(0);await act(review);await act(button(d,'Confirm finance transaction','লেনদেন নিশ্চিত করুন'));await expect(d).toBeHidden();
   await act(page.getByRole('tab',{name:word('Loans & Owners','ঋণ ও মালিক'),exact:true}));await expect(page.locator('tbody tr').filter({hasText:'FIN-000189'})).toContainText('123');
  });
  await check('split-draft',async()=>{
   await go();await act(button(page,'New transaction','নতুন লেনদেন'));const d=page.getByRole('dialog',{name:new RegExp(word('New finance transaction','নতুন টাকার লেনদেন'))});await amount(d).fill('100');
   // Shared split amount precedes the main Amount field and has a dynamic total placeholder.
   const source=d.getByPlaceholder('100',{exact:true});const review=button(d,'Review transaction','লেনদেন যাচাই করুন');
   for(const invalid of ['0','100.0.0','9'.repeat(400)]){await source.fill(invalid);await rejectedReview(d,review);}
   await source.fill('100');await act(button(d,'Add','যোগ করুন'));
   await d.getByPlaceholder('0',{exact:true}).first().fill('0');await rejectedReview(d,review);
   await d.getByPlaceholder('0',{exact:true}).first().fill('50');
   // Two split rows use zero placeholders; amount input also does, so scope to the payment source block.
   const sources=d.getByText(word('Payment sources','টাকার মাধ্যম'),{exact:true}).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');const sourceInputs=sources.getByRole('textbox');await sourceInputs.nth(0).fill('50');await sourceInputs.nth(1).fill('50');
   await act(review);await expect(d.getByRole('status')).toContainText('100');await act(button(d,'Confirm finance transaction','লেনদেন নিশ্চিত করুন'));await expect(d).toBeHidden();await act(page.getByRole('tab',{name:word('Loans & Owners','ঋণ ও মালিক'),exact:true}));await expect(page.locator('tbody tr').filter({hasText:'FIN-000189'})).toContainText('100');
  });
  await check('transfer',async()=>{
   await go();await accounts();await act(button(page,'Transfer','ট্রান্সফার'));const d=page.getByRole('dialog',{name:word('Transfer between accounts','এক হিসাব থেকে অন্য হিসাবে টাকা সরান'),exact:true});const review=button(d,'Review transfer','ট্রান্সফার যাচাই করুন');
   for(const invalid of ['1.2.3','9'.repeat(400)]){await amount(d).fill(invalid);await rejectedReview(d,review);}
   await amount(d).fill('123');await act(review);await expect(d.getByRole('status')).toContainText('123');await act(button(d,'Cancel','বাতিল'));await expect(d).toBeHidden();await act(button(page,'Transfer','ট্রান্সফার'));await expect(amount(d)).toHaveValue('');await amount(d).fill('123');await act(review);await act(button(d,'Confirm transfer','টাকা সরানো নিশ্চিত করুন'));await expect(d).toBeHidden();await expect(page.locator('tbody tr').first()).toContainText('123');
  });
  await check('account-opening',async()=>{
   await go();await accounts();await act(button(page,'Add account','হিসাব যোগ করুন'));const d=page.getByRole('dialog',{name:new RegExp(word('Add account','নতুন হিসাব যোগ করুন'))});await field(d,'Account name','হিসাবের নাম').fill('Audit preview account');const input=field(d,'Opening balance','শুরুর জের');const save=button(d,'Save account','হিসাব সংরক্ষণ');
   for(const invalid of ['1.2.3','9'.repeat(400)]){await input.fill(invalid);await act(save);await expect(d,'invalid opening balance cannot create account').toBeVisible();await expect(field(d,'Account name','হিসাবের নাম')).toHaveValue('Audit preview account');}
   await input.fill('');await act(save);await expect(d).toBeHidden();await expect(page.locator('main').getByText('Audit preview account',{exact:true})).toBeVisible();
  });
  await check('edit-finance',async()=>{
   await go();await act(page.getByRole('tab',{name:word('Loans & Owners','ঋণ ও মালিক'),exact:true}));const row=page.locator('tbody tr').first();const original=await row.innerText();await act(row.getByRole('button').last());const d=page.locator('[data-dialog-root]');await act(button(d,'Edit','সংশোধন'));const sources=d.getByText(word('Payment sources','টাকার মাধ্যম'),{exact:true}).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');await sources.getByRole('textbox').fill('');const save=button(d,'Save changes','সংশোধন সংরক্ষণ');
   for(const invalid of ['1.2.3','9'.repeat(400)]){await amount(d).fill(invalid);await act(save);await expect(save,'invalid correction remains editable').toBeVisible();assert.equal(await row.innerText(),original);}
   await amount(d).fill('123');await act(save);await expect(save).toBeHidden();await act(button(d,'Close','বন্ধ করুন').first());await expect(row).toContainText('123');
  });
  await check('manual-account',async()=>{
   await go();await accounts();const card=page.locator('p').filter({hasText:/^Main Cash Counter$/}).locator('xpath=ancestor::div[contains(@class,"rounded-xl")][1]');const original=await card.innerText();const readBalance=async()=>Number((await card.innerText()).match(/৳([\d,]+(?:\.\d+)?)/)[1].replaceAll(',',''));const balanceBefore=await readBalance();await act(card.getByRole('button').last());const d=page.locator('[data-dialog-root]');await act(button(d,'Money in / out','টাকা আসা / যাওয়া'));const save=button(d,'Record entry','লেনদেন লিখুন');
   for(const invalid of ['1.2.3','9'.repeat(400)]){await amount(d).fill(invalid);await act(save);await expect(save,'invalid account entry remains editable').toBeVisible();assert.equal(await card.innerText(),original);}
   await amount(d).fill('123');await act(save);await expect(save).toBeHidden();await act(button(d,'Close','বন্ধ করুন').first());assert.equal(await readBalance(),balanceBefore+123,'valid manual entry adds exactly the entered amount');
  });
  await check('cheque',async()=>{
   await go();await act(page.getByRole('tab',{name:word('Cheques','চেক'),exact:true}));const rows=page.locator('main tbody tr');const initial=await rows.count();await act(button(page,'New cheque','নতুন চেক').first());const d=page.getByRole('dialog',{name:new RegExp(word('New cheque','নতুন চেক'))});
   await field(d,'Cheque number','চেক নম্বর').fill('QA-VALIDATION-ONE');await field(d,'Bank','ব্যাংক').fill('QA Bank');await field(d,'Received from','কার কাছ থেকে পেয়েছি').fill('QA Customer');const chequeType=d.locator('label').filter({hasText:new RegExp('^'+word('Cheque type','চেকের ধরন'))}).getByRole('combobox');await act(chequeType);await act(page.getByRole('option',{name:word('Issued','দিয়েছি'),exact:true}));await expect(field(d,'Issued to','কাকে দিয়েছি')).toHaveValue('QA Customer');await act(chequeType);await act(page.getByRole('option',{name:word('Received','পেয়েছি'),exact:true}));await expect(field(d,'Received from','কার কাছ থেকে পেয়েছি')).toHaveValue('QA Customer');const save=button(d,'Save cheque','চেক সংরক্ষণ');
   for(const invalid of ['1.2.3','9'.repeat(400)]){await amount(d).fill(invalid);await act(save);await expect(d,'invalid cheque cannot be saved').toBeVisible();await expect(rows).toHaveCount(initial);}
   await amount(d).fill('123');await act(button(d,'Cancel','বাতিল'));await expect(d).toBeHidden();await act(button(page,'New cheque','নতুন চেক').first());await expect(amount(d)).toHaveValue('123');await expect(field(d,'Cheque number','চেক নম্বর')).toHaveValue('QA-VALIDATION-ONE');await act(save);await expect(d).toBeHidden();const first=rows.filter({hasText:'QA-VALIDATION-ONE'});await expect(first).toContainText('123');await expect(first,'save the bank visibly selected by default').toContainText('Dutch-Bangla Bank · 4582');
   await act(button(page,'New cheque','নতুন চেক').first());await field(d,'Cheque number','চেক নম্বর').fill('QA-VALIDATION-TWO');const bank=d.locator('label').filter({hasText:new RegExp('^'+word('Bank / Money Account','ব্যাংক / টাকার হিসাব'))}).getByRole('combobox');await act(bank);await act(page.getByRole('option',{name:'BRAC Bank · 7714',exact:true}));await act(save);await expect(d).toBeHidden();await expect(rows.filter({hasText:'QA-VALIDATION-TWO'})).toContainText('BRAC Bank · 7714');
  });
  const failed=results.some(r=>r.id===id&&r.status==='failed');await context.tracing.stop(failed?{path:path.join(output,id+'-trace.zip')}:{});await context.close();console.log(id,results.filter(r=>r.id===id).map(r=>r.name+':'+r.status).join(','));
 }}finally{fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));await browser.close();await server.close();}console.log(results.length+' journeys; '+results.filter(r=>r.status==='failed').length+' failed');assert.equal(results.filter(r=>r.status==='failed').length,0);
}
main().catch(e=>{console.error(e);process.exitCode=1;});
