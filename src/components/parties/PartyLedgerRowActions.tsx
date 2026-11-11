import {useTenantSettings} from '../../settings/TenantSettingsProvider';
import {canManage} from '../../settings/model';
import React, {useId} from 'react';
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
  const reasonId=useId();
  const {state,actorId}=useTenantSettings();
  const permitted=canManage(state,actorId,['purchase','purchase-return','supplier-payment','supplier-credit-refund'].includes(row.source)?'purchases':['sale','sale-return','customer-payment','customer-credit-refund','customer-credit-apply'].includes(row.source)?'sales':'money');
  const shown = actions.some(a=>a.action==='delete') ? actions : [...actions,{action:'delete' as const,enabled:!!actions.find(a=>a.action==='reverse'&&a.enabled),reason:actions.find(a=>a.action==='reverse')?.reason??'No verified original source delete command is connected.'}];
  return <FloatingPanel label={text('Transaction actions for','লেনদেনের কাজ')+' '+(row.reference??row.id)} width={220}
    trigger={({toggle,open})=><ActionMenuTrigger
      label={text('Actions for','কাজ')+' '+(row.reference??row.id)}
      expanded={open} onClick={toggle} />}
    >{close=><ActionMenuList aria-label={text('Transaction row actions','লেনদেনের সারির কাজ')}>
      {shown.map(a=>['delete','reverse'].includes(a.action)&&!permitted?{...a,enabled:false,reason:'Current actor lacks permission for this module.'}:a).filter(a=>a.action!=='delete').concat(shown.filter(a=>a.action==='delete').map(a=>!permitted?{...a,enabled:false,reason:'Current actor lacks permission for this module.'}:a)).map(({action,enabled,reason},index)=>{
        const Icon=icons[action];
        const destructive=(action==='delete'||action==='reverse');
        const firstDestructive=destructive&&!actions.slice(0,index).some(item=>item.action==='delete'||item.action==='reverse');
        return <React.Fragment key={action}>
          {firstDestructive && <ActionMenuDivider/>}
          <ActionMenuItem icon={Icon} tone={destructive?'destructive':'neutral'} disabled={!enabled}
            title={reason??partyLedgerActionLabel(language,action)} aria-describedby={!enabled?reasonId+action:undefined}
            onClick={()=>{close();onAction(action,row);}}>
            {partyLedgerActionLabel(language,action)}
          </ActionMenuItem>{!enabled&&<p id={reasonId+action} className="px-3 pb-2 text-[11px] font-normal text-ink-600">{text(reason??'No source command is connected.','এই মূল লেনদেনের নিরাপদ নির্দেশ সংযুক্ত নয় অথবা অনুমতি নেই।')}</p>}
        </React.Fragment>;
      })}
    </ActionMenuList>}</FloatingPanel>;
}
