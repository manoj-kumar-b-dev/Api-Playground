import React, { useState } from 'react';
import { Copy, Download, Check, Search, FileText, Code2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ResponseBodyProps {
  data: any;
  isJson: boolean;
  contentType: string;
}

export const ResponseBody: React.FC<ResponseBodyProps> = ({
  data,
  isJson,
  contentType,
}) => {
  const [viewMode, setViewMode] = useState<'pretty' | 'raw'>(isJson ? 'pretty' : 'raw');
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formattedJson = React.useMemo(() => {
    if (data === undefined || data === null) return '';
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(parsed, null, 2);
      } catch {
        return data;
      }
    }
    return JSON.stringify(data, null, 2);
  }, [data]);

  const rawText = React.useMemo(() => {
    if (data === undefined || data === null) return '';
    return typeof data === 'object' ? JSON.stringify(data) : String(data);
  }, [data]);

  const displayText = viewMode === 'pretty' ? formattedJson : rawText;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    toast.success('Response body copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = isJson ? 'response.json' : 'response.txt';
    const blob = new Blob([displayText], { type: contentType || 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}`);
  };

  return (
    <div className="flex flex-col bg-slate-950">
      {/* Action Sub-Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex rounded-md bg-slate-900 border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('pretty')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === 'pretty'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3 w-3" />
              <span>Pretty</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('raw')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === 'raw'
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="h-3 w-3" />
              <span>Raw</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 font-mono truncate max-w-[200px]">
            {contentType || 'text/plain'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter / Search input */}
          <div className="relative hidden sm:block">
            <Search className="h-3 w-3 absolute left-2.5 top-2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in response..."
              className="bg-slate-900 border border-slate-800 rounded py-1 pl-7 pr-2 text-[11px] text-slate-200 placeholder-slate-600 focus:border-indigo-500 outline-none w-36"
            />
          </div>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded px-2.5 py-1 transition-colors cursor-pointer"
            title="Copy Response"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">Copy</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded px-2.5 py-1 transition-colors cursor-pointer"
            title="Download Response"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </div>

      {/* Code / Text Viewer */}
      <div className="p-4 font-mono text-xs text-emerald-300 leading-relaxed selection:bg-indigo-500 selection:text-white overflow-x-auto min-h-[120px]">
        <pre className="whitespace-pre-wrap break-words">{displayText}</pre>
      </div>
    </div>
  );
};
