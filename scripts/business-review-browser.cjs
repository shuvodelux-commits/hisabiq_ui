/* Interactive audit review smoke: source is the built Vite app and canonical report preview. */
const { chromium }=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const out=path.resolve('test-results/business-review');
const profiles=[
 {width:1440,height:900,language:'English + Bangla',theme:'light'},
 {width:1024,height:768,language:'English + Bangla',theme:'dark'},
 {width:768,height:1024,language:'English + Bangla',theme:'light'},
 {width:390,height:844,language:'English + Bangla',theme:'light'},
 {width:360,height:800,language:'Bangla',theme:'dark'}
];
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const {preview}=await import('vite');
 const server=await preview({preview:{host:'127.0.0.1',port:4292,strictPort:true}});
 const browser=await chromium.launch({args:['--no-sandbox']});
 try{
 for(const p of profiles){
  const context=await browser.newContext({viewport:{width:p.width,height:p.height},reducedMotion:'reduce',acceptDownloads:true});
  await context.addInitScript(({language,theme})=>{
   localStorage.setItem('hisabiq-theme',theme);
   localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language,density:'Compact',terminology:'simple',dateView:'transaction',searchMode:'Default'}));
  },p);
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:4292/#/app/reports?workspace=business-review');
  await page.locator('[data-business-review]').waitFor({timeout:18000});
  assert.equal(await page.locator('[data-business-review] [role="tab"]').count(),4,'four internal review tabs');
  assert.equal(await page.locator('[data-business-review] [data-hisabiq-select]').count(),1,'shared HisabIQ select');
  assert(await page.locator('[data-business-review]').getByText(/not a certified audit|প্রত্যয়িত অডিট/i).count()>0,'uncertified disclaimer shown');
  const suffix=p.language==='Bangla'?'bn':'en';
  await page.screenshot({path:path.join(out,p.width+'-'+p.theme+'-'+suffix+'-summary.png'),fullPage:true,animations:'disabled'});
  const isBn=p.language==='Bangla';
  await page.getByRole('combobox',{name:isBn?'অডিটের সময়কাল':'Audit period'}).click();
  await page.getByRole('option',{name:isBn?'বার্ষিক অডিট রিপোর্ট':'Yearly audit report'}).click();
  await page.getByRole('tab',{name:isBn?'মাসভিত্তিক হিসাব':'Monthly figures'}).click();
  assert(await page.locator('[data-business-review] table tbody tr').count()>=1,'yearly monthly schedule visible');
  await page.screenshot({path:path.join(out,p.width+'-'+p.theme+'-'+suffix+'-months.png'),fullPage:true,animations:'disabled'});
  await page.getByRole('tab',{name:isBn?'নথি':'Documents'}).click();
  const downloadPromise=page.waitForEvent('download',{timeout:10000});
  await page.getByRole('button',{name:isBn?'সিএসভি নামান':'Download CSV'}).click();
  const download=await downloadPromise;
  assert(download.suggestedFilename().endsWith('.csv'),'exports real CSV data');
  await page.getByRole('tab',{name:isBn?'পর্যালোচনার ইতিহাস':'Review history'}).click();
  assert.equal(await page.locator('[data-business-review] [role="tab"]').count(),4);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+3),'no document horizontal overflow');
  assert.deepEqual(errors,[],'runtime exceptions');
  await context.close();
  console.log('PASS Business Review '+JSON.stringify(p));
 }
 }finally{await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
