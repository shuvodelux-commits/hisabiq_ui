import {useRef,type Ref,type MutableRefObject} from 'react';
import type {Product} from '../../types/erp';
import {NumericInput} from '../NumericInput';
import {productUnits} from '../../utils/unitChain';
import type {UnitQuantityMap} from '../../utils/multiUnitTransactions';
import {unitSymbol} from '../../data/productUnits';
import {useUiCopy} from '../../i18n/useUiCopy';

/** One joined quantity field, in the configured largest-to-smallest unit order. */
export function MultiUnitQuantityInput({product,quantities,onChange,disabled=false,primaryRef,onLastEnter,unitOrder,label,invalid}:{
  product:Pick<Product,'unit'|'altUnit'|'unitRelations'>;
  quantities:UnitQuantityMap;
  onChange:(next:UnitQuantityMap)=>void;
  disabled?:boolean;
  primaryRef?:Ref<HTMLInputElement>;
  onLastEnter?:()=>void;
  /** Historical return lines supply the order from their frozen unit profile. */
  unitOrder?:readonly string[];
  label?:string;
  invalid?:boolean;
}) {
  const {text}=useUiCopy();
  const inputs=useRef<(HTMLInputElement|null)[]>([]);
  const units=unitOrder??productUnits(product);
  return <div data-multi-quantity data-unit-count={units.length} data-numeric-joined data-invalid={invalid?'true':undefined} role="group" aria-label={label??text('Quantity by unit','একক অনুযায়ী পরিমাণ')}
    className="flex h-9 w-full min-w-0 max-w-full items-stretch overflow-hidden rounded-md border border-input bg-ink-50/50 focus-within:border-teal-500 focus-within:bg-card focus-within:ring-2 focus-within:ring-teal-500/20">
    {units.map((unit,index)=>
      <div key={unit} className="flex min-w-0 flex-1 items-stretch border-l border-border first:border-l-0">
        <NumericInput ref={node=>{
            inputs.current[index]=node;
            if(index===0&&typeof primaryRef==='function')primaryRef(node);
            else if(index===0&&primaryRef)(primaryRef as MutableRefObject<HTMLInputElement|null>).current=node;
          }}
          onKeyDown={event=>{if(event.key==='Enter'&&!event.nativeEvent.isComposing){
            event.preventDefault();
            event.stopPropagation();
            if(index+1<units.length){const next=inputs.current[index+1];next?.focus();next?.select();}
            else onLastEnter?.();
          }}}
          stepperCompact aria-label={text('Quantity in '+unit,unit+' এককে পরিমাণ')}
          value={quantities[unit]??''} disabled={disabled} aria-invalid={invalid||undefined}
          type="text" inputMode="decimal" autoComplete="off" placeholder="0"
          onChange={event=>{
            const cleaned=event.target.value.replace(/[^\d.]/g,'').replace(/(\..*)\./g,'$1');
            const [whole='',fraction]=cleaned.split('.');
            const clean=fraction===undefined?whole:(whole||'0')+'.'+fraction.slice(0,4);
            onChange({...quantities,[unit]:clean});
          }}
          className="h-full w-0 min-w-0 flex-1 !rounded-none !border-0 !bg-transparent !shadow-none px-1 text-right text-[13px] text-ink outline-none"/>
        <span data-table-helper="" title={unit} className="flex shrink-0 items-center border-l border-border px-1 text-[11px] text-ink-500">{unitSymbol(unit)}</span>
      </div>
    )}
  </div>;
}
