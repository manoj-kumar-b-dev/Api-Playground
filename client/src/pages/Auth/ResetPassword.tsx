import { useState } from "react";
import { api } from "../../service/api";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Sparkles, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [serverSuccess, setServerSuccess] = useState<null | string>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token") || "";

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setServerSuccess(null);

    if (!token) {
      setServerError("Reset token is missing from URL. Please request a new password reset link.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("new-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (!newPassword || !confirmPassword) {
      setServerError("Please fill in both password fields.");
      return;
    }

    if (confirmPassword !== newPassword) {
      setServerError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/reset-password", { token, newPassword });
      setServerSuccess(response.data.message || "Password reset successful! You can now sign in with your new password.");
    } catch (error: any) {
      const data = error.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        const validationMsgs = data.errors.map((err: { message: string }) => err.message).join(". ");
        setServerError(validationMsgs);
      } else if (data?.message) {
        setServerError(data.message);
      } else {
        setServerError("Failed to reset password. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Tech Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Main Glassmorphic Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 shadow-2xl shadow-indigo-950/40 rounded-2xl p-8 relative z-10"
      >
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-t-2xl" />

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="px-3 py-2.5 bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-violet-500/20 border border-indigo-500/30 rounded-2xl shadow-xl shadow-indigo-500/10 mb-3 flex items-center justify-center">
            <img src="/logo.png" alt="ReqForge Logo" className="h-10 w-10 object-contain drop-shadow-[0_0_14px_rgba(99,102,241,0.6)]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-indigo-400 mb-1">
            <span>ReqForge</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset Your Password</h1>
          <p className="text-xs text-slate-400 mt-1">Enter your new credentials below</p>
        </div>

        {/* Alerts for Feedback */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </motion.div>
        )}

        {serverSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex flex-col items-start gap-2"
          >
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{serverSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="mt-2 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2 rounded-lg text-xs transition-colors cursor-pointer text-center"
            >
              Proceed to Sign In
            </button>
          </motion.div>
        )}

        {!serverSuccess && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            {/* New Password Field */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="new-password">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="new-password"
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 chars (1 upper, 1 lower, 1 number)"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5" htmlFor="confirm-password">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  name="confirm-password"
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Re-enter your new password"
                  required
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <span>Reset Password</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default ResetPassword;
