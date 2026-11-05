import React from 'react';
import { Eye, Pencil, Printer, RotateCcw, Trash2, ExternalLink, CornerUpLeft } from 'lucide-react';
import { FloatingPanel } from '../layout/FloatingPanel';
import { ActionMenuList, ActionMenuItem, ActionMenuDivider, ActionMenuTrigger } from '../layout/ActionMenu';
import type { PartyAction, PartyLedgerRow } from '../../types/partyLedger';
import {useUiCopy} from '../../i18n/useUiCopy';
import {partyLedgerActionLabel} from '../../i18n/partyLedgerCopy';

type Availability={action:PartyAction;enabled:boolean;reason?:string};
type Props={row:PartyLedgerRow;actions:Availability[];onAction:(action:PartyAction,row:PartyLedgerRow)=>void};
const icons:Record<PartyAction,React.ComponentType<{className?:string}>>={
  view:Eye,edit:Pencil,delete:Trash2,reverse:RotateCcw,print:Printer,return:CornerUpLeft,source:ExternalLink
};
export function PartyLedgerRowActions({row,actions,onAction}:Props){
  const {text,language}=useUiCopy();
  return <FloatingPanel label={text('Transaction actions for','লেনদেনের কাজ')+' '+(row.reference??row.id)} width={220}
    trigger={({toggle,open})=><ActionMenuTrigger
      label={text('Actions for','কাজ')+' '+(row.reference??row.id)}
      expanded={open} onClick={toggle} />}
    >{close=><ActionMenuList aria-label={text('Transaction row actions','লেনদেনের সারির কাজ')}>
      {actions.map(({action,enabled,reason},index)=>{
        const Icon=icons[action];
        const destructive=(action==='delete'||action==='reverse');
        const firstDestructive=destructive&&!actions.slice(0,index).some(item=>item.action==='delete'||item.action==='reverse');
        return <React.Fragment key={action}>
          {firstDestructive && <ActionMenuDivider/>}
          <ActionMenuItem icon={Icon} tone={destructive?'destructive':'neutral'} disabled={!enabled}
            title={reason??partyLedgerActionLabel(language,action)}
            onClick={()=>{close();onAction(action,row);}}>
            {partyLedgerActionLabel(language,action)}{!enabled&&<span className="sr-only">{reason}</span>}
          </ActionMenuItem>
        </React.Fragment>;
      })}
    </ActionMenuList>}</FloatingPanel>;
}
