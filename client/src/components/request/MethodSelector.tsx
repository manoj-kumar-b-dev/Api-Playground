import React from 'react';
import type { HttpMethod } from '../../types/request.types';

interface MethodSelectorProps {
  method: HttpMethod;
  onChange: (method: HttpMethod) => void;
  disabled?: boolean;
}

const methodColors: Record<HttpMethod, { bg: string; text: string; border: string }> = {
  GET: { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/30' },
  POST: { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/30' },
  PUT: { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-500/30' },
  PATCH: { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/30' },
  DELETE: { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/30' },
};

export const MethodSelector: React.FC<MethodSelectorProps> = ({
  method,
  onChange,
  disabled = false,
}) => {
  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const currentStyle = methodColors[method] || methodColors.GET;

  return (
    <div className="relative inline-block min-w-[110px]">
      <select
        value={method}
        onChange={(e) => onChange(e.target.value as HttpMethod)}
        disabled={disabled}
        className={`w-full appearance-none rounded-l-lg border ${currentStyle.border} ${currentStyle.bg} ${currentStyle.text} px-4 py-2.5 pr-8 text-sm font-bold tracking-wider outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 cursor-pointer`}
      >
        {methods.map((m) => (
          <option key={m} value={m} className="bg-[var(--card-bg)] text-[var(--text-primary)] font-semibold">
            {m}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[var(--text-muted)]">
        <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
          <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
        </svg>
      </div>
    </div>
  );
};
