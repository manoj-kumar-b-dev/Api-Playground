import React, { useState } from 'react';
import { X, Copy, Check, Code, Terminal, Server } from 'lucide-react';
import toast from 'react-hot-toast';
import { dynamicRequestBuilder } from '../../services/dynamicRequestBuilder';
import type { FormDefinition } from '../../types/dynamicForm.types';

interface RequestPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  formDefinition: FormDefinition;
  formValues: Record<string, any>;
  baseUrl: string;
}

export const RequestPreviewModal: React.FC<RequestPreviewModalProps> = ({
  isOpen,
  onClose,
  formDefinition,
  formValues,
  baseUrl,
}) => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'curl' | 'json' | 'request'>('curl');

  if (!isOpen) return null;

  const builtReq = dynamicRequestBuilder.buildRequest(formDefinition, formValues, baseUrl);
  const jsonPreview = JSON.stringify(formValues.body || {}, null, 2);

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTab(type);
    toast.success(`Copied ${type} to clipboard!`);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden text-[var(--text-primary)] animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-secondary)]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-500 rounded-lg border border-indigo-500/20">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">Generated Request Preview</h2>
              <p className="text-xs text-[var(--text-secondary)] font-mono">{builtReq.fullUrl}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[var(--border-color)] bg-[var(--bg-secondary)] px-6 pt-2 space-x-2">
          <button
            onClick={() => setActiveTab('curl')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'curl'
                ? 'border-indigo-500 text-indigo-500 bg-[var(--card-bg)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>cURL Command</span>
          </button>

          <button
            onClick={() => setActiveTab('json')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-500 bg-[var(--card-bg)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Code className="w-4 h-4" />
            <span>JSON Body</span>
          </button>

          <button
            onClick={() => setActiveTab('request')}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 cursor-pointer ${
              activeTab === 'request'
                ? 'border-indigo-500 text-indigo-500 bg-[var(--card-bg)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>Parsed Components</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[var(--bg-primary)]">
          {activeTab === 'curl' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(builtReq.curlCommand, 'cURL')}
                className="absolute top-3 right-3 p-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-xs text-[var(--text-primary)] rounded-md border border-[var(--border-color)] flex items-center space-x-1.5 transition cursor-pointer"
              >
                {copiedTab === 'cURL' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTab === 'cURL' ? 'Copied!' : 'Copy cURL'}</span>
              </button>
              <pre className="bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--input-border)] text-xs font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {builtReq.curlCommand}
              </pre>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(jsonPreview, 'JSON')}
                className="absolute top-3 right-3 p-2 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-xs text-[var(--text-primary)] rounded-md border border-[var(--border-color)] flex items-center space-x-1.5 transition cursor-pointer"
              >
                {copiedTab === 'JSON' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedTab === 'JSON' ? 'Copied!' : 'Copy JSON'}</span>
              </button>
              <pre className="bg-[var(--input-bg)] p-4 rounded-xl border border-[var(--input-border)] text-xs font-mono text-indigo-300 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {jsonPreview}
              </pre>
            </div>
          )}

          {activeTab === 'request' && (
            <div className="space-y-4">
              <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl space-y-2">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Final Resolved URL</h4>
                <p className="text-xs font-mono text-[var(--text-primary)] bg-[var(--input-bg)] p-2.5 rounded-lg border border-[var(--input-border)] break-all">
                  {builtReq.fullUrl}
                </p>
              </div>

              <div className="p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl space-y-2">
                <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Request Headers ({builtReq.headers.length})</h4>
                {builtReq.headers.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] italic">No headers defined</p>
                ) : (
                  <div className="space-y-1 font-mono text-xs">
                    {builtReq.headers.map((h, i) => (
                      <div key={i} className="flex justify-between p-2 bg-[var(--card-bg)] rounded border border-[var(--border-color)]">
                        <span className="text-indigo-400">{h.key}</span>
                        <span className="text-[var(--text-primary)]">{h.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-[var(--border-color)] bg-[var(--bg-secondary)] space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] rounded-lg border border-[var(--border-color)] transition cursor-pointer"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
