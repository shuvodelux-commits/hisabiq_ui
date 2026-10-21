/* Sales responsive presentation, wide filter disclosure and resize regression; existing workflow scripts test the mutations. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {preview}=await import('vite');
 const server=await preview({preview:{host:'127.0.0.1',port:4415,strictPort:true}});
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox','--no-zygote','--disable-gpu','--disable-dev-shm-usage']});
 try{
  for(const language of ['English','English + Bangla','Bangla']){
   for(const width of [360,390,430,768,1024,1440]){
    const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];
    await page.route('https://fonts.googleapis.com/**',r=>r.fulfill({contentType:'text/css',body:''}));
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(({language,dark})=>{
     localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language,density:'Compact',terminology:'simple',dateView:'transaction'}));
     localStorage.setItem('hisabiq-theme',dark?'dark':'light');
    },{language,dark:language==='Bangla'});
    for(const route of ['sales','sales?tab=return','sales?tab=returns','sales?tab=credits','sales?tab=drafts','quotations','online-sales']){
     await page.goto('http://127.0.0.1:4415/#/app/'+route,{waitUntil:'domcontentloaded',timeout:120000});
     await page.locator('#erp-main h1').waitFor();
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),language+' '+width+' '+route+' page fits');
     if(route==='sales'){
      const bn=language==='Bangla';
      if(width<768){
       const record=page.locator('.sales-mobile-record').first();
       const action=record.locator('.sales-mobile-record-actions button').first();
       const [body,menu,summary]=await Promise.all([record.locator('button').first().boundingBox(),action.boundingBox(),record.locator('summary').boundingBox()]);
       assert.ok(body&&menu&&summary&&menu.y>=body.y+body.height-1,'invoice action sits below totals');
       assert.ok(Math.abs(menu.y-summary.y)<10,'invoice action is beside More details');
       await action.click();await page.getByRole('button',{name:bn?'বিল দেখুন':'View invoice',exact:true}).click();
       await page.locator('[data-slot="dialog-content"]').last().waitFor();await page.keyboard.press('Escape');
      }else if(width<1280){
       const header=label=>page.getByRole('columnheader',{name:label,exact:true});
       assert.equal(await header(bn?'পণ্য':'Items').count(),0,'tablet Items default off');
       assert.equal(await header(bn?'মাধ্যম':'Payment').count(),0,'tablet Payment default off');
       await page.getByRole('button',{name:bn?'কলাম':'Columns',exact:true}).click();
       for(const label of [bn?'পণ্য':'Items',bn?'পেমেন্ট':'Payment']){
        const choice=page.getByRole('menuitemcheckbox',{name:label,exact:true});
        assert.equal(await choice.getAttribute('aria-checked'),'false');await choice.click();
       }
       await page.keyboard.press('Escape');
       assert.equal(await header(bn?'পণ্য':'Items').count(),1);
       assert.equal(await header(bn?'মাধ্যম':'Payment').count(),1);
       await page.reload({waitUntil:'domcontentloaded'});await header(bn?'পণ্য':'Items').waitFor();
       await page.setViewportSize({width:1440,height:900});await header(bn?'মাধ্যম':'Payment').waitFor();
       await page.setViewportSize({width,height:900});
       await page.getByRole('button',{name:bn?'কলাম':'Columns',exact:true}).click();
       for(const label of [bn?'পণ্য':'Items',bn?'পেমেন্ট':'Payment'])await page.getByRole('menuitemcheckbox',{name:label,exact:true}).click();
       await page.keyboard.press('Escape');
       assert.equal(await header(bn?'পণ্য':'Items').count(),0,'tablet overrides survive resize');
      }else{
       assert.equal(await page.getByRole('columnheader',{name:bn?'পণ্য':'Items',exact:true}).count(),1,'desktop Items unchanged');
       assert.equal(await page.getByRole('columnheader',{name:bn?'মাধ্যম':'Payment',exact:true}).count(),1,'desktop Payment unchanged');
      }
     }

     if(width<768){
      assert.equal(await page.locator('.sales-mobile-summary').count(),1);
      if(['sales','quotations','online-sales'].includes(route)){
       await page.locator('.sales-mobile-record').first().waitFor();
       const filters=page.getByRole('button',{name:/Filters|ফিল্টার/,exact:true});
       await filters.click();assert.equal(await filters.getAttribute('aria-expanded'),'true');await filters.click();
      }
     }else{
      assert.equal(await page.locator('.sales-mobile-summary').count(),0,'wide summary unchanged');
      if(['sales','quotations','online-sales'].includes(route)){
       const toggle=page.getByRole('button',{name:/Filters|ফিল্টার/,exact:true});
       assert.equal(await toggle.getAttribute('aria-expanded'),'false','wide filters start collapsed');
       assert.equal(await page.locator('#erp-main').getByRole('combobox').count(),0,'filter controls hidden initially');
       await toggle.press('Enter');
       assert.equal(await toggle.getAttribute('aria-expanded'),'true');
       if(route==='quotations'){
        const draft=page.getByRole('button',{name:language==='Bangla'?'খসড়া':'Draft',exact:true});
        await draft.click();
        const rows=page.locator('tbody tr');
        assert.ok(await rows.count()>0);
        for(const row of await rows.all()) assert.ok((await row.innerText()).includes(language==='Bangla'?'খসড়া':'Draft'));
        await toggle.click();assert.equal(await draft.isVisible(),false);
        await toggle.click();assert.equal(await draft.getAttribute('data-hisabiq-variant'),'default','selected status survives collapse');
       }else{
        const count=route==='sales'?3:2;
        assert.equal(await page.locator('#erp-main').getByRole('combobox').count(),count);
        for(let index=0;index<count;index++){
         const control=page.locator('#erp-main').getByRole('combobox').nth(index);
         await control.click();await page.getByRole('option').nth(1).click();
         const chosen=await control.getAttribute('data-value');
         const result=await page.locator('#erp-main').innerText();
         await toggle.click();assert.equal(await control.isVisible(),false);
         assert.equal(await toggle.getAttribute('aria-expanded'),'false');
         await toggle.click();assert.equal(await control.getAttribute('data-value'),chosen,'selected value survives collapse');
         assert.equal(await page.locator('#erp-main').innerText(),result,'filter result survives collapse');
         await control.click();await page.getByRole('option').first().click();
        }
       }
       await toggle.click();
       assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'expanded/collapsed filters fit viewport');
      }
     }
    }
    // Switch at the breakpoint while a controlled search is filled: state must survive.
    await page.goto('http://127.0.0.1:4415/#/app/sales',{waitUntil:'domcontentloaded'});
    const search=page.getByRole('textbox',{name:/Search sales|বিক্রি খুঁজুন/});
    await search.fill('INV');await page.setViewportSize({width:width<768?1024:390,height:900});
    await page.locator(width<768?'table':'.sales-mobile-record').first().waitFor();
    assert.equal(await search.inputValue(),'INV','search state survives phone/tablet switch');
    assert.deepEqual(errors,[]);await page.close();console.log(language+' '+width+'px layouts and resize passed');
   }
  }
 }finally{await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
