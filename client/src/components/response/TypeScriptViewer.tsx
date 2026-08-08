import React, { useState } from 'react';
import { Copy, Check, FileCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface TypeScriptViewerProps {
  code: string;
}

export const TypeScriptViewer: React.FC<TypeScriptViewerProps> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('TypeScript interface copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] overflow-hidden">
      <div className="flex items-center justify-between px-3.5 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold font-mono">
          <FileCode className="h-4 w-4" />
          <span>TypeScript Definitions</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] rounded transition-colors cursor-pointer text-xs"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
          <span>Copy Interface</span>
        </button>
      </div>

      <div className="p-4 font-mono text-xs text-sky-700 dark:text-sky-300 leading-relaxed overflow-x-auto max-h-80 select-all">
        <pre>{code}</pre>
      </div>
    </div>
  );
};
