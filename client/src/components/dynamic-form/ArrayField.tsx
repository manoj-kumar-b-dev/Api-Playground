import React from 'react';
import type { FieldComponentProps } from './TextField';
import { FieldLabel } from './FieldLabel';
import { FieldDescription } from './FieldDescription';
import { ValidationMessage } from './ValidationMessage';
import { FieldRenderer } from './FieldRenderer';
import { Plus, Trash2, ArrowUp, ArrowDown, ListFilter } from 'lucide-react';
import type { FieldDefinition } from '../../types/dynamicForm.types';

export const ArrayField: React.FC<FieldComponentProps> = ({ definition, value, onChange, error }) => {
  const itemsList: any[] = Array.isArray(value) ? value : [];
  const itemDef = definition.itemDefinition || ({
    id: `${definition.id}_item`,
    name: 'item',
    path: `${definition.path}[i]`,
    type: 'text',
    label: 'Item',
    required: false,
    placeholder: 'Enter item value',
  } as FieldDefinition);

  const handleAddItem = () => {
    const defaultNewVal = itemDef.type === 'object' ? {} : itemDef.type === 'number' ? 0 : '';
    onChange([...itemsList, defaultNewVal]);
  };

  const handleRemoveItem = (index: number) => {
    const updated = itemsList.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= itemsList.length) return;
    const updated = [...itemsList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  const handleItemChange = (index: number, itemVal: any) => {
    const updated = [...itemsList];
    updated[index] = itemVal;
    onChange(updated);
  };

  return (
    <div className="border border-[var(--border-color)] rounded-xl bg-[var(--bg-secondary)] p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center space-x-2">
          <ListFilter className="w-4 h-4 text-emerald-500" />
          <FieldLabel label={definition.label} required={definition.required} className="mb-0 text-emerald-400" />
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full font-mono">
            {itemsList.length} items
          </span>
        </div>
        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center space-x-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Item</span>
        </button>
      </div>

      <FieldDescription description={definition.description} />

      {itemsList.length === 0 ? (
        <div className="text-center py-4 text-xs text-[var(--text-muted)] italic border border-dashed border-[var(--border-color)] rounded-lg">
          No items added yet. Click "Add Item" to add an entry.
        </div>
      ) : (
        <div className="space-y-3">
          {itemsList.map((itemVal, idx) => (
            <div
              key={idx}
              className="p-3 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg flex items-start space-x-3 group"
            >
              {/* Index Badge */}
              <span className="text-[10px] font-mono text-[var(--text-muted)] bg-[var(--bg-tertiary)] px-2 py-1 rounded mt-1">
                #{idx + 1}
              </span>

              {/* Item Field */}
              <div className="flex-1">
                <FieldRenderer
                  definition={{
                    ...itemDef,
                    label: itemDef.type === 'object' ? `${itemDef.label || 'Item'} #${idx + 1}` : '',
                    id: `${definition.id}_${idx}`,
                  }}
                  value={itemVal}
                  onChange={(newVal) => handleItemChange(idx, newVal)}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-1 pt-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => handleMoveItem(idx, 'up')}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 rounded transition"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  disabled={idx === itemsList.length - 1}
                  onClick={() => handleMoveItem(idx, 'down')}
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-30 rounded transition"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(idx)}
                  className="p-1 text-[var(--text-muted)] hover:text-red-500 rounded transition"
                  title="Remove Item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ValidationMessage error={error} />
    </div>
  );
};
