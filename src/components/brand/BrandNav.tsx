import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../Button';
import { LogoLockup } from './Logo';
import { brandSections } from '../../data/brand';

export function BrandNav() {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center gap-6 px-6">
        <a href="#top" aria-label="HisabIQ brand guide, top" className="flex items-center gap-3">
          <LogoLockup size={26} />
          <span className="hidden rounded-md bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-500 sm:inline">Brand guide v1.0</span>
        </a>
        <nav className="hidden flex-1 items-center gap-1 overflow-x-auto lg:flex" aria-label="Brand guide sections">
          {brandSections.map((s) =>
          <a key={s.id} href={`#${s.id}`} className="whitespace-nowrap rounded-md px-2.5 py-1 text-[13px] text-ink-600 hover:bg-ink-50 hover:text-ink">
              {s.label}
            </a>
          )}
        </nav>
        <Button size="sm" className="ml-auto" onClick={() => navigate('/app/dashboard')}>
          Open the app <ArrowRight className="size-4" />
        </Button>
      </div>
    </header>);

}