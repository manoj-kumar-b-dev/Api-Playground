import React from 'react';
import { Globe, X } from 'lucide-react';

interface UrlInputProps {
  url: string;
  onChange: (url: string) => void;
  onEnterKeyPress?: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  url,
  onChange,
  onEnterKeyPress,
  placeholder = 'Enter request URL (e.g. https://api.example.com/users/:id)',
  disabled = false,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onEnterKeyPress) {
      onEnterKeyPress();
    }
  };

  return (
    <div className="relative flex-1">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
        <Globe className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={url}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full bg-[var(--input-bg)] border-t border-b border-[var(--border-color)] py-2.5 pl-9 pr-9 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] font-mono outline-none transition duration-200 focus:bg-[var(--bg-secondary)] focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
      />
      {url && (
        <button
          type="button"
          onClick={() => onChange('')}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          title="Clear URL"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
