import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../Dialog';
import { Button } from '../Button';
import { Input } from '../Input';
import { partyRoles } from '../../data/parties';
import type { Party, PartyRole } from '../../types/erp';
import type { PartyDraft } from '../../types/partyLedger';

type Props = {
  open: boolean;
  party?: Party | null;
  onClose: () => void;
  onSave: (party: PartyDraft) => void;
};

const fresh = (party?: Party | null):PartyDraft => ({
  id:party?.id, name:party?.name??'',nameBn:party?.nameBn??'',
  phone:party?.phone??'',area:party?.area??'',roles:[...(party?.roles??['Customer'])],
  avatarColor:party?.avatarColor??'#0D7C74',
  image:party?.image
});

export function PartyEditorDialog({open,party,onClose,onSave}:Props) {
  const [draft,setDraft]=useState<PartyDraft>(()=>fresh(party));
  const [error,setError]=useState('');
  useEffect(()=>{if(open){setDraft(fresh(party));setError('');}},[open,party]);
  const update=(patch:Partial<PartyDraft>)=>setDraft(current=>({...current,...patch}));
  const toggleRole=(role:PartyRole,checked:boolean)=>update({
    roles:checked
      ? partyRoles.filter(item=>item===role || draft.roles.includes(item))
      : draft.roles.filter(item=>item!==role)
  });
  const submit=(event:React.FormEvent)=>{
    event.preventDefault();
    try {onSave(draft);setError('');onClose();}
    catch(err){setError(err instanceof Error?err.message:'Cannot save party.');}
  };
  return <Dialog open={open} onOpenChange={value=>!value&&onClose()}>
    <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader>
        <DialogTitle>{party?'Edit party':'Add party'} <span className="font-bn text-sm font-normal text-ink-500">পার্টি তথ্য</span></DialogTitle>
        <DialogDescription>One person can be a customer, supplier or hold multiple roles. This is a preview; no backend record is written.</DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4" aria-label="Party profile form">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-medium text-ink-700">Party name *
            <Input aria-label="Party name" value={draft.name} required onChange={event=>update({name:event.target.value})}/>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-700">Bangla name
            <Input aria-label="Bangla name" value={draft.nameBn??''} onChange={event=>update({nameBn:event.target.value})}/>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-700">Phone
            <Input aria-label="Phone" type="tel" value={draft.phone} onChange={event=>update({phone:event.target.value})}/>
          </label>
          <label className="space-y-1 text-xs font-medium text-ink-700">Area / address
            <Input aria-label="Area" value={draft.area} onChange={event=>update({area:event.target.value})}/>
          </label>
        </div>
        <fieldset className="rounded-lg border border-border p-3">
          <legend className="px-1 text-xs font-semibold text-ink">Relationships <span className="font-bn font-normal text-ink-500">সম্পর্ক নির্বাচন</span></legend>
          <div className="mt-1 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {partyRoles.map(role=><label key={role} className="flex items-center gap-2 rounded-md border border-border px-2 py-2 text-xs hover:bg-ink-50">
              <input type="checkbox" checked={draft.roles.includes(role)} onChange={event=>toggleRole(role,event.target.checked)} className="size-4 accent-teal-600"/>
              {role}
            </label>)}
          </div>
        </fieldset>
        {!!error&&<p role="alert" className="rounded-md bg-danger-bg px-3 py-2 text-xs text-danger">{error}</p>}
        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit">Save party</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>;
}
