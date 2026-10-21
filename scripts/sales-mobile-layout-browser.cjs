/* Phone-only presentation and resize regression; existing workflow scripts test the mutations. */
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
     if(width<768){
      assert.equal(await page.locator('.sales-mobile-summary').count(),1);
      if(['sales','quotations','online-sales'].includes(route)){
       await page.locator('.sales-mobile-record').first().waitFor();
       const filters=page.getByRole('button',{name:/Filters|ফিল্টার/,exact:true});
       await filters.click();assert.equal(await filters.getAttribute('aria-expanded'),'true');await filters.click();
      }
     }else assert.equal(await page.locator('.sales-mobile-summary').count(),0,'wide summary unchanged');
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
