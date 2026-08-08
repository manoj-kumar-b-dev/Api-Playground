import React from 'react';
import { RequiredIndicator } from './RequiredIndicator';

interface FieldLabelProps {
  label: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export const FieldLabel: React.FC<FieldLabelProps> = ({ label, required, htmlFor, className = '' }) => {
  if (!label) return null;
  return (
    <label htmlFor={htmlFor} className={`block text-xs font-semibold text-[var(--text-primary)] mb-1 ${className}`}>
      <span>{label}</span>
      {required && <RequiredIndicator />}
    </label>
  );
};
