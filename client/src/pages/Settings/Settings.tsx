import { User, Shield, Key } from "lucide-react";
import { useAuthStore } from "../../store/useAuthStore";

function Settings() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-slate-400">
          Manage your account preferences and API key configurations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <User className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-200">Account Information</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Full Name</label>
              <input
                type="text"
                readOnly
                value={user?.name || "Manoj"}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                readOnly
                value={user?.email || "manoj@example.com"}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Config */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-200">Preferences</h2>
          </div>
          <div className="space-y-3">
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between text-sm">
              <span className="text-slate-300">Default Request Timeout</span>
              <span className="text-xs text-indigo-400 font-mono">5000ms</span>
            </div>
            <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800 flex items-center justify-between text-sm">
              <span className="text-slate-300 font-medium flex items-center gap-2">
                <Key className="w-4 h-4 text-slate-400" /> API Keys
              </span>
              <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded">0 active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
