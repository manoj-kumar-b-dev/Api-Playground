import React from "react";
import { Link, useNavigate } from "react-router-dom";
import type { ProjectData } from "../service/projectService";
import { FavoriteButton } from "./FavoriteButton";
import { FolderKanban, Layers, Code2, Edit2, Trash2, ArrowRight } from "lucide-react";

interface ProjectCardProps {
  project: ProjectData;
  onToggleFavorite: (id: string) => void;
  onEdit: (project: ProjectData) => void;
  onDelete: (project: ProjectData) => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onSelectChange?: (id: string, selected: boolean) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onToggleFavorite,
  onEdit,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onSelectChange,
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (isSelectionMode && onSelectChange) {
      onSelectChange(project._id, !isSelected);
    } else {
      navigate(`/projects/${project._id}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-slate-900/80 border rounded-xl p-5 transition-all hover:shadow-xl hover:shadow-indigo-500/5 group flex flex-col justify-between relative overflow-hidden cursor-pointer ${
        isSelected
          ? "border-indigo-500 ring-2 ring-indigo-500/40 bg-indigo-950/20"
          : "border-slate-800 hover:border-indigo-500/40"
      }`}
    >
      {/* Top Bar Accent */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: project.color || "#6366f1" }}
      />

      <div>
        {/* Header with Icon, Name, and Favorite Toggle */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {isSelectionMode && onSelectChange && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={(e) => {
                  e.stopPropagation();
                  onSelectChange(project._id, e.target.checked);
                }}
                onClick={(e) => e.stopPropagation()}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
              />
            )}
            <div
              className="p-2.5 rounded-xl text-white shadow-md flex items-center justify-center shrink-0"
              style={{ backgroundColor: project.color || "#6366f1" }}
            >
              <FolderKanban className="w-5 h-5" />
            </div>
            <div>
              <Link
                to={`/projects/${project._id}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-base text-slate-100 hover:text-indigo-400 transition-colors line-clamp-1"
              >
                {project.name}
              </Link>
              <span className="text-[11px] text-slate-500 font-mono">
                Updated {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          <FavoriteButton
            isFavorite={project.favorite}
            onToggle={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavorite(project._id);
            }}
          />
        </div>

        {/* Description */}
        <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px] mb-4">
          {project.description || "No description provided."}
        </p>
      </div>

      {/* Footer Meta & Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
        {/* Stats */}
        <div className="flex items-center gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-1.5" title="Collections">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>{project.collectionsCount || 0}</span>
          </div>
          <div className="flex items-center gap-1.5" title="Endpoints">
            <Code2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{project.endpointsCount || 0}</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(project);
            }}
            title="Edit Project"
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(project);
            }}
            title="Delete Project"
            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Link
            to={`/projects/${project._id}`}
            onClick={(e) => e.stopPropagation()}
            title="View Details"
            className="p-1.5 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/20 rounded-lg transition-colors cursor-pointer ml-1"
          >
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
