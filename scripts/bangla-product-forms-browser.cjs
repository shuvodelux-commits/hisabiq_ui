/* Phase 15: Product Settings and Add/Edit in three UI languages, phones and desktops. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4400,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{
  for(const language of ['English','English + Bangla','Bangla']){
   for(const width of [390,1440]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},hasTouch:width===390,reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(lang=>localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
     mode:'Simple',language:lang,density:'Compact',terminology:'simple',dateView:'transaction'
    })),language);
    const bn=language==='Bangla';
    await page.goto('http://127.0.0.1:4400/#/app/products');
    await page.getByRole('button',{name:bn?'নতুন পণ্য':'Add product',exact:true}).click();
    const dialog=page.locator('[data-slot="dialog-content"]').last();
    await dialog.waitFor();
    await dialog.getByText(bn?'বিক্রির দাম':'Selling price',{exact:true}).first().waitFor();
    await dialog.getByText(bn?'পণ্যের ধরন':'Product type',{exact:true}).first().waitFor();
    const kind=dialog.getByRole('combobox',{name:bn?'পণ্যের ধরন':'Product type'});
    assert.equal(await kind.getAttribute('data-value'),'Stock','source ProductKind remains Stock');
    await kind.click();
    await page.getByRole('option',{name:bn?'সেবা':'Service',exact:true}).waitFor();
    await page.keyboard.press('Escape');
    await dialog.getByRole('button',{name:bn?/আরও সেটিংস/:/Advanced/}).click();
    const serial=dialog.getByRole('button',{name:bn?'বাধ্যতামূলক':'Required',exact:true});
    await serial.waitFor();
    await serial.click();
    await dialog.getByText(bn?'ছোট একক':'Base unit',{exact:true}).first().waitFor();
    await dialog.getByRole('button',{name:bn?'বাতিল':'Cancel',exact:true}).click();
    await dialog.waitFor({state:'hidden'});
    const nav=page.getByRole('tab',{name:bn?/পণ্যের সেটিংস/:/Product settings/});
    await nav.click();
    const units=page.getByRole('tab',{name:bn?'এককসমূহ':'Units',exact:true});
    await units.click();
    await page.getByText(bn?'এককের নাম':'Unit name',{exact:true}).waitFor();
    await page.getByRole('tab',{name:bn?'ব্র্যান্ডসমূহ':'Brands',exact:true}).click();
    await page.getByText(bn?'ব্র্যান্ডের নাম':'Brand name',{exact:true}).waitFor();
    await page.getByRole('tab',{name:bn?'সাধারণ সেটিংস':'Defaults',exact:true}).click();
    await page.getByText(bn?'ব্যবসার পণ্যের সাধারণ সেটিংস':'Business product defaults',{exact:true}).waitFor();
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no page overflow');
    assert.deepEqual(errors,[],language+' '+width+'px browser errors');
    await context.close();
    console.log('Product Forms Phase 15 '+language+' @ '+width+'px passed');
   }
  }
 }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
