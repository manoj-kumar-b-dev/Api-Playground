import { useAuthStore } from "../store/useAuthStore";
import { SearchBar } from "../components/SearchBar";
import { Bell, Sun, User as UserIcon, Code2 } from "lucide-react";

function NavBar() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Logo / Branding & SearchBar */}
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center gap-2.5 sm:hidden">
          <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
            <Code2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-sm text-white">API Playground</span>
        </div>

        {/* Global Live Search Bar */}
        <div className="hidden md:block w-96">
          <SearchBar />
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Notifications, Profile */}
      <div className="flex items-center gap-3">
        <button
          title="Toggle Theme"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer relative"
        >
          <Sun className="w-4 h-4" />
        </button>

        <button
          title="Notifications"
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer relative"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/50 hover:bg-slate-800 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-sm shadow-md shadow-indigo-600/20">
            {user?.name ? user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-slate-200">{user?.name || "Developer"}</p>
            <p className="text-[10px] text-slate-400">{user?.email || "user@example.com"}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default NavBar;
