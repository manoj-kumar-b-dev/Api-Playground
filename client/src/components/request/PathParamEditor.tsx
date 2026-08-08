import React from 'react';
import type { KeyValuePair } from '../../types/request.types';
import { Tag, HelpCircle } from 'lucide-react';

interface PathParamEditorProps {
  pathParams: KeyValuePair[];
  onUpdate: (id: string, value: string) => void;
  url?: string;
}

export const PathParamEditor: React.FC<PathParamEditorProps> = ({
  pathParams,
  onUpdate,
}) => {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-indigo-500" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Path Parameters
          </h4>
        </div>
        <span className="text-[11px] text-[var(--text-muted)] font-mono">
          Auto-detected from URL
        </span>
      </div>

      <div className="rounded-md bg-indigo-500/10 border border-indigo-500/20 p-3 text-xs text-indigo-600 dark:text-indigo-300 flex items-start gap-2">
        <HelpCircle className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
        <div>
          Use <code className="bg-indigo-500/20 px-1 py-0.5 rounded font-mono text-indigo-700 dark:text-indigo-200">:paramName</code> or <code className="bg-indigo-500/20 px-1 py-0.5 rounded font-mono text-indigo-700 dark:text-indigo-200">&#123;paramName&#125;</code> in your URL (e.g. <code className="font-mono text-indigo-700 dark:text-indigo-200">https://api.example.com/users/:id</code>). Parameters are automatically detected here.
        </div>
      </div>

      <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
        <table className="w-full text-left text-xs text-[var(--text-primary)]">
          <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] font-mono">
            <tr>
              <th className="py-2.5 px-3 font-semibold w-1/3">Parameter Key</th>
              <th className="py-2.5 px-3 font-semibold w-2/3">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-color)]">
            {pathParams.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-6 text-center text-[var(--text-muted)] italic">
                  No path parameters found in current URL. Add <code className="text-[var(--text-secondary)] font-mono">:id</code> or <code className="text-[var(--text-secondary)] font-mono">&#123;id&#125;</code> to the URL input.
                </td>
              </tr>
            ) : (
              pathParams.map((param) => (
                <tr key={param.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                    :{param.key}
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={param.value}
                      onChange={(e) => onUpdate(param.id, e.target.value)}
                      placeholder={`Substitution value for :${param.key}`}
                      className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                    />
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
