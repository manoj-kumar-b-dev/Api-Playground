import React, { useState, useEffect } from "react";
import type { EndpointData } from "../../service/endpointService";
import type { ProjectData } from "../../service/projectService";
import type { CollectionData } from "../../service/collectionService";
import { X, Code2 } from "lucide-react";

interface EndpointModalProps {
  isOpen: boolean;
  endpoint?: EndpointData | null;
  projects: ProjectData[];
  collections: CollectionData[];
  defaultProjectId?: string;
  defaultCollectionId?: string;
  defaultFolderId?: string | null;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    projectId: string;
    collectionId: string;
    folderId?: string | null;
    method: string;
    url: string;
    tags: string[];
  }) => Promise<void>;
}

const METHODS = ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"];

export const EndpointModal: React.FC<EndpointModalProps> = ({
  isOpen,
  endpoint,
  projects,
  collections,
  defaultProjectId,
  defaultCollectionId,
  defaultFolderId,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (endpoint) {
      setName(endpoint.name);
      const pId = typeof endpoint.projectId === "object" ? endpoint.projectId._id : endpoint.projectId;
      const cId = typeof endpoint.collectionId === "object" ? endpoint.collectionId._id : endpoint.collectionId;
      setProjectId(pId || "");
      setCollectionId(cId || "");
      setMethod(endpoint.request?.method || "GET");
      setUrl(endpoint.request?.url || "");
      setTagsInput(endpoint.tags ? endpoint.tags.join(", ") : "");
    } else {
      setName("");
      setProjectId(defaultProjectId || (projects.length > 0 ? projects[0]._id : ""));
      setCollectionId(defaultCollectionId || (collections.length > 0 ? collections[0]._id : ""));
      setMethod("GET");
      setUrl("https://jsonplaceholder.typicode.com/todos/1");
      setTagsInput("");
    }
  }, [endpoint, defaultProjectId, defaultCollectionId, projects, collections, isOpen]);

  // Filter collections by selected project
  const filteredCollections = collections.filter((col) => {
    const pId = typeof col.projectId === "object" ? col.projectId._id : col.projectId;
    return pId === projectId;
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId || !collectionId) return;
    setLoading(true);

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      await onSubmit({
        name,
        projectId,
        collectionId,
        folderId: defaultFolderId || null,
        method,
        url,
        tags,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
              <Code2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-semibold text-white">
              {endpoint ? "Edit Endpoint" : "Create New Endpoint"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Endpoint Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Get User Profile"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Project <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={projectId}
                onChange={(e) => {
                  setProjectId(e.target.value);
                  setCollectionId("");
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="" disabled className="bg-slate-900 text-slate-200">
                  Select Project
                </option>
                {projects.map((p) => (
                  <option key={p._id} value={p._id} className="bg-slate-900 text-slate-200">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Collection <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="" disabled className="bg-slate-900 text-slate-200">
                  Select Collection
                </option>
                {(filteredCollections.length > 0 ? filteredCollections : collections).map((col) => (
                  <option key={col._id} value={col._id} className="bg-slate-900 text-slate-200">
                    {col.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 font-mono font-bold focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {METHODS.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-slate-200">
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Request URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.example.com/v1/resource"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags (Comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. auth, users, v1"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim() || !projectId || !collectionId}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors cursor-pointer shadow-lg shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <span>{endpoint ? "Update Endpoint" : "Create Endpoint"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
