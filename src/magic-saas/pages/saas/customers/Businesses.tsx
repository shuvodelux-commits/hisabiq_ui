import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Download, Eye, Gauge, History, LifeBuoy, Plus, Settings } from 'lucide-react';
import { RowActions } from '../../../components/saas/RowActions';
import { Button, Select, Tabs, downloadCsv } from '../../../prototype/Ui';
import { useSaas, effectivePlan } from '../../../contexts/SaasContext';
import { useFirstLoad } from '../../../hooks/saas/useFirstLoad';
import { Badge, Card, Denied, EmptyRow, PageTitle, SearchBox, accountTone, tenantTone, th, td, thAction, tdAction } from '../../../components/saas/SaasBits';
import { CreateBusinessDialog } from '../../../components/saas/tenant/CreateBusinessDialog';
import { businessHealth, healthTone, planFit, setupProgress } from '../../../utils/saasSignals';
import { expiryText, fmtDateTime } from '../../../utils/saas';
import { businessTypes } from '../../../data/saasOpsSeeds';
import { planCatalog } from '../../../data/experienceCatalog';

type View = 'all' | 'risk' | 'setup' | 'limit' | 'lapsed' | 'invites';

export function Businesses() {
  const saas = useSaas();
  const navigate = useNavigate();
  const loading = useFirstLoad();
  const [q, setQ] = useState('');
  const [view, setView] = useState<View>('all');
  const [plan, setPlan] = useState('All plans');
  const [type, setType] = useState('All types');
  const [creating, setCreating] = useState(false);
  const { tenants, tickets } = saas.state;

  const rows = useMemo(
    () =>
      tenants
        .filter((t) => saas.inScope(t.id))
        .map((t) => {
          const p = effectivePlan(t);
          return { t, plan: p, health: businessHealth(t, tickets.filter((x) => x.tenantId === t.id && x.status !== 'Resolved').length), setup: setupProgress(t), fit: planFit(t, p) };
        }),
    [tenants, tickets, saas],
  );

  const views: { id: View; label: string; test: (r: (typeof rows)[number]) => boolean }[] = [
    { id: 'all', label: 'All', test: () => true },
    { id: 'risk', label: 'At risk', test: (r) => r.health.level === 'At risk' },
    { id: 'setup', label: 'Stuck in setup', test: (r) => r.setup.stuck },
    { id: 'limit', label: 'Near product limit', test: (r) => (r.fit.meters.find((m) => m.key === 'products')?.pct ?? 0) >= 80 },
    { id: 'lapsed', label: 'Grace & expired', test: (r) => r.t.status === 'Grace' || r.t.status === 'Expired' },
    { id: 'invites', label: 'Invite pending', test: (r) => r.t.invite === 'Pending' },
  ];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    const v = views.find((x) => x.id === view)!;
    return rows
      .filter(v.test)
      .filter((r) => !s || `${r.t.name} ${r.t.owner} ${r.t.phone} ${r.t.id} ${r.t.district}`.toLowerCase().includes(s))
      .filter((r) => plan === 'All plans' || planCatalog.find((p) => p.code === r.plan)?.label === plan)
      .filter((r) => type === 'All types' || r.t.businessType === type)
      .sort((a, b) => a.health.score - b.health.score);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, view, plan, type]);

  if (!saas.can('tenants.view')) return <Denied what="businesses" role={saas.staff.label} />;

  return (
    <div className="space-y-4">
      <PageTitle
        title="Businesses"
        bn="ব্যবসা প্রতিষ্ঠান"
        description="Every shop on HisabIQ, worst health first. Open one to act."
        actions={
          <>
            <Button onClick={() => downloadCsv('hisabiq-businesses.csv', [['ID', 'Business', 'Type', 'Owner', 'Phone', 'Plan', 'Subscription', 'Account', 'Health', 'Setup %', 'Products'], ...filtered.map((r) => [r.t.id, r.t.name, r.t.businessType, r.t.owner, r.t.phone, r.plan, r.t.status, r.t.account, r.health.level, r.setup.pct, r.t.erp.productCount])])}><Download className="size-4" />CSV</Button>
            {saas.canFor('tenants.edit', null) && <Button kind="primary" onClick={() => setCreating(true)}><Plus className="size-4" />Add business</Button>}
          </>
        }
      />

      <Card>
        <Tabs label="Saved views" value={view} onChange={(v) => setView(v as View)} items={views.map((v) => ({ id: v.id, label: v.label, count: rows.filter(v.test).length }))} />
        <div className="flex flex-wrap items-center gap-2 border-b border-ink-100 p-3">
          <SearchBox value={q} onChange={setQ} placeholder="Search name, owner, phone or ID" />
          <div className="w-full sm:w-[150px]"><Select label="Filter by plan" value={plan} onChange={setPlan} options={['All plans', ...planCatalog.map((p) => p.label)]} /></div>
          <div className="w-full sm:w-[160px]"><Select label="Filter by business type" value={type} onChange={setType} options={['All types', ...businessTypes.map((b) => b.type)]} /></div>
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table data-erp-table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-ink-100">
                <th className={th}>Business</th>
                <th className={th}>Plan · subscription</th>
                <th className={th}>Health</th>
                <th className={`${th} hidden text-right lg:table-cell`}>Setup</th>
                <th className={`${th} hidden text-right lg:table-cell`}>Products</th>
                <th className={th}>Expires</th>
                <th className={`${th} hidden xl:table-cell`}>Last active</th>
                <th className={thAction}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [0, 1, 2, 3].map((i) => <tr key={i} className="border-b border-ink-100"><td colSpan={8} className="px-4 py-3"><div className="h-4 animate-pulse rounded bg-ink-50" /></td></tr>)
              ) : filtered.length === 0 ? (
                <EmptyRow cols={8} text={rows.length ? 'No business matches this view and filters.' : 'No businesses in your scope yet.'} />
              ) : (
                filtered.map(({ t, plan: p, health, setup, fit }) => {
                  const exp = expiryText(t.expiresAt);
                  const prod = fit.meters.find((m) => m.key === 'products')!;
                  return (
                    <tr key={t.id} onClick={() => navigate(`/saas/tenants/${t.id}`)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                      <td className={td}>
                        <Link to={`/saas/tenants/${t.id}`} onClick={(e) => e.stopPropagation()} className="font-medium text-ink hover:text-teal-700 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600">{t.name}</Link>
                        <p className="text-[11px] text-ink-500">{t.businessType} · {t.owner} · {t.district}</p>
                      </td>
                      <td className={td}>
                        <span className="mr-1.5 font-medium">{planCatalog.find((x) => x.code === p)?.label}</span>
                        <Badge tone={tenantTone[t.status]} dot>{t.status}</Badge>
                        {t.account !== 'Active' && <span className="ml-1"><Badge tone={accountTone[t.account]}>{t.account}</Badge></span>}
                        {t.invite === 'Pending' && <span className="block text-[11px] text-warning">Invite not accepted</span>}
                      </td>
                      <td className={td}>
                        <Badge tone={healthTone[health.level]} dot>{health.level}</Badge>
                        <span className="block max-w-[220px] truncate text-[11px] text-ink-500" title={health.signals[0]?.text}>{health.signals[0]?.text}</span>
                      </td>
                      <td className={`${td} hidden text-right tabular-nums lg:table-cell ${setup.stuck ? 'text-warning' : ''}`}>{setup.pct}%</td>
                      <td className={`${td} hidden text-right tabular-nums lg:table-cell`}>
                        {t.erp.productCount.toLocaleString('en-IN')}
                        <span className={`block text-[11px] ${prod.pct >= 80 ? 'text-warning' : 'text-ink-500'}`}>{prod.pct}% of {prod.limit.toLocaleString('en-IN')}</span>
                      </td>
                      <td className={`${td} whitespace-nowrap ${exp.tone === 'danger' ? 'text-danger' : exp.tone === 'warning' ? 'text-warning' : 'text-ink-600'}`}>{exp.text}</td>
                      <td className={`${td} hidden whitespace-nowrap text-ink-500 xl:table-cell`}>{fmtDateTime(t.lastActive)}</td>
                      <td className={tdAction} onClick={(e) => e.stopPropagation()}>
                        <RowActions label={`Actions for ${t.name}`} items={[
                          { label: 'Open business', icon: Eye, onSelect: () => navigate(`/saas/tenants/${t.id}`) },
                          { label: 'Plan & usage', icon: Gauge, onSelect: () => navigate(`/saas/tenants/${t.id}?tab=plan`) },
                          { label: 'Support & tickets', icon: LifeBuoy, onSelect: () => navigate(`/saas/tenants/${t.id}?tab=support`) },
                          { label: 'Settings & members', icon: Settings, onSelect: () => navigate(`/saas/tenants/${t.id}?tab=settings`) },
                          { label: 'History', icon: History, onSelect: () => navigate(`/saas/tenants/${t.id}?tab=history`) },
                        ]} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <ul className="divide-y divide-ink-100 md:hidden">
          {loading ? <li className="p-4"><div className="h-10 animate-pulse rounded bg-ink-50" /></li> : filtered.length === 0 ? <li className="p-6 text-center text-[13px] text-ink-500">No business matches.</li> : filtered.map(({ t, health }) => (
            <li key={t.id}>
              <Link to={`/saas/tenants/${t.id}`} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-medium text-ink">{t.name}</p><p className="text-[11px] text-ink-500">{t.planCode} · {t.status}</p></div>
                <Badge tone={healthTone[health.level]} dot>{health.level}</Badge>
                <ChevronRight className="size-4 text-ink-300" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <p className="border-t border-ink-100 px-4 py-2 text-[11px] text-ink-500">{filtered.length} of {rows.length} businesses{rows.length < tenants.length ? ' in your assigned scope' : ''}. Health uses sample ERP activity.</p>
      </Card>
      {creating && <CreateBusinessDialog onClose={() => setCreating(false)} />}
    </div>
  );
}
