/* Phase 17 Sales: list/actions/return/credit localization without financial posting. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4402,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{
  for(const language of ['English','English + Bangla','Bangla']){
   for(const width of [390,1440]){
    const ctx=await browser.newContext({viewport:{width,height:width===390?844:900},hasTouch:width===390,acceptDownloads:true,reducedMotion:'reduce'});
    const page=await ctx.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(lang=>localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
      mode:'Simple',language:lang,density:'Compact',terminology:'simple',dateView:'transaction'
    })),language);
    const bn=language==='Bangla';
    await page.goto('http://127.0.0.1:4402/#/app/sales');
    await page.getByRole('heading',{name:bn?'বিক্রয়':'Sales',exact:true}).waitFor();
    await page.getByRole('columnheader',{name:bn?'ক্রেতা':'Customer',exact:true}).waitFor();
    await page.getByRole('columnheader',{name:bn?'পণ্য':'Items',exact:true}).waitFor();
    const cols=page.getByRole('button',{name:bn?'কলাম':'Columns',exact:true});
    await cols.click();
    const profit=page.getByRole('menuitemcheckbox',{name:bn?'লাভ':'Profit',exact:true});
    assert.equal(await profit.getAttribute('aria-checked'),'true');
    await profit.click();
    assert.equal(await page.getByRole('columnheader',{name:bn?'লাভ':'Profit',exact:true}).count(),0);
    await profit.click();
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('columnheader',{name:bn?'লাভ':'Profit',exact:true}).count(),1);
    const csvWait=page.waitForEvent('download');
    await page.getByRole('button',{name:bn?'ডাউনলোড':'Export',exact:true}).click();
    const download=await csvWait;
    assert.equal(download.suggestedFilename(),'hisabiq-sales.csv');
    const action=page.getByRole('button',{name:new RegExp(bn?'কাজ:':'Actions for')}).first();
    await action.click();
    await page.getByRole('button',{name:bn?'বিল দেখুন':'View invoice',exact:true}).click();
    const invoice=page.locator('[data-slot="dialog-content"]').last();
    await invoice.waitFor();
    await page.keyboard.press('Escape');
    await invoice.waitFor({state:'hidden'});
    await page.goto('http://127.0.0.1:4402/#/app/sales?tab=return');
    await page.getByText(bn?'বিল বাছুন':'Select invoices',{exact:false}).first().waitFor();
    const choices=page.getByRole('checkbox');
    assert.ok(await choices.count()>0,'customer has returnable invoice selections');
    await choices.first().check();
    await page.getByRole('columnheader',{name:bn?'ফেরতের পরিমাণ':'Return qty',exact:true}).waitFor();
    const qty=page.locator('table tbody tr').first().locator('input[inputmode="decimal"]').first();
    await qty.fill('1');
    const reason=page.getByRole('combobox',{name:new RegExp('^'+(bn?'ফেরতের কারণ':'Return reason')+' · ')}).first();
    assert.equal(await reason.getAttribute('data-value'),'Customer return','stored source return reason');
    await reason.click();
    await page.getByRole('option',{name:bn?'ভুল পণ্য':'Wrong item',exact:true}).click();
    assert.equal(await reason.getAttribute('data-value'),'Wrong item','translated reason retains English source value');
    const settlement=page.getByRole('combobox',{name:bn?'হিসাব মেলানো':'Settlement',exact:true}).first();
    assert.equal(await settlement.getAttribute('data-value'),'Adjust due','stored return settlement');
    await page.goto('http://127.0.0.1:4402/#/app/sales?tab=credits');
    await page.getByText(bn?'ক্রেতার টাকা ও জমা':'Customer payments & credit',{exact:false}).first().waitFor();
    await page.getByRole('button',{name:bn?'ক্রেতার টাকা নিন':'Receive customer payment',exact:true}).waitFor();
    await page.getByRole('columnheader',{name:bn?'জমা টাকা':'Credit balance',exact:true}).waitFor();
    assert.deepEqual(errors,[],language+' '+width+'px browser errors');
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal page overflow');
    await ctx.close();
    console.log('Sales language Phase 17 '+language+' @ '+width+'px passed');
   }
  }
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
