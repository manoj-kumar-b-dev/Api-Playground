import React from 'react';
import { Plus, Trash2, CheckSquare, Square, Sparkles } from 'lucide-react';
import type { KeyValuePair } from '../../types/request.types';

interface HeaderEditorProps {
  headers: KeyValuePair[];
  onAdd: (presetKey?: string, presetValue?: string) => void;
  onUpdate: (id: string, field: keyof KeyValuePair, value: any) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

const COMMON_PRESETS = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Accept', value: 'application/json' },
  { key: 'Authorization', value: 'Bearer <token>' },
  { key: 'User-Agent', value: 'ReqForge/1.0' },
  { key: 'Cache-Control', value: 'no-cache' },
];

export const HeaderEditor: React.FC<HeaderEditorProps> = ({
  headers,
  onAdd,
  onUpdate,
  onRemove,
  onToggle,
}) => {
  return (
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          HTTP Headers
        </h4>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAdd()}
            className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Header</span>
          </button>
        </div>
      </div>

      {/* Header Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-[10px] text-[var(--text-muted)] font-medium flex items-center gap-1 shrink-0">
          <Sparkles className="h-3 w-3 text-indigo-500" /> Presets:
        </span>
        {COMMON_PRESETS.map((preset) => (
          <button
            key={preset.key}
            type="button"
            onClick={() => onAdd(preset.key, preset.value)}
            className="rounded bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-indigo-500/50 hover:bg-[var(--bg-hover)] px-2 py-1 text-[11px] text-[var(--text-secondary)] font-mono transition-colors shrink-0 cursor-pointer"
          >
            + {preset.key}
          </button>
        ))}
      </div>

      <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
        <table className="w-full text-left text-xs text-[var(--text-primary)]">
          <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] font-mono">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">Status</th>
              <th className="py-2.5 px-3 font-semibold">Header Key</th>
              <th className="py-2.5 px-3 font-semibold">Header Value</th>
              <th className="py-2.5 px-3 font-semibold">Description</th>
              <th className="py-2.5 px-3 w-10 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {headers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[var(--text-muted)] italic">
                  No custom headers added yet. Use preset buttons or click &quot;Add Header&quot;.
                </td>
              </tr>
            ) : (
              headers.map((header) => (
                <tr
                  key={header.id}
                  className={`hover:bg-[var(--bg-hover)] transition-colors ${
                    !header.enabled ? 'opacity-50' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onToggle(header.id)}
                      className="text-[var(--text-muted)] hover:text-indigo-500 transition-colors cursor-pointer inline-flex items-center justify-center"
                      title={header.enabled ? 'Disable Header' : 'Enable Header'}
                    >
                      {header.enabled ? (
                        <CheckSquare className="h-4 w-4 text-indigo-500" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={header.key}
                      onChange={(e) => onUpdate(header.id, 'key', e.target.value)}
                      placeholder="e.g. Content-Type"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={header.value}
                      onChange={(e) => onUpdate(header.id, 'value', e.target.value)}
                      placeholder="e.g. application/json"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={header.description || ''}
                      onChange={(e) => onUpdate(header.id, 'description', e.target.value)}
                      placeholder="Optional description"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemove(header.id)}
                      className="text-[var(--text-muted)] hover:text-rose-500 transition-colors p-1 rounded cursor-pointer"
                      title="Delete header"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
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
