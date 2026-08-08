import React from 'react';
import { Play, Loader2, Square } from 'lucide-react';

interface SendButtonProps {
  onSend: () => void;
  onCancel: () => void;
  loading: boolean;
  disabled?: boolean;
}

export const SendButton: React.FC<SendButtonProps> = ({
  onSend,
  onCancel,
  loading,
  disabled = false,
}) => {
  if (loading) {
    return (
      <button
        type="button"
        onClick={onCancel}
        className="flex items-center justify-center gap-2 rounded-r-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-sm px-5 py-2.5 transition duration-200 shadow-md shadow-rose-900/20 active:scale-95 cursor-pointer"
        title="Cancel Request"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <Square className="h-3 w-3 fill-current" />
        <span>Cancel</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onSend}
      disabled={disabled}
      title="Send Request (Ctrl + Enter)"
      className="flex items-center justify-center gap-2 rounded-r-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-semibold text-sm px-6 py-2.5 transition duration-200 shadow-md shadow-indigo-900/20 active:scale-95 cursor-pointer disabled:cursor-not-allowed disabled:text-slate-500"
    >
      <Play className="h-4 w-4 fill-current" />
      <span>Send</span>
    </button>
  );
};
