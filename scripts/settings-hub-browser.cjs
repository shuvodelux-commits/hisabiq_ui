const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4239,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1365,height:860},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',err=>errors.push(err.message));
 const base='http://127.0.0.1:4239/#';
 try{
  await page.goto(base+'/app/settings/business');
  const hub=page.getByRole('region',{name:'Settings shortcuts'});
  await hub.waitFor();
  for(const label of ['Business & General','Users & Roles','Notifications & SMS','Data Import / Export','Subscription & Billing','Appearance & Defaults','Account & Security']){
   assert.equal(await hub.getByRole('link',{name:new RegExp(label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))}).count(),1,label+' should link to real module');
  }
  await hub.getByText('Preview only',{exact:false}).waitFor();
  await page.getByLabel('Business name',{exact:true}).fill('Unsaved Navigation Shop');
  await hub.getByRole('link',{name:/Notifications & SMS/}).click();
  const confirm=page.getByRole('dialog',{name:'Discard unsaved changes?'});
  await confirm.waitFor();
  assert.ok(page.url().includes('/app/settings/business'),'expanding/settings shortcut cannot discard a draft silently');
  await confirm.getByRole('button',{name:'Keep editing'}).click();
  assert.equal(await page.getByLabel('Business name',{exact:true}).inputValue(),'Unsaved Navigation Shop');
  await hub.getByRole('link',{name:/Notifications & SMS/}).click();
  await page.getByRole('button',{name:'Discard and continue'}).click();
  assert.ok(page.url().includes('/app/notifications'),'global SMS settings uses existing route');
  await page.goto(base+'/app/settings/business');
  await page.getByRole('region',{name:'Settings shortcuts'}).getByRole('link',{name:/Data Import \/ Export/}).click();
  assert.ok(page.url().includes('/app/settings/data'),'Import/Export stays in original Settings data section');
  await page.goto(base+'/app/settings/business');
  await page.getByRole('region',{name:'Settings shortcuts'}).getByRole('link',{name:/Subscription & Billing/}).click();
  assert.ok(page.url().includes('/app/subscription'),'owner billing uses tenant portal, never SaaS back office');
  await page.goto(base+'/app/settings/business');
  await page.setViewportSize({width:375,height:812});
  const mobileHub=page.getByRole('region',{name:'Settings shortcuts'});
  await mobileHub.waitFor();
  await mobileHub.getByRole('link',{name:/Appearance & Defaults/}).click();
  assert.ok(page.url().includes('/app/settings/personal'));
  await page.getByRole('heading',{name:'Business settings'}).waitFor();
  await page.goto(base+'/app/settings/business');
  await page.getByRole('region',{name:'Settings shortcuts'}).getByRole('link',{name:/Account & Security/}).click();
  assert.ok(page.url().includes('/app/settings/security'));
  await page.getByTestId('account-security-settings').waitFor();
  assert.equal(await page.getByRole('button',{name:'Save changes'}).count(),0,'Security must not use business settings save');
  assert.deepEqual(errors,[]);
  console.log('Settings hub: 7 destinations, unsaved draft guard, SMS/data/billing, mobile appearance and no runtime errors passed');
 }finally{await browser.close();await server.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
