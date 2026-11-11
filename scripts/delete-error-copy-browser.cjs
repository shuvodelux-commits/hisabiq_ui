const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4239,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox','--disable-dev-shm-usage']});
 const results=[];
 try{for(const profile of [{width:390,height:844,theme:'dark',language:'Bangla'}]){
 const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},reducedMotion:'reduce'});
 await context.addInitScript(p=>{localStorage.setItem('hisabiq-theme',p.theme);localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language:p.language,density:'Compact',terminology:'simple',dateView:'transaction'}));},profile);
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:'',contentType:'text/css'}));
 const go=async route=>{await page.goto('http://127.0.0.1:4239/#/app/'+route);await page.locator('main').waitFor();};
 const deletion=()=>page.getByRole('button',{name:/^Delete$|^মুছুন$/});
 const shot=async name=>page.screenshot({path:`/tmp/delete-policy-${profile.width}-${name}.png`});
 await go('expenses');
 const source=await page.evaluate(async()=>{const s=await import('/src/data/expensePreviewStore.ts');return s.getExpensePreviewSnapshot().expenses[0];});
 const row=page.getByRole('row').filter({hasText:source.ref});await row.getByRole('button').last().click();
 await deletion().click();let dialog=page.getByRole('dialog');await dialog.getByRole('textbox').fill('');
 await shot('expense-review');
 await dialog.getByRole('button',{name:/Confirm cancellation|বাতিল নিশ্চিত/}).click();await dialog.getByRole('alert').waitFor();assert.match(await dialog.getByRole('alert').innerText(),/মূল লেনদেন বাতিল বা উল্টো করার কারণ লিখুন/);
 await dialog.getByRole('textbox').fill('Duplicate source expense');
 await dialog.getByRole('button',{name:/Keep expense|খরচ রাখুন/}).click();
 assert.equal(await page.evaluate(async id=>(await import('/src/data/expensePreviewStore.ts')).getExpensePreviewSnapshot().expenses.find(e=>e.id===id).recordStatus,source.id),undefined);
 await row.getByRole('button').last().click();await deletion().click();dialog=page.getByRole('dialog');await dialog.getByRole('textbox').fill('Duplicate source expense');
 await dialog.getByRole('button',{name:/Confirm cancellation|বাতিল নিশ্চিত/}).click();await dialog.waitFor({state:'hidden'});
 const audit=await page.evaluate(async()=> (await import('/src/data/expensePreviewStore.ts')).getExpensePreviewSnapshot().audit.at(-1));assert.equal(audit.actorId,'mahmud');assert.equal(audit.after.id,source.id);assert.equal(audit.reason,'Duplicate source expense');
 await go('finance?tab=transactions');
 const finance=await page.evaluate(async()=> (await import('/src/data/financePreviewStore.ts')).getFinancePreviewSnapshot().transactions.find(t=>t.status==='Active'&&t.direction==='in'));
 await page.getByRole('button',{name:new RegExp(finance.id)}).last().click();await deletion().click();dialog=page.getByRole('dialog');
 await dialog.getByRole('button',{name:/Confirm reverse|উল্টো করা নিশ্চিত/}).click();await dialog.getByRole('alert').waitFor();assert.match(await dialog.getByRole('alert').innerText(),/মূল লেনদেন বাতিল বা উল্টো করার কারণ লিখুন/);
 await dialog.getByRole('textbox',{name:/Reason for reversal|উল্টো করার কারণ/}).fill('Duplicate finance source');await shot('finance-review');
 await dialog.getByRole('button',{name:/Confirm reverse|উল্টো করা নিশ্চিত/}).click();
 const reversed=await page.evaluate(async id=>(await import('/src/data/financePreviewStore.ts')).getFinancePreviewSnapshot().transactions.find(t=>t.id===id),finance.id);assert.equal(reversed.status,'Reversed');assert.equal(reversed.reversal.actorId,'mahmud');assert.equal(reversed.reversal.reason,'Duplicate finance source');
 await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);console.log('Bangla mobile dark: expense and finance empty reason readable, cancellation/reversal preserved; no page errors');await context.close();
 } }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
