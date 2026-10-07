import React, { useState } from 'react';
import { MoreHorizontal, Plus, Ruler, Settings2, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../Button';
import { FormSelect } from '../FormSelect';
import { Input } from '../Input';
import { StatusBadge } from '../StatusBadge';
import { Switch } from '../Switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../Table';
import { FloatingPanel } from '../layout/FloatingPanel';

type SettingsTab = 'categories' | 'units' | 'brands' | 'defaults';

type NamedSetting = {
  id: string;
  name: string;
  nameBn?: string;
  usage: number;
  active: boolean;
};

type UnitSetting = NamedSetting & {
  symbol: string;
  kind: 'Base' | 'Compound-ready';
};

const initialCategories: NamedSetting[] = [
  { id: 'cat-1', name: 'Plumbing', nameBn: 'প্লাম্বিং', usage: 3, active: true },
  { id: 'cat-2', name: 'Electrical', nameBn: 'ইলেকট্রিক্যাল', usage: 3, active: true },
  { id: 'cat-3', name: 'Steel', nameBn: 'স্টিল', usage: 2, active: true },
  { id: 'cat-4', name: 'Building', nameBn: 'বিল্ডিং', usage: 1, active: true },
  { id: 'cat-5', name: 'Hardware', nameBn: 'হার্ডওয়্যার', usage: 4, active: true }
];

const initialUnits: UnitSetting[] = [
  { id: 'u-1', name: 'Piece', symbol: 'Pcs', kind: 'Compound-ready', usage: 6, active: true },
  { id: 'u-2', name: 'Gira', symbol: 'Gira', kind: 'Compound-ready', usage: 1, active: true },
  { id: 'u-3', name: 'Kilogram', symbol: 'Kg', kind: 'Base', usage: 2, active: true },
  { id: 'u-4', name: 'Feet', symbol: 'Ft', kind: 'Compound-ready', usage: 0, active: true },
  { id: 'u-5', name: 'Bag', symbol: 'Bag', kind: 'Base', usage: 1, active: true },
  { id: 'u-6', name: 'Coil', symbol: 'Coil', kind: 'Base', usage: 1, active: true },
  { id: 'u-7', name: 'Pair', symbol: 'Pair', kind: 'Base', usage: 1, active: true },
  { id: 'u-8', name: 'Litre', symbol: 'L', kind: 'Base', usage: 0, active: true }
];

const initialBrands: NamedSetting[] = [
  { id: 'br-1', name: 'RFL', nameBn: 'আরএফএল', usage: 2, active: true },
  { id: 'br-2', name: 'Vision', nameBn: 'ভিশন', usage: 1, active: true },
  { id: 'br-3', name: 'Shah Cement', nameBn: 'শাহ সিমেন্ট', usage: 1, active: true },
  { id: 'br-4', name: 'Generic / No brand', nameBn: 'ব্র্যান্ড নেই', usage: 9, active: true }
];

function SettingActions({
  label,
  active,
  onToggle,
  onDelete
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <FloatingPanel
      label={`Actions for ${label}`}
      width={180}
      trigger={({ toggle, open }) => (
        <button
          onClick={toggle}
          aria-expanded={open}
          aria-label={`Actions for ${label}`}
          className="rounded-md p-1.5 text-ink-400 hover:bg-ink-50 hover:text-ink">
          <MoreHorizontal className="size-4" />
        </button>
      )}>
      {(close) => (
        <div className="py-1">
          <button
            onClick={() => { close(); toast(`Editing ${label}`); }}
            className="w-full px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
            Edit
          </button>
          <button
            onClick={() => { close(); onToggle(); }}
            className="w-full px-3 py-2 text-left text-[13px] text-ink-700 hover:bg-ink-50">
            {active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => { close(); onDelete(); }}
            className="w-full px-3 py-2 text-left text-[13px] text-danger hover:bg-danger-bg">
            Delete
          </button>
        </div>
      )}
    </FloatingPanel>
  );
}

export function ProductSettings() {
  const [tab, setTab] = useState<SettingsTab>('categories');
  const [categories, setCategories] = useState(initialCategories);
  const [units, setUnits] = useState(initialUnits);
  const [brands, setBrands] = useState(initialBrands);
  const [newName, setNewName] = useState('');
  const [newBn, setNewBn] = useState('');
  const [newSymbol, setNewSymbol] = useState('');

  const [banglaHelpers, setBanglaHelpers] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [barcodeScan, setBarcodeScan] = useState(true);
  const [negativeStock, setNegativeStock] = useState(false);
  const [openingUnit, setOpeningUnit] = useState('Stock view unit');
  const [minimumUnit, setMinimumUnit] = useState('Stock view unit');
  const [priceEntry, setPriceEntry] = useState('Selected unit');
  const [rounding, setRounding] = useState('Round final invoice');

  const clearNew = () => {
    setNewName('');
    setNewBn('');
    setNewSymbol('');
  };

  const addNamed = () => {
    if (!newName.trim()) return;
    if (tab === 'categories') {
      setCategories((items) => [...items, {
        id: `cat-${Date.now()}`,
        name: newName.trim(),
        ...(newBn.trim() ? { nameBn: newBn.trim() } : {}),
        usage: 0,
        active: true
      }]);
    } else if (tab === 'brands') {
      setBrands((items) => [...items, {
        id: `br-${Date.now()}`,
        name: newName.trim(),
        ...(newBn.trim() ? { nameBn: newBn.trim() } : {}),
        usage: 0,
        active: true
      }]);
    } else if (tab === 'units') {
      setUnits((items) => [...items, {
        id: `u-${Date.now()}`,
        name: newName.trim(),
        symbol: newSymbol.trim() || newName.trim(),
        kind: 'Compound-ready',
        usage: 0,
        active: true
      }]);
    }
    toast.success(`${newName.trim()} added`);
    clearNew();
  };

  const tabs: Array<[SettingsTab, string, React.ElementType]> = [
    ['categories', 'Categories', Tags],
    ['units', 'Units', Ruler],
    ['brands', 'Brands', Tags],
    ['defaults', 'Defaults', Settings2]
  ];

  return (
    <div>
      <div className="flex flex-nowrap gap-1 overflow-x-auto border-b border-border px-3 scrollbar-thin" role="tablist">
        {tabs.map(([id, label, Icon]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => { setTab(id); clearNew(); }}
            className={`flex shrink-0 items-center gap-1.5 px-2.5 py-2.5 text-[13px] font-medium ${tab === id ? 'erp-tab-active text-ink' : 'text-ink-500 hover:text-ink'}`}>
            <Icon className="size-3.5" /> {label}
          </button>
        ))}
      </div>

      {tab !== 'defaults' && (
        <div className="flex flex-col gap-2 border-b border-border bg-ink-50/40 p-3 lg:flex-row lg:items-end">
          <label className="min-w-0 flex-1 text-[12px] font-medium text-ink lg:max-w-xs">
            {tab === 'categories' ? 'Category name' : tab === 'brands' ? 'Brand name' : 'Unit name'}
            <Input className="mt-1" value={newName} onChange={(event) => setNewName(event.target.value)} placeholder={tab === 'units' ? 'e.g. Meter' : 'Enter name'} />
          </label>
          {tab !== 'units' && (
            <label className="min-w-0 flex-1 text-[12px] font-medium text-ink lg:max-w-xs">
              Bangla name
              <Input className="font-bn mt-1" value={newBn} onChange={(event) => setNewBn(event.target.value)} placeholder="বাংলা নাম (ঐচ্ছিক)" />
            </label>
          )}
          {tab === 'units' && (
            <label className="w-full text-[12px] font-medium text-ink lg:w-36">
              Symbol
              <Input className="mt-1" value={newSymbol} onChange={(event) => setNewSymbol(event.target.value)} placeholder="e.g. m" />
            </label>
          )}
          <Button size="sm" onClick={addNamed} disabled={!newName.trim()}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
      )}

      {tab === 'categories' && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 pl-4 text-xs">Category</TableHead>
              <TableHead className="h-9 text-xs">Bangla</TableHead>
              <TableHead className="h-9 text-right text-xs">Products</TableHead>
              <TableHead className="h-9 text-xs">Status</TableHead>
              <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((item) => (
              <TableRow key={item.id} className="text-[13px]">
                <TableCell className="py-2 pl-4 font-medium text-ink">{item.name}</TableCell>
                <TableCell className="font-bn py-2 text-ink-600">{item.nameBn ?? '—'}</TableCell>
                <TableCell className="py-2 text-right">{item.usage}</TableCell>
                <TableCell className="py-2"><StatusBadge tone={item.active ? 'success' : 'neutral'} dot={item.active}>{item.active ? 'Active' : 'Inactive'}</StatusBadge></TableCell>
                <TableCell className="py-2 pr-4 text-right">
                  <SettingActions
                    label={item.name}
                    active={item.active}
                    onToggle={() => setCategories((items) => items.map((value) => value.id === item.id ? { ...value, active: !value.active } : value))}
                    onDelete={() => item.usage > 0 ? toast.error('Category is used by products') : setCategories((items) => items.filter((value) => value.id !== item.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 'units' && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 pl-4 text-xs">Unit</TableHead>
              <TableHead className="h-9 text-xs">Symbol</TableHead>
              <TableHead className="h-9 text-xs">Use</TableHead>
              <TableHead className="h-9 text-right text-xs">Products</TableHead>
              <TableHead className="h-9 text-xs">Status</TableHead>
              <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((item) => (
              <TableRow key={item.id} className="text-[13px]">
                <TableCell className="py-2 pl-4 font-medium text-ink">{item.name}</TableCell>
                <TableCell className="py-2 text-ink-600">{item.symbol}</TableCell>
                <TableCell className="py-2"><StatusBadge tone={item.kind === 'Compound-ready' ? 'teal' : 'neutral'}>{item.kind}</StatusBadge></TableCell>
                <TableCell className="py-2 text-right">{item.usage}</TableCell>
                <TableCell className="py-2"><StatusBadge tone={item.active ? 'success' : 'neutral'} dot={item.active}>{item.active ? 'Active' : 'Inactive'}</StatusBadge></TableCell>
                <TableCell className="py-2 pr-4 text-right">
                  <SettingActions
                    label={item.name}
                    active={item.active}
                    onToggle={() => setUnits((items) => items.map((value) => value.id === item.id ? { ...value, active: !value.active } : value))}
                    onDelete={() => item.usage > 0 ? toast.error('Unit is used by products') : setUnits((items) => items.filter((value) => value.id !== item.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 'brands' && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="h-9 pl-4 text-xs">Brand</TableHead>
              <TableHead className="h-9 text-xs">Bangla</TableHead>
              <TableHead className="h-9 text-right text-xs">Products</TableHead>
              <TableHead className="h-9 text-xs">Status</TableHead>
              <TableHead className="h-9 pr-4 text-right text-xs">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((item) => (
              <TableRow key={item.id} className="text-[13px]">
                <TableCell className="py-2 pl-4 font-medium text-ink">{item.name}</TableCell>
                <TableCell className="font-bn py-2 text-ink-600">{item.nameBn ?? '—'}</TableCell>
                <TableCell className="py-2 text-right">{item.usage}</TableCell>
                <TableCell className="py-2"><StatusBadge tone={item.active ? 'success' : 'neutral'} dot={item.active}>{item.active ? 'Active' : 'Inactive'}</StatusBadge></TableCell>
                <TableCell className="py-2 pr-4 text-right">
                  <SettingActions
                    label={item.name}
                    active={item.active}
                    onToggle={() => setBrands((items) => items.map((value) => value.id === item.id ? { ...value, active: !value.active } : value))}
                    onDelete={() => item.usage > 0 ? toast.error('Brand is used by products') : setBrands((items) => items.filter((value) => value.id !== item.id))}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 'defaults' && (
        <div className="grid gap-4 p-4 xl:grid-cols-2">
          <section className="rounded-xl border border-border">
            <div className="border-b border-border p-3">
              <p className="text-sm font-semibold text-ink">Product entry defaults</p>
              <p className="mt-0.5 text-[11px] text-ink-500">Defaults reduce repetitive choices; each product can still override them.</p>
            </div>
            <div className="space-y-4 p-3">
              <label className="block text-[12px] font-medium text-ink">
                Opening stock unit
                <FormSelect className="mt-1" value={openingUnit} onChange={(event) => setOpeningUnit(event.target.value)} options={['Stock view unit', 'Base unit', 'Largest configured unit']} />
              </label>
              <label className="block text-[12px] font-medium text-ink">
                Minimum stock unit
                <FormSelect className="mt-1" value={minimumUnit} onChange={(event) => setMinimumUnit(event.target.value)} options={['Stock view unit', 'Base unit', 'Largest configured unit']} />
              </label>
              <label className="block text-[12px] font-medium text-ink">
                Selling / purchase price entry
                <FormSelect className="mt-1" value={priceEntry} onChange={(event) => setPriceEntry(event.target.value)} options={['Selected unit', 'Base unit', 'Largest configured unit']} />
              </label>
              <label className="block text-[12px] font-medium text-ink">
                Rounding
                <FormSelect className="mt-1" value={rounding} onChange={(event) => setRounding(event.target.value)} options={['Round final invoice', 'No automatic rounding', 'Round unit prices + invoice']} />
              </label>
            </div>
          </section>

          <section className="rounded-xl border border-border">
            <div className="border-b border-border p-3">
              <p className="text-sm font-semibold text-ink">Product behaviour</p>
              <p className="mt-0.5 text-[11px] text-ink-500">Keep operational behaviour simple and switchable.</p>
            </div>
            <div className="divide-y divide-border">
              {[
                { label: 'Bangla helper text', helper: 'Show Bangla hints beside product fields.', value: banglaHelpers, set: setBanglaHelpers },
                { label: 'Low stock alerts', helper: 'Warn when stock falls below the product minimum.', value: lowStockAlerts, set: setLowStockAlerts },
                { label: 'Barcode scan in POS', helper: 'Allow barcode scan to add a product to the cart.', value: barcodeScan, set: setBarcodeScan },
                { label: 'Negative stock by default', helper: 'Allow sale below zero without choosing the shortage option.', value: negativeStock, set: setNegativeStock }
              ].map((setting) => (
                <div key={setting.label} className="flex items-start justify-between gap-4 p-3">
                  <div>
                    <p className="text-[13px] font-medium text-ink">{setting.label}</p>
                    <p className="mt-0.5 text-[11px] text-ink-500">{setting.helper}</p>
                  </div>
                  <Switch checked={setting.value} onCheckedChange={setting.set} aria-label={setting.label} />
                </div>
              ))}
            </div>
          </section>

          <div className="xl:col-span-2 flex justify-end">
            <Button onClick={() => toast.success('Product defaults saved')}>Save defaults</Button>
          </div>
        </div>
      )}
    </div>
  );
}

