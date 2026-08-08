import React from 'react';
import type { FieldDefinition } from '../../types/dynamicForm.types';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';

export interface FieldComponentProps {
  definition: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const TextField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  const inputType = definition.type === 'password' ? 'password' : definition.type === 'email' ? 'email' : definition.type === 'url' ? 'url' : 'text';

  return (
    <div className="space-y-1">
      <FieldLabel label={definition.label} required={definition.required} htmlFor={definition.id} />
      <input
        id={definition.id}
        type={inputType}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={definition.readOnly}
        placeholder={definition.placeholder}
        className={`w-full bg-[var(--input-bg)] border rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none transition ${
          error
            ? 'border-red-500 focus:border-red-500'
            : 'border-[var(--input-border)] focus:border-indigo-500'
        } ${definition.readOnly ? 'opacity-60 cursor-not-allowed bg-[var(--bg-tertiary)]' : ''}`}
      />
      <FieldDescription description={definition.description} />
      <ValidationMessage error={error} />
    </div>
  );
};
