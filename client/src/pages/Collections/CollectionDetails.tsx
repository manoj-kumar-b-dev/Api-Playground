import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { collectionService } from "../../service/collectionService";
import { folderService, type FolderData } from "../../service/folderService";
import { endpointService, type EndpointData } from "../../service/endpointService";
import { projectService } from "../../service/projectService";
import { FolderTree } from "../../components/FolderTree";
import { FolderModal } from "../../components/Modals/FolderModal";
import { EndpointModal } from "../../components/Modals/EndpointModal";
import { ImportModal } from "../../components/Modals/ImportModal";
import { DeleteDialog } from "../../components/DeleteDialog";
import { Breadcrumb } from "../../components/Breadcrumb";
import { EmptyState } from "../../components/EmptyState";
import { Layers, Plus, Folder, Star, FolderInput, CheckSquare, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

export const CollectionDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>([]);
  const [selectedEndpointIds, setSelectedEndpointIds] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Folder modal state
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<FolderData | null>(null);
  const [parentFolderId, setParentFolderId] = useState<string | null>(null);

  // Endpoint modal state
  const [isEndpointModalOpen, setIsEndpointModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  // Delete state
  const [deletingFolder, setDeletingFolder] = useState<FolderData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: collection = null, isLoading: loadingCol } = useQuery({
    queryKey: ["collection", id],
    queryFn: async () => {
      if (!id) return null;
      const res = await collectionService.getCollectionById(id);
      return res.success ? res.data : null;
    },
    enabled: !!id,
  });

  const { data: treeData = { folders: [], endpoints: [] }, isLoading: loadingTree } = useQuery({
    queryKey: ["folderTree", id],
    queryFn: async () => {
      if (!id) return { folders: [], endpoints: [] };
      const res = await folderService.getFolderTree(id);
      return res.success ? res.data : { folders: [], endpoints: [] };
    },
    enabled: !!id,
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await projectService.getProjects();
      return res.success ? res.data : [];
    },
  });

  const treeFolders = treeData.folders || [];
  const rootEndpoints = treeData.endpoints || [];
  const loading = loadingCol || loadingTree;

  const getAllTreeItemIds = () => {
    const fIds: string[] = [];
    const eIds: string[] = [...rootEndpoints.map((e: EndpointData) => e._id)];

    const traverse = (fList: FolderData[]) => {
      for (const f of fList) {
        fIds.push(f._id);
        if (f.endpoints) {
          eIds.push(...f.endpoints.map((e: EndpointData) => e._id));
        }
        if (f.folders) {
          traverse(f.folders);
        }
      }
    };

    traverse(treeFolders);
    return { fIds, eIds };
  };

  const { fIds: allFolderIds, eIds: allEndpointIds } = getAllTreeItemIds();
  const totalItems = allFolderIds.length + allEndpointIds.length;
  const totalSelected = selectedFolderIds.length + selectedEndpointIds.length;
  const isAllSelected = totalItems > 0 && totalSelected === totalItems;

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedFolderIds([]);
      setSelectedEndpointIds([]);
    } else {
      setSelectedFolderIds(allFolderIds);
      setSelectedEndpointIds(allEndpointIds);
    }
  };

  const handleToggleSelectFolder = (folderId: string) => {
    setSelectedFolderIds((prev) =>
      prev.includes(folderId) ? prev.filter((i) => i !== folderId) : [...prev, folderId]
    );
  };

  const handleToggleSelectEndpoint = (endpointId: string) => {
    setSelectedEndpointIds((prev) =>
      prev.includes(endpointId) ? prev.filter((i) => i !== endpointId) : [...prev, endpointId]
    );
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedFolderIds.length === 0 && selectedEndpointIds.length === 0) return;
    setIsBulkDeleting(true);
    try {
      const promises: Promise<any>[] = [];
      selectedFolderIds.forEach((fId) => promises.push(folderService.deleteFolder(fId)));
      selectedEndpointIds.forEach((eId) => promises.push(endpointService.deleteEndpoint(eId)));

      await Promise.all(promises);
      toast.success(`${totalSelected} item(s) deleted`);
      queryClient.invalidateQueries({ queryKey: ["folderTree", id] });
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      setSelectedFolderIds([]);
      setSelectedEndpointIds([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete selected items");
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteDialog(false);
    }
  };

  const handleSelectEndpoint = (ep: EndpointData) => {
    navigate(`/apis?id=${ep._id}`);
  };

  const handleSaveFolder = async (data: {
    collectionId: string;
    parentFolderId?: string | null;
    name: string;
  }) => {
    try {
      if (selectedFolder) {
        const res = await folderService.updateFolder(selectedFolder._id, data.name);
        if (res.success) {
          toast.success("Folder updated");
          queryClient.invalidateQueries({ queryKey: ["folderTree", id] });
        }
      } else {
        const res = await folderService.createFolder(data);
        if (res.success) {
          toast.success("Folder created");
          queryClient.invalidateQueries({ queryKey: ["folderTree", id] });
        }
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save folder");
    }
  };

  const handleDeleteFolderConfirm = async () => {
    if (!deletingFolder) return;
    setIsDeleting(true);
    try {
      const res = await folderService.deleteFolder(deletingFolder._id);
      if (res.success) {
        toast.success("Folder deleted");
        queryClient.invalidateQueries({ queryKey: ["folderTree", id] });
        setSelectedFolderIds((prev) => prev.filter((fId) => fId !== deletingFolder._id));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete folder");
    } finally {
      setIsDeleting(false);
      setDeletingFolder(null);
    }
  };

  const handleCreateEndpoint = async (data: {
    name: string;
    projectId: string;
    collectionId: string;
    folderId?: string | null;
    method: string;
    url: string;
    tags: string[];
  }) => {
    try {
      const res = await endpointService.createEndpoint({
        name: data.name,
        projectId: data.projectId,
        collectionId: data.collectionId,
        folderId: data.folderId,
        request: {
          method: data.method as any,
          url: data.url,
          headers: [{ key: "Accept", value: "application/json", enabled: true }],
          queryParams: [],
          pathParams: [],
          body: { mode: "none", raw: "" },
          authorization: { type: "none" },
        },
        tags: data.tags,
      });

      if (res.success) {
        toast.success("Endpoint created");
        queryClient.invalidateQueries({ queryKey: ["folderTree", id] });
        queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create endpoint");
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-[var(--text-muted)] space-y-4">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-sm">Loading collection tree...</p>
      </div>
    );
  }

  if (!collection) {
    return (
      <EmptyState
        icon={Layers}
        title="Collection Not Found"
        description="The requested collection could not be found."
        actionText="Back to Collections"
        onAction={() => navigate("/collections")}
      />
    );
  }

  const projectObj = typeof collection.projectId === "object" ? collection.projectId : null;

  return (
    <div className="space-y-6 pb-6">
      <Breadcrumb
        items={[
          { label: "Collections", link: "/collections" },
          { label: collection.name },
        ]}
      />

      {/* Collection Header Banner */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 rounded-xl shrink-0">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>{collection.name}</span>
                {collection.favorite && (
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                )}
              </h1>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {collection.description || "No description provided."}
              </p>
              {projectObj && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-[var(--text-muted)]">Project:</span>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-medium text-[var(--text-primary)] border border-[var(--border-color)]"
                    style={{ backgroundColor: `${projectObj.color || "#6366f1"}20` }}
                  >
                    {projectObj.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {totalItems > 0 && (
              <button
                onClick={() => {
                  if (isSelectionMode) {
                    setIsSelectionMode(false);
                    setSelectedFolderIds([]);
                    setSelectedEndpointIds([]);
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
                <CheckSquare className="w-4 h-4" />
                <span>{isSelectionMode ? "Done Selecting" : "Select"}</span>
              </button>
            )}

            {isSelectionMode && totalItems > 0 && (
              <label className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span>Select All ({totalItems})</span>
              </label>
            )}

            {isSelectionMode && totalSelected > 0 && (
              <button
                onClick={() => setShowBulkDeleteDialog(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white border border-red-500/30 rounded-lg text-xs font-medium transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected ({totalSelected})</span>
              </button>
            )}

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-indigo-500 border border-[var(--border-color)] rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <FolderInput className="w-4 h-4 text-indigo-500" />
              <span>Import API</span>
            </button>

            <button
              onClick={() => {
                setSelectedFolder(null);
                setParentFolderId(null);
                setIsFolderModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[var(--bg-secondary)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              <Folder className="w-4 h-4 text-indigo-500" />
              <span>New Folder</span>
            </button>

            <button
              onClick={() => {
                setTargetFolderId(null);
                setIsEndpointModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Endpoint</span>
            </button>
          </div>
        </div>
      </div>

      {/* Collection Folder Tree & Endpoints Panel */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-5">
        <FolderTree
          folders={treeFolders}
          rootEndpoints={rootEndpoints}
          onSelectEndpoint={handleSelectEndpoint}
          onAddSubfolder={(parentId) => {
            setSelectedFolder(null);
            setParentFolderId(parentId || null);
            setIsFolderModalOpen(true);
          }}
          onAddEndpoint={(folderId) => {
            setTargetFolderId(folderId);
            setIsEndpointModalOpen(true);
          }}
          onRenameFolder={(folder) => {
            setSelectedFolder(folder);
            setParentFolderId(folder.parentFolderId ? String(folder.parentFolderId) : null);
            setIsFolderModalOpen(true);
          }}
          onDeleteFolder={(folder) => setDeletingFolder(folder)}
          isSelectionMode={isSelectionMode}
          selectedFolderIds={selectedFolderIds}
          selectedEndpointIds={selectedEndpointIds}
          onToggleSelectFolder={handleToggleSelectFolder}
          onToggleSelectEndpoint={handleToggleSelectEndpoint}
        />
      </div>

      {/* Modals */}
      <FolderModal
        isOpen={isFolderModalOpen}
        folder={selectedFolder}
        collectionId={collection._id}
        parentFolderId={parentFolderId}
        onClose={() => setIsFolderModalOpen(false)}
        onSubmit={handleSaveFolder}
      />

      <EndpointModal
        isOpen={isEndpointModalOpen}
        projects={projects}
        collections={[collection]}
        defaultProjectId={projectObj?._id || ""}
        defaultCollectionId={collection._id}
        defaultFolderId={targetFolderId}
        onClose={() => setIsEndpointModalOpen(false)}
        onSubmit={handleCreateEndpoint}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        projects={projects}
        collections={collection ? [collection] : []}
        defaultProjectId={projectObj?._id || ""}
        defaultCollectionId={collection._id}
        onImportSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["folderTree", id] });
          queryClient.invalidateQueries({ queryKey: ["endpoints"] });
        }}
        onLoadToWorkbench={() => {
          navigate("/apis");
        }}
      />

      <DeleteDialog
        isOpen={!!deletingFolder}
        title="Delete Folder"
        itemTitle={deletingFolder?.name}
        message="Are you sure you want to delete this folder? All nested subfolders and endpoints will be permanently removed."
        isDeleting={isDeleting}
        onConfirm={handleDeleteFolderConfirm}
        onClose={() => setDeletingFolder(null)}
      />

      <DeleteDialog
        isOpen={showBulkDeleteDialog}
        title="Delete Selected Items"
        itemTitle={`${totalSelected} items selected`}
        message="Are you sure you want to delete the selected folders and endpoints? This action cannot be undone."
        isDeleting={isBulkDeleting}
        onConfirm={handleBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteDialog(false)}
      />
    </div>
  );
};
