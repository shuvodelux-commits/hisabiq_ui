const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');const server=await createServer({server:{host:'127.0.0.1',port:4240,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1366,height:900},reducedMotion:'reduce'}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({body:'',contentType:'text/css'}));
 const go=async route=>{await page.goto('http://127.0.0.1:4240/#/app/'+route);await page.locator('main').waitFor();};
 const del=()=>page.getByRole('button',{name:'Delete',exact:true});
 try{
 let d;
 if(!process.env.SKIP_VENDOR){await go('vendors?partyId=v1&tab=taken');
 const work=page.getByRole('region',{name:'Taken product workplace'});await work.getByRole('button',{name:/Actions for/}).click();await del().click();
 d=page.getByRole('dialog',{name:'Review Vendor correction'});await d.waitFor();assert.equal(await d.getByRole('tab',{name:'Reverse source',exact:true}).getAttribute('aria-selected'),'true');
 await page.screenshot({path:'/tmp/delete-policy-vendor-impact.png'});await d.getByRole('button',{name:'Confirm demo reversal'}).click();await d.getByRole('alert').waitFor();
 await d.getByRole('textbox',{name:'Vendor correction reason'}).fill('Duplicate original vendor memo');await d.getByRole('button',{name:'Confirm demo reversal'}).click();await d.waitFor({state:'hidden'});
 const event=await page.evaluate(async()=> (await import('/src/vendor/vendorPreviewStore.ts')).getVendorPreviewSnapshot().events.at(-1));assert.equal(event.actor,'mahmud');assert.equal(event.kind,'reversal');
 console.log('Vendor original source reversal: actor/reason/impact verified');}
 await go('accounts?tab=vouchers');
 const ref=await page.evaluate(async()=> (await import('/src/data/accounting.ts')).accountingSources.find(s=>s.source==='adjustment').reference);
 const voucher=page.getByRole('row').filter({hasText:ref});await voucher.getByRole('button').last().click();await del().click();d=page.getByRole('dialog');await d.getByText('Delete complete voucher?',{exact:true}).waitFor();
 await page.screenshot({path:'/tmp/delete-policy-voucher-impact.png'});await d.getByRole('textbox').fill('Duplicate whole voucher');await d.getByRole('button',{name:'Delete voucher',exact:true}).click();await d.waitFor({state:'hidden'});assert.match(await voucher.innerText(),/Deleted/);
 console.log('Voucher whole-source deletion retains history');
 await go('accounts?tab=money-accounts');
 const transfer=page.getByRole('row').filter({hasText:'TRF-000041'});await transfer.getByRole('button',{name:/Actions for/}).click();await del().click();d=page.getByRole('dialog',{name:'Account transfer',exact:true});await d.getByRole('textbox',{name:'Reason for reversal'}).fill('Duplicate original transfer');await d.getByRole('button',{name:'Confirm reverse'}).click();assert.match(await transfer.innerText(),/Reversed/);await d.getByText(/mahmud.*Duplicate original transfer/).waitFor();await page.keyboard.press('Escape');
 console.log('Transfer original source/account review and retained actor/reason verified');
 await go('products?view=settings');
 const setup=page.getByRole('button',{name:/Actions for/}).first();await setup.click();assert.equal(await del().isDisabled(),true);await page.getByText('Setup recovery is not connected. Keep this record or use Deactivate.',{exact:true}).waitFor();await page.screenshot({path:'/tmp/delete-policy-setup-blocked.png'});await page.keyboard.press('Escape');
 await go('finance?tab=cash');await page.getByRole('button',{name:/Actions for CS-000240/}).first().click();assert.equal(await del().isDisabled(),true);await page.getByText('History is immutable. Correction requires a new audited operation.',{exact:true}).waitFor();await page.screenshot({path:'/tmp/delete-policy-closed-session-blocked.png'});
 assert.deepEqual(errors,[]);console.log('Setup and closed-session Delete disabled with readable reasons; no page errors');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
