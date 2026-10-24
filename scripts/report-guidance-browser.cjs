/* eslint-env node */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
async function main(){
 const {createServer}=await import('vite');const server=await createServer({server:{host:'127.0.0.1',port:4399,strictPort:true}});await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{
  for(const profile of [{width:1440,height:1000,language:'English + Bangla',theme:'light'},{width:390,height:844,language:'Bangla',theme:'dark'},{width:390,height:844,language:'English',theme:'light'},{width:1440,height:1000,language:'English',theme:'dark'}]){
   const context=await browser.newContext({viewport:{width:profile.width,height:profile.height},hasTouch:profile.width<500,reducedMotion:'reduce'}),page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(v=>{localStorage.setItem('hisabiq-theme',v.theme);localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({mode:'Simple',language:v.language,density:'Compact',terminology:'simple',dateView:'transaction'}));},profile);
   await page.goto('http://127.0.0.1:4399/#/app/reports');
   const bn=profile.language==='Bangla';
   await page.getByRole('heading',{name:bn?'ব্যবসার সারাংশ':'Business overview',exact:true}).waitFor();
   assert.equal(await page.locator('[data-report-summary="sales-register"]').getAttribute('data-report-tone'),'success');
   assert.equal(await page.locator('[data-report-summary="purchases"]').getAttribute('data-report-tone'),'info');
   assert.equal(await page.locator('button button').count(),0,'help buttons must not be nested in summary buttons');
   const help=page.getByRole('button',{name:bn?'মোট লাভ সম্পর্কে জানুন':'About gross profit',exact:true});
   await help.focus();await page.getByRole('tooltip').filter({hasText:bn?/বিক্রয়/:/sales/i}).waitFor();
   assert.match(await page.getByRole('tooltip').textContent(),bn?/বিক্রয়/:/sales/i);
   await page.keyboard.press('Escape');assert.equal(await page.getByRole('tooltip').count(),0);
   if(profile.width<500)await help.tap();else await help.click();
   await page.getByRole('tooltip').waitFor();
   const rect=await page.getByRole('tooltip').boundingBox();assert.ok(rect.x>=0&&rect.x+rect.width<=profile.width+1,'tooltip stays inside viewport');
   await page.getByRole('heading',{name:bn?'ব্যবসার সারাংশ':'Business overview',exact:true}).click();
   assert.equal(await page.getByRole('tooltip').count(),0);
   assert.equal((await page.locator('[data-bangla-helper]').count())>0,profile.language==='English + Bangla');
   await page.goto('http://127.0.0.1:4399/#/app/reports?report=sales-register&from=&to=');
   await page.locator('[data-report-status]').first().waitFor();
   assert.ok(await page.locator('[data-report-status="Due"][data-report-tone="warning"]').count()>0);
   await page.goto('http://127.0.0.1:4399/#/app/reports?report=product-profit&from=&to=');
   await page.locator('[data-report-cost-missing]').first().waitFor();
   await page.goto('http://127.0.0.1:4399/#/app/reports?report=stock&from=&to=');
   await page.locator('[data-report-status="Low stock"]').first().waitFor();
   await page.locator('[data-report-row]').first().getByRole('button').first().click();
   const details=page.getByRole('dialog',{name:bn?'রিপোর্টের বিস্তারিত':'Report details'});await details.waitFor();
   await details.getByRole('button',{name:bn?'ব্যবহারযোগ্য স্টক সম্পর্কে জানুন':'About usable stock',exact:true}).focus();
   await page.getByRole('tooltip').waitFor();await page.keyboard.press('Escape');
   assert.equal(await details.isVisible(),true,'Escape dismisses help before the record dialog');
   assert.equal(await page.getByRole('tooltip').count(),0);
   await details.getByRole('button',{name:bn?'বিস্তারিত বন্ধ করুন':'Close details',exact:true}).click();
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.addScriptTag({path:require.resolve('axe-core')});
   const result=await page.evaluate(async()=>await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}}));
   assert.deepEqual(result.violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})),[]);
   await page.goto('http://127.0.0.1:4399/#/app/reports');await page.getByRole('heading',{name:bn?'ব্যবসার সারাংশ':'Business overview',exact:true}).waitFor();
   if(process.env.REPORT_GUIDANCE_CAPTURE!=='0'){fs.mkdirSync('.impeccable/review',{recursive:true});await page.screenshot({path:'.impeccable/review/guidance-'+profile.width+'-'+profile.theme+'.png',fullPage:true});}
   assert.deepEqual(errors,[]);await context.close();
  }
  console.log('Report guidance: semantic badges, Bangla helpers, keyboard/touch tooltips, viewport bounds and accessibility passed in four profiles.');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
