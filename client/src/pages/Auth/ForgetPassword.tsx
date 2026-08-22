import { useState } from "react";
import { api } from "../../service/api";
import { useNavigate } from "react-router-dom";
import { Sparkles, Mail, ArrowLeft, Send, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

function ForgetPassword() {
  const [serverSuccess, setServerSuccess] = useState<null | string>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailInput, setEmailInput] = useState("");

  const navigate = useNavigate();

  const handleSendLink = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerSuccess(null);
    setServerError(null);

    if (!emailInput) {
      setServerError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.post("/auth/forgot-password", { email: emailInput });
      const result = response.data;
      setServerSuccess(result.message || "Password Reset Email Sent!");
    } catch (error: any) {
      setServerError(error.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-primary)] text-[var(--text-primary)] flex items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Dynamic Background Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Tech Grid Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

      {/* Main Glassmorphic Auth Card */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)] shadow-2xl shadow-indigo-950/40 rounded-2xl p-8 relative z-10"
      >
        {/* Top Gradient Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-500 rounded-t-2xl" />

        {/* Back Button */}
        <button
          onClick={() => navigate("/login")}
          type="button"
          className="inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </button>

        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="p-3 bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-violet-500/25 border border-indigo-500/40 rounded-2xl shadow-xl shadow-indigo-500/20 mb-3 flex items-center justify-center transition-transform hover:scale-105 duration-300">
            <img src="/logo.png" alt="ReqForge Logo" className="h-14 w-auto max-w-[120px] object-contain filter drop-shadow-[0_0_16px_rgba(129,140,248,0.7)]" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-indigo-400 mb-1">
            <span>ReqForge</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">Forgot Password?</h1>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Enter your registered email to reset your password</p>
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
            className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{serverSuccess}</span>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSendLink} className="space-y-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                name="email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
              />
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
                <span>Sending link...</span>
              </>
            ) : (
              <>
                <span>Send Reset Link</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default ForgetPassword;
