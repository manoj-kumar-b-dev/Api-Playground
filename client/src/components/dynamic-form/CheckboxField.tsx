import React from 'react';
import type { FieldComponentProps } from './TextField';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';

export const CheckboxField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  return (
    <div className="space-y-1 py-1">
      <div className="flex items-center space-x-2">
        <input
          id={definition.id}
          type="checkbox"
          checked={Boolean(value)}
          onChange={(e) => onChange(e.target.checked)}
          disabled={definition.readOnly}
          className="w-4 h-4 text-indigo-600 bg-[var(--input-bg)] border-[var(--input-border)] rounded focus:ring-indigo-500 cursor-pointer"
        />
        <FieldLabel label={definition.label} required={definition.required} htmlFor={definition.id} className="mb-0 cursor-pointer" />
      </div>
      <FieldDescription description={definition.description} />
      <ValidationMessage error={error} />
    </div>
  );
};
