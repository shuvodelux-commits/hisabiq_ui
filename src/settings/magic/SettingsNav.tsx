import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '../../components/Input';
import { Search } from 'lucide-react';
import { settingsGroups, settingsSections, type SettingsSectionId } from './settingsSections';

type SettingsNavProps = {
  /** null when the Settings home is open. */
  activeId: SettingsSectionId | null;
  urlFor: (id: SettingsSectionId) => string;
  onNavigate: (url: string, e: React.MouseEvent) => void;
};

/** Left settings navigation — matches the repo's TenantSettingsPage aside (search + compact list). */
export function SettingsNav({ activeId, urlFor, onNavigate }: SettingsNavProps) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const list = settingsSections.filter((s) => !q || `${s.label} ${s.bn} ${s.desc}`.toLowerCase().includes(q));

  return (
    <aside className="min-w-0 space-y-3">
      <Link
        to="/app/settings"
        onClick={(e) => onNavigate('/app/settings', e)}
        aria-current={activeId === null ? 'page' : undefined}
        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 ${activeId === null ? 'border-teal-600/30 bg-accent text-ink' : 'border-ink-100 bg-card text-ink-600 hover:bg-ink-50'}`}
      >
        Settings home <span className="font-bn text-[10.5px] font-normal text-ink-400">সেটিংস হোম</span>
      </Link>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search settings"
          aria-label="Search settings"
          className="ref-control w-full rounded-lg border border-ink-200 bg-card pl-9 pr-3 text-[13px] text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600"
        />
      </div>
      <nav data-settings-directory aria-label="Settings" className="flex gap-1 overflow-x-auto rounded-xl border border-ink-100 bg-card p-2 scrollbar-thin lg:block">
        {list.length === 0 && <p className="px-3 py-2 text-xs text-ink-500">No settings match “{query}”.</p>}
        {settingsGroups.map((g) => {
          const items = list.filter((s) => s.group === g);
          if (!items.length) return null;
          return (
            <div key={g} className="contents lg:block lg:pb-1">
              <p className="hidden px-3 pb-1 pt-2 text-[11px] font-medium text-ink-400 lg:block">{g}</p>
              {items.map((s) => {
                const Icon = s.icon;
                const active = s.id === activeId;
                const url = urlFor(s.id);
                return (
                  <Link
                    data-settings-section={s.id}
                    key={s.id}
                    to={url}
                    onClick={(e) => onNavigate(url, e)}
                    aria-current={active ? 'page' : undefined}
                    className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-teal-600 lg:w-full ${
                      s.nested ? 'lg:pl-9' : ''
                    } ${active ? 'bg-accent font-medium text-ink' : 'text-ink-600 hover:bg-ink-50 hover:text-ink'}`}
                  >
                    <Icon className={`size-4 shrink-0 ${active ? 'text-teal-700' : 'text-ink-400'} ${s.nested ? 'lg:hidden' : ''}`} aria-hidden="true" />
                    <span className="whitespace-nowrap lg:whitespace-normal">
                      {s.label}
                      <span className="hidden font-bn text-[10.5px] font-normal text-ink-400 lg:block">{s.bn}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
