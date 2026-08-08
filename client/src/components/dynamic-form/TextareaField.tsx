import React from 'react';
import type { FieldComponentProps } from './TextField';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';

export const TextareaField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  return (
    <div className="space-y-1">
      <FieldLabel label={definition.label} required={definition.required} htmlFor={definition.id} />
      <textarea
        id={definition.id}
        rows={4}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={definition.readOnly}
        placeholder={definition.placeholder}
        className={`w-full bg-[var(--input-bg)] border rounded-lg p-3 text-xs font-mono text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition resize-y ${
          error ? 'border-red-500 focus:border-red-500' : 'border-[var(--input-border)] focus:border-indigo-500'
        } ${definition.readOnly ? 'opacity-60 cursor-not-allowed bg-[var(--bg-tertiary)]' : ''}`}
      />
      <FieldDescription description={definition.description} />
      <ValidationMessage error={error} />
    </div>
  );
};
