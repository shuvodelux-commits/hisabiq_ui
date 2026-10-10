const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4210,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:850},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4210/#/app/quotations');
  await page.getByRole('button',{name:'New quotation'}).click();
  const dlg=page.getByRole('dialog',{name:'New quotation'});
  await dlg.getByLabel('Quotation customer name').fill('Quotation Browser Customer');
  await dlg.getByRole('combobox',{name:'Add product to quotation'}).click();
  await page.getByRole('listbox',{name:'Add product to quotation options'})
   .getByRole('option',{name:/LED Bulb 12W/}).click();
  await dlg.getByRole('combobox',{name:'Unit row 1'}).click();
  await page.getByRole('listbox',{name:'Unit row 1 options'}).getByRole('option',{name:'Box'}).click();
  await dlg.getByLabel('Quantity row 1').fill('2');
  await dlg.getByLabel('Quotation discount').fill('50');
  await dlg.getByText('3,050',{exact:false}).first().waitFor();
  await dlg.getByRole('button',{name:'Save draft'}).click();
  await dlg.waitFor({state:'hidden'});
  await page.getByText('Quotation Browser Customer',{exact:true}).first().waitFor();
  const row=page.getByRole('row').filter({hasText:'Quotation Browser Customer'});
  await row.getByRole('button',{name:'QT-000043',exact:true}).click();
  const details=page.getByRole('dialog',{name:'Quotation QT-000043'});
  await details.getByText('LED Bulb 12W',{exact:true}).waitFor();
  await details.getByRole('button',{name:'Mark sent'}).click();
  await details.getByText('Sent',{exact:true}).first().waitFor();
  await details.getByRole('button',{name:'Duplicate'}).click();
  const copied=page.getByRole('dialog',{name:'Quotation QT-000044'});
  await copied.getByText('Draft',{exact:true}).first().waitFor();
  await copied.getByRole('button',{name:'Delete draft'}).click();
  const confirm=page.getByRole('dialog',{name:'Confirm delete quotation'});
  await confirm.getByRole('button',{name:'Delete draft'}).click();
  await confirm.waitFor({state:'hidden'});
  await page.setViewportSize({width:375,height:812});
  assert.equal(await page.getByRole('button',{name:'New quotation'}).isVisible(),true);
  assert.deepEqual(errors,[]);
  console.log('Quotations browser: create, compound-unit price, discount, status, duplicate, delete and mobile passed');
 }finally{await browser.close();await server.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
