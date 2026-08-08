import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import toast from 'react-hot-toast';

interface RawViewerProps {
  data: any;
  contentType?: string;
}

export const RawViewer: React.FC<RawViewerProps> = ({ data, contentType = 'text/plain' }) => {
  const [copied, setCopied] = useState(false);

  const rawText = React.useMemo(() => {
    if (data === undefined || data === null) return '';
    return typeof data === 'object' ? JSON.stringify(data) : String(data);
  }, [data]);

  const handleCopy = () => {
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    toast.success('Raw response copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    let ext = 'txt';
    if (contentType.includes('json')) ext = 'json';
    else if (contentType.includes('html')) ext = 'html';
    else if (contentType.includes('xml')) ext = 'xml';

    const filename = `raw-response.${ext}`;
    const blob = new Blob([rawText], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="flex flex-col bg-[var(--card-bg)] rounded-b-lg border-t border-[var(--border-color)] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs">
        <span className="text-[var(--text-secondary)] font-mono text-[11px] truncate max-w-[240px]">
          Content-Type: <span className="text-indigo-600 dark:text-indigo-300">{contentType}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] rounded transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Raw</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] rounded transition-colors cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="p-4 font-mono text-xs text-[var(--text-primary)] leading-relaxed selection:bg-indigo-500 selection:text-white overflow-x-auto max-h-[460px] min-h-[140px]">
        <pre className="whitespace-pre-wrap break-words">{rawText}</pre>
      </div>
    </div>
  );
};
