import React from 'react';
import type { FieldComponentProps } from './TextField';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';

export const DateField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  const isDateTime = definition.type === 'datetime';
  const inputType = isDateTime ? 'datetime-local' : 'date';

  return (
    <div className="space-y-1">
      <FieldLabel label={definition.label} required={definition.required} htmlFor={definition.id} />
      <input
        id={definition.id}
        type={inputType}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={definition.readOnly}
        className={`w-full bg-[var(--input-bg)] border rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none transition ${
          error ? 'border-red-500 focus:border-red-500' : 'border-[var(--input-border)] focus:border-indigo-500'
        } ${definition.readOnly ? 'opacity-60 cursor-not-allowed bg-[var(--bg-tertiary)]' : ''}`}
      />
      <FieldDescription description={definition.description} />
      <ValidationMessage error={error} />
    </div>
  );
};
