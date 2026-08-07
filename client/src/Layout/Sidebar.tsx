import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Code2,
  Settings,
  LogOut,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Collections", path: "/collections", icon: Layers },
  { name: "APIs", path: "/apis", icon: Code2 },
  { name: "Settings", path: "/settings", icon: Settings },
];

function Sidebar() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full border-r border-slate-800 shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-800">
        <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl text-white shadow-lg shadow-indigo-500/20">
          <Code2 className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
            API Playground
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Developer Hub</span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer with Logout Button */}
      <div className="p-4 border-t border-slate-800 space-y-3">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>

        <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-500 flex items-center justify-between px-1">
          <span>v1.0.0</span>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
