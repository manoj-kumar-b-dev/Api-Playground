import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../Context/ThemeContext";

interface ThemeToggleProps {
  variant?: "icon" | "pill" | "labeled";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className = "" }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Toggle theme (Currently ${theme})`}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`relative inline-flex items-center w-14 h-8 p-1 rounded-full cursor-pointer transition-colors duration-300 select-none overflow-hidden ${
          isDark
            ? "bg-slate-900 border border-slate-700 hover:border-indigo-500/60 shadow-inner"
            : "bg-amber-100/90 border border-amber-300 hover:border-amber-400 shadow-inner"
        } ${className}`}
      >
        {/* Background Track Icons */}
        <div className="absolute inset-0 px-2 flex items-center justify-between pointer-events-none z-0">
          <Sun className={`w-3.5 h-3.5 transition-opacity duration-200 ${isDark ? "opacity-60 text-amber-400" : "opacity-0"}`} />
          <Moon className={`w-3.5 h-3.5 transition-opacity duration-200 ${!isDark ? "opacity-60 text-indigo-500" : "opacity-0"}`} />
        </div>

        {/* Sliding Thumb */}
        <motion.div
          animate={{ x: isDark ? 24 : 0 }}
          transition={{ type: "spring", stiffness: 450, damping: 28 }}
          className={`w-6 h-6 rounded-full flex items-center justify-center shadow-md relative z-10 ${
            isDark
              ? "bg-indigo-600 text-indigo-100 shadow-indigo-900/50"
              : "bg-amber-500 text-amber-50 shadow-amber-600/30"
          }`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon-thumb"
                initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Moon className="w-3.5 h-3.5 fill-indigo-200 text-indigo-200" />
              </motion.div>
            ) : (
              <motion.div
                key="sun-thumb"
                initial={{ rotate: 90, scale: 0.4, opacity: 0 }}
                animate={{ rotate: 0, scale: 1, opacity: 1 }}
                exit={{ rotate: -90, scale: 0.4, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                <Sun className="w-3.5 h-3.5 fill-amber-100 text-amber-100" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </button>
    );
  }

  if (variant === "labeled") {
    return (
      <motion.button
        type="button"
        onClick={toggleTheme}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        aria-label="Toggle Theme"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border cursor-pointer transition-all duration-300 select-none ${
          isDark
            ? "bg-slate-800/80 border-slate-700/80 text-amber-400 hover:bg-slate-800 hover:border-amber-500/40 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
            : "bg-amber-50/80 border-amber-200/80 text-indigo-600 hover:bg-amber-100 hover:border-indigo-400/40 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
        } ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="dark-labeled"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex items-center gap-2"
            >
              <Sun className="w-4 h-4 text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
              <span className="text-xs font-semibold text-slate-200">Light Mode</span>
            </motion.div>
          ) : (
            <motion.div
              key="light-labeled"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              className="flex items-center gap-2"
            >
              <Moon className="w-4 h-4 text-indigo-600 filter drop-shadow-[0_0_6px_rgba(99,102,241,0.6)]" />
              <span className="text-xs font-semibold text-slate-700">Dark Mode</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  // Default Icon Button
  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.92 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label="Toggle Theme"
      className={`relative p-2 rounded-lg border cursor-pointer overflow-hidden transition-colors duration-300 ${
        isDark
          ? "bg-[var(--bg-hover)] border-[var(--border-color)] text-amber-400 hover:text-amber-300 hover:border-amber-500/40 shadow-sm hover:shadow-[0_0_12px_rgba(251,191,36,0.25)]"
          : "bg-[var(--bg-hover)] border-[var(--border-color)] text-indigo-600 hover:text-indigo-500 hover:border-indigo-400/40 shadow-sm hover:shadow-[0_0_12px_rgba(99,102,241,0.25)]"
      } ${className}`}
    >
      {/* Dynamic Ambient Background Glow */}
      <motion.div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: isDark
            ? "radial-gradient(circle at center, rgba(251, 191, 36, 0.2) 0%, transparent 70%)"
            : "radial-gradient(circle at center, rgba(99, 102, 241, 0.2) 0%, transparent 70%)",
        }}
      />

      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="sun-icon"
            initial={{ scale: 0.3, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.3, rotate: 180, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="relative flex items-center justify-center"
          >
            <Sun className="w-4 h-4 text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            <motion.span
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-amber-400/30 blur-xs -z-10"
            />
          </motion.div>
        ) : (
          <motion.div
            key="moon-icon"
            initial={{ scale: 0.3, rotate: 180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.3, rotate: -180, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 20 }}
            className="relative flex items-center justify-center"
          >
            <Moon className="w-4 h-4 text-indigo-600 dark:text-indigo-400 filter drop-shadow-[0_0_6px_rgba(99,102,241,0.5)]" />
            <motion.span
              animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full bg-indigo-500/30 blur-xs -z-10"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
