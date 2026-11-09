import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button, Field, Input, Modal, Select, Textarea } from '../../../prototype/Ui';
import { useSaas } from '../../../contexts/SaasContext';
import { Badge, Card, Denied, EmptyRow, PageTitle, SearchBox, th, td } from '../../../components/saas/SaasBits';
import { fmtDate, sid } from '../../../utils/saas';
import type { Article } from '../../../types/saas';

export function KnowledgeBase() {
  const saas = useSaas();
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState<Article | null>(null);
  if (!saas.can('kb.view')) return <Denied what="the knowledge base" role={saas.staff.label} />;
  const canEdit = saas.can('kb.edit');
  const s = q.trim().toLowerCase();
  const rows = saas.state.articles.filter((a) => !s || `${a.title} ${a.titleBn} ${a.category}`.toLowerCase().includes(s));
  return (
    <div className="space-y-4">
      <PageTitle
        title="Knowledge base"
        bn="নলেজ বেস"
        description="Help articles owners see in-app, and internal notes for staff."
        actions={canEdit && <Button kind="primary" onClick={() => setEdit({ id: sid('KB'), title: '', titleBn: '', category: 'Getting started', visibility: 'Public', status: 'Draft', body: '', updatedAt: '', updatedBy: '', views: 0 })}><Plus className="size-4" />New article</Button>}
      />
      <Card>
        <div className="border-b border-ink-100 p-3"><SearchBox value={q} onChange={setQ} placeholder="Search articles (English or Bangla)" /></div>
        <div className="overflow-x-auto">
          <table data-erp-table className="w-full text-[13px]">
            <thead><tr className="border-b border-ink-100"><th className={th}>Article</th><th className={`${th} hidden md:table-cell`}>Category</th><th className={th}>Audience</th><th className={`${th} hidden text-right md:table-cell`}>Views</th><th className={`${th} hidden lg:table-cell`}>Updated</th><th className={th}>Status</th></tr></thead>
            <tbody>
              {rows.length === 0 ? <EmptyRow cols={6} text="No articles match." /> : rows.map((a) => (
                <tr key={a.id} onClick={() => setEdit(a)} className="cursor-pointer border-b border-ink-100 last:border-0 hover:bg-ink-50/60">
                  <td className={td}><span className="font-medium text-ink">{a.title}</span><span className="block font-bn text-[11px] text-ink-500">{a.titleBn}</span></td>
                  <td className={`${td} hidden md:table-cell`}>{a.category}</td>
                  <td className={td}><Badge tone={a.visibility === 'Public' ? 'teal' : 'ink'}>{a.visibility === 'Public' ? 'Owners' : 'Staff only'}</Badge></td>
                  <td className={`${td} hidden text-right tabular-nums md:table-cell`}>{a.views.toLocaleString('en-IN')}</td>
                  <td className={`${td} hidden text-ink-500 lg:table-cell`}>{fmtDate(a.updatedAt)} · {a.updatedBy}</td>
                  <td className={td}><Badge tone={a.status === 'Published' ? 'success' : 'neutral'} dot>{a.status}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      {edit && <ArticleDialog article={edit} canEdit={canEdit} onClose={() => setEdit(null)} />}
    </div>
  );
}

function ArticleDialog({ article, canEdit, onClose }: { article: Article; canEdit: boolean; onClose: () => void }) {
  const saas = useSaas();
  const [a, setA] = useState(article);
  const [error, setError] = useState('');
  const save = (status: Article['status']) => {
    const r = saas.saveArticle({ ...a, status });
    if (!r.ok) return setError(r.message);
    toast.success(r.message);
    onClose();
  };
  return (
    <Modal title={a.title || 'New article'} onClose={onClose} footer={canEdit ? <><Button onClick={onClose}>Cancel</Button><Button onClick={() => save('Draft')}>Save draft</Button><Button kind="primary" onClick={() => save('Published')}>Publish</Button></> : <Button onClick={onClose}>Close</Button>}>
      <div className="space-y-3 text-[13px]">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Title (English)"><Input value={a.title} onChange={(title) => setA({ ...a, title })} disabled={!canEdit} /></Field>
          <Field label="Title (Bangla)"><Input value={a.titleBn} onChange={(titleBn) => setA({ ...a, titleBn })} disabled={!canEdit} /></Field>
          <Field label="Category"><Select value={a.category} onChange={(category) => setA({ ...a, category })} options={['Getting started', 'Sales & POS', 'Stock', 'Money', 'Billing', 'SMS', 'Internal']} disabled={!canEdit} /></Field>
          <Field label="Audience"><Select value={a.visibility} onChange={(v) => setA({ ...a, visibility: v as Article['visibility'] })} options={[{ value: 'Public', label: 'Owners (in-app help)' }, { value: 'Internal', label: 'Staff only' }]} disabled={!canEdit} /></Field>
        </div>
        <Field label="Article"><Textarea value={a.body} onChange={(body) => setA({ ...a, body })} disabled={!canEdit} /></Field>
        {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      </div>
    </Modal>
  );
}
