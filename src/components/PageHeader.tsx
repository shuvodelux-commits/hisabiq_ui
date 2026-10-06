import React from 'react';

type PageHeaderProps = {
  title: string;
  titleBn?: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, titleBn, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
          {titleBn && <span className="font-bn text-sm text-ink-500">{titleBn}</span>}
        </div>
        {description && <p className="mt-0.5 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>);

}