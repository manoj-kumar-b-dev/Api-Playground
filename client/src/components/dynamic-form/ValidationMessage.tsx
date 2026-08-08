import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ValidationMessageProps {
  error?: string;
}

export const ValidationMessage: React.FC<ValidationMessageProps> = ({ error }) => {
  if (!error) return null;
  return (
    <div className="flex items-center space-x-1.5 text-xs text-red-500 mt-1 animate-in fade-in duration-150">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="font-medium">{error}</span>
    </div>
  );
};
