/** Magic Patterns DataSettings UI — pinned source artifact 238f01b4, Phase 1 preview.
 * All backup/restore/reset interactions remain LOCAL. No tenant data is read, saved,
 * replaced, downloaded or sent anywhere by these source-demo controls.
 */
import React, { useId, useRef, useState } from 'react';
import { Download, Lock, Upload } from 'lucide-react';
import { MotionTabIndicator, MotionTabList } from '../../motion/MotionTabList';
import { Button, Modal } from './invoice/Ui';
import { SettingCard } from '../ui';

type BackupPreview = { salesCount: number; expensesCount: number; fileName: string };
const tabs = [
  { id: 'backup', label: 'Backup & restore' },
  { id: 'reset', label: 'Reset demo' },
] as const;

export function DataSettings({ canEdit }: { canEdit: boolean }) {
  const [tab, setTab] = useState<'backup' | 'reset'>('backup');
  const [pendingRestore, setPendingRestore] = useState<BackupPreview | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [reading, setReading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const tabId = useId().replace(/:/g, '');

  const read = async (file: File | null) => {
    setError('');
    setFeedback('');
    if (!file) return;
    if (file.size > 1_500_000) {
      setError('This file is larger than 1.5 MB. Choose a HisabIQ demo backup.');
      return;
    }
    setReading(true);
    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!parsed || typeof parsed !== 'object' ||
          !('sales' in parsed) || !Array.isArray(parsed.sales) ||
          !('expenses' in parsed) || !Array.isArray(parsed.expenses) ||
          !('vendorEntries' in parsed) || !Array.isArray(parsed.vendorEntries) ||
          !('staff' in parsed) || !Array.isArray(parsed.staff) ||
          !('settings' in parsed) || !parsed.settings || typeof parsed.settings !== 'object') {
        throw new Error('This file is not a HisabIQ demo backup.');
      }
      setPendingRestore({
        salesCount: parsed.sales.length,
        expensesCount: parsed.expenses.length,
        fileName: file.name,
      });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'This file could not be read.');
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const previewAction = (message: string) => {
    setFeedback(message);
    setError('');
    setPendingRestore(null);
    setConfirmReset(false);
  };

  return (
    <div className="min-w-0 max-w-full" data-settings-magic-data>
      <SettingCard
        title="Data & backup"
        titleBn="ডেটা ও ব্যাকআপ"
        description="UI preview only. Download, restore and reset are not connected to business data."
        bodyClassName=""
      >
        <MotionTabList aria-label="Data sections" data-hisabiq-ledger-tabs=""
          className="flex min-w-0 gap-1 overflow-x-auto border-b border-ink-100 px-3 scrollbar-thin">
          {tabs.map((item, index) => (
            <button key={item.id} type="button" role="tab" aria-selected={tab === item.id}
              id={`${tabId}-${item.id}`} aria-controls={`${tabId}-panel`} tabIndex={tab === item.id ? 0 : -1}
              onClick={() => setTab(item.id)}
              onKeyDown={event => {
                if (!['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return;
                event.preventDefault();
                const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 :
                  (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
                setTab(tabs[next].id);
                (event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next])?.focus();
              }}
              className={'relative flex h-11 shrink-0 items-center gap-1.5 px-2.5 text-[13px] font-medium transition-colors duration-150 focus-visible:rounded-t-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-teal-500/30 ' +
                (tab === item.id ? 'text-ink' : 'text-ink-500 hover:text-ink')}>
              {item.label}
              <MotionTabIndicator active={tab === item.id} />
            </button>
          ))}
        </MotionTabList>
        <div role="tabpanel" id={`${tabId}-panel`} aria-labelledby={`${tabId}-${tab}`}>
          {!canEdit ? (
            <p className="m-4 flex items-center gap-2 rounded-lg bg-ink-50 px-3 py-2 text-xs text-ink-600">
              <Lock className="size-3.5" aria-hidden="true" />
              Only the owner can back up, restore or reset data.
            </p>
          ) : tab === 'backup' ? (
            <div className="divide-y divide-ink-100">
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[13px] font-medium text-ink">Download a backup</p>
                  <p className="text-xs text-ink-500">Sales, expenses, vendors, team and settings as one JSON file.</p>
                </div>
                <Button onClick={() => previewAction('UI preview only. No backup file was created or downloaded.')}>
                  <Download className="size-4" /> Download
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-[13px] font-medium text-ink">Restore from a backup</p>
                  <p className="text-xs text-ink-500">Replaces all demo data in this browser. You’ll confirm first.</p>
                  {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
                </div>
                <input ref={fileRef} type="file" accept="application/json,.json"
                  className="sr-only" aria-label="Choose backup file"
                  onChange={event => { void read(event.target.files?.[0] ?? null); }} />
                <Button disabled={reading} onClick={() => fileRef.current?.click()}>
                  <Upload className="size-4" />
                  {reading ? 'Reading…' : 'Choose file'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-[13px] font-medium text-ink">Reset all demo data</p>
                <p className="text-xs text-ink-500">Returns sales, expenses, vendors, team and settings to the starter records.</p>
              </div>
              <Button kind="danger" onClick={() => setConfirmReset(true)}>Reset demo</Button>
            </div>
          )}
        </div>
      </SettingCard>

      {feedback && <p role="status" className="mt-3 text-xs text-teal-700">{feedback}</p>}
      <p className="mt-3 text-[11px] text-ink-500">Source interface preview. File reading stays on this device; no backup or restore reaches the tenant settings provider.</p>

      {pendingRestore && (
        <Modal title="Replace demo data with this backup?" onClose={() => setPendingRestore(null)}
          footer={
            <>
              <Button onClick={() => setPendingRestore(null)}>Cancel</Button>
              <Button kind="danger" onClick={() => previewAction('UI preview only. No demo or business data was restored.')}>
                Replace data
              </Button>
            </>
          }>
          <p className="text-[13px] text-ink-700">
            The backup has {pendingRestore.salesCount} sales and {pendingRestore.expensesCount} expenses. Current demo data will be replaced.
          </p>
          <p className="mt-2 text-xs text-warning">Preview only: this confirmation cannot replace any real or demo records.</p>
        </Modal>
      )}

      {confirmReset && (
        <Modal title="Reset all demo data?" onClose={() => setConfirmReset(false)}
          footer={
            <>
              <Button onClick={() => setConfirmReset(false)}>Cancel</Button>
              <Button kind="danger" onClick={() => previewAction('UI preview only. No demo or business data was reset.')}>Reset</Button>
            </>
          }>
          <p className="text-[13px] text-ink-700">This can’t be undone unless you downloaded a backup. Nothing outside this browser changes.</p>
          <p className="mt-2 text-xs text-warning">Preview only: no records will actually be reset.</p>
        </Modal>
      )}
    </div>
  );
}
