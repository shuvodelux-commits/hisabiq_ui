import {NumericInput} from '../../NumericInput';
import {useUiCopy} from '../../../i18n/useUiCopy';

/** Historical net price is always displayed and edited per frozen base/smallest unit. */
export function ReturnPriceField({name,baseUnit,historicalUnitPrice,rawOverride,onChange,onReset}:{
 name:string;baseUnit:string;historicalUnitPrice:number|null;
 rawOverride?:string;onChange:(next:string)=>void;onReset:()=>void;
}){
 const {text}=useUiCopy();
 const historic=historicalUnitPrice===null?'':String(Number(historicalUnitPrice.toFixed(6)));
 const changed=rawOverride!==undefined&&rawOverride!==historic&&
  (rawOverride.trim()===''||!Number.isFinite(Number(rawOverride))||
   historicalUnitPrice===null||Math.abs(Number(rawOverride)-Number(historic))>0.0000005);
 return <div className="ml-auto w-32 min-w-0 space-y-1">
   <label className="sr-only" htmlFor={'return-price-'+name.replace(/\W/g,'-')}>{text('Return price','ফেরত দাম')} / {baseUnit}</label>
   <NumericInput stepperCompact id={'return-price-'+name.replace(/\W/g,'-')}
     aria-label={text('Return price for ','ফেরত পণ্যের দাম: ')+name+' / '+baseUnit}
     disabled={historicalUnitPrice===null}
     type="text" inputMode="decimal" value={rawOverride??historic}
     onChange={event=>onChange(event.target.value)}
     className="h-8 w-full min-w-0 text-right text-[13px]"/>
   {changed&&<button type="button" onClick={onReset}
     className="block w-full text-right text-[10.5px] leading-4 text-teal-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-teal-400"
     >{text('Reset historical net price','আগের নিট দাম ফিরিয়ে আনুন')}</button>}
   <p className="text-right text-[10px] text-ink-400">/ {baseUnit}</p>
  </div>;
}
