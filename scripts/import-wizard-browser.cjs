const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4207,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:850},acceptDownloads:true,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4207/#/app/products');
  await page.getByRole('button',{name:'Import',exact:true}).click();
  const dlg=page.getByRole('dialog',{name:'Import products'});
  await dlg.waitFor();
  assert.ok(await dlg.getByText('UI preview only').count()>0);
  const [csvDownload]=await Promise.all([
    page.waitForEvent('download'),
    dlg.getByRole('button',{name:'Download CSV template'}).click()
  ]);
  assert.match(csvDownload.suggestedFilename(),/products.*\.csv$/);
  const [excelDownload]=await Promise.all([
    page.waitForEvent('download'),
    dlg.getByRole('button',{name:'Download Excel template'}).click()
  ]);
  assert.match(excelDownload.suggestedFilename(),/products.*\.xlsx$/);
  await dlg.getByLabel('Select Excel or CSV file').setInputFiles({
   name:'products.csv',mimeType:'text/csv',
   buffer:Buffer.from('Product Name,SKU,Selling Price,Base Unit,Opening Stock,Opening Stock Unit\n' +
    'LED Bulb 12W,000120,165,Pcs,2,Box\n' +
    'পাইপ,0009,420,Pcs,0,Pcs\n','utf8')
  });
  assert.ok(await dlg.getByText('2 data rows').count()>0);
  await dlg.getByRole('button',{name:'Next: Map columns'}).click();
  assert.ok(await dlg.getByText('Map columns').count()>0);
  await dlg.getByRole('button',{name:'Next: Review'}).click();
  assert.ok(await dlg.getByText('LED Bulb 12W').count()>0);
  assert.ok(await dlg.getByText('000120').count()>0);
  assert.ok(await dlg.getByText('পাইপ').count()>0);
  assert.equal(await dlg.getByRole('button',{name:/Confirm import/i}).isDisabled(),true,
   'Phase A must never fake a backend or product posting');
  await dlg.getByRole('button',{name:'Back'}).click();
  await dlg.getByRole('button',{name:'Back'}).click();
  assert.ok(await dlg.getByText('2 data rows').count()>0);
  await page.setViewportSize({width:375,height:812});
  assert.ok(await dlg.isVisible());
  await dlg.getByRole('button',{name:'Cancel'}).click();
  await dlg.waitFor({state:'hidden'});
  assert.deepEqual(errors,[]);
  console.log('Shared import wizard CSV mapping, downloads, disabled commit and mobile browser smoke passed');
 } finally {await browser.close();await server.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
