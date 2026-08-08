import React from 'react';

interface InsightCardProps {
  icon: React.ReactNode;
  title: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  className?: string;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  icon,
  title,
  badge,
  badgeColor = 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border-indigo-500/30',
  children,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] shadow-md ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
            {icon}
          </div>
          <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">{title}</h4>
        </div>

        {badge && (
          <span className={`text-[10px] font-semibold font-mono px-2 py-0.5 rounded-full border ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="text-xs text-[var(--text-primary)]">{children}</div>
    </div>
  );
};
