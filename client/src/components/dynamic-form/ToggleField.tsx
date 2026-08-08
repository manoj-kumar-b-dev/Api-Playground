import React from 'react';
import type { FieldComponentProps } from './TextField';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';

export const ToggleField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  const isChecked = Boolean(value);

  return (
    <div className="space-y-1 py-1">
      <div className="flex items-center justify-between">
        <FieldLabel label={definition.label} required={definition.required} htmlFor={definition.id} className="mb-0" />
        <button
          id={definition.id}
          type="button"
          disabled={definition.readOnly}
          onClick={() => onChange(!isChecked)}
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            isChecked ? 'bg-indigo-600' : 'bg-gray-700'
          } ${definition.readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <span
            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isChecked ? 'translate-x-4' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      <FieldDescription description={definition.description} />
      <ValidationMessage error={error} />
    </div>
  );
};
