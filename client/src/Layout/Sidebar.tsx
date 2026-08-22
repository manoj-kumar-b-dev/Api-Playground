import { NavLink, useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
  LayoutDashboard,
  FolderKanban,
  Layers,
  Code2,
  Settings,
  LogOut,
  Sparkles,
  X
} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Projects", path: "/projects", icon: FolderKanban },
  { name: "Collections", path: "/collections", icon: Layers },
  { name: "APIs", path: "/apis", icon: Code2 },
  { name: "Settings", path: "/settings", icon: Settings },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const logout = useAuthStore((state) => state.logout);
  const location = useLocation();

  // Close mobile sidebar on route change
  useEffect(() => {
    if (onClose) onClose();
  }, [location.pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full w-52 bg-[var(--bg-secondary)] text-[var(--text-primary)] border-r border-[var(--border-color)]">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="ReqForge Logo" className="h-8 w-8 object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base tracking-wide text-[var(--text-primary)] flex items-center gap-1.5">
              ReqForge
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-[var(--text-secondary)] hover:text-white rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                  ? "bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                }`
              }
            >
              <Icon className="w-[18px] h-[18px] shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Sidebar Footer with Logout Button */}
      <div className="p-3 border-t border-[var(--border-color)] space-y-2">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <span>Logout</span>
        </button>

        <div className="pt-2 border-t border-[var(--border-light)] text-[11px] text-[var(--text-muted)] flex items-center justify-between px-1">
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-52 shrink-0 h-full">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[var(--overlay-bg)] backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />

          {/* Sliding Drawer Panel */}
          <div className="relative w-60 max-w-[80vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

export default Sidebar;
