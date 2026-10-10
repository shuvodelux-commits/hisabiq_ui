const {chromium}=require('playwright');
const assert=require('node:assert/strict');

async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4252,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1200,height:850},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4252/#/app/parties?id=v1&role=Vendor');
  const workspace=page.getByRole('region',{name:'Vendor workspace'});
  await workspace.waitFor();
  await workspace.getByRole('tab',{name:/Pending price/}).click();
  await workspace.getByRole('button',{name:'Correct vendor source DEMO-INV-201'}).click();
  const review=page.getByRole('dialog',{name:'Review Vendor correction'});
  await review.waitFor();
  assert.match(await review.innerText(),/not accounting|demo-only|demo preview/i);
  const save=review.getByRole('button',{name:'Save corrected demo source'});
  await save.click();
  await review.getByRole('alert').getByText(/reason/i).waitFor();
  await review.getByRole('textbox',{name:'Corrected source quantity'}).fill('2');
  await review.getByRole('textbox',{name:'Vendor correction reason'}).fill('Vendor verified two pieces, not three');
  await save.click();
  await review.waitFor({state:'hidden'});
  await workspace.getByText('2 base units').first().waitFor();
  await workspace.getByRole('tab',{name:/All Activity/}).click();
  assert.ok((await workspace.innerText()).includes('Reversal of sourcing'));

  await workspace.getByRole('tab',{name:/Sourced Sales/}).click();
  await workspace.getByRole('button',{name:'Correct vendor source DEMO-INV-201'}).click();
  await review.getByRole('tab',{name:'Reverse source'}).click();
  await review.getByRole('textbox',{name:'Vendor correction reason'}).fill('Customer cancelled before price confirmation');
  await review.getByRole('button',{name:'Confirm demo reversal'}).click();
  await review.waitFor({state:'hidden'});
  await workspace.getByRole('tab',{name:/Pending price/}).click();
  assert.equal(await workspace.getByRole('button',{name:'Correct vendor source DEMO-INV-201'}).count(),0);
  await page.setViewportSize({width:390,height:820});
  assert.deepEqual(errors,[]);
  console.log('Vendor correction: reason required, audit reversal and source quantity smoke passed');
 }finally{await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
