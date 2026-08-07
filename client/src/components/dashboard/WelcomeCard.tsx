import { useAuthStore } from "../../store/useAuthStore";
import { Sparkles } from "lucide-react";

function WelcomeCard() {
  const user = useAuthStore((state) => state.user);
  const displayName = user?.name ? `${user.name} 👋` : "Manoj 👋";

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 md:p-8 shadow-xl">
      {/* Decorative gradient blur */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute right-20 top-0 w-32 h-32 bg-violet-600/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Developer Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Welcome back, <span className="text-indigo-400">{displayName}</span>
          </h1>
          <p className="text-sm text-slate-300 max-w-xl">
            Manage all your API projects from one place.
          </p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeCard;
