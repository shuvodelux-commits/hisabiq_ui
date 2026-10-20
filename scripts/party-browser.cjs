const { chromium } = require('playwright');
const assert = require('node:assert/strict');

async function main() {
  const { createServer } = await import('vite');
  const server = await createServer({ server: { host:'127.0.0.1',port:4196,strictPort:true }});
  await server.listen();
  const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_EXECUTABLE_PATH || undefined, args:['--no-sandbox'] });
  const page = await browser.newPage({ viewport:{width:1280,height:900},reducedMotion:'reduce' });
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  try {
    await page.goto('http://127.0.0.1:4196/#/app/parties');
    await page.getByRole('button',{name:/Add party/i}).click();
    const dialog=page.getByRole('dialog');
    await dialog.getByLabel('Party name').fill('New Party QA');
    await dialog.getByLabel('Bangla name').fill('নতুন পার্টি');
    await dialog.getByLabel('Phone').fill('01799990000');
    await dialog.getByLabel('Area').fill('Dhaka');
    await dialog.getByRole('checkbox',{name:'Supplier'}).check();
    await dialog.getByRole('button',{name:/Save party/i}).click();
    await page.getByRole('heading',{name:'New Party QA'}).waitFor();
    assert.match(page.url(),/id=party-preview-/);
    await page.getByRole('combobox',{name:'Relationship'}).click();
    await page.getByRole('listbox',{name:'Relationship options'}).getByRole('option',{name:'Supplier',exact:true}).click();
    assert.match(page.url(),/role=Supplier/);
    await page.getByRole('button',{name:/Edit party/i}).click();
    await dialog.getByLabel('Phone').fill('01888880000');
    await dialog.getByRole('button',{name:/Save party/i}).click();
    await page.locator(':text-is("01888880000"):visible').first().waitFor();
    await page.getByRole('tab',{name:/Notes/}).click();
    await page.getByRole('textbox',{name:'New note'}).fill('Ask for receipt');
    await page.getByRole('textbox',{name:'New note'}).locator('..').getByRole('button',{name:'Add note'}).click();
    await page.getByText('Ask for receipt').first().waitFor();
    await page.getByRole('button',{name:/Edit note Ask for receipt/i}).click();
    await page.getByRole('textbox',{name:'Edit note'}).fill('Bring receipt');
    await page.getByRole('button',{name:/Save note/i}).click();
    await page.getByText('Bring receipt').first().waitFor();
    await page.getByRole('button',{name:/Delete note Bring receipt/i}).click();
    await page.getByRole('button',{name:'Confirm delete'}).click();
    assert.equal(await page.getByText('Bring receipt').count(),0);
    // The directory search must include the Bangla display name.
    await page.getByRole('textbox',{name:'Search parties'}).fill('নতুন');
    assert.ok(await page.getByText('New Party QA',{exact:true}).count() >= 1);
    await page.getByRole('textbox',{name:'Search parties'}).fill('');
    await page.getByRole('button',{name:/Import Excel/i}).click();
    await page.getByRole('dialog',{name:'Choose Party import type'})
      .getByRole('button',{name:'Legacy multi-role CSV'}).click();
    await page.getByLabel('Select CSV file').setInputFiles({
      name:'parties.csv',mimeType:'text/csv',
      buffer:Buffer.from('name,nameBn,phone,area,roles\nCSV Supplier QA,সিএসভি,01700990011,Sylhet,Supplier|Customer\n')
    });
    await page.getByRole('button',{name:/Import 1 parties/}).click();
    await page.locator(':text-is("CSV Supplier QA"):visible').first().waitFor();
    // Magic Patterns adaptive Party workspace: one selected profile plus a chooser on narrow viewports.
    await page.setViewportSize({width:375,height:800});
    await page.getByRole('button',{name:'Change party'}).click();
    const choose=page.getByRole('dialog',{name:'Change party'});
    await choose.getByRole('textbox',{name:'Search parties'}).fill('CSV Supplier QA');
    await choose.getByRole('option',{name:/CSV Supplier QA/}).click();
    await choose.waitFor({state:'hidden'});
    await page.getByRole('heading',{name:/CSV Supplier QA/}).waitFor();
    await page.getByRole('button',{name:'More actions'}).click();
    await page.getByRole('button',{name:/Opening balance/}).first().waitFor();
    await page.keyboard.press('Escape');
    await page.getByRole('dialog',{name:'More actions'}).waitFor({state:'hidden'});

    for(const width of [320,360,390,600,768,820,1024,1280,1440]){
      await page.setViewportSize({width,height:900});
      const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);
      assert.ok(overflow<=4,`Party ${width}px should not overflow horizontally (extra ${overflow}px)`);
      assert.equal(await page.getByRole('list',{name:'Transactions'}).isVisible(),width<1280,`Party ${width}px shows reference feed on small screens`);
      assert.equal(await page.locator('table').first().isVisible(),width>=1280,`Party ${width}px shows reference ledger table on wide screens`);
      assert.equal(await page.getByRole('button',{name:'Change party'}).isVisible(),width<1024,`Party chooser at ${width}px`);
    }
    assert.equal(errors.length,0,'browser page must not throw');
    console.log('Party profile browser flow passed');
  } finally {
    await browser.close();
    await server.close();
  }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
