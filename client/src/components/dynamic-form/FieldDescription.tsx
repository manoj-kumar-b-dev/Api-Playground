import React from 'react';

interface FieldDescriptionProps {
  description?: string;
  className?: string;
}

export const FieldDescription: React.FC<FieldDescriptionProps> = ({ description, className = '' }) => {
  if (!description) return null;
  return (
    <p className={`text-[11px] text-[var(--text-muted)] mt-1 font-normal leading-relaxed ${className}`}>
      {description}
    </p>
  );
};
