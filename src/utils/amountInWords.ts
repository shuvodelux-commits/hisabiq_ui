/** Consistent Bangladesh taka/paisa wording for transaction entry and review. */
const small = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
function belowThousand(value:number):string {
 if(value<20)return small[value];
 if(value<100)return tens[Math.floor(value/10)]+(value%10?' '+small[value%10]:'');
 return small[Math.floor(value/100)]+' Hundred'+(value%100?' '+belowThousand(value%100):'');
}
function positiveWords(value:number):string {
 if(value===0)return 'Zero';
 const parts:string[]=[];
 const units:[number,string][]=[[10000000,'Crore'],[100000,'Lakh'],[1000,'Thousand'],[1,'']];
 for(const [size,label] of units){
  const count=Math.floor(value/size);
  if(count>0){parts.push((count<1000?belowThousand(count):positiveWords(count))+(label?' '+label:''));value%=size;}
 }
 return parts.join(' ');
}
/** No floating point rounding leakage: input is first rounded to whole paisa. */
export function amountInWords(value:number):string {
 if(!Number.isFinite(value))return '';
 const cents=Math.round(Math.abs(value)*100);
 if(!Number.isSafeInteger(cents))return '';
 const whole=Math.floor(cents/100),paisa=cents%100;
 return (value<0?'Minus ':'')+positiveWords(whole)+' Taka'+(paisa?' and '+positiveWords(paisa)+' Paisa':'')+' Only';
}
