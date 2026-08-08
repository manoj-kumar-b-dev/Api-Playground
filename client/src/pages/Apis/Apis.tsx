import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  endpointService,
  type EndpointData,
  type EndpointRequestConfig,
} from "../../service/endpointService";
import { projectService } from "../../service/projectService";
import { collectionService } from "../../service/collectionService";
import { EndpointModal } from "../../components/Modals/EndpointModal";
import { ImportModal } from "../../components/Modals/ImportModal";
import { FavoriteButton } from "../../components/FavoriteButton";
import { DeleteDialog } from "../../components/DeleteDialog";
import { getMethodBadgeColor } from "../../components/EndpointCard";
import { Breadcrumb } from "../../components/Breadcrumb";
import { EmptyState } from "../../components/EmptyState";
import {
  Code2,
  Plus,
  Save,
  Copy,
  Trash2,
  Search,
  Star,
  FolderInput,
  Loader2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";

import { useRequestStore } from "../../stores/requestStore";
import { MethodSelector } from "../../components/request/MethodSelector";
import { UrlInput } from "../../components/request/UrlInput";
import { SendButton } from "../../components/request/SendButton";
import { RequestTabs } from "../../components/request/RequestTabs";
import { QueryEditor } from "../../components/request/QueryEditor";
import { HeaderEditor } from "../../components/request/HeaderEditor";
import { PathParamEditor } from "../../components/request/PathParamEditor";
import { BodyEditor } from "../../components/request/BodyEditor";
import { AuthEditor } from "../../components/request/AuthEditor";
import { ResponseViewer } from "../../components/response/ResponseViewer";

function Apis() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id");

  const [activeEndpoint, setActiveEndpoint] = useState<EndpointData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteTab, setFavoriteTab] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [favoritingIds, setFavoritingIds] = useState<Set<string>>(new Set());
  const [isRequestPanelOpen, setIsRequestPanelOpen] = useState(true);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deletingEndpoint, setDeletingEndpoint] = useState<EndpointData | null>(null);

  const [mobileTab, setMobileTab] = useState<"list" | "workbench">("list");

  // Request Store State
  const {
    method,
    url,
    queryParams,
    headers,
    pathParams,
    body,
    auth,
    activeTab,
    loading,
    useProxy,
    response,
    error,
    setMethod,
    setUrl,
    setActiveTab,
    toggleUseProxy,
    addQueryParam,
    updateQueryParam,
    removeQueryParam,
    toggleQueryParam,
    addHeader,
    updateHeader,
    removeHeader,
    toggleHeader,
    updatePathParam,
    setAuth,
    setBodyMode,
    setJsonBody,
    addFormDataItem,
    updateFormDataItem,
    removeFormDataItem,
    toggleFormDataItem,
    addEncodedItem,
    updateEncodedItem,
    removeEncodedItem,
    toggleEncodedItem,
    setBinaryFile,
    sendRequest,
    cancelRequest,
    loadFromEndpoint,
  } = useRequestStore();

  const { data: endpoints = [], isLoading: loadingEndpoints } = useQuery({
    queryKey: ["endpoints", searchQuery, favoriteTab],
    queryFn: async () => {
      const res = await endpointService.getEndpoints({ search: searchQuery, favorite: favoriteTab });
      return res.success ? res.data : [];
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await projectService.getProjects();
      return res.success ? res.data : [];
    },
  });

  const { data: collections = [] } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const res = await collectionService.getCollections();
      return res.success ? res.data : [];
    },
  });

  useEffect(() => {
    if (endpoints.length > 0) {
      if (initialId) {
        const found = endpoints.find((e: EndpointData) => e._id === initialId);
        if (found) loadEndpointIntoWorkbench(found);
        else if (!activeEndpoint) loadEndpointIntoWorkbench(endpoints[0]);
      } else if (!activeEndpoint) {
        loadEndpointIntoWorkbench(endpoints[0]);
      }
    }
  }, [endpoints, initialId]);

  // Ctrl + Enter keyboard shortcut to trigger HTTP Send Request
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        sendRequest();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sendRequest]);

  const loadEndpointIntoWorkbench = (ep: EndpointData) => {
    setActiveEndpoint(ep);
    setName(ep.name);
    loadFromEndpoint(ep);
    setMobileTab("workbench");
  };

  const handleSaveWorkbench = async () => {
    if (!activeEndpoint) return;
    try {
      setSaving(true);

      const activeHeaders = headers.filter((h) => h.key.trim() !== "");
      const activeQueryParams = queryParams.filter((q) => q.key.trim() !== "");
      const activePathParams = pathParams.filter((p) => p.key.trim() !== "");

      const updatedConfig: EndpointRequestConfig = {
        method,
        url,
        headers: activeHeaders as any,
        queryParams: activeQueryParams as any,
        pathParams: activePathParams as any,
        body: {
          mode: body.mode === "json" ? "json" : body.mode === "formData" ? "form-data" : body.mode === "urlencoded" ? "x-www-form-urlencoded" : "none",
          raw: body.json,
        },
        authorization: {
          type: auth.type,
          token: auth.bearerToken,
          username: auth.basicUser,
          password: auth.basicPass,
          key: auth.apiKeyKey,
          value: auth.apiKeyValue,
          addTo: auth.apiKeyAddTo,
        },
      };

      const res = await endpointService.updateEndpoint(activeEndpoint._id, {
        name,
        request: updatedConfig,
      });

      if (res.success) {
        toast.success("Endpoint saved successfully!");
        setActiveEndpoint(res.data);
        queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to save endpoint");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    setFavoritingIds((prev) => new Set(prev).add(id));
    try {
      if (activeEndpoint && activeEndpoint._id === id) {
        setActiveEndpoint({ ...activeEndpoint, favorite: !activeEndpoint.favorite });
      }
      const res = await endpointService.toggleFavorite(id);
      toast.success(res.message);
      await queryClient.invalidateQueries({ queryKey: ["endpoints"] });
    } catch (err) {
      toast.error("Failed to toggle favorite");
    } finally {
      setFavoritingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      const res = await endpointService.duplicateEndpoint(id);
      if (res.success) {
        toast.success("Endpoint duplicated");
        loadEndpointIntoWorkbench(res.data);
        queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      }
    } catch (err: any) {
      toast.error("Failed to duplicate endpoint");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingEndpoint) return;
    try {
      const res = await endpointService.deleteEndpoint(deletingEndpoint._id);
      if (res.success) {
        toast.success("Endpoint deleted");
        const remaining = endpoints.filter((e: EndpointData) => e._id !== deletingEndpoint._id);
        if (activeEndpoint?._id === deletingEndpoint._id) {
          setActiveEndpoint(remaining.length > 0 ? remaining[0] : null);
        }
        queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      }
    } catch (err: any) {
      toast.error("Failed to delete endpoint");
    } finally {
      setDeletingEndpoint(null);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] sm:h-[calc(100vh-95px)] overflow-hidden space-y-2.5">
      <div className="shrink-0">
        <Breadcrumb items={[{ label: "API Workbench" }]} />
      </div>

      {/* Mobile View Switcher (lg:hidden) */}
      <div className="flex lg:hidden items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 shrink-0">
        <button
          onClick={() => setMobileTab("list")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${mobileTab === "list"
            ? "bg-indigo-600 text-white shadow-md"
            : "text-slate-400 hover:text-slate-200"
            }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Endpoints ({endpoints.length})</span>
        </button>
        <button
          onClick={() => setMobileTab("workbench")}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${mobileTab === "workbench"
            ? "bg-indigo-600 text-white shadow-md"
            : "text-slate-400 hover:text-slate-200"
            }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>Workbench {activeEndpoint ? `(${activeEndpoint.name})` : ""}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Left Endpoints List (4 cols) */}
        <div className={`lg:col-span-4 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex flex-col h-full overflow-hidden ${mobileTab === "list" ? "flex" : "hidden lg:flex"
          }`}>
          <div className="p-3 border-b border-[var(--border-color)] space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-[var(--text-primary)]">Endpoints</h2>
                <span className="text-[10px] font-medium bg-[var(--bg-tertiary)] text-[var(--text-secondary)] px-1.5 py-0.5 rounded-full">
                  {endpoints.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-[var(--bg-tertiary)] hover:bg-[var(--bg-hover)] text-indigo-400 border border-[var(--border-color)] rounded-lg transition-colors cursor-pointer"
                  title="Import from cURL or OpenAPI"
                >
                  <FolderInput className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Import</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search endpoints..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Tabs (All vs Favorites) */}
            <div className="flex items-center gap-1 pt-1">
              <button
                onClick={() => setFavoriteTab(false)}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${!favoriteTab
                  ? "bg-[var(--accent)] text-white"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
              >
                All ({endpoints.length})
              </button>
              <button
                onClick={() => setFavoriteTab(true)}
                className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${favoriteTab
                  ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                  }`}
              >
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Starred</span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loadingEndpoints ? (
              <div className="p-4 text-center text-xs text-[var(--text-muted)]">Loading APIs...</div>
            ) : endpoints.length === 0 ? (
              <div className="p-6 text-center text-xs text-[var(--text-muted)]">
                No endpoints found. Click + New to add one.
              </div>
            ) : (
              endpoints.map((ep: EndpointData) => {
                const isActive = activeEndpoint?._id === ep._id;
                return (
                  <div
                    key={ep._id}
                    onClick={() => loadEndpointIntoWorkbench(ep)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${isActive
                      ? "bg-indigo-600/15 border-indigo-500/40 text-[var(--text-primary)] shadow-sm"
                      : "bg-[var(--bg-secondary)] border-transparent hover:bg-[var(--bg-hover)] text-[var(--text-secondary)]"
                      }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border ${getMethodBadgeColor(
                            ep.request?.method || "GET"
                          )}`}
                        >
                          {ep.request?.method || "GET"}
                        </span>
                        <span className="text-xs font-semibold truncate">{ep.name}</span>
                      </div>
                      <p className="text-[10px] font-mono text-[var(--text-muted)] truncate mt-0.5">
                        {ep.request?.url || "No URL set"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <FavoriteButton
                        isFavorite={ep.favorite}
                        isLoading={favoritingIds.has(ep._id)}
                        onToggle={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(ep._id);
                        }}
                        size="sm"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Endpoint Workbench Editor (8 cols) */}
        <div className={`lg:col-span-8 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl flex flex-col h-full overflow-y-auto ${mobileTab === "workbench" ? "flex" : "hidden lg:flex"
          }`}>
          {!activeEndpoint ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <EmptyState
                icon={Code2}
                title="Select or Create an API Endpoint"
                description="Choose an endpoint from the left panel or click New to create a request."
                actionText="New Endpoint"
                onAction={() => setIsModalOpen(true)}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              {/* Workbench Top Header Bar */}
              <div className="p-3 border-b border-[var(--border-color)] space-y-2.5 shrink-0">
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setMobileTab("list")}
                    className="lg:hidden p-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium border border-indigo-500/30 bg-indigo-500/10 rounded-lg shrink-0 cursor-pointer"
                  >
                    ← List
                  </button>

                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Endpoint Name"
                    className="text-sm font-bold text-[var(--text-primary)] bg-transparent border-b border-transparent hover:border-[var(--border-color)] focus:border-indigo-500 focus:outline-none px-1 py-0.5 transition-colors flex-1 min-w-0"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <motion.button
                      onClick={handleSaveWorkbench}
                      disabled={saving}
                      whileHover={{ scale: saving ? 1 : 1.03 }}
                      whileTap={{ scale: saving ? 1 : 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="relative flex items-center justify-center gap-1.5 min-w-[90px] px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/70 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold border border-indigo-500/50 shadow-md shadow-indigo-600/20 transition-all cursor-pointer overflow-hidden"
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {saving ? (
                          <motion.div
                            key="saving"
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1.5"
                          >
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            <span>Saving...</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="save"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center gap-1.5"
                          >
                            <Save className="w-3.5 h-3.5 text-indigo-100" />
                            <span>Save</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>

                    <button
                      onClick={() => handleDuplicate(activeEndpoint._id)}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer"
                      title="Duplicate Endpoint"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeletingEndpoint(activeEndpoint)}
                      className="p-1.5 text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete Endpoint"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Modular HTTP Request Bar */}
                <div className="flex items-center shadow-lg rounded-lg overflow-hidden border border-[var(--border-color)] bg-[var(--input-bg)]">
                  <MethodSelector method={method} onChange={setMethod} disabled={loading} />
                  <UrlInput url={url} onChange={setUrl} onEnterKeyPress={sendRequest} disabled={loading} />
                  <button
                    type="button"
                    onClick={toggleUseProxy}
                    className={`px-3 py-3 text-xs font-semibold border-l border-[var(--border-color)] transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${useProxy
                      ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                      }`}
                    title={
                      useProxy
                        ? "Server Proxy ON: Bypasses CORS & auto-resolves local ports"
                        : "Direct Browser Mode: Sends HTTP request directly from browser"
                    }
                  >
                    {useProxy ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Proxy ON</span>
                      </>
                    ) : (
                      <>
                        <span>🌐</span>
                        <span>Direct</span>
                      </>
                    )}
                  </button>
                  <SendButton onSend={sendRequest} onCancel={cancelRequest} loading={loading} />
                </div>
              </div>

              {/* Request Configuration Tabs + Minimize Toggle */}
              <div className="flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-secondary)] pr-2 shrink-0">
                <div className="flex-1 overflow-x-auto min-w-0">
                  <RequestTabs
                    activeTab={activeTab}
                    onChangeTab={(tab) => {
                      setActiveTab(tab);
                      setIsRequestPanelOpen(true);
                    }}
                    paramCount={queryParams.filter((q) => q.key.trim() !== "").length}
                    headerCount={headers.filter((h) => h.key.trim() !== "").length}
                    pathParamCount={pathParams.length}
                    bodyMode={body.mode}
                    authType={auth.type}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsRequestPanelOpen(!isRequestPanelOpen)}
                  className="px-2 py-1 text-[11px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded transition-colors shrink-0 flex items-center gap-1 cursor-pointer border border-[var(--border-color)]"
                  title={isRequestPanelOpen ? "Minimize request editor to maximize response view area" : "Expand request editor"}
                >
                  {isRequestPanelOpen ? (
                    <>
                      <ChevronUp className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span className="hidden sm:inline">Minimize Params</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
                      <span className="hidden sm:inline text-indigo-400 font-semibold">Expand Params</span>
                    </>
                  )}
                </button>
              </div>

              {/* Request Editors Section */}
              {isRequestPanelOpen && (
                <div className="border-b border-[var(--border-color)] bg-[var(--bg-primary)] overflow-y-auto max-h-80 sm:max-h-96 shrink-0 transition-all duration-200">
                  {activeTab === "params" && (
                    <QueryEditor
                      queryParams={queryParams}
                      onAdd={addQueryParam}
                      onUpdate={updateQueryParam}
                      onRemove={removeQueryParam}
                      onToggle={toggleQueryParam}
                    />
                  )}

                  {activeTab === "headers" && (
                    <HeaderEditor
                      headers={headers}
                      onAdd={addHeader}
                      onUpdate={updateHeader}
                      onRemove={removeHeader}
                      onToggle={toggleHeader}
                    />
                  )}

                  {activeTab === "pathParams" && (
                    <PathParamEditor
                      pathParams={pathParams}
                      onUpdate={updatePathParam}
                      url={url}
                    />
                  )}

                  {activeTab === "body" && (
                    <BodyEditor
                      body={body}
                      onModeChange={setBodyMode}
                      onJsonChange={setJsonBody}
                      onAddFormData={addFormDataItem}
                      onUpdateFormData={updateFormDataItem}
                      onRemoveFormData={removeFormDataItem}
                      onToggleFormData={toggleFormDataItem}
                      onAddEncoded={addEncodedItem}
                      onUpdateEncoded={updateEncodedItem}
                      onRemoveEncoded={removeEncodedItem}
                      onToggleEncoded={toggleEncodedItem}
                      onBinaryFileSelect={setBinaryFile}
                    />
                  )}

                  {activeTab === "auth" && (
                    <AuthEditor auth={auth} onUpdateAuth={setAuth} />
                  )}
                </div>
              )}

              {/* Response Viewer Panel */}
              <div className="flex-1 p-2 sm:p-3 bg-[var(--bg-primary)]">
                <ResponseViewer response={response} error={error} loading={loading} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EndpointModal
        isOpen={isModalOpen}
        projects={projects}
        collections={collections}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (data) => {
          const res = await endpointService.createEndpoint({
            name: data.name,
            projectId: data.projectId,
            collectionId: data.collectionId,
            folderId: data.folderId,
            request: {
              method: data.method as any,
              url: data.url,
              headers: [],
              queryParams: [],
              pathParams: [],
              body: { mode: "none", raw: "" },
              authorization: { type: "none" },
            },
            tags: data.tags,
          });

          if (res.success) {
            toast.success("Endpoint created");
            queryClient.invalidateQueries({ queryKey: ["endpoints"] });
            loadEndpointIntoWorkbench(res.data);
          }
        }}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        projects={projects}
        collections={collections}
        onImportSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["endpoints"] });
        }}
        onLoadToWorkbench={(ep: any) => {
          loadEndpointIntoWorkbench(ep as EndpointData);
        }}
      />

      <DeleteDialog
        isOpen={!!deletingEndpoint}
        title="Delete Endpoint"
        itemTitle={deletingEndpoint?.name}
        message="Are you sure you want to delete this API endpoint?"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingEndpoint(null)}
      />
    </div>
  );
}

export default Apis;

