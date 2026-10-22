import type {SaleLine,Product} from '../../../types/erp';
import {Input} from '../../Input';
import {CompoundQuantityInput} from '../../transactions/CompoundQuantityInput';
import {MultiUnitQuantityInput} from '../../transactions/MultiUnitQuantityInput';
import {useUiCopy} from '../../../i18n/useUiCopy';

/** Reuse real POS quantity controls, driven exclusively by the original invoice unit snapshot. */
export function ReturnQuantityField({line,value,unitValues,onChange,onUnitsChange}:{
 line:SaleLine;value:string;unitValues?:Record<string,string>;
 onChange:(next:string)=>void;onUnitsChange:(next:Record<string,string>)=>void;
}){
 const {text}=useUiCopy();
 const p=line.unitSnapshot;
 const ordered=p?Object.keys(p.factors).sort((a,b)=>p.factors[b]-p.factors[a]):[];
 const sourceUnitLabels=Object.keys(line.unitQuantities??{});
 const hasCompound=ordered.length>1||sourceUnitLabels.length>1||
   (line.quantity.match(/\d+(?:\.\d+)?\s+[A-Za-z]+/g)?.length??0)>1||
   (line.unit!==p?.baseUnit&&!!p);
 if(!p&&hasCompound){
  const units=sourceUnitLabels.length>1?sourceUnitLabels:line.quantity.match(/[A-Za-z]+/g)?.filter((unit,index,list)=>list.indexOf(unit)===index)??[line.unit];
  if(!units.includes(line.unit))units.push(line.unit);
  return <div className="space-y-1" role="alert">
    {units.map(unit=><div key={unit} className="flex h-8 items-center gap-1">
      <Input disabled value="" aria-label={unit+' return quantity'} className="h-8 w-16 text-right"/>
      <span className="text-[10px] text-ink-400">{unit}</span>
    </div>)}
    <p className="text-[10px] text-danger">{text('Original unit conversion missing; return cannot be posted.','আগের এককের হিসাব নেই; ফেরত জমা হবে না।')}</p>
  </div>;
 }
 if(p&&ordered.length>1){
  const product:Pick<Product,'unit'|'altUnit'|'unitRelations'>={
   unit:p.baseUnit,
   altUnit:ordered.length===2?{unit:ordered[0],factor:p.factors[ordered[0]]}:undefined,
   unitRelations:ordered.length>2?ordered.slice(0,-1).map((unit,i)=>({
    leftUnit:unit,rightUnit:ordered[i+1],quantity:p.factors[unit]/p.factors[ordered[i+1]]
   })):undefined
  };
  if(ordered.length>2)return <MultiUnitQuantityInput product={product} quantities={unitValues??{}} onChange={onUnitsChange}/>;
  return <CompoundQuantityInput product={product} unit={ordered[0]}
    primary={unitValues?.[ordered[0]]??''} secondary={unitValues?.[p.baseUnit]??''}
    onPrimaryChange={next=>onUnitsChange({...unitValues,[ordered[0]]:next})}
    onSecondaryChange={next=>onUnitsChange({...unitValues,[p.baseUnit]:next})}
    primaryLabel={ordered[0]+' return quantity'}
    secondaryLabel={p.baseUnit+' return quantity'}/>;
 }
 return <Input value={value} onChange={event=>onChange(event.target.value)}
  inputMode="decimal" aria-label={text('Return qty','ফেরতের পরিমাণ')+' · '+line.name}
  className="h-8 text-right" placeholder="0"/>;
}
