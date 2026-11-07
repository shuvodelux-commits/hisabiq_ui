/* POS evidence must retain the real sticky header and HisabIQ logo. */
const assert = require('node:assert/strict');
async function assertPosHeader(page) {
 const geometry=await page.evaluate(()=>{
  const header=document.querySelector('.erp-workspace > div > header');
  if(!header)return null;
  const box=header.getBoundingClientRect();
  const logo=[...document.querySelectorAll('svg[aria-label="HisabIQ"]')].find(el=>{const b=el.getBoundingClientRect();return b.width>0&&b.height>0&&b.left>=0&&b.right<=innerWidth&&b.top>=0&&b.bottom<=Math.max(box.bottom,64);});
  const mark=logo?.getBoundingClientRect();
  return {headerTop:box.top,headerBottom:box.bottom,logo:mark?{top:mark.top,bottom:mark.bottom,left:mark.left,right:mark.right}:null};
 });
 assert.ok(geometry&&Math.abs(geometry.headerTop)<=1,'POS header at viewport top: '+JSON.stringify(geometry));
 assert.ok(geometry.logo,'HisabIQ logo visible near top bar/sidebar top: '+JSON.stringify(geometry));
 return geometry;
}
async function capturePos(page,options={}) {
 if(options.fullPage){
  await page.evaluate(()=>{
   window.scrollTo(0,0);
   for(const el of document.querySelectorAll('*')){const style=getComputedStyle(el);if(['auto','scroll'].includes(style.overflowY)&&el.scrollHeight>el.clientHeight)el.scrollTop=0;if(['auto','scroll'].includes(style.overflowX)&&el.scrollWidth>el.clientWidth)el.scrollLeft=0;}
  });
 }
 await page.evaluate(async()=>{
  await document.fonts.ready;
  await Promise.all([...document.images].map(image=>image.complete?Promise.resolve():new Promise(resolve=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',resolve,{once:true});})));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
 });
 // Allow the existing authored popup/dialog entrance to settle before evidence.
 await page.waitForTimeout(220);
 await assertPosHeader(page);
 const result=await page.screenshot(options);
 await assertPosHeader(page);
 return result;
}
module.exports={assertPosHeader,capturePos};
