import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collectionService } from "../../service/collectionService";
import { projectService } from "../../service/projectService";
import { CollectionCard } from "../../components/CollectionCard";
import { CollectionModal } from "../../components/Modals/CollectionModal";
import { DeleteDialog } from "../../components/DeleteDialog";
import { EmptyState } from "../../components/EmptyState";
import { Breadcrumb } from "../../components/Breadcrumb";
import { Plus, Layers, Star, Filter, Trash2, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";
import type { CollectionData } from "../../service/collectionService";

function Collections() {
  const queryClient = useQueryClient();
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<CollectionData | null>(null);

  // Delete state
  const [deletingCollection, setDeletingCollection] = useState<CollectionData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await projectService.getProjects();
      return res.success ? res.data : [];
    },
  });

  const { data: collections = [], isLoading: loading } = useQuery({
    queryKey: ["collections", selectedProjectId, activeTab],
    queryFn: async () => {
      const res = await collectionService.getCollections({
        projectId: selectedProjectId || undefined,
        favorite: activeTab === "favorites",
      });
      return res.success ? res.data : [];
    },
  });

  const isAllSelected = collections.length > 0 && collections.every((c: CollectionData) => selectedIds.includes(c._id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(collections.map((c: CollectionData) => c._id));
    }
  };

  const handleSelectChange = (id: string, selected: boolean) => {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((itemId) => itemId !== id)
    );
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      await Promise.all(selectedIds.map((id) => collectionService.deleteCollection(id)));
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

  const handleToggleFavorite = async (id: string) => {
    try {
      const res = await collectionService.toggleFavorite(id);
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    } catch (err) {
      toast.error("Failed to toggle favorite");
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
          toast.success("Collection updated successfully");
          queryClient.invalidateQueries({ queryKey: ["collections"] });
        }
      } else {
        const res = await collectionService.createCollection(data);
        if (res.success) {
          toast.success("Collection created successfully");
          queryClient.invalidateQueries({ queryKey: ["collections"] });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save collection");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCollection) return;
    setIsDeleting(true);
    try {
      const res = await collectionService.deleteCollection(deletingCollection._id);
      if (res.success) {
        toast.success("Collection deleted");
        queryClient.invalidateQueries({ queryKey: ["collections"] });
        setSelectedIds((prev) => prev.filter((id) => id !== deletingCollection._id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete collection");
    } finally {
      setIsDeleting(false);
      setDeletingCollection(null);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <Breadcrumb items={[{ label: "Collections" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <span>Collections</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {collections.length}
            </span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Group your API endpoints into modular collections for easier testing and environment mapping.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCollection(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-2 rounded-xl border border-slate-800">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              All Collections
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "favorites"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Favorites</span>
            </button>
          </div>

          {/* Select Toggle Button */}
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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                isSelectionMode
                  ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/40 hover:bg-indigo-600/30"
                  : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isSelectionMode ? "Done Selecting" : "Select"}</span>
            </button>
          )}

          {/* Select All */}
          {isSelectionMode && collections.length > 0 && (
            <label className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 cursor-pointer hover:bg-slate-900 transition-colors select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
              <span>Select All ({collections.length})</span>
            </label>
          )}

          {/* Bulk Delete Button */}
          {isSelectionMode && selectedIds.length > 0 && (
            <button
              onClick={() => setShowBulkDeleteDialog(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-lg text-xs font-medium transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>

        {/* Project Filter Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
          >
            <option value="" className="bg-slate-900 text-slate-200">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id} className="bg-slate-900 text-slate-200">
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Collections Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 h-40 animate-pulse space-y-4"
            >
              <div className="h-4 bg-slate-800 rounded w-2/3"></div>
              <div className="h-3 bg-slate-800/60 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : collections.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={activeTab === "favorites" ? "No Favorite Collections" : "No Collections Found"}
          description={
            activeTab === "favorites"
              ? "You haven't added any collections to favorites."
              : selectedProjectId
              ? "No collections belong to the selected project."
              : "Organize your endpoints by creating a collection."
          }
          actionText={activeTab === "all" ? "Create Collection" : undefined}
          onAction={
            activeTab === "all"
              ? () => {
                  setSelectedCollection(null);
                  setIsModalOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map((col: CollectionData) => (
            <CollectionCard
              key={col._id}
              collection={col}
              onToggleFavorite={handleToggleFavorite}
              onEdit={(c) => {
                setSelectedCollection(c);
                setIsModalOpen(true);
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
        isOpen={isModalOpen}
        collection={selectedCollection}
        projects={projects}
        defaultProjectId={selectedProjectId}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveCollection}
      />

      <DeleteDialog
        isOpen={!!deletingCollection}
        title="Delete Collection"
        itemTitle={deletingCollection?.name}
        message="Are you sure you want to delete this collection? All associated folders and endpoints will also be deleted."
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
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
}

export default Collections;
