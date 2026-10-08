import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from './Button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './Dialog';
import { FormSelect } from './FormSelect';
import { Input } from './Input';

type Props = {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  onCreate: (name: string, phone: string, area: string) => void;
  showContact?: boolean;
  placeholder?: string;
};

/** One predictable + control beside a dropdown. Creation stays in context. */
export function QuickAddSelect({ label, value, options, onChange, onCreate, showContact = false, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [area, setArea] = useState('');
  const [error, setError] = useState('');

  const close = () => {
    setOpen(false);
    setName('');
    setPhone('');
    setArea('');
    setError('');
  };

  const create = () => {
    const trimmed = name.trim();
    if (!trimmed) return setError(label + ' name is required.');
    if (options.some((option) => option.toLocaleLowerCase() === trimmed.toLocaleLowerCase())) {
      return setError('This ' + label.toLocaleLowerCase() + ' already exists. Select it from the list.');
    }
    onCreate(trimmed, phone.trim(), area.trim());
    close();
  };

  return (
    <>
      <div className="flex min-w-0">
        <FormSelect
          aria-label={label}
          className="min-w-0 flex-1 [&>select]:rounded-r-none"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          options={options.length ? options : [placeholder ?? 'Select ' + label.toLowerCase()]}
        />
        <button
          type="button"
          title={'Quick add ' + label.toLowerCase()}
          aria-label={'Quick add ' + label.toLowerCase()}
          className="-ml-px flex size-9 shrink-0 items-center justify-center rounded-r-md border border-input bg-card text-teal-700 hover:bg-teal-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-500"
          onClick={() => setOpen(true)}>
          <Plus className="size-4" />
        </button>
      </div>
      <Dialog open={open} onOpenChange={(next) => { if (!next) close(); else setOpen(true); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Quick add {label.toLowerCase()}</DialogTitle>
            <DialogDescription>
              Create without leaving this transaction. The new {label.toLowerCase()} will be selected automatically.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(event) => { event.preventDefault(); create(); }} className="space-y-3">
            <label className="block text-[13px] font-medium text-ink">
              {label} name <span className="text-danger">*</span>
              <Input autoFocus className="mt-1" value={name} onChange={(event) => { setName(event.target.value); setError(''); }} placeholder={placeholder ?? label + ' name'} />
            </label>
            {showContact && (
              <>
                <label className="block text-[13px] font-medium text-ink">Phone <span className="font-normal text-ink-400">· ফোন</span>
                  <Input className="mt-1" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01XXXXXXXXX" />
                </label>
                <label className="block text-[13px] font-medium text-ink">Address / area <span className="font-normal text-ink-400">· ঠিকানা</span>
                  <Input className="mt-1" value={area} onChange={(event) => setArea(event.target.value)} placeholder="Optional" />
                </label>
              </>
            )}
            {error && <p role="alert" className="text-xs text-danger">{error}</p>}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={close}>Cancel</Button>
              <Button type="submit"><Plus className="size-4" /> Add {label.toLowerCase()}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
