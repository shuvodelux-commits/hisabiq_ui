import React, { useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { Button, Modal } from '../invoice/Ui';

type Props = { title: string; message: React.ReactNode; confirmLabel: string; danger?: boolean; onConfirm: () => void; onClose: () => void };

/** Owner PIN check for high-impact actions. The prototype accepts any 6 digits and never stores them. */
export function PinConfirmDialog({ title, message, confirmLabel, danger, onConfirm, onClose }: Props) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const submit = () => {
    if (!/^\d{6}$/.test(pin)) return setError('Enter your 6-digit PIN.');
    onConfirm();
  };
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button kind={danger ? 'danger' : 'primary'} onClick={submit}>{confirmLabel}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="text-[13px] text-ink-700">{message}</div>
        <label className="block text-[12px] font-medium text-ink-700">
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-teal-700" aria-hidden="true" />Owner PIN</span>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={pin}
            onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            aria-invalid={!!error}
            className="ref-control mt-1.5 block h-9 w-40 rounded-md border border-input bg-card px-3 text-center text-[15px] tracking-[0.4em] text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20"
            placeholder="••••••"
          />
          {error ? <span className="mt-1 block text-xs font-normal text-danger">{error}</span> : <span className="ref-helper mt-1 block font-normal">UI-only demo. Do not enter your real PIN; no identity is verified.</span>}
        </label>
      </div>
    </Modal>
  );
}
