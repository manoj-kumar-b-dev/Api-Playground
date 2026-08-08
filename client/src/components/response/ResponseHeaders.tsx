import React, { useState } from 'react';
import { Copy, Check, Search } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResponseHeadersProps {
  headers: Record<string, string>;
}

export const ResponseHeaders: React.FC<ResponseHeadersProps> = ({ headers }) => {
  const [filter, setFilter] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const headerEntries = Object.entries(headers || {});

  const filteredEntries = headerEntries.filter(
    ([key, value]) =>
      key.toLowerCase().includes(filter.toLowerCase()) ||
      value.toLowerCase().includes(filter.toLowerCase())
  );

  const handleCopyHeader = (key: string, value: string) => {
    navigator.clipboard.writeText(`${key}: ${value}`);
    setCopiedKey(key);
    toast.success(`Copied header ${key}`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCopyAll = () => {
    const text = headerEntries.map(([k, v]) => `${k}: ${v}`).join('\n');
    navigator.clipboard.writeText(text);
    toast.success('All response headers copied!');
  };

  return (
    <div className="flex flex-col bg-slate-950 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Filter headers by key or value..."
            className="w-full bg-slate-900 border border-slate-800 rounded-md py-1.5 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleCopyAll}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-md px-3 py-1.5 transition-colors cursor-pointer"
        >
          <Copy className="h-3.5 w-3.5" />
          <span>Copy All</span>
        </button>
      </div>

      <div className="border border-slate-800 rounded-lg overflow-x-auto bg-slate-950/60">
        <table className="w-full text-left text-xs text-slate-300 font-mono">
          <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-4 font-semibold w-1/3">Header Key</th>
              <th className="py-2.5 px-4 font-semibold w-2/3">Header Value</th>
              <th className="py-2.5 px-4 w-12 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-500 italic">
                  No response headers found matching filter.
                </td>
              </tr>
            ) : (
              filteredEntries.map(([key, value]) => (
                <tr key={key} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-2.5 px-4 text-indigo-400 font-semibold">{key}</td>
                  <td className="py-2.5 px-4 text-slate-200 select-all break-all">{value}</td>
                  <td className="py-2.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleCopyHeader(key, value)}
                      className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded cursor-pointer"
                      title="Copy header line"
                    >
                      {copiedKey === key ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
