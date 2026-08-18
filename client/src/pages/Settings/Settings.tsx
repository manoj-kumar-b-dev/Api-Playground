import { User, Palette, Sun, Moon, CheckCircle2 } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";
import { useTheme } from "../../Context/ThemeContext";
import { ThemeToggle } from "../../components/ThemeToggle";

function Settings() {
  const user = useAuthStore((state) => state.user);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Settings</h1>
        <p className="text-sm text-[var(--text-secondary)]">
          Manage your account preferences, theme appearance, and API configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Full Name</label>
              <input
                type="text"
                readOnly
                value={user?.name || "Manoj"}
                className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Email Address</label>
              <input
                type="email"
                readOnly
                value={user?.email || "manoj@example.com"}
                className="w-full px-3 py-2 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--text-primary)] text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Appearance & Theme Card */}
        <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Appearance & Theme</h2>
            </div>
            <ThemeToggle variant="pill" />
          </div>

          <p className="text-xs text-[var(--text-secondary)]">
            Choose how API Playground looks to you. Select a theme below or use the quick toggle above.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {/* Dark Mode Card */}
            <button
              type="button"
              onClick={() => {
                if (theme !== "dark") toggleTheme();
              }}
              className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                theme === "dark"
                  ? "bg-indigo-950/40 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/10"
                  : "bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-indigo-500/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-slate-900 text-indigo-400 border border-slate-800">
                  <Moon className="w-4 h-4" />
                </div>
                {theme === "dark" && (
                  <CheckCircle2 className="w-4 h-4 text-indigo-500" />
                )}
              </div>
              <div className="font-semibold text-sm text-[var(--text-primary)]">Dark Mode</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Sleek dark design for low light environments
              </div>
            </button>

            {/* Light Mode Card */}
            <button
              type="button"
              onClick={() => {
                if (theme !== "light") toggleTheme();
              }}
              className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 ${
                theme === "light"
                  ? "bg-amber-500/10 border-amber-500/80 ring-2 ring-amber-500/20 shadow-md shadow-amber-500/10"
                  : "bg-[var(--bg-secondary)] border-[var(--border-color)] hover:border-amber-500/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600 border border-amber-200">
                  <Sun className="w-4 h-4" />
                </div>
                {theme === "light" && (
                  <CheckCircle2 className="w-4 h-4 text-amber-500" />
                )}
              </div>
              <div className="font-semibold text-sm text-[var(--text-primary)]">Light Mode</div>
              <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
                Clean & vibrant design with high contrast
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
