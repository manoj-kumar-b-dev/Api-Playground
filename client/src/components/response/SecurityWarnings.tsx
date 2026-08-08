import React from 'react';
import { ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';
import type { SecurityWarning } from '../../types/ai.types';

interface SecurityWarningsProps {
  warnings: SecurityWarning[];
}

export const SecurityWarnings: React.FC<SecurityWarningsProps> = ({ warnings }) => {
  if (!warnings || warnings.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
        <div className="space-y-0.5">
          <h4 className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">No Security Sensitive Exposure Detected</h4>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80 leading-relaxed">
            No API keys, passwords, JWT tokens, or unmasked PII found in response body.
          </p>
        </div>
      </div>
    );
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/40';
      case 'medium':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/40';
      default:
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-2.5">
      {warnings.map((w, idx) => (
        <div
          key={idx}
          className="p-3.5 rounded-xl bg-[var(--card-bg)] border border-rose-500/30 flex items-start gap-3 shadow-md"
        >
          <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
            {w.severity === 'critical' || w.severity === 'high' ? (
              <ShieldAlert className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
          </div>

          <div className="flex-1 space-y-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-300 truncate">{w.field}</span>
              <span
                className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border uppercase ${getSeverityStyle(
                  w.severity
                )}`}
              >
                {w.severity}
              </span>
            </div>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed">{w.issue}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
