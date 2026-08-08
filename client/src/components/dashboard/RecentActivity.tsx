import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { endpointService } from "../../service/endpointService";
import { projectService } from "../../service/projectService";
import { getMethodBadgeColor } from "../EndpointCard";
import { Clock, ArrowRight } from "lucide-react";

function RecentActivity() {
  const { data: endpoints = [], isLoading: loadingEp } = useQuery({
    queryKey: ["endpoints"],
    queryFn: async () => {
      const res = await endpointService.getEndpoints();
      return res.success ? res.data : [];
    },
  });

  const { data: projects = [], isLoading: loadingProj } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await projectService.getProjects();
      return res.success ? res.data : [];
    },
  });

  const recentEndpoints = endpoints.slice(0, 4);
  const recentProjects = projects.slice(0, 3);
  const loading = loadingEp || loadingProj;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-base font-semibold text-[var(--text-primary)]">Recent Workspaces & Endpoints</h3>
        </div>
        <Link
          to="/apis"
          className="text-xs text-indigo-500 hover:text-indigo-600 flex items-center gap-1 font-medium"
        >
          <span>View All</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-[var(--text-muted)]">Loading recent activity...</div>
      ) : recentEndpoints.length === 0 && recentProjects.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm font-medium text-[var(--text-primary)]">No recent activity</p>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mt-1">
            Create a project or endpoint to start organizing your APIs.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Endpoints */}
          {recentEndpoints.map((ep: any) => (
            <Link
              key={ep._id}
              to={`/apis?id=${ep._id}`}
              className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-indigo-500/40 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border shrink-0 ${getMethodBadgeColor(
                    ep.request?.method || "GET"
                  )}`}
                >
                  {ep.request?.method || "GET"}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors truncate">
                    {ep.name}
                  </p>
                  <p className="text-[10px] font-mono text-[var(--text-muted)] truncate">
                    {ep.request?.url || "No URL"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">
                {new Date(ep.updatedAt).toLocaleDateString()}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecentActivity;
