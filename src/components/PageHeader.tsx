import React from 'react';
import { useUiCopy } from '../i18n/useUiCopy';

type PageHeaderProps = {
  title: string;
  titleBn?: string;
  description?: string;
  /** Optional formatted description; plain text remains the fallback for all existing pages. */
  descriptionContent?: React.ReactNode;
  descriptionBn?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, titleBn, description, descriptionContent, descriptionBn, actions }: PageHeaderProps) {
  const { language, text, showHelper } = useUiCopy();
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <h1 className="text-xl font-semibold tracking-tight text-ink">{titleBn ? text(title, titleBn) : title}</h1>
          {showHelper && titleBn && <span className="font-bn text-sm text-ink-500">{titleBn}</span>}
        </div>
        {(descriptionContent ?? description) && <p className="mt-0.5 text-sm text-ink-500">{descriptionContent ?? (descriptionBn && language === "Bangla" ? descriptionBn : description)}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>);

}