const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4241,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 try{
  const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{localStorage.setItem('hisabiq-theme','dark');localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language:'Bangla',density:'Compact',terminology:'simple',dateView:'transaction'}));});
  await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:'',contentType:'text/css'}));
  await page.goto('http://127.0.0.1:4241/#/app/parties?id=c1&role=Customer');await page.locator('main').waitFor();
  await page.evaluate(async()=>{const store=await import('/src/data/partyPreviewStore.ts');store.dispatchPartyPreview({type:'record-payment',payload:{partyId:'c1',relationship:'Customer',date:(await import('/src/utils/dateRange.ts')).businessToday(),amount:50,splits:[{id:'cash',method:'Cash',accountId:'acc-cash',amount:50}],operationId:'copy-revoke'}});});
  await page.getByRole('button',{name:'কাজ PAYMENT:COPY-REVOKE',exact:true}).click();
  await page.getByRole('button',{name:'মুছুন / উল্টো এন্ট্রি',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'লেনদেন সংশোধন'});await dialog.getByRole('textbox',{name:'সংশোধনের কারণ',exact:true}).fill('Duplicate source');
  await dialog.getByRole('button',{name:'উল্টো লেনদেন যাচাই',exact:true}).click();
  const before=await page.evaluate(async()=>JSON.stringify((await import('/src/data/partyPreviewStore.ts')).getPartyPreviewSnapshot()));
  await page.evaluate(async()=>{const {defaults,settingsKey}=await import('/src/settings/model.ts');const state=defaults();state.sections.team.employees=state.sections.team.employees.map(e=>e.id==='mahmud'?{...e,active:false}:e.id==='rafiq'?{...e,active:true,roleIds:['owner']}:e);const key=settingsKey('t1'),newValue=JSON.stringify(state);localStorage.setItem(key,newValue);window.dispatchEvent(new StorageEvent('storage',{key,newValue}));});
  await dialog.getByRole('button',{name:'উল্টো লেনদেন নিশ্চিত করুন',exact:true}).click();
  await dialog.getByRole('alert').filter({hasText:'এই মডিউলে বর্তমান ব্যবহারকারীর অনুমতি নেই।'}).waitFor();
  assert.equal(await page.evaluate(async()=>JSON.stringify((await import('/src/data/partyPreviewStore.ts')).getPartyPreviewSnapshot())),before);
  await page.screenshot({path:'/tmp/party-delete-bangla-revoked.png'});assert.deepEqual(errors,[]);
  console.log('Bangla desktop dark: Party source reversal rejects revoked actor after review with translated authority error; source/audit snapshot unchanged; no page errors');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
