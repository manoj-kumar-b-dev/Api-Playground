import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface FormSectionProps {
  title: string;
  icon?: React.ReactNode;
  badge?: string | number;
  description?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  icon,
  badge,
  description,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-xs overflow-hidden transition">
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-3 flex items-center justify-between bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] transition cursor-pointer border-b border-[var(--border-color)]"
      >
        <div className="flex items-center space-x-3">
          {icon && <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">{icon}</div>}
          <div className="text-left">
            <div className="flex items-center space-x-2">
              <h3 className="text-xs font-semibold text-[var(--text-primary)]">{title}</h3>
              {badge !== undefined && (
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            {description && <p className="text-[11px] text-[var(--text-muted)] font-normal">{description}</p>}
          </div>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
      </button>

      {/* Section Content */}
      {isOpen && <div className="p-5 space-y-4">{children}</div>}
    </div>
  );
};
