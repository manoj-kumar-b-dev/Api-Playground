import React from 'react';
import { Gauge, CheckCircle2 } from 'lucide-react';
import type { PerformanceSuggestion, BestPractice } from '../../types/ai.types';

interface PerformanceSuggestionsProps {
  performance: PerformanceSuggestion[];
  bestPractices: BestPractice[];
}

export const PerformanceSuggestions: React.FC<PerformanceSuggestionsProps> = ({
  performance,
  bestPractices,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {/* Performance Column */}
      <div className="space-y-2.5">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-indigo-500" />
          <span>Performance Optimization</span>
        </h5>
        {performance.map((item, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
            <span className="text-[10px] font-bold font-mono text-indigo-600 dark:text-indigo-300 uppercase px-1.5 py-0.5 bg-indigo-500/10 rounded border border-indigo-500/20">
              {item.category}
            </span>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed pt-1">{item.suggestion}</p>
          </div>
        ))}
      </div>

      {/* Best Practices Column */}
      <div className="space-y-2.5">
        <h5 className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
          <span>API Best Practices</span>
        </h5>
        {bestPractices.map((item, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] space-y-1">
            <span className="text-[10px] font-bold font-mono text-emerald-600 dark:text-emerald-300 uppercase px-1.5 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/20">
              {item.topic}
            </span>
            <p className="text-xs text-[var(--text-primary)] leading-relaxed pt-1">{item.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
