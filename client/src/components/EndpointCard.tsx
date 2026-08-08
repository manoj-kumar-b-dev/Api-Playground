import React from "react";
import type { EndpointData } from "../service/endpointService";
import { FavoriteButton } from "./FavoriteButton";
import { Play, Copy, Edit2, Trash2 } from "lucide-react";

interface EndpointCardProps {
  endpoint: EndpointData;
  onSelect?: (endpoint: EndpointData) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onEdit: (endpoint: EndpointData) => void;
  onDelete: (endpoint: EndpointData) => void;
  isFavoriting?: boolean;
}

export const getMethodBadgeColor = (method: string) => {
  switch (method?.toUpperCase()) {
    case "GET":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/30";
    case "POST":
      return "bg-sky-500/10 text-sky-500 border-sky-500/30";
    case "PUT":
      return "bg-amber-500/10 text-amber-500 border-amber-500/30";
    case "DELETE":
      return "bg-red-500/10 text-red-500 border-red-500/30";
    case "PATCH":
      return "bg-purple-500/10 text-purple-500 border-purple-500/30";
    default:
      return "bg-[var(--bg-tertiary)] text-[var(--text-secondary)] border-[var(--border-color)]";
  }
};

export const EndpointCard: React.FC<EndpointCardProps> = ({
  endpoint,
  onSelect,
  onToggleFavorite,
  onDuplicate,
  onEdit,
  onDelete,
  isFavoriting = false,
}) => {
  const method = endpoint.request?.method || "GET";
  const url = endpoint.request?.url || "https://api.example.com";

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-indigo-500/40 rounded-xl p-4 transition-all hover:shadow-lg flex items-center justify-between gap-4 group">
      <div
        className="flex items-center gap-3.5 min-w-0 flex-1 cursor-pointer"
        onClick={() => onSelect && onSelect(endpoint)}
      >
        {/* Method Badge */}
        <span
          className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border shrink-0 ${getMethodBadgeColor(
            method
          )}`}
        >
          {method}
        </span>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors truncate">
              {endpoint.name}
            </h4>
            {endpoint.tags && endpoint.tags.length > 0 && (
              <div className="hidden sm:flex items-center gap-1">
                {endpoint.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] text-[10px] text-[var(--text-secondary)] border border-[var(--border-color)]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <p className="text-xs font-mono text-[var(--text-secondary)] truncate mt-0.5">
            {url}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <FavoriteButton
          isFavorite={endpoint.favorite}
          isLoading={isFavoriting}
          onToggle={(e) => {
            e.stopPropagation();
            onToggleFavorite(endpoint._id);
          }}
          size="sm"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(endpoint._id);
          }}
          title="Duplicate Request"
          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(endpoint);
          }}
          title="Edit Request"
          className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(endpoint);
          }}
          title="Delete Request"
          className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>

        {onSelect && (
          <button
            onClick={() => onSelect(endpoint)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-indigo-600/20 cursor-pointer ml-1"
          >
            <Play className="w-3 h-3 fill-current" />
            <span className="hidden sm:inline">Open</span>
          </button>
        )}
      </div>
    </div>
  );
};
