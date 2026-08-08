import React, { useState } from 'react';
import type { FieldComponentProps } from './TextField';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { FieldRenderer } from './FieldRenderer';

export const ObjectField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  const [isOpen, setIsOpen] = useState(true);
  const children = definition.children || [];
  const objValue = typeof value === 'object' && value !== null ? value : {};

  const handleChildChange = (childName: string, childVal: any) => {
    onChange({
      ...objValue,
      [childName]: childVal,
    });
  };

  return (
    <div className="border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] overflow-hidden space-y-0">
      {/* Object Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2.5 flex items-center justify-between bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] transition cursor-pointer border-b border-[var(--border-color)]"
      >
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-500" />
          <FieldLabel label={definition.label} required={definition.required} className="mb-0 text-indigo-400" />
          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full font-mono">
            {children.length} properties
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronRight className="w-4 h-4 text-[var(--text-muted)]" />}
      </button>

      {isOpen && (
        <div className="p-4 space-y-4">
          <FieldDescription description={definition.description} />
          {children.length === 0 ? (
            <p className="text-xs text-[var(--text-muted)] italic">No defined properties for object</p>
          ) : (
            children.map((childDef) => (
              <FieldRenderer
                key={childDef.id}
                definition={childDef}
                value={objValue[childDef.name]}
                onChange={(newVal) => handleChildChange(childDef.name, newVal)}
              />
            ))
          )}
          <ValidationMessage error={error} />
        </div>
      )}
    </div>
  );
};
