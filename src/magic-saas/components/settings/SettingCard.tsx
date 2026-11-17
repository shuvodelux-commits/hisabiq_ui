import React from 'react';

type SettingCardProps = {
  title: string;
  titleBn?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  bodyClassName?: string;
};

/** Settings section card — mirrors the repo's SettingCard (title row with a bottom border, padded body). */
export function SettingCard({ title, titleBn, description, actions, children, bodyClassName = 'space-y-5 p-4' }: SettingCardProps) {
  return (
    <section className="min-w-0 rounded-xl border border-ink-100 bg-white shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-2 border-b border-ink-100 px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-ink">
            {title}
            {titleBn && <span className="ml-2 font-bn text-[11px] font-normal text-ink-400">{titleBn}</span>}
          </h2>
          {description && <p className="mt-0.5 text-xs text-ink-500">{description}</p>}
        </div>
        {actions}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
