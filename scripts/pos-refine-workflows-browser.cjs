/* Actual POS UI journeys for hidden controls. No backend posting is claimed. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {capturePos}=require('./pos-browser-capture.cjs');
const base=process.env.POS_BASE||'http://127.0.0.1:4173';
const label=process.env.POS_SHOT_LABEL||'round-3';
const out=process.env.POS_EVIDENCE_DIR||'/workspace/hisabiq_ui/.claude/worktrees/refine-app-pos.run';
const results=[];
const rx=(en,bn)=>new RegExp(en+'|'+bn);
async function main(){
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{
 for(const theme of ['light','dark'])for(const language of ['English','Bangla','English + Bangla']){
  const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,reducedMotion:'reduce'});
  await context.addInitScript(({theme,language})=>{localStorage.setItem('hisabiq-theme',theme);localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({language,mode:'Simple',density:'Compact',terminology:'simple',dateView:'transaction'}));},{theme,language});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.route('https://fonts.googleapis.com/**',r=>r.abort());
  const key=theme+' '+language;
  const shot=async(state)=>{const file=path.join(out,'shots',`${label}-workflow-${theme}-${language==='Bangla'?'bn':language==='English'?'en':'both'}-${state}.png`);await capturePos(page,{path:file});return file;};
  const record=(action,details={})=>{results.push({theme,language,action,status:'passed',...details});console.log('PASS '+key+' '+action);};
  try{
   await page.goto(base+'/#/app/pos');
   const rows=page.getByTestId('pos-cart-row'),checkout=page.locator('[data-pos-checkout]');await rows.first().waitFor();
   const count=await rows.count();
   assert.equal(await rows.first().getAttribute('data-cart-motion'),'reduced','reduced preference reaches cart row entry/exit/layout');
   const search=page.getByRole('combobox',{name:rx('Add product','পণ্য যোগ করুন'),exact:true});
   await search.fill('zzzz-no-product');await page.getByText(rx('No matching products','কোনো পণ্য পাওয়া যায়নি')).waitFor();
   assert.equal(await page.getByRole('option').count(),0);
   await page.getByRole('button',{name:rx('Clear product search','পণ্যের খোঁজ খালি করুন')}).click();
   assert.equal(await search.inputValue(),'');assert.equal(await search.evaluate(e=>document.activeElement===e),true);
   await search.fill('Cement');await search.press('Enter');await page.keyboard.press('Enter');
   await search.fill('Gate Valve');await search.press('Enter');await page.keyboard.press('Enter');
   assert.equal(await rows.count(),count+2);record('search empty/clear and multiple actual adds');
   const valve=rows.filter({hasText:'Gate Valve'});await valve.getByRole('textbox',{name:rx('Quantity for','পরিমাণ:')}).fill('1');
   await valve.getByRole('button',{name:rx('Serials','সিরিয়াল')}).click();
   const serial=page.getByRole('dialog').last();
   await serial.getByRole('button',{name:rx('Use serials','সিরিয়াল ব্যবহার করুন'),exact:true}).click();
   const serialError=serial.getByRole('alert');await serialError.waitFor();
   const scan=serial.getByRole('textbox',{name:rx('Scan or type serial','স্ক্যান করুন বা সিরিয়াল লিখুন')});
   const paste=serial.getByRole('textbox',{name:rx('Paste multiple','একসাথে পেস্ট করুন')});
   assert.equal(await scan.getAttribute('aria-invalid'),'true');assert.equal(await scan.getAttribute('aria-describedby'),await serialError.getAttribute('id'));
   assert.equal(await paste.getAttribute('aria-describedby'),await serialError.getAttribute('id'));
   await scan.fill('NOT-IN-STOCK');await scan.press('Enter');assert.match(await serialError.innerText(),rx('not eligible','বিক্রিযোগ্য স্টক'));
   const serialShot=await shot('serial-error');
   const option=serial.locator('button').filter({hasText:/GV34-/}).first();const selected=(await option.innerText()).split(/\s/)[0];
   await option.click();
   const remove=serial.getByRole('button',{name:rx('Remove serial '+selected,'সিরিয়াল সরান: '+selected),exact:true});
   assert.ok((await remove.boundingBox()).width>=35);await remove.click();assert.equal(await remove.count(),0);
   await option.click();await serial.getByRole('button',{name:rx('Use serials','সিরিয়াল ব্যবহার করুন'),exact:true}).click();await serial.waitFor({state:'hidden'});
   record('serial required count, scan invalid, connected labels/error, select/remove/use',{shot:serialShot});
   const pipe=rows.first(),quantity=pipe.getByRole('textbox',{name:rx('Quantity for','পরিমাণ:')});const original=await quantity.inputValue();
   await quantity.fill('10000');await pipe.getByRole('button',{name:rx('Short','ঘাটতি')}).click();
   let shortage=page.getByRole('dialog',{name:rx('Stock shortage','স্টক কম'),exact:true});
   await shortage.getByRole('radio',{name:rx('Negative Sale','নেগেটিভ বিক্রি')}).click();
   await shortage.getByRole('button',{name:rx('Cancel','বাতিল'),exact:true}).click();assert.equal(await quantity.inputValue(),'10000');
   await pipe.getByRole('button',{name:rx('Short','ঘাটতি')}).click();
   await shortage.getByRole('radio',{name:rx('Vendor','ভেন্ডর থেকে')}).click();
   const vendor=shortage.getByRole('combobox',{name:rx('Vendor','ভেন্ডর'),exact:true});await vendor.click();await page.getByRole('option').first().click();
   const cost=shortage.getByRole('textbox',{name:rx('Vendor cost per','ভেন্ডরের দাম')});await cost.fill('0');
   assert.equal(await cost.getAttribute('aria-invalid'),'true');const costError=shortage.getByRole('alert');assert.equal(await cost.getAttribute('aria-describedby'),await costError.getAttribute('id'));
   assert.equal(await shortage.getByRole('button',{name:rx('Use vendor','ভেন্ডর থেকে নিন'),exact:true}).isEnabled(),false);
   const stockShot=await shot('shortage-vendor-error');
   await cost.fill('');await shortage.getByRole('button',{name:rx('Quick add vendor','নতুন ভেন্ডর যোগ করুন')}).click();
   const quickVendor=page.getByRole('dialog').last();await quickVendor.getByRole('button',{name:rx('Cancel','বাতিল'),exact:true}).click();
   assert.equal(await shortage.getByRole('radio',{name:rx('Vendor','ভেন্ডর থেকে')}).getAttribute('aria-checked'),'true');
   await shortage.getByRole('button',{name:rx('Use vendor','ভেন্ডর থেকে নিন'),exact:true}).click();await shortage.waitFor({state:'hidden'});
   assert.match(await pipe.innerText(),rx('Price pending','দাম ঠিক করা বাকি'));
   await quantity.fill('10001');await pipe.getByRole('button',{name:rx('Short','ঘাটতি')}).click();
   await shortage.getByRole('radio',{name:rx('Negative Sale','নেগেটিভ বিক্রি')}).click();await shortage.getByRole('button',{name:rx('Allow negative sale','নেগেটিভ বিক্রি করুন'),exact:true}).click();
   assert.match(await pipe.innerText(),rx('Negative sale','ঋণাত্মক স্টক বিক্রি'));
   await quantity.fill('10002');await pipe.getByRole('button',{name:rx('Short','ঘাটতি')}).click();
   await shortage.getByRole('radio',{name:rx('Own Stock','নিজের স্টক')}).click();await shortage.getByRole('button',{name:rx('Use own stock','নিজের স্টক নিন'),exact:true}).click();
   assert.ok(Number(await quantity.inputValue())<10002);await quantity.fill(original);record('shortage cancel/Own/Negative/Vendor pending cost, nested quick-add cancel',{shot:stockShot});
   const quickQty=Number(await quantity.inputValue());await page.locator('section[aria-labelledby="quick-items"] button').first().click();assert.equal(Number(await quantity.inputValue()),quickQty+1,'quick item updates the actual existing cart line');
   const before=await pipe.locator('[data-pos-line-total]').innerText();const price=pipe.getByRole('textbox',{name:rx('Price for','দাম:')});await price.fill('500');assert.notEqual(await pipe.locator('[data-pos-line-total]').innerText(),before);
   const eye=pipe.getByRole('button',{name:rx('Show purchase price','কেনা দাম দেখুন')});await eye.click();assert.equal(await eye.getAttribute('aria-pressed'),'true');await eye.click();
   const handle=pipe.getByTestId('pos-drag-handle'),lineKey=await pipe.getAttribute('data-line-key');await handle.focus();await handle.press('ArrowDown');assert.equal(await rows.nth(1).getAttribute('data-line-key'),lineKey);
   await rows.filter({hasText:'Cement'}).getByRole('button',{name:rx('Remove','পণ্য সরান')}).click();assert.equal(await rows.count(),count+1);record('price/cost eye, keyboard reorder and remove');
   await checkout.getByTestId('pos-invoice-details-toggle').click();await checkout.getByRole('textbox',{name:rx('Customer name','ক্রেতার নাম'),exact:true}).fill('Workflow customer');await checkout.getByRole('textbox',{name:rx('Customer phone','ক্রেতার ফোন'),exact:true}).fill('01799000001');
   await checkout.getByRole('button',{name:rx('Quick add customer','নতুন ক্রেতা যোগ করুন')}).click();const quick=page.getByRole('dialog').last();await shot('customer-quickadd');await quick.getByRole('button',{name:rx('Cancel','বাতিল'),exact:true}).click();assert.equal(await checkout.getByRole('textbox',{name:rx('Customer name','ক্রেতার নাম'),exact:true}).inputValue(),'Workflow customer');record('invoice customer details and quick-add cancel preserve cart');
   await checkout.getByRole('button',{name:/^৳[0-9]/}).first().click();assert.ok(Number(await checkout.getByRole('textbox',{name:rx('Payment amount 1','পেমেন্টের পরিমাণ 1')}).inputValue())>0,'cash shortcut fills actual payment');
   await checkout.getByTestId('pos-customer-picker-trigger').click();await page.getByTestId('pos-customer-picker-search').waitFor();await shot('customer-picker');await page.keyboard.press('Escape');
   const method=checkout.getByRole('combobox',{name:rx('Payment method 1','পেমেন্টের মাধ্যম 1')});
   for(const [value,bn]of [['Bank','ব্যাংক'],['bKash','bKash'],['Nagad','Nagad'],['Card','কার্ড'],['Cash','ক্যাশ']]){
    await method.click();await page.getByRole('option').first().waitFor();if(value==='Bank')await shot('payment-method');await page.getByRole('option',{name:language==='Bangla'?bn:value,exact:true}).click();if(value==='Bank'){await checkout.getByRole('combobox',{name:rx('Payment account 1','পেমেন্টের হিসাব 1')}).click();await page.getByRole('option').first().waitFor();await shot('payment-account');await page.getByRole('option').first().click();}assert.ok((await checkout.getByRole('combobox',{name:rx('Payment account 1','পেমেন্টের হিসাব 1')}).innerText()).trim());
   }
   await checkout.getByRole('textbox',{name:rx('Payment amount 1','পেমেন্টের পরিমাণ 1')}).fill('1');
   await method.click();await page.getByRole('option',{name:language==='Bangla'?'ক্রেতার অগ্রিম জমা':'Customer Credit',exact:true}).click();
   await checkout.getByRole('alert').waitFor();assert.equal(await checkout.locator('[data-erp-workflow-action="complete"]').isEnabled(),false,'unverified customer credit remains blocked');
   await method.click();await page.getByRole('option',{name:language==='Bangla'?'ক্যাশ':'Cash',exact:true}).click();
   await checkout.getByRole('button',{name:language==='Bangla'?'যোগ করুন':'Add',exact:true}).click();assert.equal(await checkout.getByRole('combobox',{name:rx('Payment method 2','পেমেন্টের মাধ্যম 2')}).count(),1);
   await checkout.getByRole('textbox',{name:rx('Payment amount 1','পেমেন্টের পরিমাণ 1')}).fill('1');await checkout.getByRole('button',{name:rx('Remaining','বাকি টাকা'),exact:true}).last().click();
   assert.ok(Number(await checkout.getByRole('textbox',{name:rx('Payment amount 2','পেমেন্টের পরিমাণ 2')}).inputValue())>0);
   await checkout.getByRole('button',{name:rx('Remove payment 2','পেমেন্ট 2 সরান')}).click();
   const discount=checkout.getByRole('textbox',{name:rx('Discount','ছাড়'),exact:true});await checkout.getByRole('radio',{name:'%'}).click();await discount.fill('101');await checkout.getByRole('alert').waitFor();assert.equal(await checkout.locator('[data-erp-workflow-action="complete"]').isEnabled(),false);await discount.fill('10');
   await checkout.getByRole('textbox',{name:rx('Payment amount 1','পেমেন্টের পরিমাণ 1')}).fill('0');assert.equal(await checkout.locator('[data-erp-workflow-action="complete"]').isEnabled(),true);
   await checkout.getByRole('button',{name:rx('Exact','পুরো টাকা'),exact:true}).click();record('payment methods/accounts, split add/remove/remaining/exact, discount error and due customer');
   const expectedCount=await rows.count();await page.getByRole('button',{name:rx('Drafts','খসড়া')}).click();await shot('drafts-menu');await page.getByRole('button',{name:rx('Hold current','এই বিক্রি রাখুন')}).click();await page.getByRole('button',{name:rx('Drafts','খসড়া')}).click();
   const held=page.locator('li').filter({hasText:'Workflow customer'}).first();await held.locator('button').first().click();await page.waitForURL(/continue-draft/);assert.equal(await rows.count(),expectedCount);assert.equal(await checkout.getByRole('textbox',{name:rx('Payment amount 1','পেমেন্টের পরিমাণ 1')}).inputValue()!=='',true);record('hold/resume preserves products and split amount');
   await checkout.locator('[data-erp-workflow-action="complete"]').click();const review=page.getByRole('dialog').last();await review.getByRole('button',{name:rx('Edit details','সংশোধন করুন')}).waitFor();const reviewShot=await shot('review');await review.getByRole('button',{name:rx('Confirm sale preview','বিক্রির প্রিভিউ নিশ্চিত করুন'),exact:true}).click();const receipt=page.getByRole('dialog').last();await receipt.getByRole('button',{name:rx('Print receipt','রসিদ প্রিন্ট')}).waitFor();assert.match(await receipt.innerText(),rx('Not posted','খাতায় যোগ হয়নি'));const receiptShot=await shot('receipt');await receipt.getByRole('button',{name:rx('Close','বন্ধ করুন'),exact:true}).click();record('review confirmation and receipt preview only',{shots:[reviewShot,receiptShot]});
   for(const mode of ['edit','duplicate']){
    await page.evaluate(mode=>{location.hash='#/app/pos?mode='+mode+'&invoice=INV-000241';},mode);
    await page.getByRole('heading',{name:mode==='edit'?rx('Edit sale','বিক্রি সম্পাদনা'):rx('Duplicate sale','বিক্রি কপি'),exact:true}).waitFor();await rows.first().waitFor();
    const date=await page.evaluate(async mode=>{const {datePickerDayLabel}=await import('/src/i18n/datePickerCopy.ts');const {expenseDateIso,businessToday}=await import('/src/utils/dateRange.ts');const {salesInvoices}=await import('/src/data/sales.ts');return {source:salesInvoices[0].invoice,date:mode==='edit'?expenseDateIso(salesInvoices.find(x=>x.invoice==='INV-000241')?.date??salesInvoices[0].date):businessToday()};},mode);
    const expected=await page.evaluate(async({language,iso})=>{const {datePickerDayLabel}=await import('/src/i18n/datePickerCopy.ts');return datePickerDayLabel(language,iso);},{language,iso:date.date});assert.ok((await checkout.innerText()).includes(expected));record(mode+' source context and display date',{expected});
   }
   for(const [mode,en,bn]of [['continue-draft','Continue draft','খসড়া চালিয়ে যান'],['edit-draft','Edit draft','খসড়া সম্পাদনা'],['duplicate-draft','Duplicate draft','খসড়া কপি']]){
    await page.evaluate(mode=>{location.hash='#/app/pos?mode='+mode+'&draft=d2';},mode);
    await page.getByRole('heading',{name:rx(en,bn),exact:true}).waitFor();await rows.first().waitFor();
    assert.equal(await rows.count(),2,'stored draft lines restored');
    const actualDate=await page.evaluate(async language=>{const {datePickerDayLabel}=await import('/src/i18n/datePickerCopy.ts');const {businessToday}=await import('/src/utils/dateRange.ts');return datePickerDayLabel(language,businessToday());},language);
    assert.ok((await checkout.innerText()).includes(actualDate),'working draft shows current business date, no invented saved transaction date');record(mode+' context preserves original two-line draft');
   }
   await page.getByTestId('pos-templates-trigger').click();await page.getByTestId('pos-templates-list').waitFor();await shot('templates-menu');await page.keyboard.press('Escape');
   const draftLines=await rows.count();await page.getByRole('button',{name:rx('Drafts','খসড়া')}).click();
   const heldToDelete=page.locator('li').filter({hasText:'Workflow customer'}).first();await heldToDelete.getByRole('button',{name:rx('Delete','মুছুন')}).click();
   assert.equal(await page.locator('li').filter({hasText:'Workflow customer'}).count(),0);await page.keyboard.press('Escape');assert.equal(await rows.count(),draftLines);record('delete held preview draft preserves active cart');
   await checkout.getByRole('button',{name:language==='Bangla'?'খালি করুন':'Clear',exact:true}).click();
   await search.fill('PVC Pipe');await search.press('Enter');await page.keyboard.press('Enter');
   assert.equal(await rows.count(),1);await checkout.getByRole('button',{name:rx('Installment sale','কিস্তিতে বিক্রি'),exact:true}).click();
   await checkout.locator('summary').filter({hasText:rx('Advanced price adjustment','দাম বাড়ানো / কমানো')}).click();
   const adjustment=checkout.getByRole('combobox',{name:rx('Adjustment type','দাম বদলের ধরন')});await adjustment.click();await page.getByRole('option').first().waitFor();const adjustmentShot=await shot('installment-adjustment-select');
   assert.equal(await page.getByRole('option').count(),2);await page.getByRole('option',{name:'%',exact:true}).click();
   const priorPrice=await rows.first().getByRole('textbox',{name:rx('Price for','দাম:')}).inputValue();
   await checkout.getByRole('textbox',{name:rx('Price adjustment','দাম পরিবর্তন'),exact:true}).fill('10');
   await checkout.getByRole('button',{name:rx('Apply','প্রয়োগ করুন'),exact:true}).click();
   assert.notEqual(await rows.first().getByRole('textbox',{name:rx('Price for','দাম:')}).inputValue(),priorPrice,'shared adjustment select preserves actual price callback');
   await checkout.getByRole('button',{name:rx('View / Edit','দেখুন / বদলান'),exact:true}).click();const breakdown=page.getByRole('dialog').last();
   await breakdown.getByRole('textbox',{name:rx('Installment 1 amount','কিস্তি 1 টাকা'),exact:true}).fill('1');
   assert.equal(await breakdown.getByRole('button',{name:rx('Apply breakdown','কিস্তি সংরক্ষণ'),exact:true}).isEnabled(),false);
   const installmentShot=await shot('installment-breakdown');await breakdown.getByRole('button',{name:rx('Cancel','বাতিল'),exact:true}).click();
   record('installment terms, shared adjustment select and callback, schedule invalid/cancel',{shots:[adjustmentShot,installmentShot]});
   assert.deepEqual(errors,[]);record('no runtime errors');
  }finally{await context.close();}
 }
 }finally{await browser.close();fs.writeFileSync(path.join(out,label+'-workflow-matrix.json'),JSON.stringify({head:require('child_process').execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),capturedAt:new Date().toISOString(),results,limitations:['All outcomes are browser previews; no real ledger, bank, stock or backend posting certified.','Missing-product Quick Add remains existing migration debt: no creation action is wired in POS; no workflow was invented.','Receipt Print button was found; physical printing and browser print dialog were not invoked.','Genuine three/four unit creation and addition, templates, installment lifecycle, bundle fulfillment, touch reorder and normal/reduced popup motion are covered by their named companion suites.']},null,2));}
 console.log('POS hidden workflow matrix passed '+results.length+' assertions/journeys');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
