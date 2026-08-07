import React, { useState } from "react";
import type { FolderData } from "../service/folderService";
import type { EndpointData } from "../service/endpointService";
import { getMethodBadgeColor } from "./EndpointCard";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  FileCode,
} from "lucide-react";

interface FolderTreeProps {
  folders: FolderData[];
  rootEndpoints?: EndpointData[];
  onSelectEndpoint: (endpoint: EndpointData) => void;
  onAddSubfolder: (parentFolderId: string) => void;
  onAddEndpoint: (folderId: string | null) => void;
  onRenameFolder: (folder: FolderData) => void;
  onDeleteFolder: (folder: FolderData) => void;
  isSelectionMode?: boolean;
  selectedFolderIds?: string[];
  selectedEndpointIds?: string[];
  onToggleSelectFolder?: (folderId: string) => void;
  onToggleSelectEndpoint?: (endpointId: string) => void;
}

const FolderNode: React.FC<{
  folder: FolderData;
  onSelectEndpoint: (endpoint: EndpointData) => void;
  onAddSubfolder: (parentFolderId: string) => void;
  onAddEndpoint: (folderId: string | null) => void;
  onRenameFolder: (folder: FolderData) => void;
  onDeleteFolder: (folder: FolderData) => void;
  isSelectionMode?: boolean;
  selectedFolderIds?: string[];
  selectedEndpointIds?: string[];
  onToggleSelectFolder?: (folderId: string) => void;
  onToggleSelectEndpoint?: (endpointId: string) => void;
}> = ({
  folder,
  onSelectEndpoint,
  onAddSubfolder,
  onAddEndpoint,
  onRenameFolder,
  onDeleteFolder,
  isSelectionMode = false,
  selectedFolderIds = [],
  selectedEndpointIds = [],
  onToggleSelectFolder,
  onToggleSelectEndpoint,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  const isFolderSelected = selectedFolderIds.includes(folder._id);

  return (
    <div className="space-y-1">
      {/* Folder Header Row */}
      <div
        className={`flex items-center justify-between p-2 rounded-lg transition-colors group cursor-pointer text-xs font-medium ${
          isFolderSelected
            ? "bg-indigo-600/15 border border-indigo-500/40 text-white"
            : "hover:bg-slate-800/60 text-slate-200"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isSelectionMode && onToggleSelectFolder && (
            <input
              type="checkbox"
              checked={isFolderSelected}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelectFolder(folder._id);
              }}
              onClick={(e) => e.stopPropagation()}
              className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
            />
          )}

          <div
            className="flex items-center gap-2 min-w-0 flex-1"
            onClick={() => {
              if (isSelectionMode && onToggleSelectFolder) {
                onToggleSelectFolder(folder._id);
              } else {
                setIsOpen(!isOpen);
              }
            }}
          >
            {isOpen ? (
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            {isOpen ? (
              <FolderOpen className="w-4 h-4 text-indigo-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-indigo-400 shrink-0" />
            )}
            <span className="truncate">{folder.name}</span>
          </div>
        </div>

        {/* Hover Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddEndpoint(folder._id);
            }}
            title="Add Endpoint in this folder"
            className="p-1 hover:text-indigo-400 hover:bg-slate-700/60 rounded transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddSubfolder(folder._id);
            }}
            title="Create Subfolder"
            className="p-1 hover:text-indigo-400 hover:bg-slate-700/60 rounded transition-colors"
          >
            <Folder className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRenameFolder(folder);
            }}
            title="Rename Folder"
            className="p-1 hover:text-slate-200 hover:bg-slate-700/60 rounded transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder(folder);
            }}
            title="Delete Folder"
            className="p-1 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Child Folders & Endpoints */}
      {isOpen && (
        <div className="pl-4 border-l border-slate-800 space-y-1 ml-3">
          {folder.folders &&
            folder.folders.map((subfolder) => (
              <FolderNode
                key={subfolder._id}
                folder={subfolder}
                onSelectEndpoint={onSelectEndpoint}
                onAddSubfolder={onAddSubfolder}
                onAddEndpoint={onAddEndpoint}
                onRenameFolder={onRenameFolder}
                onDeleteFolder={onDeleteFolder}
                isSelectionMode={isSelectionMode}
                selectedFolderIds={selectedFolderIds}
                selectedEndpointIds={selectedEndpointIds}
                onToggleSelectFolder={onToggleSelectFolder}
                onToggleSelectEndpoint={onToggleSelectEndpoint}
              />
            ))}

          {folder.endpoints &&
            folder.endpoints.map((ep) => {
              const isEpSelected = selectedEndpointIds.includes(ep._id);
              return (
                <div
                  key={ep._id}
                  onClick={() => {
                    if (isSelectionMode && onToggleSelectEndpoint) {
                      onToggleSelectEndpoint(ep._id);
                    } else {
                      onSelectEndpoint(ep);
                    }
                  }}
                  className={`flex items-center justify-between p-1.5 rounded-lg transition-colors cursor-pointer text-xs group ${
                    isEpSelected
                      ? "bg-indigo-600/15 border border-indigo-500/40"
                      : "hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {isSelectionMode && onToggleSelectEndpoint && (
                      <input
                        type="checkbox"
                        checked={isEpSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onToggleSelectEndpoint(ep._id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                      />
                    )}
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border ${getMethodBadgeColor(
                        ep.request?.method || "GET"
                      )}`}
                    >
                      {ep.request?.method || "GET"}
                    </span>
                    <span className="text-slate-300 group-hover:text-indigo-400 transition-colors truncate">
                      {ep.name}
                    </span>
                  </div>
                </div>
              );
            })}

          {(!folder.folders || folder.folders.length === 0) &&
            (!folder.endpoints || folder.endpoints.length === 0) && (
              <div className="py-2 text-[11px] text-slate-500 italic">Empty folder</div>
            )}
        </div>
      )}
    </div>
  );
};

export const FolderTree: React.FC<FolderTreeProps> = ({
  folders,
  rootEndpoints = [],
  onSelectEndpoint,
  onAddSubfolder,
  onAddEndpoint,
  onRenameFolder,
  onDeleteFolder,
  isSelectionMode = false,
  selectedFolderIds = [],
  selectedEndpointIds = [],
  onToggleSelectFolder,
  onToggleSelectEndpoint,
}) => {
  return (
    <div className="space-y-2">
      {/* Root Level Add Actions */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400 border-b border-slate-800/80 pb-2">
        <span className="font-semibold text-slate-300">Collection Hierarchy</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAddSubfolder("")}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-[11px] transition-colors cursor-pointer"
          >
            <Folder className="w-3 h-3 text-indigo-400" />
            <span>New Folder</span>
          </button>
          <button
            onClick={() => onAddEndpoint(null)}
            className="flex items-center gap-1 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[11px] font-medium transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>New Endpoint</span>
          </button>
        </div>
      </div>

      {/* Render Root Level Folders */}
      {folders.map((folder) => (
        <FolderNode
          key={folder._id}
          folder={folder}
          onSelectEndpoint={onSelectEndpoint}
          onAddSubfolder={onAddSubfolder}
          onAddEndpoint={onAddEndpoint}
          onRenameFolder={onRenameFolder}
          onDeleteFolder={onDeleteFolder}
          isSelectionMode={isSelectionMode}
          selectedFolderIds={selectedFolderIds}
          selectedEndpointIds={selectedEndpointIds}
          onToggleSelectFolder={onToggleSelectFolder}
          onToggleSelectEndpoint={onToggleSelectEndpoint}
        />
      ))}

      {/* Render Root Level Endpoints */}
      {rootEndpoints.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60 space-y-1">
          <span className="text-[11px] font-medium text-slate-500 px-2 uppercase tracking-wider">
            Root Endpoints
          </span>
          {rootEndpoints.map((ep) => {
            const isEpSelected = selectedEndpointIds.includes(ep._id);
            return (
              <div
                key={ep._id}
                onClick={() => {
                  if (isSelectionMode && onToggleSelectEndpoint) {
                    onToggleSelectEndpoint(ep._id);
                  } else {
                    onSelectEndpoint(ep);
                  }
                }}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer text-xs group ${
                  isEpSelected
                    ? "bg-indigo-600/15 border border-indigo-500/40"
                    : "hover:bg-slate-800"
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {isSelectionMode && onToggleSelectEndpoint && (
                    <input
                      type="checkbox"
                      checked={isEpSelected}
                      onChange={(e) => {
                        e.stopPropagation();
                        onToggleSelectEndpoint(ep._id);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                    />
                  )}
                  <FileCode className="w-3.5 h-3.5 text-slate-500" />
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border ${getMethodBadgeColor(
                      ep.request?.method || "GET"
                    )}`}
                  >
                    {ep.request?.method || "GET"}
                  </span>
                  <span className="text-slate-300 group-hover:text-indigo-400 transition-colors truncate">
                    {ep.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {folders.length === 0 && rootEndpoints.length === 0 && (
        <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg">
          No folders or endpoints yet. Click above to create one.
        </div>
      )}
    </div>
  );
};
