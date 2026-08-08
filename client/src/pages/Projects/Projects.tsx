import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { projectService, type ProjectData } from "../../service/projectService";
import { ProjectCard } from "../../components/ProjectCard";
import { ProjectModal } from "../../components/Modals/ProjectModal";
import { DeleteDialog } from "../../components/DeleteDialog";
import { EmptyState } from "../../components/EmptyState";
import { Breadcrumb } from "../../components/Breadcrumb";
import { Plus, Search, FolderKanban, Star, Trash2, CheckSquare } from "lucide-react";
import toast from "react-hot-toast";

function Projects() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "favorites">("all");

  // Selection state
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);

  // Delete state
  const [deletingProject, setDeletingProject] = useState<ProjectData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: projects = [], isLoading: loading } = useQuery({
    queryKey: ["projects", search, activeTab],
    queryFn: async () => {
      const res = await projectService.getProjects({
        search,
        favorite: activeTab === "favorites",
      });
      return res.success ? res.data : [];
    },
  });

  const isAllSelected = projects.length > 0 && projects.every((p: ProjectData) => selectedIds.includes(p._id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(projects.map((p: ProjectData) => p._id));
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
      await Promise.all(selectedIds.map((id) => projectService.deleteProject(id)));
      toast.success(`${selectedIds.length} project(s) deleted`);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setSelectedIds([]);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete selected projects");
    } finally {
      setIsBulkDeleting(false);
      setShowBulkDeleteDialog(false);
    }
  };

  const [favoritingIds, setFavoritingIds] = useState<Set<string>>(new Set());

  const handleToggleFavorite = async (id: string) => {
    setFavoritingIds((prev) => new Set(prev).add(id));
    try {
      const res = await projectService.toggleFavorite(id);
      toast.success(res.message);
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
    } catch (error: any) {
      toast.error("Failed to toggle favorite");
    } finally {
      setFavoritingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSaveProject = async (data: {
    name: string;
    description: string;
    color: string;
    icon: string;
  }) => {
    try {
      if (selectedProject) {
        const res = await projectService.updateProject(selectedProject._id, data);
        if (res.success) {
          toast.success("Project updated successfully");
          queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
      } else {
        const res = await projectService.createProject(data);
        if (res.success) {
          toast.success("Project created successfully");
          queryClient.invalidateQueries({ queryKey: ["projects"] });
        }
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save project");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProject) return;
    setIsDeleting(true);
    try {
      const res = await projectService.deleteProject(deletingProject._id);
      if (res.success) {
        toast.success("Project deleted");
        queryClient.invalidateQueries({ queryKey: ["projects"] });
        setSelectedIds((prev) => prev.filter((id) => id !== deletingProject._id));
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete project");
    } finally {
      setIsDeleting(false);
      setDeletingProject(null);
    }
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Navigation Breadcrumb */}
      <Breadcrumb items={[{ label: "Projects" }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2.5">
            <span>Projects</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              {projects.length}
            </span>
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Manage your API workspaces, microservices, and environment scopes.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProject(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--card-bg)] p-2 rounded-xl border border-[var(--border-color)]">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-lg border border-[var(--border-color)] shrink-0">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "all"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              All Projects
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                activeTab === "favorites"
                  ? "bg-indigo-600 text-white shadow"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>Favorites</span>
            </button>
          </div>

          {/* Select Toggle Button */}
          {projects.length > 0 && (
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
                  : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border-[var(--border-color)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{isSelectionMode ? "Done Selecting" : "Select"}</span>
            </button>
          )}

          {/* Select All */}
          {isSelectionMode && projects.length > 0 && (
            <label className="flex items-center gap-2 px-2.5 py-1.5 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-xs text-[var(--text-primary)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors select-none">
              <input
                type="checkbox"
                checked={isAllSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-[var(--border-color)] bg-[var(--input-bg)] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
              />
              <span>Select All ({projects.length})</span>
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

        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name..."
            className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 h-44 animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800"></div>
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-800 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-800/60 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-3 bg-slate-800/40 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={activeTab === "favorites" ? "No Favorite Projects" : "No Projects Found"}
          description={
            activeTab === "favorites"
              ? "You haven't marked any projects as favorites yet."
              : search
              ? `No projects matching "${search}".`
              : "Get started by creating your first project workspace to group collections and endpoints."
          }
          actionText={activeTab === "all" && !search ? "Create First Project" : undefined}
          onAction={
            activeTab === "all" && !search
              ? () => {
                  setSelectedProject(null);
                  setIsModalOpen(true);
                }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project: ProjectData) => (
            <ProjectCard
              key={project._id}
              project={project}
              onToggleFavorite={handleToggleFavorite}
              isFavoriting={favoritingIds.has(project._id)}
              onEdit={(p) => {
                setSelectedProject(p);
                setIsModalOpen(true);
              }}
              onDelete={(p) => setDeletingProject(p)}
              isSelectionMode={isSelectionMode}
              isSelected={selectedIds.includes(project._id)}
              onSelectChange={handleSelectChange}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ProjectModal
        isOpen={isModalOpen}
        project={selectedProject}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveProject}
      />

      <DeleteDialog
        isOpen={!!deletingProject}
        title="Delete Project"
        itemTitle={deletingProject?.name}
        message="Are you sure you want to delete this project? This will permanently remove all associated collections, folders, and endpoints."
        isDeleting={isDeleting}
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingProject(null)}
      />

      <DeleteDialog
        isOpen={showBulkDeleteDialog}
        title="Delete Selected Projects"
        itemTitle={`${selectedIds.length} projects selected`}
        message="Are you sure you want to delete the selected projects? This will permanently remove all associated collections, folders, and endpoints within them."
        isDeleting={isBulkDeleting}
        onConfirm={handleBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteDialog(false)}
      />
    </div>
  );
}

export default Projects;
