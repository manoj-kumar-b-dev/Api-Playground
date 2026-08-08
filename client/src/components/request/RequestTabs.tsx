import React from 'react';
import type { RequestTabType } from '../../types/request.types';

interface RequestTabsProps {
  activeTab: RequestTabType;
  onChangeTab: (tab: RequestTabType) => void;
  paramCount?: number;
  headerCount?: number;
  pathParamCount?: number;
  bodyMode?: string;
  authType?: string;
}

export const RequestTabs: React.FC<RequestTabsProps> = ({
  activeTab,
  onChangeTab,
  paramCount = 0,
  headerCount = 0,
  pathParamCount = 0,
  bodyMode = 'none',
  authType = 'none',
}) => {
  const tabs: { id: RequestTabType; label: string; count?: number; badge?: string }[] = [
    { id: 'params', label: 'Query Params', count: paramCount },
    { id: 'headers', label: 'Headers', count: headerCount },
    { id: 'pathParams', label: 'Path Params', count: pathParamCount },
    { id: 'body', label: 'Body', badge: bodyMode !== 'none' ? bodyMode : undefined },
    { id: 'auth', label: 'Authorization', badge: authType !== 'none' ? authType : undefined },
  ];

  return (
    <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-2 overflow-x-auto no-scrollbar">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChangeTab(tab.id)}
            className={`relative flex items-center gap-2 px-4 py-3 text-xs font-medium transition-colors whitespace-nowrap outline-none cursor-pointer ${
              isActive
                ? 'text-indigo-500 font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && tab.count > 0 && (
              <span className="flex items-center justify-center rounded-full bg-[var(--bg-tertiary)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)] font-bold">
                {tab.count}
              </span>
            )}
            {tab.badge && (
              <span className="flex items-center justify-center rounded-full bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 px-2 py-0.5 text-[10px] font-bold capitalize">
                {tab.badge}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 shadow-sm shadow-indigo-500/50" />
            )}
          </button>
        );
      })}
    </div>
  );
};
