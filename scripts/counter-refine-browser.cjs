/* Counter compact refinement: responsive action layout, split payments, keyboard and review states. */
/* eslint-env node */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
async function main(){
 const {createServer}=await import('vite');
 const port=Number(process.env.COUNTER_REFINE_PORT||49632);
 const server=await createServer({server:{host:'127.0.0.1',port,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const directory=path.join('test-results','counter-refine');
 fs.mkdirSync(directory,{recursive:true});
 let states=0;
 try{
  for(const width of [320,390,768,1024,1440])for(const theme of ['light','dark']){
   const context=await browser.newContext({viewport:{width,height:900},colorScheme:theme,hasTouch:width<=768,reducedMotion:'reduce'});
   const page=await context.newPage(),errors=[];
   page.on('pageerror',error=>errors.push(error.message));
   try{
    await page.addInitScript(value=>localStorage.setItem('hisabiq-theme',value),theme);
    await page.goto('http://127.0.0.1:'+port+'/#/app/counter',{waitUntil:'networkidle'});
    const actions=page.getByRole('group',{name:'Counter actions'});
    await actions.waitFor();
    const tiles=actions.getByRole('button');
    assert.equal(await tiles.count(),6,width+' '+theme+': six counter entries');
    const bounds=await Promise.all((await tiles.all()).map(tile=>tile.boundingBox()));
    assert.ok(bounds.every(box=>box&&box.width>80&&box.height>=44&&box.x>=0&&box.x+box.width<=width+1),width+' '+theme+': reachable tiles');
    const rows=new Set(bounds.map(box=>Math.round(box.y))).size;
    assert.equal(rows,width===320?3:width<1280?2:1,width+' '+theme+': action density');
    await page.screenshot({path:path.join(directory,width+'-'+theme+'-default.png'),fullPage:true,animations:'disabled'});
    const bank=actions.getByRole('button',{name:/Bank Entry/});
    await bank.focus();
    await page.keyboard.press('Enter');
    assert.equal(await bank.getAttribute('aria-pressed'),'true','keyboard Bank Entry');
    await page.getByRole('region',{name:'Bank Entry',exact:true}).waitFor();
    await actions.getByRole('button',{name:/Customer Receive/}).click();
    const party=page.locator('input[aria-label="Search customer"]');
    await party.fill('Rahman');
    await page.getByRole('option',{name:/Rahman Hardware/}).click();
    await page.getByText('Selected customer').waitFor();
    await page.getByRole('button',{name:/Add payment/}).click();
    const amounts=page.locator('input[aria-label="Payment source amount"]');
    assert.equal(await amounts.count(),2,'split payment rows');
    await amounts.nth(0).fill('100');
    await amounts.nth(1).fill('25');
    await page.evaluate(()=>window.scrollTo(0,0));
    await page.screenshot({path:path.join(directory,width+'-'+theme+'-split.png'),fullPage:true,animations:'disabled'});
    await page.getByRole('button',{name:/Review receive payment/}).click();
    const review=page.getByRole('dialog',{name:/Confirm receive payment/});
    await review.waitFor();
    await page.screenshot({path:path.join(directory,width+'-'+theme+'-review.png'),animations:'disabled'});
    await review.getByRole('button',{name:/Edit details/}).click();
    assert.equal(await amounts.nth(0).inputValue(),'100','first split retained');
    assert.equal(await amounts.nth(1).inputValue(),'25','second split retained');
    await page.getByRole('button',{name:'Remove payment'}).first().click();
    assert.equal(await amounts.count(),1,'one row removed');
    assert.deepEqual(errors,[],width+' '+theme+': browser errors');
    states++;
    console.log('Counter refine PASS '+width+' '+theme);
   }finally{await context.close();}
  }
  console.log('Counter refine: '+states+'/10 viewport and theme journeys');
 }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
