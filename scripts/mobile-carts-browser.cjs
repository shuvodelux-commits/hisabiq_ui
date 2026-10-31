const {chromium}=require('playwright');const assert=require('node:assert/strict');
async function main(){const {createServer}=await import('vite');const server=await createServer({server:{host:'127.0.0.1',port:4302,strictPort:true}});await server.listen();const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
try{for(const width of [390,768,1024,1440])for(const theme of ['light','dark']){const page=await browser.newPage({viewport:{width,height:900},colorScheme:theme,hasTouch:width<1440});const errors=[];page.on('pageerror',e=>errors.push(e.message));
for(const mode of ['pos','purchase','quote']){await page.goto('http://127.0.0.1:4302/#/app/'+(mode==='purchase'?'purchases/new':mode==='quote'?'quotations':'pos'));
if(mode==='quote')await page.getByRole('button',{name:'New quotation',exact:true}).click();
const label=mode==='purchase'?'Search product to add to purchase':mode==='quote'?'Add product to quotation':'Add product';const search=page.getByRole('combobox',{name:label,exact:true});await search.fill('LED Bulb');await page.getByRole('option',{name:/LED Bulb 12W/}).first().click();const row=page.locator('[data-cart-row]').last();await row.waitFor();if(process.env.CART_SCREENSHOTS&&width===390&&theme==='light')await row.screenshot({path:process.env.CART_SCREENSHOTS+'/'+mode+'-mobile-cart.png'});
if(width<1280&&(width<768||mode==='quote')){const bounds=await row.boundingBox();assert.ok(bounds.x>=0&&bounds.x+bounds.width<=width+2,mode+' row fits viewport');for(const field of await row.locator('input').all()){const box=await field.boundingBox();assert.ok(box&&box.x>=bounds.x&&box.x+box.width<=bounds.x+bounds.width+1,'all fields inside '+mode+' card');}assert.ok(await row.getByRole('button',{name:/Remove/}).isVisible(),'touch remove remains visible');}
if(width>=768&&mode!=='quote'){
  assert.equal(await row.evaluate(el=>getComputedStyle(el).gridTemplateRows.trim().split(/\s+/).length),1,mode+' tablet product stays in one row');
  const bounds=await row.boundingBox();
  for(const field of await row.locator('input').all()){
    const box=await field.boundingBox();
    assert.ok(box&&box.x>=bounds.x&&box.x+box.width<=bounds.x+bounds.width+1,'all fields inside '+mode+' table row');
  }
  const scroll=await row.evaluateHandle(el=>{
    for(let parent=el.parentElement;parent;parent=parent.parentElement)
      if(['auto','scroll'].includes(getComputedStyle(parent).overflowX))return parent;
    return null;
  });
  assert.ok(await scroll.evaluate(el=>Boolean(el)),mode+' cart owns horizontal scrolling');
  assert.ok(await scroll.evaluate(el=>{const box=el.getBoundingClientRect();return box.x>=0&&box.right<=innerWidth+2;}),mode+' scroll region fits viewport');
  await scroll.evaluate(el=>{el.scrollLeft=el.scrollWidth;});
  const remove=row.getByRole('button',{name:/Remove/});
  await remove.scrollIntoViewIfNeeded();
  const action=await remove.boundingBox();
  assert.ok(action&&action.x>=0&&action.x+action.width<=width+2,mode+' remove action reachable after cart scrolling');
  await scroll.dispose();
}
assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+2),mode+' has no whole-page overflow');
assert.equal(await row.locator('[data-cart-field]').count(),mode==='purchase'?5:4,'same editable controls, readable field labels');}
assert.deepEqual(errors,[]);await page.close();}
console.log('Phone/quotation cards fit the viewport; tablet POS/Purchase rows stay single-line with reachable cart scrolling; both themes/four sizes passed');}finally{await browser.close();await server.close();}}
main().catch(error=>{console.error(error);process.exitCode=1;});
