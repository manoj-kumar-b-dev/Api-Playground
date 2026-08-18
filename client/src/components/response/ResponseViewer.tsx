import React, { useState, useEffect } from 'react';
import type { ResponseData, RequestError } from '../../types/response.types';
import { StatusBar } from './StatusBar';
import { PrettyJsonViewer } from './PrettyJsonViewer';
import { RawViewer } from './RawViewer';
import { HeaderTable } from './HeaderTable';
import { AiExplanation } from './AiExplanation';
import {
  Code2,
  FileText,
  List,
  Sparkles,
  Bug,
  AlertTriangle,
  WifiOff,
  Clock,
  ShieldAlert,
  ServerOff,
  Send,
  Loader2,
  Eye,
} from 'lucide-react';

interface ResponseViewerProps {
  response: ResponseData | null;
  error: RequestError | null;
  loading: boolean;
}

export const ResponseViewer: React.FC<ResponseViewerProps> = ({
  response,
  error,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<'pretty' | 'raw' | 'preview' | 'headers' | 'ai'>('pretty');

  const isHtmlResponse = React.useMemo(() => {
    if (!response) return false;
    const contentType = response.contentType || '';
    if (contentType.toLowerCase().includes('html')) return true;
    if (typeof response.data === 'string' && response.data.trim().toLowerCase().startsWith('<')) return true;
    return false;
  }, [response]);

  useEffect(() => {
    if (response) {
      if (!response.isJson) {
        setActiveTab('raw');
      } else {
        setActiveTab('pretty');
      }
    }
  }, [response]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[260px] p-8 text-center bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
        <div className="relative mb-4">
          <div className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping" />
          <div className="relative p-4 rounded-full bg-[var(--bg-secondary)] border border-indigo-500/30 text-indigo-400">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Executing HTTP Request...</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-sm">
          Sending payload and waiting for server response. You can click Cancel at any time.
        </p>
      </div>
    );
  }

  if (error) {
    const getErrorDetails = (err: RequestError) => {
      if (err.isCancel) {
        return {
          title: 'Request Cancelled',
          icon: <Clock className="h-8 w-8 text-amber-400" />,
          desc: 'The HTTP request was aborted by the user before completion.',
        };
      }
      if (err.isNetworkError) {
        return {
          title: 'Network Error / CORS Blocked',
          icon: <WifiOff className="h-8 w-8 text-rose-400" />,
          desc: 'Unable to connect to target host. Check: 1) Is port specified e.g. http://localhost:5000? 2) Is backend running? 3) Does server allow CORS?',
        };
      }
      if (err.isTimeout) {
        return {
          title: 'Request Timeout',
          icon: <Clock className="h-8 w-8 text-amber-400" />,
          desc: 'The server took too long to respond (exceeded timeout limit).',
        };
      }
      if (err.status === 401 || err.status === 403) {
        return {
          title: `Access Denied (${err.status} ${err.statusText || ''})`,
          icon: <ShieldAlert className="h-8 w-8 text-rose-400" />,
          desc: 'Authentication failed or insufficient permissions to access this endpoint.',
        };
      }
      if (err.status && err.status >= 500) {
        return {
          title: `Server Error (${err.status} ${err.statusText || ''})`,
          icon: <ServerOff className="h-8 w-8 text-rose-400" />,
          desc: 'The target API server encountered an unhandled internal exception.',
        };
      }
      return {
        title: err.message || 'Execution Failed',
        icon: <AlertTriangle className="h-8 w-8 text-rose-400" />,
        desc: err.statusText || 'An unexpected error occurred during request execution.',
      };
    };

    const details = getErrorDetails(error);

    return (
      <div className="flex flex-col bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)]">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 shrink-0">
              {details.icon}
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-semibold text-[var(--text-primary)]">{details.title}</h3>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{details.desc}</p>
            </div>
          </div>

          {error.responseData && (
            <div className="mt-4 space-y-1.5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Server Error Details
              </h4>
              <div className="p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] font-mono text-xs text-rose-400 overflow-x-auto">
                <pre>
                  {typeof error.responseData === 'object'
                    ? JSON.stringify(error.responseData, null, 2)
                    : String(error.responseData)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!response) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[260px] p-8 text-center bg-[var(--card-bg)] rounded-lg border border-dashed border-[var(--border-color)]">
        <div className="p-4 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-muted)] mb-3">
          <Send className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">No Response Yet</h3>
        <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm">
          Enter an API URL, select HTTP method, configure headers or body, and click &quot;Send&quot; to execute.
        </p>
      </div>
    );
  }

  const headerCount = Object.keys(response.headers || {}).length;
  const isSuccess = response.status >= 200 && response.status < 300;

  return (
    <div className="flex flex-col bg-[var(--card-bg)] rounded-lg border border-[var(--border-color)] shadow-xl">
      {/* Top Status Indicator */}
      <StatusBar
        status={response.status}
        statusText={response.statusText}
        time={response.time}
        sizeFormatted={response.sizeFormatted}
      />

      {/* Response Navigation Sub-Tabs */}
      <div className="flex items-center overflow-x-auto border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('pretty')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors outline-none cursor-pointer shrink-0 ${
            activeTab === 'pretty'
              ? 'text-indigo-500 border-b-2 border-indigo-500 font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>Pretty JSON</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors outline-none cursor-pointer shrink-0 ${
            activeTab === 'raw'
              ? 'text-indigo-500 border-b-2 border-indigo-500 font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>Raw Response</span>
        </button>

        {isHtmlResponse && (
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors outline-none cursor-pointer shrink-0 ${
              activeTab === 'preview'
                ? 'text-indigo-500 border-b-2 border-indigo-500 font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>HTML Preview</span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('headers')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors outline-none cursor-pointer shrink-0 ${
            activeTab === 'headers'
              ? 'text-indigo-500 border-b-2 border-indigo-500 font-semibold'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <List className="h-3.5 w-3.5" />
          <span>Headers ({headerCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium transition-colors outline-none cursor-pointer shrink-0 ${
            activeTab === 'ai'
              ? isSuccess
                ? 'text-purple-500 border-b-2 border-purple-500 font-bold'
                : 'text-rose-500 border-b-2 border-rose-500 font-bold'
              : isSuccess
                ? 'text-[var(--text-secondary)] hover:text-purple-500'
                : 'text-[var(--text-secondary)] hover:text-rose-500'
          }`}
        >
          {isSuccess ? (
            <>
              <Sparkles className="h-3.5 w-3.5 text-purple-500" />
              <span>AI Explanation</span>
            </>
          ) : (
            <>
              <Bug className="h-3.5 w-3.5 text-rose-500" />
              <span>Debug with AI</span>
            </>
          )}
        </button>
      </div>

      {/* Main Tab Views */}
      <div className="w-full">
        {activeTab === 'pretty' && <PrettyJsonViewer data={response.data} />}
        {activeTab === 'raw' && <RawViewer data={response.data} contentType={response.contentType} />}
        {activeTab === 'preview' && isHtmlResponse && (
          <div className="flex flex-col bg-[var(--card-bg)] rounded-b-lg border-t border-[var(--border-color)] overflow-hidden">
            <div className="p-2 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] text-[11px] text-[var(--text-muted)] font-mono flex items-center justify-between px-4">
              <span>Rendered HTML Output</span>
            </div>
            <div className="w-full h-[400px] bg-white">
              <iframe
                title="HTML Response Preview"
                srcDoc={typeof response.data === 'string' ? response.data : String(response.data)}
                sandbox="allow-same-origin"
                className="w-full h-full border-none"
              />
            </div>
          </div>
        )}
        {activeTab === 'headers' && <HeaderTable headers={response.headers} />}
        {activeTab === 'ai' && <AiExplanation />}
      </div>
    </div>
  );
};
