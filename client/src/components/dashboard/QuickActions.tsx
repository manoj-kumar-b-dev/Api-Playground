import { useNavigate } from "react-router-dom";
import { FolderPlus, FileUp, Layers, Zap } from "lucide-react";
import toast from "react-hot-toast";

function QuickActions() {
  const navigate = useNavigate();

  const handleAction = (actionName: string, path?: string) => {
    if (path) {
      navigate(path);
    } else {
      toast.success(`${actionName} action coming soon!`);
    }
  };

  const actions = [
    {
      label: "New Project",
      icon: FolderPlus,
      color: "from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500",
      path: "/projects",
      description: "Create a workspace for APIs",
    },
    {
      label: "Import API",
      icon: FileUp,
      color: "from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500",
      path: "/apis",
      description: "Upload Swagger/OpenAPI spec",
    },
    {
      label: "Create Collection",
      icon: Layers,
      color: "from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500",
      path: "/collections",
      description: "Organize endpoints into groups",
    },
  ];

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col justify-between h-full">
      <div className="flex items-center gap-2.5 border-b border-[var(--border-color)] pb-4 mb-4">
        <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg">
          <Zap className="w-4 h-4" />
        </div>
        <h3 className="text-base font-semibold text-[var(--text-primary)]">Quick Actions</h3>
      </div>

      <div className="space-y-3 flex-1 flex flex-col justify-center">
        {actions.map((action, id) => {
          const Icon = action.icon;
          return (
            <button
              key={id}
              onClick={() => handleAction(action.label, action.path)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:border-indigo-500/40 text-left transition-all hover:translate-x-1 group cursor-pointer"
            >
              <div className={`p-2.5 rounded-lg bg-gradient-to-r ${action.color} text-white shadow-md transition-transform group-hover:scale-105`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-indigo-500 transition-colors">
                  {action.label}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {action.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuickActions;
