import React, { useState } from 'react';
import type {
  BodyMode,
  BodyConfig,
  FormDataParam,
  KeyValuePair,
} from '../../types/request.types';
import { FileUpload } from './FileUpload';
import {
  Code2,
  Plus,
  Trash2,
  CheckSquare,
  Square,
  Wand2,
  AlertCircle,
} from 'lucide-react';

interface BodyEditorProps {
  body: BodyConfig;
  onModeChange: (mode: BodyMode) => void;
  onJsonChange: (json: string) => void;
  onAddFormData: () => void;
  onUpdateFormData: (id: string, field: keyof FormDataParam, value: any) => void;
  onRemoveFormData: (id: string) => void;
  onToggleFormData: (id: string) => void;
  onAddEncoded: () => void;
  onUpdateEncoded: (id: string, field: keyof KeyValuePair, value: any) => void;
  onRemoveEncoded: (id: string) => void;
  onToggleEncoded: (id: string) => void;
  onBinaryFileSelect: (file: File | null) => void;
}

export const BodyEditor: React.FC<BodyEditorProps> = ({
  body,
  onModeChange,
  onJsonChange,
  onAddFormData,
  onUpdateFormData,
  onRemoveFormData,
  onToggleFormData,
  onAddEncoded,
  onUpdateEncoded,
  onRemoveEncoded,
  onToggleEncoded,
  onBinaryFileSelect,
}) => {
  const [jsonError, setJsonError] = useState<string | null>(null);

  const modes: { id: BodyMode; label: string }[] = [
    { id: 'none', label: 'none' },
    { id: 'json', label: 'json' },
    { id: 'formData', label: 'form-data' },
    { id: 'urlencoded', label: 'x-www-form-urlencoded' },
    { id: 'binary', label: 'binary' },
  ];

  const handlePrettifyJson = () => {
    try {
      if (!body.json.trim()) return;
      const parsed = JSON.parse(body.json);
      onJsonChange(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message || 'Invalid JSON syntax');
    }
  };

  const handleTextareaChange = (value: string) => {
    onJsonChange(value);
    if (!value.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(value);
      setJsonError(null);
    } catch (err: any) {
      setJsonError(err.message);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Body Mode Selector */}
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-[var(--text-secondary)] mr-2">Mode:</span>
        {modes.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              body.mode === m.id
                ? 'bg-indigo-600/20 text-indigo-500 border border-indigo-500/40 font-semibold'
                : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:text-[var(--text-primary)]'
            }`}
          >
            <input
              type="radio"
              name="bodyMode"
              value={m.id}
              checked={body.mode === m.id}
              onChange={() => onModeChange(m.id)}
              className="hidden"
            />
            <span>{m.label}</span>
          </label>
        ))}
      </div>

      {/* Mode: None */}
      {body.mode === 'none' && (
        <div className="py-8 text-center text-xs text-[var(--text-muted)] italic">
          This request does not include a body payload.
        </div>
      )}

      {/* Mode: JSON */}
      {body.mode === 'json' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono">
              <Code2 className="h-3.5 w-3.5 text-indigo-500" />
              <span>application/json</span>
            </div>
            <button
              type="button"
              onClick={handlePrettifyJson}
              className="flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-600 bg-indigo-500/10 border border-indigo-500/20 rounded px-2.5 py-1 transition-colors cursor-pointer"
            >
              <Wand2 className="h-3 w-3" />
              <span>Format JSON</span>
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={10}
              value={body.json}
              onChange={(e) => handleTextareaChange(e.target.value)}
              placeholder='{\n  "key": "value"\n}'
              className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg p-3 text-xs text-[var(--text-primary)] font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none leading-relaxed"
            />
            {jsonError && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 rounded px-2.5 py-1.5 font-mono">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{jsonError}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode: Form Data */}
      {body.mode === 'formData' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              Form Data Parameters (multipart/form-data)
            </h5>
            <button
              type="button"
              onClick={onAddFormData}
              className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Field</span>
            </button>
          </div>

          <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
            <table className="w-full text-left text-xs text-[var(--text-primary)]">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] font-mono">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Key</th>
                  <th className="py-2.5 px-3 font-semibold w-24">Type</th>
                  <th className="py-2.5 px-3 font-semibold">Value / File</th>
                  <th className="py-2.5 px-3 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {body.formData.map((param) => (
                  <tr key={param.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleFormData(param.id)}
                        className="text-[var(--text-muted)] hover:text-indigo-500 transition-colors cursor-pointer inline-flex items-center justify-center"
                      >
                        {param.enabled ? (
                          <CheckSquare className="h-4 w-4 text-indigo-500" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => onUpdateFormData(param.id, 'key', e.target.value)}
                        placeholder="Field name"
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <select
                        value={param.type}
                        onChange={(e) => onUpdateFormData(param.id, 'type', e.target.value)}
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2 py-1.5 text-xs text-[var(--text-primary)] font-mono focus:border-indigo-500 outline-none"
                      >
                        <option value="text">Text</option>
                        <option value="file">File</option>
                      </select>
                    </td>
                    <td className="py-2 px-3">
                      {param.type === 'text' ? (
                        <input
                          type="text"
                          value={param.value}
                          onChange={(e) => onUpdateFormData(param.id, 'value', e.target.value)}
                          placeholder="Field value"
                          className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                        />
                      ) : (
                        <input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              onUpdateFormData(param.id, 'file', e.target.files[0]);
                            }
                          }}
                          className="w-full text-xs text-[var(--text-secondary)] file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-medium file:bg-[var(--bg-tertiary)] file:text-[var(--text-primary)] hover:file:bg-[var(--bg-hover)]"
                        />
                      )}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveFormData(param.id)}
                        className="text-[var(--text-muted)] hover:text-rose-500 transition-colors p-1 rounded cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode: x-www-form-urlencoded */}
      {body.mode === 'urlencoded' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
              x-www-form-urlencoded Parameters
            </h5>
            <button
              type="button"
              onClick={onAddEncoded}
              className="flex items-center gap-1.5 text-xs text-indigo-500 hover:text-indigo-600 font-medium transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Key</span>
            </button>
          </div>

          <div className="border border-[var(--border-color)] rounded-lg overflow-hidden bg-[var(--card-bg)]">
            <table className="w-full text-left text-xs text-[var(--text-primary)]">
              <thead className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-b border-[var(--border-color)] font-mono">
                <tr>
                  <th className="py-2.5 px-3 w-10 text-center">Status</th>
                  <th className="py-2.5 px-3 font-semibold">Key</th>
                  <th className="py-2.5 px-3 font-semibold">Value</th>
                  <th className="py-2.5 px-3 w-10 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {body.urlencoded.map((param) => (
                  <tr key={param.id} className="hover:bg-[var(--bg-hover)] transition-colors">
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onToggleEncoded(param.id)}
                        className="text-[var(--text-muted)] hover:text-indigo-500 transition-colors cursor-pointer inline-flex items-center justify-center"
                      >
                        {param.enabled ? (
                          <CheckSquare className="h-4 w-4 text-indigo-500" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => onUpdateEncoded(param.id, 'key', e.target.value)}
                        placeholder="Key"
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => onUpdateEncoded(param.id, 'value', e.target.value)}
                        placeholder="Value"
                        className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded px-2.5 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono focus:border-indigo-500 focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onRemoveEncoded(param.id)}
                        className="text-[var(--text-muted)] hover:text-rose-500 transition-colors p-1 rounded cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mode: Binary */}
      {body.mode === 'binary' && (
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
            Binary Data File
          </h5>
          <FileUpload
            selectedFile={body.binaryFile}
            onFileSelect={onBinaryFileSelect}
          />
        </div>
      )}
    </div>
  );
};
