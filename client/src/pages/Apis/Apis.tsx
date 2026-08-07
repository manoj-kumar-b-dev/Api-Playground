import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  endpointService,
  type EndpointData,
  type EndpointRequestConfig,
  type KeyValuePair,
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
  Play,
  Save,
  Copy,
  Trash2,
  Search,
  Star,
  Clock,
  HardDrive,
  FolderInput,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

function Apis() {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get("id");

  const [activeEndpoint, setActiveEndpoint] = useState<EndpointData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteTab, setFavoriteTab] = useState(false);

  // Workbench request state
  const [method, setMethod] = useState<EndpointRequestConfig["method"]>("GET");
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [headers, setHeaders] = useState<KeyValuePair[]>([]);
  const [queryParams, setQueryParams] = useState<KeyValuePair[]>([]);
  const [authType, setAuthType] = useState<"none" | "bearer" | "basic" | "apiKey">("none");
  const [authToken, setAuthToken] = useState("");
  const [authUsername, setAuthUsername] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [bodyMode, setBodyMode] = useState<"none" | "json" | "raw">("none");
  const [bodyRaw, setBodyRaw] = useState("");

  // Request execution response state
  const [saving, setSaving] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [responseResult, setResponseResult] = useState<any>(null);
  const [activeReqTab, setActiveReqTab] = useState<"params" | "headers" | "auth" | "body">("params");

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deletingEndpoint, setDeletingEndpoint] = useState<EndpointData | null>(null);

  const { data: endpoints = [], isLoading: loading } = useQuery({
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

  const loadEndpointIntoWorkbench = (ep: EndpointData) => {
    setActiveEndpoint(ep);
    setName(ep.name);
    const req = ep.request;
    setMethod(req?.method || "GET");
    setUrl(req?.url || "");
    setHeaders(req?.headers && req.headers.length > 0 ? req.headers : [{ key: "", value: "", enabled: true }]);
    setQueryParams(req?.queryParams && req.queryParams.length > 0 ? req.queryParams : [{ key: "", value: "", enabled: true }]);
    setAuthType(req?.authorization?.type || "none");
    setAuthToken(req?.authorization?.token || "");
    setAuthUsername(req?.authorization?.username || "");
    setAuthPassword(req?.authorization?.password || "");
    setBodyMode((req?.body?.mode as any) || "none");
    setBodyRaw(req?.body?.raw || "");
    setResponseResult(null);
  };

  const handleSaveWorkbench = async () => {
    if (!activeEndpoint) return;
    try {
      setSaving(true);
      const updatedConfig: EndpointRequestConfig = {
        method,
        url,
        headers: headers.filter((h) => h.key.trim() !== ""),
        queryParams: queryParams.filter((q) => q.key.trim() !== ""),
        pathParams: [],
        body: { mode: bodyMode as any, raw: bodyRaw },
        authorization: {
          type: authType,
          token: authToken,
          username: authUsername,
          password: authPassword,
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

  const handleExecuteRequest = async () => {
    if (!url.trim()) {
      toast.error("Please enter a valid request URL");
      return;
    }
    setExecuting(true);
    setResponseResult(null);

    const config: EndpointRequestConfig = {
      method,
      url,
      headers: headers.filter((h) => h.enabled && h.key.trim() !== ""),
      queryParams: queryParams.filter((q) => q.enabled && q.key.trim() !== ""),
      pathParams: [],
      body: { mode: bodyMode as any, raw: bodyRaw },
      authorization: {
        type: authType,
        token: authToken,
        username: authUsername,
        password: authPassword,
      },
    };

    try {
      const res = await endpointService.executeRequest(config);
      if (res.success) {
        setResponseResult(res.data);
      }
    } catch (err: any) {
      toast.error("Request execution failed");
    } finally {
      setExecuting(false);
    }
  };

  const handleToggleFavorite = async (id: string) => {
    try {
      if (activeEndpoint && activeEndpoint._id === id) {
        setActiveEndpoint({ ...activeEndpoint, favorite: !activeEndpoint.favorite });
      }
      const res = await endpointService.toggleFavorite(id);
      toast.success(res.message);
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
    } catch (err) {
      toast.error("Failed to toggle favorite");
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

  const addHeaderRow = () => setHeaders([...headers, { key: "", value: "", enabled: true }]);
  const updateHeaderRow = (index: number, field: keyof KeyValuePair, val: any) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: val };
    setHeaders(updated);
  };
  const removeHeaderRow = (index: number) => setHeaders(headers.filter((_, i) => i !== index));

  const addParamRow = () => setQueryParams([...queryParams, { key: "", value: "", enabled: true }]);
  const updateParamRow = (index: number, field: keyof KeyValuePair, val: any) => {
    const updated = [...queryParams];
    updated[index] = { ...updated[index], [field]: val };
    setQueryParams(updated);
  };
  const removeParamRow = (index: number) => setQueryParams(queryParams.filter((_, i) => i !== index));

  return (
    <div className="space-y-4 pb-6">
      <Breadcrumb items={[{ label: "API Workbench" }]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 h-[calc(100vh-140px)] min-h-[600px]">
        {/* Left Endpoints List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span>Endpoints ({endpoints.length})</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  title="Import from cURL, OpenAPI, Swagger or Docs"
                >
                  <FolderInput className="w-3.5 h-3.5" />
                  <span>Import</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setFavoriteTab(false)}
                className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                  !favoriteTab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All APIs
              </button>
              <button
                onClick={() => setFavoriteTab(true)}
                className={`flex-1 py-1 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1 ${
                  favoriteTab ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>Starred</span>
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter endpoints..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <div className="p-4 text-center text-xs text-slate-500">Loading APIs...</div>
            ) : endpoints.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No endpoints found. Click + New to add one.
              </div>
            ) : (
              endpoints.map((ep) => {
                const isActive = activeEndpoint?._id === ep._id;
                return (
                  <div
                    key={ep._id}
                    onClick={() => loadEndpointIntoWorkbench(ep)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border ${
                      isActive
                        ? "bg-indigo-600/15 border-indigo-500/40 text-white shadow-sm"
                        : "bg-slate-900/40 border-transparent hover:bg-slate-800/60 text-slate-300"
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
                      <p className="text-[10px] font-mono text-slate-500 truncate mt-0.5">
                        {ep.request?.url || "No URL set"}
                      </p>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <FavoriteButton
                        isFavorite={ep.favorite}
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
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
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
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Workbench Top Bar */}
              <div className="p-4 border-b border-slate-800 space-y-3 shrink-0">
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-base font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-indigo-500 focus:outline-none px-1 py-0.5 transition-colors flex-1"
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
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
                      title="Duplicate"
                    >
                      <Copy className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeletingEndpoint(activeEndpoint)}
                      className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* HTTP Request URL Bar */}
                <div className="flex items-center gap-2">
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as any)}
                    className={`px-3 py-2 text-xs font-mono font-bold rounded-lg border focus:outline-none cursor-pointer ${getMethodBadgeColor(
                      method
                    )}`}
                  >
                    {METHODS.map((m) => (
                      <option key={m} value={m} className="bg-slate-900 text-slate-200">
                        {m}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter request URL (e.g. https://jsonplaceholder.typicode.com/todos/1)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                  />

                  <button
                    onClick={handleExecuteRequest}
                    disabled={executing}
                    className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-indigo-600/20 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {executing ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Request Config Tabs */}
              <div className="flex items-center border-b border-slate-800 px-4 bg-slate-950/40 shrink-0">
                <button
                  onClick={() => setActiveReqTab("params")}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                    activeReqTab === "params"
                      ? "border-indigo-500 text-indigo-400 font-semibold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Params ({queryParams.filter((q) => q.key).length})
                </button>
                <button
                  onClick={() => setActiveReqTab("headers")}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                    activeReqTab === "headers"
                      ? "border-indigo-500 text-indigo-400 font-semibold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Headers ({headers.filter((h) => h.key).length})
                </button>
                <button
                  onClick={() => setActiveReqTab("auth")}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                    activeReqTab === "auth"
                      ? "border-indigo-500 text-indigo-400 font-semibold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Authorization ({authType})
                </button>
                <button
                  onClick={() => setActiveReqTab("body")}
                  className={`px-4 py-2 text-xs font-medium border-b-2 transition-all cursor-pointer ${
                    activeReqTab === "body"
                      ? "border-indigo-500 text-indigo-400 font-semibold"
                      : "border-transparent text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Body ({bodyMode})
                </button>
              </div>

              {/* Request Tab Content Panel */}
              <div className="p-4 overflow-y-auto max-h-48 border-b border-slate-800 bg-slate-950/20 shrink-0">
                {activeReqTab === "params" && (
                  <div className="space-y-2">
                    {queryParams.map((q, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={q.enabled}
                          onChange={(e) => updateParamRow(idx, "enabled", e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                        />
                        <input
                          type="text"
                          placeholder="Key"
                          value={q.key}
                          onChange={(e) => updateParamRow(idx, "key", e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={q.value}
                          onChange={(e) => updateParamRow(idx, "value", e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => removeParamRow(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addParamRow}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Parameter</span>
                    </button>
                  </div>
                )}

                {activeReqTab === "headers" && (
                  <div className="space-y-2">
                    {headers.map((h, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={h.enabled}
                          onChange={(e) => updateHeaderRow(idx, "enabled", e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
                        />
                        <input
                          type="text"
                          placeholder="Header Key (e.g. Content-Type)"
                          value={h.key}
                          onChange={(e) => updateHeaderRow(idx, "key", e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Value (e.g. application/json)"
                          value={h.value}
                          onChange={(e) => updateHeaderRow(idx, "value", e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          onClick={() => removeHeaderRow(idx)}
                          className="text-slate-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addHeaderRow}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 pt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Header</span>
                    </button>
                  </div>
                )}

                {activeReqTab === "auth" && (
                  <div className="space-y-3 max-w-md">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">
                        Auth Type
                      </label>
                      <select
                        value={authType}
                        onChange={(e) => setAuthType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                      >
                        <option value="none">No Auth</option>
                        <option value="bearer">Bearer Token</option>
                        <option value="basic">Basic Auth</option>
                      </select>
                    </div>

                    {authType === "bearer" && (
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">
                          Bearer Token
                        </label>
                        <input
                          type="text"
                          value={authToken}
                          onChange={(e) => setAuthToken(e.target.value)}
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                          className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs font-mono text-slate-200"
                        />
                      </div>
                    )}

                    {authType === "basic" && (
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Username
                          </label>
                          <input
                            type="text"
                            value={authUsername}
                            onChange={(e) => setAuthUsername(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={authPassword}
                            onChange={(e) => setAuthPassword(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeReqTab === "body" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="bodyMode"
                          checked={bodyMode === "none"}
                          onChange={() => setBodyMode("none")}
                        />
                        <span>None</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="bodyMode"
                          checked={bodyMode === "json"}
                          onChange={() => setBodyMode("json")}
                        />
                        <span>JSON</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="bodyMode"
                          checked={bodyMode === "raw"}
                          onChange={() => setBodyMode("raw")}
                        />
                        <span>Raw Text</span>
                      </label>
                    </div>

                    {bodyMode !== "none" && (
                      <textarea
                        rows={3}
                        value={bodyRaw}
                        onChange={(e) => setBodyRaw(e.target.value)}
                        placeholder='{\n  "key": "value"\n}'
                        className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Response Viewer Panel */}
              <div className="flex-1 flex flex-col overflow-hidden bg-slate-950/60">
                <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 text-xs shrink-0">
                  <span className="font-semibold text-slate-300">Response Viewer</span>

                  {responseResult && (
                    <div className="flex items-center gap-4 font-mono text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          responseResult.status >= 200 && responseResult.status < 300
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {responseResult.status} {responseResult.statusText}
                      </span>

                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{responseResult.durationMs} ms</span>
                      </span>

                      <span className="flex items-center gap-1 text-slate-400">
                        <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                        <span>{responseResult.sizeBytes} B</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-200">
                  {!responseResult ? (
                    <div className="h-full flex items-center justify-center text-slate-500 italic">
                      Click "Send" to execute request and view server response.
                    </div>
                  ) : (
                    <pre className="whitespace-pre-wrap break-all text-emerald-400 bg-slate-950 p-4 rounded-lg border border-slate-800">
                      {typeof responseResult.data === "object"
                        ? JSON.stringify(responseResult.data, null, 2)
                        : responseResult.data}
                    </pre>
                  )}
                </div>
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
        onLoadToWorkbench={(ep) => {
          setName(ep.name);
          const req = ep.request;
          setMethod(req.method || "GET");
          setUrl(req.url || "");
          setHeaders(req.headers && req.headers.length > 0 ? req.headers : [{ key: "", value: "", enabled: true }]);
          setQueryParams(req.queryParams && req.queryParams.length > 0 ? req.queryParams : [{ key: "", value: "", enabled: true }]);
          setAuthType(req.authorization?.type || "none");
          setAuthToken(req.authorization?.token || "");
          setAuthUsername(req.authorization?.username || "");
          setAuthPassword(req.authorization?.password || "");
          setBodyMode((req.body?.mode as any) || "none");
          setBodyRaw(req.body?.raw || "");
          setResponseResult(null);
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
