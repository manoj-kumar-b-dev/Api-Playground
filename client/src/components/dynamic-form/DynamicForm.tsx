import React, { useState } from 'react';
import { useDynamicFormStore } from '../../stores/useDynamicFormStore';
import { FormRenderer } from './FormRenderer';
import { RequestPreviewModal } from './RequestPreviewModal';
import { ResponseViewer } from '../response/ResponseViewer';
import { getMethodBadgeColor } from '../EndpointCard';
import {
  Sparkles,
  RotateCcw,
  Send,
  Eye,
  Copy,
  Server,
  Layers,
  FileCode2,
  Check,
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const DynamicForm: React.FC = () => {
  const {
    endpoints,
    selectedEndpointKey,
    formDefinition,
    formValues,
    validationErrors,
    baseUrl,
    servers,
    isSubmitting,
    response,
    selectEndpoint,
    setFieldValue,
    populateExamples,
    resetForm,
    setBaseUrl,
    executeRequest,
  } = useDynamicFormStore();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  const handleCopyJson = () => {
    const jsonStr = JSON.stringify(formValues.body || {}, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopiedJson(true);
    toast.success('Form JSON body copied to clipboard!');
    setTimeout(() => setCopiedJson(false), 2000);
  };

  if (!formDefinition) {
    return (
      <div className="p-8 text-center bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl space-y-3">
        <FileCode2 className="w-10 h-10 text-[var(--text-muted)] mx-auto" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">No Endpoint Selected</h3>
        <p className="text-xs text-[var(--text-muted)]">
          Please load or select an OpenAPI / Swagger endpoint to generate dynamic form fields.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Endpoint Selector Bar */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${getMethodBadgeColor(
                formDefinition.endpoint.method
              )}`}
            >
              {formDefinition.endpoint.method}
            </span>
            <div>
              <h2 className="text-base font-semibold text-[var(--text-primary)]">
                {formDefinition.endpoint.summary || formDefinition.endpoint.path}
              </h2>
              <p className="text-xs font-mono text-[var(--text-muted)]">{formDefinition.endpoint.path}</p>
            </div>
          </div>

          {/* Endpoint Dropdown Selector */}
          {endpoints.length > 1 && (
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <select
                value={selectedEndpointKey || ''}
                onChange={(e) => {
                  const [method, ...pathParts] = e.target.value.split(' ');
                  selectEndpoint(pathParts.join(' '), method);
                }}
                className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500"
              >
                {endpoints.map((ep) => (
                  <option
                    key={`${ep.method}_${ep.path}`}
                    value={`${ep.method} ${ep.path}`}
                    className="bg-[var(--bg-primary)] text-[var(--text-primary)]"
                  >
                    {ep.method} {ep.path} - {ep.summary}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Base URL & Target Server Selection */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex items-center space-x-2 text-xs font-medium text-[var(--text-secondary)] flex-shrink-0">
            <Server className="w-4 h-4 text-indigo-500" />
            <span>Target Base Server:</span>
          </div>
          {servers.length > 1 ? (
            <select
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 flex-1"
            >
              {servers.map((srv) => (
                <option key={srv} value={srv} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
                  {srv}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://api.example.com"
              className="bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg px-3 py-1.5 text-xs font-mono text-[var(--text-primary)] focus:outline-none focus:border-indigo-500 flex-1"
            />
          )}
        </div>
      </div>

      {/* Dynamic Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={populateExamples}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Fill Examples</span>
          </button>

          <button
            type="button"
            onClick={resetForm}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Form</span>
          </button>

          <button
            type="button"
            onClick={handleCopyJson}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg text-xs font-medium transition cursor-pointer"
          >
            {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedJson ? 'Copied!' : 'Copy JSON'}</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/20 rounded-lg text-xs font-medium transition cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Preview Request</span>
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={executeRequest}
            className="flex items-center space-x-2 px-5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white rounded-lg text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isSubmitting ? 'Sending...' : 'Send Request'}</span>
          </button>
        </div>
      </div>

      {/* Main Dynamic Form Fields */}
      <FormRenderer
        formDefinition={formDefinition}
        formValues={formValues}
        validationErrors={validationErrors}
        onChange={setFieldValue}
      />

      {/* Live Response Panel */}
      {response && (
        <div className="pt-4 border-t border-[var(--border-color)] space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
            <div className="flex items-center space-x-3">
              {response.isError ? (
                <XCircle className="w-5 h-5 text-red-500" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              )}
              <span className={`text-xs font-bold ${response.isError ? 'text-red-500' : 'text-emerald-500'}`}>
                Status: {response.status} {response.statusText}
              </span>
            </div>
            <div className="flex items-center space-x-1 text-xs text-[var(--text-muted)] font-mono">
              <Clock className="w-3.5 h-3.5" />
              <span>{response.responseTime} ms</span>
            </div>
          </div>

          <ResponseViewer
            response={(() => {
              const dataStr = typeof response.data === 'object' ? JSON.stringify(response.data) : String(response.data || '');
              const size = new Blob([dataStr]).size;
              const sizeFormatted = size > 1024 ? `${(size / 1024).toFixed(2)} KB` : `${size} B`;
              const isJson = typeof response.data === 'object';
              const contentType = response.headers?.['content-type'] || (isJson ? 'application/json' : 'text/plain');

              return {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers || {},
                data: response.data,
                time: response.responseTime,
                size,
                sizeFormatted,
                contentType,
                isJson,
              };
            })()}
            error={response.isError ? { message: String(response.data || 'Request failed') } : null}
            loading={isSubmitting}
          />
        </div>
      )}

      {/* Preview Modal */}
      <RequestPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        formDefinition={formDefinition}
        formValues={formValues}
        baseUrl={baseUrl}
      />
    </div>
  );
};
