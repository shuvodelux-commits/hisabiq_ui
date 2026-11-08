import { SettingsToggle } from '../SettingsToggle';
import { useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, CloudOff, Monitor, RefreshCw, Smartphone, Tablet, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Modal } from '../invoice/Ui';
import { Select, Tag } from './SessionsUi';
import { Input } from '../../../components/Input';
import { SettingCard } from '../../ui';
import { StatTile } from './StatTile';
import { PinConfirmDialog } from './PinConfirmDialog';
import { ago, dhakaTime } from './sessionPreview';
import { useOfflinePreview } from './offlinePreview';
import { lakhGroup } from './activityPreview';

/** Original Magic Patterns Offline selling screen, pinned artifact 238f01b4.
 * Phase 1 preview: no real offline POS authorization, sync, sales or stock writes.
 */
const previewToast = Object.assign(
 (message: string, options?: { description?: string }) => toast(message, {
   description: 'Demo only — no real device, sale or sync changed. ' + (options?.description ?? ''),
 }),
 {
  success: (message: string, options?: { description?: string }) => toast.success(message, {
   description: 'Demo only — no real device, sale or sync changed. ' + (options?.description ?? ''),
  }),
  error: (message: string, options?: { description?: string }) => toast.error(message, {
   description: 'Demo only — no real device, sale or sync changed. ' + (options?.description ?? ''),
  }),
 }
);
const kindIcon = { desktop: Monitor, phone: Smartphone, tablet: Tablet };
const numInput = 'ref-control mt-1.5 block h-9 w-full rounded-md border border-input bg-card px-3 text-[13px] font-normal text-ink outline-none focus-visible:border-teal-600 focus-visible:ring-2 focus-visible:ring-teal-500/20';

/** Owner tool: exactly one approved device may keep selling when the internet drops. */
export function OfflinePage({ canManage }: { canManage: boolean }) {
  const sec = useOfflinePreview();
  const reduced = useReducedMotion();
  const o = sec.offline;
  const device = sec.sessions.find((s) => s.id === o.deviceId);
  const others = sec.sessions.filter((s) => s.id !== o.deviceId);
  const [switchTo, setSwitchTo] = useState<string | null>(null);
  const [turnOff, setTurnOff] = useState(false);
  const [progress, setProgress] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current !== null) window.clearInterval(timer.current); }, []);

  const handover = o.handoverTo ? sec.sessions.find((s) => s.id === o.handoverTo) : undefined;
  const approve = (id: string) => {
    const result = sec.setOfflineDevice(id);
    setSwitchTo(null);
    if (result === 'waiting') {
      previewToast('Switch is waiting for a sync', { description: `${o.pending} sale${o.pending === 1 ? '' : 's'} on the current device must upload first, so nothing is lost.` });
      return;
    }
    setProgress(5);
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => setProgress((p) => {
      if (p >= 100) { if (timer.current !== null) window.clearInterval(timer.current); timer.current = null; return 0; }
      return Math.min(100, p + 19);
    }), 300);
    previewToast.success('Offline selling turned on', { description: 'Products, prices, customers and 200 invoice numbers are being saved to the device.' });
  };
  const sync = () => {
    const n = sec.syncNow();
    previewToast.success(n ? `${n} offline sale${n === 1 ? '' : 's'} synced` : 'Everything is up to date');
  };
  const testSale = () => {
    if (o.numbersLeft <= 0) return previewToast.error('No reserved invoice numbers left. Sync to get more.');
    const used = 200 - o.numbersLeft + 1;
    sec.updateOffline({ pending: o.pending + 1, numbersLeft: o.numbersLeft - 1 });
    previewToast(`Offline sale saved as INV-OFF-${String(o.blockStart + used - 1).padStart(4, '0')}`);
  };

  if (!canManage) {
    return (
      <SettingCard title="Offline selling" titleBn="অফলাইন বিক্রি">
        <p className="text-[13px] text-ink-600">{device ? `${device.device} is the only device that can sell without internet.` : 'Offline selling is off.'} Only the owner can change this.</p>
      </SettingCard>
    );
  }

  const DeviceIcon = device ? kindIcon[device.kind] : CloudOff;

  return (
    <div className="min-w-0 max-w-full space-y-4 overflow-x-hidden" data-settings-magic-offline>
      <p role="note" className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800">UI preview · Offline devices, sales, stock differences, invoice numbers, sync and permissions are synthetic. This page cannot authorize a real device or save a sale. All changes reset on reload.</p>
      <section className="min-w-0 max-w-full rounded-xl border border-ink-100 bg-card p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-4">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-lg ${device ? 'bg-teal-50 text-teal-700' : 'bg-ink-50 text-ink-500'}`}><DeviceIcon className="size-5" aria-hidden="true" /></span>
          <div className="min-w-0 flex-1">
            {device ? (
              <>
                <p className="text-[15px] font-semibold text-ink">{device.device} <span className="text-[13px] font-normal text-ink-500">· {device.browser}</span></p>
                <p className="text-xs text-ink-500">The offline device · turned on by {o.enabledBy} on {dhakaTime(o.enabledAt)} · last synced {ago(o.lastSync).toLowerCase()}</p>
              </>
            ) : (
              <>
                <p className="text-[15px] font-semibold text-ink">Offline selling is off</p>
                <p className="text-xs text-ink-500">When the internet drops, every device pauses selling. Pick one device below to keep selling offline.</p>
              </>
            )}
            {progress > 0 && (
              <div className="mt-2 max-w-sm">
                <div className="h-1.5 overflow-hidden rounded-full bg-ink-100"><motion.div className="h-full bg-teal-600" animate={{ width: `${progress}%` }} transition={{ duration: reduced ? 0 : 0.25 }} /></div>
                <p className="mt-1 text-[11px] text-ink-500">Saving shop data to the device… {progress}% · about {Math.max(1, Math.round((100 - progress) / 20))} sec left</p>
              </div>
            )}
          </div>
          {device && (
            <>
              {o.simulateOffline ? <Tag color="warning">Offline · selling</Tag> : <Tag color="success">● Ready offline</Tag>}
              <div className="flex flex-wrap gap-2">
                <Button onClick={sync}><RefreshCw className="size-4" />Sync now</Button>
                <Button kind="ghost" onClick={() => setTurnOff(true)}>Turn off</Button>
              </div>
            </>
          )}
        </div>
      </section>

      {handover && device && (
        <div role="status" className="flex flex-wrap items-center gap-3 rounded-xl border border-warning/30 bg-warning-bg px-4 py-3 text-[13px] text-ink-700">
          <RefreshCw className="size-4 shrink-0 text-warning" aria-hidden="true" />
          <p className="min-w-0 flex-1">
            <b className="font-medium text-ink">Waiting to switch to {handover.device}.</b> {device.device} still has {o.pending} unsynced sale{o.pending === 1 ? '' : 's'}. The switch finishes automatically after it syncs — or sign it out from Logged-in devices.
          </p>
          <div className="flex gap-2">
            <Button onClick={sync}>Sync now</Button>
            <Button kind="ghost" onClick={() => { sec.cancelHandover(); previewToast('Switch cancelled'); }}>Cancel switch</Button>
          </div>
        </div>
      )}

      {device && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatTile label="Waiting to sync" value={o.pending} tone={o.pending ? 'warning' : 'neutral'} hint={o.pending ? 'Syncs when internet is back' : 'All sales uploaded'} />
          <StatTile label="Products saved" value={lakhGroup(o.productsSaved, 0)} hint="With prices and stock" />
          <StatTile label="Invoice numbers left" value={o.numbersLeft} tone={o.numbersLeft <= o.warnAt ? 'danger' : 'neutral'} hint={`INV-OFF-${String(o.blockStart).padStart(4, '0')} to ${String(o.blockStart + 199).padStart(4, '0')}`} />
          <StatTile label="Problems" value={o.problems.length} tone={o.problems.length ? 'danger' : 'success'} />
        </div>
      )}

      {o.problems.length > 0 && (
        <SettingCard title="Needs your decision" titleBn="সিদ্ধান্ত দরকার">
          <ul className="space-y-2">
            {o.problems.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-danger/20 bg-danger-bg/50 p-3">
                <AlertTriangle className="size-4 shrink-0 text-danger" aria-hidden="true" />
                <p className="min-w-0 flex-1 text-[13px] text-ink-700">{p.text}</p>
                <Button onClick={() => { sec.resolveProblem(p.id); previewToast.success('Stock difference accepted'); }}>{p.fix}</Button>
                <Button kind="ghost" onClick={() => previewToast('Sample product only', { description: 'The linked stock record is not a real product; no navigation was performed.' })}>Open product</Button>
              </li>
            ))}
          </ul>
        </SettingCard>
      )}

      <SettingCard title={device ? 'Switch to another device' : 'Choose the offline device'} titleBn="ডিভাইস বাছাই" description="Only one device can sell offline. This stops two counters from selling the last items of stock or using the same invoice number.">
        <ul className="divide-y divide-ink-100">
          {others.map((s) => {
            const Icon = kindIcon[s.kind];
            return (
              <li key={s.id} className="flex flex-wrap items-center gap-3 py-2.5">
                <Icon className="size-4 text-ink-400" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-ink">{s.device} <span className="text-ink-500">· {sec.person(s.personId)?.name}</span></p>
                  <p className="text-xs text-ink-500">{s.browser} · {s.trusted ? 'Trusted' : 'Not trusted yet'}</p>
                </div>
                <Button disabled={!s.trusted} title={s.trusted ? undefined : 'Only trusted devices can sell offline'} onClick={() => setSwitchTo(s.id)}>Make this the offline device</Button>
              </li>
            );
          })}
          {others.length === 0 && <li className="py-3 text-[13px] text-ink-500">No other signed-in devices.</li>}
        </ul>
      </SettingCard>

      <SettingCard title="Rules while offline" titleBn="অফলাইনের নিয়ম" description="Deleting sales, editing products or prices, and changing settings are always off while offline.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-[12px] font-medium text-ink-700">
            Must sync at least every
            <span className="mt-1.5 block font-normal">
              <Select label="Sync deadline" value={String(o.maxHours)} onChange={(v) => sec.updateOffline({ maxHours: Number(v) as 4 | 12 | 24 | 72 })} options={[{ value: '4', label: '4 hours' }, { value: '12', label: '12 hours' }, { value: '24', label: '24 hours' }, { value: '72', label: '3 days' }]} />
            </span>
            <span className="ref-helper mt-1 block font-normal">After this, the device stops selling until it gets internet.</span>
          </div>
          <label className="block text-[12px] font-medium text-ink-700">
            Warn when invoice numbers left drop to
            <Input type="number" min={5} max={100} value={o.warnAt} onChange={(e) => sec.updateOffline({ warnAt: Math.max(5, Math.min(100, Number(e.target.value) || 5)) })} className={numInput} />
          </label>
          <div className="flex min-w-0 items-start justify-between gap-3 text-[13px] text-ink-700">
            <div className="min-w-0 pt-1">
              <label htmlFor="settings-offline-credit" className="cursor-pointer font-medium">Allow selling on credit (baki) offline</label>
              <span className="ref-helper block">Cash, and bKash/Nagad marked as paid, are always allowed.</span>
            </div>
            <SettingsToggle id="settings-offline-credit" aria-label="Allow selling on credit (baki) offline" checked={o.allowCredit} onCheckedChange={value => sec.updateOffline({ allowCredit: value })} />
          </div>
          {o.allowCredit && (
            <label className="block text-[12px] font-medium text-ink-700">
              Credit limit per sale (৳)
              <Input type="number" min={0} value={o.creditLimit} onChange={(e) => sec.updateOffline({ creditLimit: Math.max(0, Number(e.target.value) || 0) })} className={numInput} />
            </label>
          )}
        </div>
      </SettingCard>

      {device && (
        <SettingCard title="Try it in the preview" description="Pretend the internet is down. The top bar and POS show what cashiers would see. Nothing leaves this browser.">
          <div className="flex flex-wrap items-center gap-2">
            <Button kind={o.simulateOffline ? 'primary' : 'outline'} onClick={() => sec.updateOffline({ simulateOffline: !o.simulateOffline })}><WifiOff className="size-4" />{o.simulateOffline ? 'Back online' : 'Go offline'}</Button>
            <Button disabled={!o.simulateOffline} onClick={testSale}>Record a test offline sale</Button>
          </div>
        </SettingCard>
      )}

      <SettingCard title="Sync history" titleBn="সিঙ্ক ইতিহাস" bodyClassName="max-w-full overflow-x-auto" >
        <table data-erp-table data-settings-offline-history className="w-full min-w-[560px] text-[13px]">
          <thead>
            <tr className="text-left text-xs text-ink-500"><th className="px-4 py-2 font-medium">Time</th><th className="px-4 py-2 font-medium">Device</th><th className="px-4 py-2 text-right font-medium">Sales</th><th className="px-4 py-2 text-right font-medium">Total</th><th className="px-4 py-2 font-medium">Result</th></tr>
          </thead>
          <tbody>
            {o.history.map((h) => (
              <tr key={h.id} className="border-t border-ink-100">
                <td className="px-4 py-2.5 text-ink-700">{dhakaTime(h.at)}</td>
                <td className="px-4 py-2.5 text-ink">{h.device}</td>
                <td className="px-4 py-2.5 text-right">{h.sales}</td>
                <td className="px-4 py-2.5 text-right">৳ {lakhGroup(h.total, 0)}</td>
                <td className="px-4 py-2.5">{h.result === 'Synced' ? <span className="inline-flex items-center gap-1 text-success"><CheckCircle2 className="size-3.5" />Synced</span> : <Tag color={h.result === 'Failed' ? 'danger' : 'warning'}>{h.result}</Tag>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </SettingCard>

      {switchTo && (
        <PinConfirmDialog
          title="Change the offline device?"
          message={<>{device && <><b>{device.device}</b> stops selling offline after its next sync. </>}<b>{sec.sessions.find((s) => s.id === switchTo)?.device}</b> will download the shop data and 200 reserved invoice numbers.</>}
          confirmLabel="Make offline device"
          onClose={() => setSwitchTo(null)}
          onConfirm={() => approve(switchTo)}
        />
      )}
      {turnOff && (
        <Modal
          title="Turn off offline selling?"
          onClose={() => setTurnOff(false)}
          footer={
            o.pending ? (
              <><Button onClick={() => setTurnOff(false)}>Close</Button><Button kind="primary" onClick={sync}><RefreshCw className="size-4" />Sync now</Button></>
            ) : (
              <><Button onClick={() => setTurnOff(false)}>Cancel</Button><Button kind="danger" onClick={() => { sec.disableOffline(); setTurnOff(false); previewToast.success('Offline selling turned off'); }}>Turn off</Button></>
            )
          }
        >
          <p className="text-[13px] text-ink-700">{o.pending ? `Sync ${o.pending} sale${o.pending === 1 ? '' : 's'} first. Turning off now would lose them.` : 'When the internet drops, every device will pause selling until it’s back.'}</p>
        </Modal>
      )}
    </div>
  );
}
