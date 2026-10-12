export type SearchResult = { id:string; kind:'Module'|'Product'|'Party'|'Invoice'|'Purchase'; label:string; helper:string; path:string; keywords?:string };
/** Match all words and Bangla digits without changing stored identifiers. */
export function normalizeSearch(text:string):string {
  return text.normalize('NFC').toLocaleLowerCase().replace(/[০-৯]/g,digit=>String('০১২৩৪৫৬৭৮৯'.indexOf(digit))).trim();
}
export function searchResults(records:readonly SearchResult[],query:string):SearchResult[] {
  const words=normalizeSearch(query).split(/\s+/).filter(Boolean);
  if(!words.length)return records.filter(record=>record.kind==='Module');
  return records.filter(record=>{
    const haystack=normalizeSearch([record.label,record.helper,record.keywords??''].join(' '));
    return words.every(word=>haystack.includes(word));
  });
}
