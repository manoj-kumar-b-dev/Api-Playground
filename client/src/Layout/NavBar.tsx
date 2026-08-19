import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { SearchBar } from "../components/SearchBar";
import { ThemeToggle } from "../components/ThemeToggle";
import { User as UserIcon, Menu, Search, X } from "lucide-react";

interface NavBarProps {
  onToggleMobileMenu?: () => void;
}

function NavBar({ onToggleMobileMenu }: NavBarProps) {
  const user = useAuthStore((state) => state.user);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="h-16 bg-[var(--bg-secondary)]/80 backdrop-blur-md border-b border-[var(--border-color)] px-4 md:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Mobile Menu Toggle & Brand / SearchBar */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Mobile Hamburger Button */}
        <button
          onClick={onToggleMobileMenu}
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Brand */}
        <div className="flex items-center gap-2 md:hidden truncate">
          <div className="p-1 bg-indigo-600/20 border border-indigo-500/30 rounded-lg shrink-0 flex items-center justify-center">
            <img src="/logo.png" alt="ReqForge Logo" className="w-5 h-5 object-contain drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
          </div>
          <span className="font-bold text-sm text-[var(--text-primary)] truncate">ReqForge</span>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block w-96">
          <SearchBar />
        </div>
      </div>

      {/* Right Controls: Theme Toggle, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="md:hidden p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer"
          title="Search"
        >
          {showMobileSearch ? <X className="w-4 h-4" /> : <Search className="w-4 h-4" />}
        </button>

        <ThemeToggle />

        <div className="h-4 w-px bg-[var(--border-color)] mx-0.5 sm:mx-1"></div>

        {/* User Profile */}
        <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-hover)] border border-[var(--border-color)] hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white font-medium text-xs sm:text-sm shadow-md shadow-indigo-600/20 shrink-0">
            {user?.name ? (
              user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
            ) : user?.email ? (
              user.email[0].toUpperCase()
            ) : (
              <UserIcon className="w-4 h-4" />
            )}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-[var(--text-primary)]">{user?.name || user?.email?.split("@")[0] || "User"}</p>
            <p className="text-[10px] text-[var(--text-secondary)] truncate max-w-[140px]">{user?.email || "Signed In"}</p>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay Bar */}
      {showMobileSearch && (
        <div className="absolute top-16 left-0 right-0 p-3 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] md:hidden z-50 shadow-xl">
          <SearchBar />
        </div>
      )}
    </header>
  );
}

export default NavBar;
