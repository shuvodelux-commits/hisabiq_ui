export type SearchResult = { id:string; kind:'Module'|'Product'|'Party'|'Invoice'|'Purchase'; label:string; helper:string; path:string; keywords?:string };
export type GlobalSearchMode = 'Default'|'Advanced';

/** Normalize mixed English/Bangla queries, including Bangla numerals. */
export function normalizeSearch(text:string):string {
 return text.normalize('NFC').toLocaleLowerCase().replace(/[০-৯]/g,digit=>String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).trim();
}
const parts=(text:string)=>normalizeSearch(text).match(/[\p{L}\p{N}]+/gu)??[];
/** At most one character edit for longer words; protects short SKU/number queries from noise. */
function closeSpelling(a:string,b:string):boolean {
 if(a.length<4||b.length<4||Math.abs(a.length-b.length)>1)return false;
 let i=0,j=0,edits=0;
 while(i<a.length&&j<b.length){
  if(a[i]===b[j]){i++;j++;continue;}
  if(++edits>1)return false;
  if(a.length>b.length)i++;else if(b.length>a.length)j++;else{i++;j++;}
 }
 return edits+(a.length-i)+(b.length-j)<=1;
}
function score(record:SearchResult,query:string,mode:GlobalSearchMode):number|null {
 const fields=[normalizeSearch(record.label),normalizeSearch(record.helper),normalizeSearch(record.keywords??'')];
 const tokens=parts(query);if(!tokens.length)return null;
 const wordFields=fields.map(parts);
 const strengths=tokens.map(token=>{
  let best=0;
  fields.forEach((field,index)=>{
   if(!field)return;
   const words=wordFields[index],primary=index===0;
   if(field===token)best=Math.max(best,primary?120:84);
   else if(field.startsWith(token))best=Math.max(best,primary?96:67);
   else if(words.some(word=>word===token))best=Math.max(best,primary?88:60);
   else if(words.some(word=>word.startsWith(token)))best=Math.max(best,primary?78:47);
   else if(mode==='Advanced'&&field.includes(token))best=Math.max(best,primary?48:30);
   else if(mode==='Advanced'&&words.some(word=>closeSpelling(word,token)))best=Math.max(best,primary?24:15);
  });
  return best;
 });
 // Default means every entered word matches a whole-word prefix.
 // Advanced is fuzzy: any matching word can surface a candidate, ranked below exact matches.
 if(mode==='Default'&&strengths.some(value=>!value))return null;
 if(mode==='Advanced'&&strengths.every(value=>!value))return null;
 return strengths.reduce((sum,value)=>sum+value,0)+(mode==='Advanced'?strengths.filter(Boolean).length*8:0);
}
export function searchResults(records:readonly SearchResult[],query:string,mode:GlobalSearchMode='Default'):SearchResult[] {
 if(!normalizeSearch(query))return records.filter(record=>record.kind==='Module');
 const ranked=records.map((record,index)=>({record,index,rank:score(record,query,mode)}))
  .filter((item):item is {record:SearchResult;index:number;rank:number}=>item.rank!==null);
 return ranked.sort((a,b)=>b.rank-a.rank||
  (a.record.kind==='Module'?1:0)-(b.record.kind==='Module'?1:0)||a.index-b.index)
  .map(item=>item.record);
}
