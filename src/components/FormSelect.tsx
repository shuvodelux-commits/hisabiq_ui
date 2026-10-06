import React from 'react';
import { ChevronDown } from 'lucide-react';

type FormSelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: string[];
};

export function FormSelect({ options, className = '', ...rest }: FormSelectProps) {
  return (
    <div className={`relative ${className}`}>
      <select
        {...rest}
        className="h-9 w-full appearance-none rounded-md border border-input bg-white pl-3 pr-8 text-sm text-ink shadow-xs focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20">
        
        {options.map((o) =>
        <option key={o} value={o}>
            {o}
          </option>
        )}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
    </div>);

}