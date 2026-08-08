import React from 'react';
import type { FieldComponentProps } from './TextField';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';
import { Upload, File as FileIcon, X } from 'lucide-react';

export const FileUploadField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  const file: File | null = value instanceof File ? value : null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onChange(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange(null);
  };

  return (
    <div className="space-y-1">
      <FieldLabel label={definition.label} required={definition.required} htmlFor={definition.id} />
      {file ? (
        <div className="flex items-center justify-between p-2.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg">
          <div className="flex items-center space-x-2 truncate">
            <FileIcon className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            <span className="text-xs text-[var(--text-primary)] font-medium truncate">{file.name}</span>
            <span className="text-[10px] text-[var(--text-muted)]">({(file.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <label className="flex items-center justify-center space-x-2 border-2 border-dashed border-[var(--border-color)] hover:border-indigo-500/50 rounded-lg p-3 cursor-pointer transition bg-[var(--input-bg)]">
          <Upload className="w-4 h-4 text-[var(--text-muted)]" />
          <span className="text-xs text-[var(--text-secondary)] font-medium">Choose file to upload</span>
          <input id={definition.id} type="file" onChange={handleFileChange} disabled={definition.readOnly} className="hidden" />
        </label>
      )}
      <FieldDescription description={definition.description} />
      <ValidationMessage error={error} />
    </div>
  );
};
