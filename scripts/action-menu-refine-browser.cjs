/* Screenshot and interaction regressions for existing HisabIQ action dropdowns.
 * ACTION_MENU_BASE=... ACTION_MENU_SHOTS=... ACTION_MENU_BASELINE=1 captures unchanged main.
 */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.ACTION_MENU_BASE||'http://127.0.0.1:32841';
const shots=process.env.ACTION_MENU_SHOTS||'/tmp/hisabiq-action-menu-evidence';
const baseline=process.env.ACTION_MENU_BASELINE==='1';
const modules=[
  {id:'products',route:'/app/products',required:true},
  {id:'expenses',route:'/app/expenses',required:true},
  {id:'audit-ledger',route:'/app/audit-ledger',required:true},
  {id:'purchases',route:'/app/purchases',required:true},
  {id:'sales',route:'/app/sales',required:true},
  {id:'parties',route:'/app/parties',required:false},
  {id:'vendors',route:'/app/vendors',required:false}
];
async function openMenu(page,module){
  const search=page.locator('button[aria-label*="Actions for"],button[aria-label*="Transaction actions for"],button[aria-label*="Account actions for"]').filter({visible:true});
  try{await search.first().waitFor({state:'visible',timeout:9000});}catch{}
  if(await search.count()) {const target=search.first();await target.click({timeout:4000});return target;}
  // Party/Vendor profiles expose a contextual More menu after a party is selected.
  const more=page.getByRole('button',{name:/^(More|আরও)$/}).filter({visible:true});
  if(await more.count()){await more.first().click();return more.first();}
  if(['parties','vendors'].includes(module.id)){
    const first=page.locator('tbody tr:visible').first();
    if(await first.count()){await first.click({timeout:4000}).catch(()=>{});await page.waitForTimeout(300);
      if(await more.count()){await more.first().click();return more.first();}
      if(await search.count()){await search.first().click();return search.first();}
    }
  }
  return null;
}
async function run(){
 const browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});
 let checks=0,skipped=[];
 try{
 for(const module of modules){
  for(const [width,theme] of [[1440,'light'],[1440,'dark'],[390,'light'],[390,'dark']]){
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,hasTouch:true,reducedMotion:'reduce'});
   await context.addInitScript(theme=>{localStorage.setItem('hisabiq-theme',theme);localStorage.setItem('theme',theme)},theme);
   const page=await context.newPage(),errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.goto(base+'/#'+module.route,{waitUntil:'domcontentloaded'});
   const trigger=await openMenu(page,module);
   if(!trigger){
      if(module.required)throw new Error('Required action menu not found: '+module.id);
      const folder=path.join(shots,baseline?'before':'after');fs.mkdirSync(folder,{recursive:true});
      await page.screenshot({path:path.join(folder,module.id+'-'+width+'-'+theme+'.png'),animations:'disabled'});
      skipped.push(module.id+':'+width+' (page only)');await context.close();continue;
   }
   const dialog=page.locator('[role="dialog"]').last();
   await dialog.waitFor({state:'visible',timeout:6000});
   if(!baseline)await dialog.locator('[data-action-menu]').waitFor({state:'visible',timeout:6000});
   await page.waitForTimeout(250); // wait for FloatingPanel's portal positioning/entrance animation
   const folder=path.join(shots,baseline?'before':'after');fs.mkdirSync(folder,{recursive:true});
   await page.screenshot({path:path.join(folder,module.id+'-'+width+'-'+theme+'.png'),animations:'disabled'});
   if(!baseline){
     const menu=dialog.locator('[data-action-menu]');
     await menu.waitFor({state:'visible'});
     const items=menu.locator('[data-action-menu-item]');
     const n=await items.count();assert.ok(n>=1,module.id+' has action items');
     assert.equal(await items.locator('svg').count(),n,module.id+' each action has icon');
     const ordinary=menu.locator('[data-tone="neutral"]');
     for(const item of await ordinary.all()){assert.ok(!(await item.getAttribute('class')).includes('text-danger'),module.id+' normal action not red');}
     const destructive=menu.locator('[data-tone="destructive"]');
     if(await destructive.count()){
       const last=destructive.last();
       assert.ok(await last.evaluate(el=>Array.from(el.parentElement.children).indexOf(el)>0),module.id+' destructive section not first');
       assert.ok(await menu.locator('[data-action-menu-divider]').count(),module.id+' destructive section separated');
     }
     const enabled=menu.locator('[data-action-menu-item]:not([disabled])');
     if(await enabled.count()>1){
       await enabled.first().focus();await page.keyboard.press('ArrowDown');
       assert.ok(await enabled.nth(1).evaluate(el=>el===document.activeElement),module.id+' ArrowDown focus');
       await page.keyboard.press('Home');
       assert.ok(await enabled.first().evaluate(el=>el===document.activeElement),module.id+' Home focus');
     }
     await page.keyboard.press('Escape');
     await dialog.waitFor({state:'hidden'});
     assert.equal(await trigger.evaluate(el=>el===document.activeElement),true,module.id+' Escape restores trigger focus');
     assert.deepEqual(errors,[],module.id+' no runtime errors');
   }
   checks++;
   console.log((baseline?'BASE':'PASS'),module.id,width,theme);
   await context.close();
  }
 }
 }finally{await browser.close()}
 console.log('TOTAL_PROFILES',checks,'SKIPPED',JSON.stringify(skipped));
}
run().catch(e=>{console.error(e);process.exitCode=1});
