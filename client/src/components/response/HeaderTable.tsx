import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface HeaderTableProps {
  headers: Record<string, string>;
}

export const HeaderTable: React.FC<HeaderTableProps> = ({ headers }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const headerPairs = Object.entries(headers || {});

  const handleCopySingle = (key: string, value: string) => {
    navigator.clipboard.writeText(`${key}: ${value}`);
    setCopiedKey(key);
    toast.success(`Copied "${key}" header`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    const text = headerPairs.map(([k, v]) => `${k}: ${v}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedAll(true);
    toast.success('Copied all headers to clipboard!');
    setTimeout(() => setCopiedAll(false), 2000);
  };

  if (headerPairs.length === 0) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--card-bg)] rounded-b-lg border-t border-[var(--border-color)]">
        No response headers returned.
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-[var(--card-bg)] rounded-b-lg overflow-hidden border-t border-[var(--border-color)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs">
        <span className="text-[var(--text-secondary)] font-mono text-[11px]">{headerPairs.length} headers</span>

        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1 px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] rounded transition-colors cursor-pointer"
        >
          {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span>Copy All Headers</span>
        </button>
      </div>

      <div className="overflow-x-auto max-h-[460px]">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] uppercase text-[10px] tracking-wider">
              <th className="py-2.5 px-4 font-semibold w-1/3">Header</th>
              <th className="py-2.5 px-4 font-semibold w-7/12">Value</th>
              <th className="py-2.5 px-4 font-semibold text-right w-1/12">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {headerPairs.map(([key, value]) => (
              <tr key={key} className="hover:bg-[var(--bg-hover)] transition-colors">
                <td className="py-2 px-4 text-indigo-600 dark:text-indigo-300 font-semibold truncate max-w-[200px]" title={key}>
                  {key}
                </td>
                <td className="py-2 px-4 text-[var(--text-primary)] break-all select-all">{value}</td>
                <td className="py-2 px-4 text-right">
                  <button
                    type="button"
                    onClick={() => handleCopySingle(key, value)}
                    className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors cursor-pointer inline-flex items-center"
                    title={`Copy ${key}`}
                  >
                    {copiedKey === key ? (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
