import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { searchService, type SearchResults } from "../service/searchService";
import { Search, FolderKanban, Layers, Code2, X } from "lucide-react";

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<SearchResults>({
    projects: [],
    collections: [],
    folders: [],
    endpoints: [],
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef<HTMLDivElement>(null);

  // Ctrl + K keyboard shortcut binding
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search call
  useEffect(() => {
    if (!query.trim()) {
      setResults({ projects: [], collections: [], folders: [], endpoints: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await searchService.globalSearch(query);
        if (res.success) {
          setResults(res.data);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (url: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(url);
  };

  const totalResults =
    results.projects.length +
    results.collections.length +
    results.folders.length +
    results.endpoints.length;

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      {/* Input bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          placeholder="Search projects, collections, endpoints..."
          className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-9 pr-16 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
        />
        {query ? (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-400 font-mono border border-slate-700/50 pointer-events-none">
            <span>Ctrl K</span>
          </div>
        )}
      </div>

      {/* Results Dropdown Modal */}
      {isOpen && (query.trim().length > 0 || loading) && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[100] max-h-96 overflow-y-auto p-2 space-y-3 animate-fade-in backdrop-blur-xl opacity-100">
          {loading && (
            <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></span>
              <span>Searching workspace...</span>
            </div>
          )}

          {!loading && totalResults === 0 && (
            <div className="p-6 text-center text-xs text-slate-400">
              No results found for "<span className="text-slate-200 font-medium">{query}</span>"
            </div>
          )}

          {!loading && totalResults > 0 && (
            <>
              {/* Projects */}
              {results.projects.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <FolderKanban className="w-3 h-3 text-indigo-400" />
                    <span>Projects ({results.projects.length})</span>
                  </div>
                  {results.projects.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => handleSelect(`/projects/${p._id}`)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: p.color || "#6366f1" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">{p.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{p.description || "Project"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Collections */}
              {results.collections.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Layers className="w-3 h-3 text-violet-400" />
                    <span>Collections ({results.collections.length})</span>
                  </div>
                  {results.collections.map((c) => (
                    <div
                      key={c._id}
                      onClick={() => handleSelect(`/collections/${c._id}`)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <Layers className="w-4 h-4 text-violet-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">{c.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {c.projectId?.name ? `Project: ${c.projectId.name}` : "Collection"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Endpoints */}
              {results.endpoints.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Code2 className="w-3 h-3 text-emerald-400" />
                    <span>Endpoints ({results.endpoints.length})</span>
                  </div>
                  {results.endpoints.map((ep) => (
                    <div
                      key={ep._id}
                      onClick={() => handleSelect(`/apis?id=${ep._id}`)}
                      className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
                    >
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded bg-slate-800 text-emerald-400 border border-emerald-500/30">
                        {ep.request?.method || "GET"}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-200 truncate">{ep.name}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate">
                          {ep.request?.url || ""}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
