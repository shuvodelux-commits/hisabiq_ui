const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4244,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1250,height:850},reducedMotion:'reduce',acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4244/#/app/parties?id=v1&role=Vendor');
  await page.getByRole('region',{name:'Vendor workspace'}).waitFor();
  assert.ok(await page.getByText('Known payable').count()>0);
  assert.ok(await page.getByText('Vendor receivable').count()>0);
  assert.ok(await page.getByText('Price pending',{exact:false}).count()>0);
  const nav=page.getByRole('navigation',{name:'Main'});
  await nav.getByRole('link',{name:/Vendors/}).waitFor();
  const pending=page.getByRole('tab',{name:/Pending/});await pending.click();
  assert.ok(await page.getByText('DEMO-INV-201').count()>0);
  await page.getByRole('button',{name:'View vendor source DEMO-INV-201'}).click();
  await page.getByRole('dialog',{name:'Vendor source details'}).waitFor();
  await page.getByRole('dialog',{name:'Vendor source details'}).getByRole('button',{name:'Close'}).first().click();
  await page.getByRole('button',{name:/Vendor statement/}).click();
  await page.getByRole('dialog',{name:'Vendor ledger statement'}).waitFor();
  const csv=page.waitForEvent('download');
  await page.getByRole('dialog',{name:'Vendor ledger statement'}).getByRole('button',{name:/Export CSV/}).click();
  assert.match((await csv).suggestedFilename(),/vendor-ledger-/);
  await page.getByRole('dialog',{name:'Vendor ledger statement'}).getByRole('button',{name:'Close'}).first().click();
  await page.setViewportSize({width:375,height:800});
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('Vendor workspace and statement preview smoke passed');
 }finally{await browser.close();await server.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
