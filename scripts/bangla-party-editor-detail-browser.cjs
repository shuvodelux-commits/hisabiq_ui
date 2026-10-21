/* Phase 21: shared Party Editor, opening-balance and Party Detail language smoke. */
const {chromium}=require('playwright');
const assert=require('node:assert/strict');

async function main(){
 const {createServer}=await import('vite');
 const server=await createServer({server:{host:'127.0.0.1',port:4406,strictPort:true}});
 await server.listen();
 const browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 try{
  for(const language of ['English','English + Bangla','Bangla']){
   const bn=language==='Bangla';
   const label=(english,bangla)=>bn?bangla:english;
   for(const width of [390,768,1440]){
    const context=await browser.newContext({viewport:{width,height:width===390?844:900},hasTouch:width===390,reducedMotion:'reduce'});
    const page=await context.newPage(),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.addInitScript(lang=>localStorage.setItem('hisabiq-erp-personal-v1',JSON.stringify({
     mode:'Simple',language:lang,density:'Compact',terminology:'simple',dateView:'transaction'
    })),language);
    await page.goto('http://127.0.0.1:4406/#/app/parties?id=c1&role=Customer');
    if(width<768)await page.getByRole('button',{name:label('Change party','পার্টি বদলান')}).click();
    await page.getByRole('button',{name:label('Add party','নতুন পার্টি যোগ করুন'),exact:true}).click();
    const editor=page.getByRole('dialog',{name:label('Add party','নতুন পার্টি যোগ করুন')});
    await editor.waitFor();
    await editor.getByLabel(label('Party name','পার্টির নাম'),{exact:true}).waitFor();
    await editor.getByRole('checkbox',{name:label('Supplier','সরবরাহকারী')}).check();
    const section=editor.locator('[data-testid="party-opening-section"]');
    await section.locator('summary').click();
    await editor.getByRole('textbox',{name:label('Opening amount Customer','শুরুর জের ক্রেতা')}).fill('120');
    await editor.getByRole('textbox',{name:label('Opening amount Supplier','শুরুর জের সরবরাহকারী')}).fill('75');
    await editor.getByRole('button',{name:label('Cancel','বাতিল')}).click();
    await editor.waitFor({state:'hidden'});

    if(width<1024){
      await page.getByRole('button',{name:label('More actions','আরও কাজ')}).click();
      const more=page.getByRole('dialog',{name:label('More actions','আরও কাজ')});
      await more.getByRole(width<768?'button':'menuitem',{name:bn?/শুরুর জের/:/Opening balance/}).click();
    }else{
      await page.getByRole('button',{name:label('Edit opening balance','শুরুর জের বদলান')}).click();
    }
    const opening=page.getByRole('dialog',{name:label('Party opening balance','পার্টির শুরুর জের')});
    await opening.getByRole('textbox',{name:label('Opening balance amount','শুরুর জেরের টাকা')}).waitFor();
    await opening.getByText(label('Opening balance changes the ledger only.','শুরুর জের শুধু খাতার হিসাব বদলায়।'),{exact:false}).waitFor();
    await opening.getByRole('button',{name:label('Cancel','বাতিল')}).click();

    await page.getByRole('tab',{name:label('Notes','মন্তব্য')}).click();
    await page.getByRole('textbox',{name:label('New note','নতুন নোট')}).fill('Phase 21 language check');
    await page.getByRole('button',{name:label('Add note','নোট যোগ করুন')}).last().click();
    await page.getByText('Phase 21 language check',{exact:true}).waitFor();
    await page.getByRole('button',{name:label('Edit note','নোট বদলান')+' Phase 21 language check'}).click();
    await page.getByRole('textbox',{name:label('Edit note','নোট বদলান')}).fill('Phase 21 changed note');
    await page.getByRole('button',{name:label('Save note','নোট রাখুন')}).click();
    await page.getByText('Phase 21 changed note',{exact:true}).waitFor();
    await page.getByRole('button',{name:label('Delete note','নোট মুছুন')+' Phase 21 changed note'}).click();
    await page.getByRole('button',{name:label('Confirm delete','নিশ্চিত মুছুন')}).click();
    assert.equal(await page.getByText('Phase 21 changed note',{exact:true}).count(),0);
    assert.deepEqual(errors,[],language+' '+width+'px uncaught errors');
    await context.close();
    console.log('Phase 21 Party Editor/Detail '+language+' @ '+width+'px passed');
   }
  }
 }finally{await browser.close();await server.close();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
