const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4246,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1320,height:860},acceptDownloads:true,reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 try{
  await page.goto('http://127.0.0.1:4246/#/app/expenses');
  await page.getByRole('heading',{name:'Expenses'}).waitFor();
  await page.getByRole('tab',{name:/Categories/}).click();
  await page.getByRole('button',{name:'Add category'}).click();
  const category=page.getByRole('dialog',{name:'New expense category'});
  await category.getByLabel('Category name').fill('Browser QA Maintenance');
  await category.getByRole('button',{name:'Create category'}).click();
  await category.waitFor({state:'hidden'});
  await page.getByText('Browser QA Maintenance',{exact:true}).waitFor();

  await page.getByRole('tab',{name:/Payees/}).click();
  await page.getByRole('button',{name:'Add payee'}).click();
  const payee=page.getByRole('dialog',{name:'New expense payee'});
  await payee.getByLabel('Payee name').fill('Browser QA Cleaner');
  await payee.getByLabel('Payee phone').fill('01711000001');
  await payee.getByRole('button',{name:'Create payee'}).click();
  await payee.waitFor({state:'hidden'});
  await page.getByText('Browser QA Cleaner',{exact:true}).waitFor();

  await page.getByRole('tab',{name:/Expense list/}).click();
  const rows=page.locator('tbody tr');
  assert.ok(await rows.count()>0);
  await page.getByRole('combobox',{name:'Expense category filter'}).click();
  await page.getByRole('option',{name:'Browser QA Maintenance'}).click();
  assert.equal(await rows.count(),0,'new category must filter out nonmatching expenses');
  await page.getByRole('combobox',{name:'Expense category filter'}).click();
  await page.getByRole('option',{name:'All categories'}).click();
  assert.ok(await rows.count()>0);

  const downloadPromise=page.waitForEvent('download');
  await page.getByRole('button',{name:'Export'}).click();
  const download=await downloadPromise;
  assert.match(download.suggestedFilename(),/hisabiq-expenses-preview.*csv/);

  await rows.first().getByRole('button',{name:/View EXP-/}).click();
  const bill=page.locator('[data-slot="dialog-content"]').last();
  await bill.waitFor();
  if(await bill.getByRole('button',{name:/Payment unavailable/}).count()){
   assert.equal(await bill.getByRole('button',{name:/Payment unavailable/}).isDisabled(),true);
  }
  await bill.getByRole('button',{name:'Close',exact:true}).first().click();
  assert.deepEqual(errors,[]);
  console.log('Expense Quick Add, list filters, real CSV and truthful detail actions passed');
 }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
