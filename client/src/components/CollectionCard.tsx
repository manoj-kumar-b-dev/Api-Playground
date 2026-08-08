import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { CollectionData } from "../service/collectionService";
import { FavoriteButton } from "./FavoriteButton";
import { Layers, Folder, Code2, Edit2, Trash2, ArrowRight } from "lucide-react";

interface CollectionCardProps {
  collection: CollectionData;
  onToggleFavorite: (id: string) => void;
  onEdit: (collection: CollectionData) => void;
  onDelete: (collection: CollectionData) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
  isFavoriting?: boolean;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onToggleFavorite,
  onEdit,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onSelectChange,
  isFavoriting = false,
}) => {
  const navigate = useNavigate();
  const projectObj = typeof collection.projectId === "object" ? collection.projectId : null;

  const handleCardClick = () => {
    if (isSelectionMode && onSelectChange) {
      onSelectChange(collection._id, !isSelected);
    } else {
      navigate(`/collections/${collection._id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-[var(--card-bg)] border rounded-xl p-5 transition-all hover:shadow-xl flex flex-col justify-between relative cursor-pointer ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-500/10"
          : "border-[var(--border-color)] hover:border-indigo-500/40"
      }`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {isSelectionMode && onSelectChange && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelectChange(collection._id, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
              />
            )}
            <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <Link
                to={`/collections/${collection._id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-base text-[var(--text-primary)] hover:text-indigo-500 transition-colors line-clamp-1"
              >
                {collection.name}
              </Link>
              {projectObj && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: projectObj.color || "#6366f1" }}
                  />
                  <span className="text-[11px] text-[var(--text-muted)] font-medium truncate max-w-[140px]">
                    {projectObj.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <FavoriteButton
            isFavorite={collection.favorite}
            isLoading={isFavoriting}
            onToggle={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(collection._id);
            }}
          />
        </div>

        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 min-h-[32px] mb-4">
          {collection.description || "No description provided."}
        </p>
      </div>

      <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-1.5" title="Folders">
            <Folder className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>{collection.foldersCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Endpoints">
            <Code2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>{collection.endpointsCount || 0}</span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(collection);
            }}
            title="Edit Collection"
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(collection);
            }}
            title="Delete Collection"
            className="p-1.5 text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link
            to={`/collections/${collection._id}`}
            onClick={(e) => e.stopPropagation()}
            title="View Details"
            className="p-1.5 text-indigo-500 hover:text-indigo-600 hover:bg-indigo-500/10 rounded-lg transition-colors cursor-pointer ml-1"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
