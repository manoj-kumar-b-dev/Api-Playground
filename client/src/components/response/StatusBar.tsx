import React from 'react';
import { Clock, HardDrive, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface StatusBarProps {
  status: number;
  statusText: string;
  time: number;
  sizeFormatted: string;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  status,
  statusText,
  time,
  sizeFormatted,
}) => {
  const getStatusColor = (code: number) => {
    if (code >= 200 && code < 300) {
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-500 font-bold',
        border: 'border-emerald-500/30',
        icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
      };
    }
    if (code >= 300 && code < 400) {
      return {
        bg: 'bg-amber-400/10',
        text: 'text-amber-600 dark:text-amber-300 font-bold',
        border: 'border-amber-400/30',
        icon: <CheckCircle2 className="h-4 w-4 text-amber-500" />,
      };
    }
    if (code >= 400 && code < 500) {
      return {
        bg: 'bg-orange-500/10',
        text: 'text-orange-600 dark:text-orange-400 font-bold',
        border: 'border-orange-500/30',
        icon: <AlertTriangle className="h-4 w-4 text-orange-500" />,
      };
    }
    return {
      bg: 'bg-rose-500/10',
      text: 'text-rose-600 dark:text-rose-400 font-bold',
      border: 'border-rose-500/30',
      icon: <XCircle className="h-4 w-4 text-rose-500" />,
    };
  };

  const style = getStatusColor(status);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs">
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-secondary)] font-medium">Status:</span>
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border font-mono ${style.bg} ${style.text} ${style.border}`}
        >
          {style.icon}
          <span>
            {status} {statusText}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[var(--text-secondary)] font-mono">
        <div className="flex items-center gap-1.5">
          <Clock className="h-3.5 w-3.5 text-indigo-500" />
          <span>{time} ms</span>
        </div>

        <div className="flex items-center gap-1.5">
          <HardDrive className="h-3.5 w-3.5 text-indigo-500" />
          <span>{sizeFormatted}</span>
        </div>
      </div>
    </div>
  );
};
