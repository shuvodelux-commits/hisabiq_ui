import type {Ref} from 'react';
import type {Product} from '../../types/erp';
import {NumericInput} from '../NumericInput';
import {productUnits} from '../../utils/unitChain';
import type {UnitQuantityMap} from '../../utils/multiUnitTransactions';

/** Joined numeric fields for entering three or more units on the same transaction line.
 * Traditional one/two-unit products keep CompoundQuantityInput without visual changes.
 */
export function MultiUnitQuantityInput({product,quantities,onChange,disabled=false,primaryRef}:{
  product:Pick<Product,'unit'|'altUnit'|'unitRelations'>;
  quantities:UnitQuantityMap;
  onChange:(next:UnitQuantityMap)=>void;
  disabled?:boolean;
  primaryRef?:Ref<HTMLInputElement>;
}) {
  return <div data-multi-quantity className="grid min-w-0 grid-cols-1 gap-1">
    {productUnits(product).map((unit,index)=>
      <div key={unit} data-numeric-joined className="flex h-9 min-w-0 items-stretch overflow-hidden rounded-md border border-input bg-card focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20">
        <NumericInput ref={index===0?primaryRef:undefined} stepperCompact aria-label={'Quantity in '+unit}
          value={quantities[unit]??''} disabled={disabled}
          type="text" inputMode="decimal" placeholder="0"
          onChange={event=>{
            const clean=event.target.value.replace(/[^\d.]/g,'').replace(/(\..*)\./g,'$1');
            onChange({...quantities,[unit]:clean});
          }}
          className="h-full w-0 min-w-0 flex-1 bg-transparent px-2 text-right text-[13px] text-ink outline-none"/>
        <span title={unit} className="flex w-[65px] min-w-0 shrink-0 items-center justify-center border-l border-border bg-ink-50/50 px-1 text-[12px] text-ink">{unit}</span>
      </div>
    )}
  </div>;
}
