import React, { useState } from 'react';
import { Copy, Download, Check, ChevronRight, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

interface PrettyJsonViewerProps {
  data: any;
}

interface JsonTreeNodeProps {
  name?: string;
  value: any;
  isLast?: boolean;
}

const JsonTreeNode: React.FC<JsonTreeNodeProps> = ({ name, value, isLast = true }) => {
  const [collapsed, setCollapsed] = useState(false);

  const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isExpandable = isObject || isArray;

  if (isExpandable) {
    const keys = isObject ? Object.keys(value) : (value as any[]);
    const isEmpty = keys.length === 0;

    return (
      <div className="pl-4 font-mono text-xs leading-relaxed">
        <div
          onClick={() => !isEmpty && setCollapsed(!collapsed)}
          className={`flex items-center gap-1 hover:bg-[var(--bg-hover)] rounded px-1 -ml-4 py-0.5 cursor-pointer group selection:bg-indigo-500 selection:text-white ${
            !isEmpty ? 'cursor-pointer' : 'cursor-default'
          }`}
        >
          {isExpandable && !isEmpty && (
            <span className="text-[var(--text-muted)] group-hover:text-indigo-500">
              {collapsed ? <ChevronRight className="h-3 w-3 inline" /> : <ChevronDown className="h-3 w-3 inline" />}
            </span>
          )}
          {name !== undefined && <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{`"${name}"`}: </span>}
          <span className="text-[var(--text-secondary)]">{isArray ? '[' : '{'}</span>
          {collapsed && (
            <span className="text-[var(--text-muted)] text-[10px] px-1 bg-[var(--bg-tertiary)] rounded border border-[var(--border-color)]">
              {isArray ? `${value.length} items` : `${Object.keys(value).length} keys`}
            </span>
          )}
          {collapsed && <span className="text-[var(--text-secondary)]">{isArray ? ']' : '}'}{!isLast && ','}</span>}
        </div>

        {!collapsed && (
          <div>
            {isObject &&
              Object.keys(value).map((k, idx, arr) => (
                <JsonTreeNode key={k} name={k} value={value[k]} isLast={idx === arr.length - 1} />
              ))}
            {isArray &&
              (value as any[]).map((item, idx, arr) => (
                <JsonTreeNode key={idx} value={item} isLast={idx === arr.length - 1} />
              ))}
            <div className="-ml-4 text-[var(--text-secondary)]">{isArray ? ']' : '}'}{!isLast && ','}</div>
          </div>
        )}
      </div>
    );
  }

  // Primitive Values
  const renderValue = () => {
    if (value === null) return <span className="text-rose-600 dark:text-rose-400 font-semibold">null</span>;
    if (typeof value === 'boolean') return <span className="text-amber-600 dark:text-amber-400 font-semibold">{String(value)}</span>;
    if (typeof value === 'number') return <span className="text-blue-600 dark:text-emerald-400 font-semibold">{value}</span>;
    if (typeof value === 'string') return <span className="text-emerald-700 dark:text-teal-300">&quot;{value}&quot;</span>;
    return <span className="text-[var(--text-primary)]">{String(value)}</span>;
  };

  return (
    <div className="pl-4 font-mono text-xs py-0.5 leading-relaxed selection:bg-indigo-500 selection:text-white">
      {name !== undefined && <span className="text-indigo-600 dark:text-indigo-300 font-semibold">{`"${name}"`}: </span>}
      {renderValue()}
      {!isLast && <span className="text-[var(--text-secondary)]">,</span>}
    </div>
  );
};

export const PrettyJsonViewer: React.FC<PrettyJsonViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);

  const formattedString = React.useMemo(() => {
    if (data === undefined || data === null) return '';
    try {
      return typeof data === 'string' ? JSON.stringify(JSON.parse(data), null, 2) : JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  }, [data]);

  const lineCount = React.useMemo(() => formattedString.split('\n').length, [formattedString]);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedString);
    setCopied(true);
    toast.success('JSON copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'response.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded response.json');
  };

  const parsedData = React.useMemo(() => {
    if (typeof data === 'string') {
      try {
        return JSON.parse(data);
      } catch {
        return data;
      }
    }
    return data;
  }, [data]);

  return (
    <div className="flex flex-col bg-[var(--card-bg)] rounded-b-lg overflow-hidden border-t border-[var(--border-color)]">
      <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-xs">
        <span className="text-[var(--text-secondary)] font-mono text-[11px]">{lineCount} lines</span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] rounded transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy JSON</span>
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

      {/* Code Tree View with Line Numbers */}
      <div className="flex p-4 overflow-x-auto max-h-[460px] min-h-[140px]">
        {/* Line Numbers */}
        <div className="pr-4 border-r border-[var(--border-color)] text-right select-none font-mono text-xs text-[var(--text-muted)] space-y-0.5 shrink-0">
          {Array.from({ length: lineCount }).map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Tree Container */}
        <div className="pl-4 flex-1">
          {typeof parsedData === 'object' && parsedData !== null ? (
            <JsonTreeNode value={parsedData} />
          ) : (
            <pre className="font-mono text-xs text-emerald-600 dark:text-emerald-300 whitespace-pre-wrap">{formattedString}</pre>
          )}
        </div>
      </div>
    </div>
  );
};
