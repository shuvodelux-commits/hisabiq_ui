const {chromium}=require('playwright');
const assert=require('node:assert/strict');
async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4246,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 try{
  await page.goto('http://127.0.0.1:4246/#/app/parties?id=v1&role=Vendor');
  const vendor=page.getByRole('region',{name:'Vendor workspace'});
  await vendor.getByRole('tab',{name:/Pending price/}).click();
  await vendor.getByRole('button',{name:'Set price DEMO-INV-201'}).click();
  const modal=page.getByRole('dialog',{name:'Vendor settlement'});
  await modal.getByRole('textbox',{name:'Vendor cost per Pcs'}).fill('110');
  await modal.getByRole('button',{name:'Confirm price in demo'}).click();
  await vendor.getByText('৳330').first().waitFor();
  await vendor.getByRole('tab',{name:/Sourced Sales/}).click();
  await vendor.getByRole('button',{name:'Pay DEMO-INV-201'}).click();
  await modal.getByRole('textbox',{name:'Pay amount'}).fill('200');
  await modal.getByRole('button',{name:'Record demo payment'}).click();
  await vendor.getByText('৳130').first().waitFor();
  await vendor.getByRole('button',{name:'Return goods DEMO-INV-201'}).click();
  await modal.getByRole('textbox',{name:'Return matching quantity'}).fill('1');
  await modal.getByRole('button',{name:'Record demo return'}).click();
  await vendor.getByText('৳20').first().waitFor();
  assert.match(await vendor.innerText(),/Demo preview.*no real posting/);
  assert.deepEqual(errors,[]);
  console.log('Vendor evening quote + cash + matching goods return preview passed');
 }finally{await browser.close();await server.close();}
}
main().catch(err=>{console.error(err);process.exitCode=1;});
