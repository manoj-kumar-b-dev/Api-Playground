import React from 'react';
import type { FieldComponentProps } from './TextField';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';
import { FieldRenderer } from './FieldRenderer';
import { GitMerge } from 'lucide-react';
import { useDynamicFormStore } from '../../stores/useDynamicFormStore';

export const PolymorphicField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  const variants = definition.variants || [];
  const activeIdx = definition.selectedVariantIndex || 0;
  const activeVariant = variants[activeIdx] || variants[0];
  const setPolymorphicVariant = useDynamicFormStore((s) => s.setPolymorphicVariant);

  const handleVariantSelect = (idx: number) => {
    setPolymorphicVariant(definition.path, idx);
    onChange(undefined);
  };

  return (
    <div className="border border-purple-500/30 rounded-xl bg-[var(--bg-secondary)] p-4 space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-2">
          <GitMerge className="w-4 h-4 text-purple-400" />
          <FieldLabel label={definition.label} required={definition.required} className="mb-0 text-purple-300" />
        </div>
        <span className="text-[10px] text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded-full">
          oneOf / anyOf Polymorphic
        </span>
      </div>

      <FieldDescription description={definition.description} />

      {/* Variant Selection Tabs */}
      {variants.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-1 bg-[var(--bg-tertiary)] rounded-lg">
          {variants.map((v, idx) => (
            <button
              key={v.id}
              type="button"
              onClick={() => handleVariantSelect(idx)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                activeIdx === idx
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

      {/* Active Variant Form */}
      {activeVariant && (
        <div className="pt-2">
          <FieldRenderer
            definition={activeVariant.definition}
            value={value}
            onChange={onChange}
            error={error}
          />
        </div>
      )}

      <ValidationMessage error={error} />
    </div>
  );
};
