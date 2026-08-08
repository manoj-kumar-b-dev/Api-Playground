import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../../service/projectService";
import { collectionService, type CollectionData } from "../../service/collectionService";
import { CollectionCard } from "../../components/CollectionCard";
import { CollectionModal } from "../../components/Modals/CollectionModal";
import { DeleteDialog } from "../../components/DeleteDialog";
import { Breadcrumb } from "../../components/Breadcrumb";
import { EmptyState } from "../../components/EmptyState";
import {
  FolderKanban,
  Layers,
  Plus,
  Calendar,
  Star,
  Trash2,
  CheckSquare,
} from "lucide-react";
import toast from "react-hot-toast";

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Collection modal state
  const [isCollectionModalOpen, setIsCollectionModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionData | null>(null);

  // Delete state
  const [deletingCollection, setDeletingCollection] = useState<CollectionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: project = null, isLoading: loadingProject } = useQuery({
    queryKey: ["project", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await projectService.getProjectById(id);
      return res.success ? res.data : null;
    },
    enabled: !!id,
  });

  const { data: collections = [], isLoading: loadingCollections } = useQuery({
    queryKey: ["collections", { projectId: id }],
    queryFn: async () => {
      if (!id) return [];
      const res = await collectionService.getCollections({ projectId: id });
      return res.success ? res.data : [];
    },
    enabled: !!id,
  });

  const loading = loadingProject || loadingCollections;

  const isAllSelected = collections.length > 0 && collections.every((c: CollectionData) => selectedIds.includes(c._id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(collections.map((c: CollectionData) => c._id));
    }
  };

  const handleSelectChange = (colId: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, colId] : prev.filter((itemId) => itemId !== colId)
    );
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((colId) => collectionService.deleteCollection(colId)));
      toast.success(`${selectedIds.length} collection(s) deleted`);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete selected collections");
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteDialog(false);
    }
  };

  const [favoritingIds, setFavoritingIds] = useState<Set<string>>(new Set());

  const handleToggleCollectionFavorite = async (colId: string) => {
    setFavoritingIds((prev) => new Set(prev).add(colId));
    try {
      const res = await collectionService.toggleFavorite(colId);
      toast.success(res.message);
      await queryClient.invalidateQueries({ queryKey: ["collections"] });
    } catch (err) {
      toast.error("Failed to update favorite");
    } finally {
      setFavoritingIds((prev) => {
        const next = new Set(prev);
        next.delete(colId);
        return next;
      });
    }
  };

  const handleSaveCollection = async (data: {
    projectId: string;
    name: string;
    description: string;
  }) => {
    try {
      if (selectedCollection) {
        const res = await collectionService.updateCollection(selectedCollection._id, data);
        if (res.success) {
          toast.success("Collection updated");
          queryClient.invalidateQueries({ queryKey: ["collections"] });
        }
      } else {
        const res = await collectionService.createCollection(data);
        if (res.success) {
          toast.success("Collection created");
          queryClient.invalidateQueries({ queryKey: ["collections"] });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save collection");
    }
  };

  const handleDeleteCollectionConfirm = async () => {
    if (!deletingCollection) return;
    setIsDeleting(true);
    try {
      const res = await collectionService.deleteCollection(deletingCollection._id);
      if (res.success) {
        toast.success("Collection deleted");
        queryClient.invalidateQueries({ queryKey: ["collections"] });
        setSelectedIds((prev) => prev.filter((colId) => colId !== deletingCollection._id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete collection");
    } finally {
      setIsDeleting(false);
      setDeletingCollection(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] space-y-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm">Loading project workspace...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <EmptyState
        icon={FolderKanban}
        title="Project Not Found"
        description="The requested project workspace could not be found."
        actionText="Back to Projects"
        onAction={() => navigate("/projects")}
      />
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Breadcrumbs */}
      <Breadcrumb
        items={[
          { label: "Projects", link: "/projects" },
          { label: project.name },
        ]}
      />

      {/* Project Banner Card */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 relative overflow-hidden">
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: project.color || "#6366f1" }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div
              className="p-3.5 rounded-xl text-white shadow-lg shrink-0 mt-1"
              style={{ backgroundColor: project.color || "#6366f1" }}
            >
              <FolderKanban className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-[var(--text-primary)]">{project.name}</h1>
                {project.favorite && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs flex items-center gap-1 font-medium">
                    <Star className="w-3 h-3 fill-amber-500" />
                    Favorite
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                {project.description || "No description provided for this project."}
              </p>
              <div className="flex items-center gap-4 text-xs text-[var(--text-muted)] pt-2 font-mono">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 shrink-0 bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)]">
            <div className="text-center px-4 border-r border-[var(--border-color)]">
              <p className="text-xs text-[var(--text-secondary)]">Collections</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{collections.length}</p>
            </div>
            <div className="text-center px-4">
              <p className="text-xs text-[var(--text-secondary)]">Total Endpoints</p>
              <p className="text-lg font-bold text-indigo-500">
                {collections.reduce((acc: number, c: CollectionData) => acc + (c.endpointsCount || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <span>Project Collections</span>
          </h2>
          <p className="text-xs text-[var(--text-secondary)]">
            Collections group endpoints and folders under this project.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {collections.length > 0 && (
            <button
              onClick={() => {
                if (isSelectionMode) {
                  setIsSelectionMode(false);
                  setSelectedIds([]);
                } else {
                  setIsSelectionMode(true);
                }
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isSelectionMode
                  ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/40 hover:bg-indigo-600/30"
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isSelectionMode ? "Done Selecting" : "Select"}</span>
            </button>
          )}

          {isSelectionMode && collections.length > 0 && (
            <label className="flex items-center gap-2 px-2.5 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
              <span>Select All ({collections.length})</span>
            </label>
          )}

          {isSelectionMode && selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteDialog(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}

          <button
            onClick={() => {
              setSelectedCollection(null);
              setIsCollectionModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Collection</span>
          </button>
        </div>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No Collections Found"
          description="This project doesn't have any API collections yet. Create your first collection to organize endpoints."
          actionText="Create Collection"
          onAction={() => {
            setSelectedCollection(null);
            setIsCollectionModalOpen(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((col: CollectionData) => (
            <CollectionCard
              key={col._id}
              collection={col}
              onToggleFavorite={handleToggleCollectionFavorite}
              isFavoriting={favoritingIds.has(col._id)}
              onEdit={(c) => {
                setSelectedCollection(c);
                setIsCollectionModalOpen(true);
              }}
              onDelete={(c) => setDeletingCollection(c)}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(col._id)}
              onSelectChange={handleSelectChange}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CollectionModal
        isOpen={isCollectionModalOpen}
        collection={selectedCollection}
        projects={[project]}
        defaultProjectId={project._id}
        onClose={() => setIsCollectionModalOpen(false)}
        onSubmit={handleSaveCollection}
      />

      <DeleteDialog
        isOpen={!!deletingCollection}
        title="Delete Collection"
        itemTitle={deletingCollection?.name}
        message="Are you sure you want to delete this collection? All child folders and endpoints will also be deleted."
        isDeleting={isDeleting}
        onConfirm={handleDeleteCollectionConfirm}
        onClose={() => setDeletingCollection(null)}
      />

      <DeleteDialog
        isOpen={showBulkDeleteDialog}
        title="Delete Selected Collections"
        itemTitle={`${selectedIds.length} collections selected`}
        message="Are you sure you want to delete the selected collections? All associated folders and endpoints inside them will also be deleted."
        isDeleting={isBulkDeleting}
        onConfirm={handleBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteDialog(false)}
      />
    </div>
  );
};
