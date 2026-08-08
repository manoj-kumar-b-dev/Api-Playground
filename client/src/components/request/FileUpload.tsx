import React, { useRef, useState } from 'react';
import { UploadCloud, File, X, Check } from 'lucide-react';
import { formatBytes } from '../../utils/requestBuilder';

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void;
  accept?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  selectedFile,
  onFileSelect,
  accept = '*/*',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {selectedFile ? (
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-700/70 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded bg-indigo-500/10 text-indigo-400">
              <File className="h-5 w-5" />
            </div>
            <div className="truncate">
              <p className="font-semibold text-slate-100 truncate">{selectedFile.name}</p>
              <p className="text-[11px] text-slate-400 font-mono">
                {formatBytes(selectedFile.size)} • {selectedFile.type || 'Binary File'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
              <Check className="h-3 w-3" /> Ready
            </span>
            <button
              type="button"
              onClick={() => onFileSelect(null)}
              className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Remove File"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-950/20'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-900/40'
          }`}
        >
          <UploadCloud className="h-8 w-8 text-indigo-400 mb-2 animate-bounce" />
          <p className="text-xs font-semibold text-slate-200">
            Click to browse or drop file here
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            Supports documents, images, zip files, or binary data
          </p>
        </div>
      )}
    </div>
  );
};
