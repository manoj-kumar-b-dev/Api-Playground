import { useQuery } from "@tanstack/react-query";
import { projectService } from "../../service/projectService";
import { collectionService } from "../../service/collectionService";
import { endpointService } from "../../service/endpointService";
import { FolderKanban, Code2, Layers, Star } from "lucide-react";

function StatsCard() {
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

  const { data: endpoints = [] } = useQuery({
    queryKey: ["endpoints"],
    queryFn: async () => {
      const res = await endpointService.getEndpoints();
      return res.success ? res.data : [];
    },
  });

  const { data: favoriteEndpoints = [] } = useQuery({
    queryKey: ["endpoints", "favorites"],
    queryFn: async () => {
      const res = await endpointService.getEndpoints({ favorite: true });
      return res.success ? res.data : [];
    },
  });

  const projectCount = projects.length;
  const collectionCount = collections.length;
  const endpointCount = endpoints.length;
  const favoriteCount = favoriteEndpoints.length;

  const stats = [
    {
      title: "Total Projects",
      value: projectCount,
      icon: FolderKanban,
      change: "Active Workspaces",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10 border-blue-500/20",
    },
    {
      title: "Total APIs",
      value: endpointCount,
      icon: Code2,
      change: "Configured Endpoints",
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10 border-emerald-500/20",
    },
    {
      title: "Collections",
      value: collectionCount,
      icon: Layers,
      change: "API Groups",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10 border-purple-500/20",
    },
    {
      title: "Starred APIs",
      value: favoriteCount,
      icon: Star,
      change: "Starred Endpoints",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon;
        return (
          <div
            key={idx}
            className="bg-[var(--card-bg)] border border-[var(--border-color)] hover:border-indigo-500/40 rounded-xl p-5 transition-all duration-200 hover:shadow-lg group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-[var(--text-secondary)]">
                {stat.title}
              </span>
              <div className={`p-2 rounded-lg border ${stat.bgColor} ${stat.color} transition-transform group-hover:scale-105`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                {stat.value}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                {stat.change}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default StatsCard;
