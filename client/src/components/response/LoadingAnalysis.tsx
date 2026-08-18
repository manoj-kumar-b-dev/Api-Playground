import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface LoadingAnalysisProps {
  message?: string;
}

export const LoadingAnalysis: React.FC<LoadingAnalysisProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--card-bg)] rounded-xl border border-indigo-500/30 my-2 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 animate-pulse pointer-events-none" />

      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
        <div className="relative p-4 rounded-full bg-[var(--bg-secondary)] border border-indigo-500/50 text-indigo-500 shadow-lg shadow-indigo-500/20">
          <Bot className="h-8 w-8 animate-bounce" />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm font-bold text-[var(--text-primary)] mb-1">
        <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
        <span>{message || "Analyzing Endpoint with Gemini LLM..."}</span>
      </div>

      <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
        Generating developer-friendly plain-text response explanations and actionable debugging insights.
      </p>

      {/* Loading Progress Bar Animation */}
      <div className="w-48 h-1 bg-[var(--bg-secondary)] rounded-full mt-5 overflow-hidden border border-[var(--border-color)]">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-full animate-pulse" />
      </div>
    </div>
  );
};
