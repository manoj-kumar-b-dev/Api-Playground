import React, { useState, useEffect } from "react";
import { parseCurlCommand } from "../../utils/curlParser";
import type { ParsedImportEndpoint } from "../../utils/curlParser";
import { parseOpenApiSpec } from "../../utils/openApiParser";
import { parseDocumentationText } from "../../utils/docParser";
import { endpointService } from "../../service/endpointService";
import type { EndpointRequestConfig } from "../../service/endpointService";
import type { ProjectData } from "../../service/projectService";
import type { CollectionData } from "../../service/collectionService";
import { getMethodBadgeColor } from "../EndpointCard";
import {
  X,
  FileCode,
  Terminal,
  FileText,
  Edit3,
  CheckCircle2,
  AlertCircle,
  FolderInput,
  ArrowRight,
  Layers,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: ProjectData[];
  collections: CollectionData[];
  defaultProjectId?: string;
  defaultCollectionId?: string;
  onImportSuccess?: (importedEndpoints: ParsedImportEndpoint[]) => void;
  onLoadToWorkbench?: (endpoint: ParsedImportEndpoint) => void;
}

type ImportTab = "curl" | "openapi" | "doc" | "manual";

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  projects,
  collections,
  defaultProjectId,
  defaultCollectionId,
  onImportSuccess,
  onLoadToWorkbench,
}) => {
  const [activeTab, setActiveTab] = useState<ImportTab>("curl");
  const [inputText, setInputText] = useState("");

  // Manual endpoint state
  const [manualMethod, setManualMethod] = useState<EndpointRequestConfig["method"]>("GET");
  const [manualUrl, setManualUrl] = useState("");
  const [manualName, setManualName] = useState("");
  const [manualHeaders, setManualHeaders] = useState("");
  const [manualBody, setManualBody] = useState("");

  // Target Destination
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>("");
  const [availableCollections, setAvailableCollections] = useState<CollectionData[]>([]);

  // Parsing result & status
  const [parsedEndpoints, setParsedEndpoints] = useState<ParsedImportEndpoint[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (defaultProjectId) {
      setSelectedProjectId(defaultProjectId);
    } else if (projects.length > 0) {
      setSelectedProjectId(projects[0]._id);
    }
  }, [defaultProjectId, projects]);

  useEffect(() => {
    if (selectedProjectId) {
      const filtered = collections.filter((c) => {
        const pId = typeof c.projectId === "object" ? c.projectId._id : c.projectId;
        return pId === selectedProjectId;
      });
      setAvailableCollections(filtered);

      if (defaultCollectionId && filtered.some((c) => c._id === defaultCollectionId)) {
        setSelectedCollectionId(defaultCollectionId);
      } else if (filtered.length > 0) {
        setSelectedCollectionId(filtered[0]._id);
      } else {
        setSelectedCollectionId("");
      }
    } else {
      setAvailableCollections([]);
      setSelectedCollectionId("");
    }
  }, [selectedProjectId, collections, defaultCollectionId]);

  if (!isOpen) return null;

  const handleParse = () => {
    setParseError(null);
    setParsedEndpoints([]);

    try {
      if (activeTab === "curl") {
        if (!inputText.trim()) throw new Error("Please enter a valid cURL command.");
        const ep = parseCurlCommand(inputText);
        setParsedEndpoints([ep]);
        toast.success("cURL command parsed successfully!");
      } else if (activeTab === "openapi") {
        if (!inputText.trim()) throw new Error("Please paste an OpenAPI or Swagger spec (JSON/YAML).");
        const eps = parseOpenApiSpec(inputText);
        setParsedEndpoints(eps);
        toast.success(`Successfully parsed ${eps.length} OpenAPI endpoints!`);
      } else if (activeTab === "doc") {
        if (!inputText.trim()) throw new Error("Please paste API documentation text or markdown.");
        const eps = parseDocumentationText(inputText);
        setParsedEndpoints(eps);
        toast.success(`Successfully parsed ${eps.length} API documentation endpoint${eps.length > 1 ? "s" : ""}!`);
      } else if (activeTab === "manual") {
        if (!manualUrl.trim()) throw new Error("Endpoint URL is required.");

        const parsedHeaders = manualHeaders
          .split("\n")
          .filter((l) => l.includes(":"))
          .map((l) => {
            const idx = l.indexOf(":");
            return {
              key: l.substring(0, idx).trim(),
              value: l.substring(idx + 1).trim(),
              enabled: true,
            };
          });

        let bodyMode: EndpointRequestConfig["body"]["mode"] = "none";
        if (manualBody.trim()) {
          try {
            JSON.parse(manualBody);
            bodyMode = "json";
          } catch {
            bodyMode = "raw";
          }
        }

        const ep: ParsedImportEndpoint = {
          name: manualName || `${manualMethod} ${manualUrl}`,
          request: {
            method: manualMethod,
            url: manualUrl,
            headers: parsedHeaders,
            queryParams: [],
            pathParams: [],
            body: {
              mode: bodyMode,
              raw: manualBody,
            },
            authorization: { type: "none" },
          },
        };
        setParsedEndpoints([ep]);
        toast.success("Manual endpoint prepared!");
      }
    } catch (err: any) {
      setParseError(err.message || "Failed to parse input.");
      toast.error(err.message || "Parsing error");
    }
  };

  const handleImportToCollection = async () => {
    if (parsedEndpoints.length === 0) {
      toast.error("Please parse input first to view endpoints to import.");
      return;
    }
    if (!selectedProjectId || !selectedCollectionId) {
      toast.error("Please select a target Project and Collection.");
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;

    try {
      for (const ep of parsedEndpoints) {
        await endpointService.createEndpoint({
          name: ep.name,
          projectId: selectedProjectId,
          collectionId: selectedCollectionId,
          request: ep.request,
        });
        successCount++;
      }

      toast.success(`✓ Import Complete! (${successCount} endpoints created)`);
      if (onImportSuccess) onImportSuccess(parsedEndpoints);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Import failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenInWorkbench = (ep: ParsedImportEndpoint) => {
    if (onLoadToWorkbench) {
      onLoadToWorkbench(ep);
      toast.success(`Loaded "${ep.name}" into active workbench!`);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <FolderInput className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Import API Endpoints</h2>
              <p className="text-xs text-slate-400">
                Import from cURL, OpenAPI/Swagger specs, Documentation, or Manual entry
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 space-x-2">
          <button
            onClick={() => {
              setActiveTab("curl");
              setParsedEndpoints([]);
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 ${
              activeTab === "curl"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>cURL Command</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("openapi");
              setParsedEndpoints([]);
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 ${
              activeTab === "openapi"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>OpenAPI / Swagger</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("doc");
              setParsedEndpoints([]);
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 ${
              activeTab === "doc"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Documentation</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("manual");
              setParsedEndpoints([]);
            }}
            className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-medium rounded-t-lg transition border-b-2 ${
              activeTab === "manual"
                ? "border-indigo-500 text-indigo-400 bg-slate-800/60"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>Manual Endpoint</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Input Area */}
          {activeTab !== "manual" ? (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">
                {activeTab === "curl" && "Paste cURL Command:"}
                {activeTab === "openapi" && "Paste OpenAPI 3.0 or Swagger 2.0 (JSON or YAML):"}
                {activeTab === "doc" && "Paste API Raw Documentation or Markdown snippet:"}
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={
                  activeTab === "curl"
                    ? 'curl -X POST "https://api.example.com/v1/users" -H "Authorization: Bearer token" -H "Content-Type: application/json" -d \'{"name":"John"}\''
                    : activeTab === "openapi"
                    ? '{\n  "openapi": "3.0.0",\n  "info": { "title": "Sample API" },\n  "paths": { ... }\n}'
                    : "POST https://api.example.com/v1/auth/login\nHeaders:\nAuthorization: Bearer token123\n\nBody:\n{\n  \"username\": \"admin\"\n}"
                }
                rows={6}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>
          ) : (
            <div className="space-y-4 bg-slate-950/60 p-4 border border-slate-800 rounded-lg">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Method</label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  >
                    {["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Endpoint URL</label>
                  <input
                    type="text"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://api.example.com/v1/resource"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Endpoint Name</label>
                <input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Create New User"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Headers <span className="text-slate-500">(One per line "Key: Value")</span>
                  </label>
                  <textarea
                    value={manualHeaders}
                    onChange={(e) => setManualHeaders(e.target.value)}
                    placeholder="Content-Type: application/json&#10;Authorization: Bearer token"
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Body (JSON/Raw)</label>
                  <textarea
                    value={manualBody}
                    onChange={(e) => setManualBody(e.target.value)}
                    placeholder='{"key": "value"}'
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Parse Trigger Button */}
          <div className="flex justify-end">
            <button
              onClick={handleParse}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-medium transition shadow-lg shadow-indigo-600/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Parse & Preview</span>
            </button>
          </div>

          {/* Parse Error Alert */}
          {parseError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-3 text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* Parsed Endpoints Preview Section */}
          {parsedEndpoints.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-semibold text-emerald-400">
                    Parsing Working ({parsedEndpoints.length} endpoint{parsedEndpoints.length > 1 ? "s" : ""} extracted)
                  </h3>
                </div>
              </div>

              {/* Endpoint Cards List */}
              <div className="max-h-56 overflow-y-auto space-y-2 pr-1">
                {parsedEndpoints.map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between space-x-3 hover:border-slate-700 transition"
                  >
                    <div className="flex items-center space-x-3 overflow-hidden">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getMethodBadgeColor(
                          ep.request.method
                        )}`}
                      >
                        {ep.request.method}
                      </span>
                      <div className="truncate">
                        <p className="text-xs font-medium text-white truncate">{ep.name}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{ep.request.url || "No URL"}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {onLoadToWorkbench && (
                        <button
                          onClick={() => handleOpenInWorkbench(ep)}
                          className="px-2.5 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded border border-slate-700 transition flex items-center space-x-1"
                        >
                          <span>Workbench</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Target Project & Collection Selection */}
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg space-y-3 mt-4">
                <h4 className="text-xs font-semibold text-slate-300 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  <span>Target Destination for Import</span>
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Project</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
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
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">Collection</label>
                    <select
                      value={selectedCollectionId}
                      onChange={(e) => setSelectedCollectionId(e.target.value)}
                      disabled={availableCollections.length === 0}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                    >
                      <option value="" disabled className="bg-slate-900 text-slate-200">
                        {availableCollections.length > 0 ? "Select Collection" : "No Collections in Project"}
                      </option>
                      {availableCollections.map((c) => (
                        <option key={c._id} value={c._id} className="bg-slate-900 text-slate-200">
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/60">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            {parsedEndpoints.length > 0 && (
              <span className="flex items-center space-x-1 text-emerald-400 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Import Complete ready</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>

            <button
              onClick={handleImportToCollection}
              disabled={parsedEndpoints.length === 0 || !selectedCollectionId || isSubmitting}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white px-5 py-2 rounded-lg text-xs font-semibold transition shadow-lg shadow-indigo-600/20 disabled:cursor-not-allowed"
            >
              <span>{isSubmitting ? "Importing..." : `Import to Collection (${parsedEndpoints.length})`}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
