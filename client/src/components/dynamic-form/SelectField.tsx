import React from 'react';
import type { FieldComponentProps } from './TextField';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';

export const SelectField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  const options = definition.options || [];

  return (
    <div className="space-y-1">
      <FieldLabel label={definition.label} required={definition.required} htmlFor={definition.id} />
      <select
        id={definition.id}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={definition.readOnly}
        className={`w-full bg-[var(--input-bg)] border rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none transition ${
          error ? 'border-red-500 focus:border-red-500' : 'border-[var(--input-border)] focus:border-indigo-500'
        } ${definition.readOnly ? 'opacity-60 cursor-not-allowed bg-[var(--bg-tertiary)]' : ''}`}
      >
        <option value="" disabled className="bg-[var(--bg-primary)] text-[var(--text-muted)]">
          {definition.placeholder || 'Select option...'}
        </option>
        {options.map((opt) => (
          <option key={String(opt)} value={String(opt)} className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
            {String(opt)}
          </option>
        ))}
      </select>
      <FieldDescription description={definition.description} />
      <ValidationMessage error={error} />
    </div>
  );
};
