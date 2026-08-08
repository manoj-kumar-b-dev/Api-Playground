import React from 'react';
import { Plus, Trash2, CheckSquare, Square } from 'lucide-react';
import type { KeyValuePair } from '../../types/request.types';

interface QueryEditorProps {
  queryParams: KeyValuePair[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof KeyValuePair, value: any) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
}

export const QueryEditor: React.FC<QueryEditorProps> = ({
  queryParams,
  onAdd,
  onUpdate,
  onRemove,
  onToggle,
}) => {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
          Query Parameters
        </h4>
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Parameter</span>
        </button>
      </div>

      <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
        <table className="w-full text-left text-xs text-[var(--text-primary)]">
          <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] font-mono">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">Status</th>
              <th className="py-2.5 px-3 font-semibold">Key</th>
              <th className="py-2.5 px-3 font-semibold">Value</th>
              <th className="py-2.5 px-3 font-semibold">Description</th>
              <th className="py-2.5 px-3 w-10 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {queryParams.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-[var(--text-muted)] italic">
                  No query parameters added yet. Click &quot;Add Parameter&quot; above.
                </td>
              </tr>
            ) : (
              queryParams.map((param) => (
                <tr
                  key={param.id}
                  className={`hover:bg-[var(--bg-hover)] transition-colors ${
                    !param.enabled ? 'opacity-50' : ''
                  }`}
                >
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onToggle(param.id)}
                      className="text-[var(--text-muted)] hover:text-indigo-500 transition-colors cursor-pointer inline-flex items-center justify-center"
                      title={param.enabled ? 'Disable Parameter' : 'Enable Parameter'}
                    >
                      {param.enabled ? (
                        <CheckSquare className="h-4 w-4 text-indigo-500" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={param.key}
                      onChange={(e) => onUpdate(param.id, 'key', e.target.value)}
                      placeholder="e.g. page"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => onUpdate(param.id, 'value', e.target.value)}
                      placeholder="e.g. 1"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={param.description || ''}
                      onChange={(e) => onUpdate(param.id, 'description', e.target.value)}
                      placeholder="Optional description"
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-indigo-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => onRemove(param.id)}
                      className="text-[var(--text-muted)] hover:text-rose-500 transition-colors p-1 rounded cursor-pointer"
                      title="Delete parameter"
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
