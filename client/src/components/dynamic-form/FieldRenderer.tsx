import React from 'react';
import type { FieldDefinition } from '../../types/dynamicForm.types';
import { fieldRegistry } from './FieldRegistry';

interface FieldRendererProps {
  definition: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export const FieldRenderer: React.FC<FieldRendererProps> = ({ definition, value, onChange, error }) => {
  const Component = fieldRegistry.get(definition.type);
  return <Component definition={definition} value={value} onChange={onChange} error={error} />;
};
