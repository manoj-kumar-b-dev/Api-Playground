import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle, Bot, Copy, Check, Bug, Wrench } from 'lucide-react';
import { useRequestStore } from '../../stores/requestStore';
import { LoadingAnalysis } from './LoadingAnalysis';

export const AiExplanation: React.FC = () => {
  const { aiExplanation, isAnalyzing, analysisError, generateAiExplanation, response } = useRequestStore();
  const [copied, setCopied] = useState(false);

  if (!response) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--card-bg)] rounded-b-lg border-t border-[var(--border-color)]">
        Execute an HTTP request first to generate AI explanation or debug response.
      </div>
    );
  }

  const isSuccess = response.status >= 200 && response.status < 300;
  const isDebugMode = !isSuccess || (aiExplanation && aiExplanation.mode === 'debug');

  const handleCopy = () => {
    if (!aiExplanation?.explanation) return;
    navigator.clipboard.writeText(aiExplanation.explanation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isAnalyzing) {
    return <LoadingAnalysis message={isDebugMode ? "Debugging API Error with Gemini LLM..." : "Generating AI Explanation with Gemini LLM..."} />;
  }

  if (analysisError) {
    return (
      <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-rose-500/30 text-center space-y-3 my-2">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-500 inline-block">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">
            {isDebugMode ? 'AI Debugging Failed' : 'AI Explanation Failed'}
          </h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">{analysisError}</p>
        </div>
        <button
          type="button"
          onClick={generateAiExplanation}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Analysis</span>
        </button>
      </div>
    );
  }

  if (!aiExplanation) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-[var(--card-bg)] rounded-b-lg border-t border-[var(--border-color)]">
        <div className={`p-3 rounded-full border mb-3 ${isDebugMode ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-500'}`}>
          {isDebugMode ? <Bug className="h-7 w-7" /> : <Bot className="h-7 w-7" />}
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">
          {isDebugMode ? 'Debug Endpoint Error with AI' : 'AI Response Explanation'}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed mb-4">
          {isDebugMode
            ? 'Click below to analyze this HTTP error status, inspect root cause details, and get plain-text instructions on how to fix this error.'
            : 'Click below to generate a clear plain-text explanation of this endpoint, request parameters, and response structure.'}
        </p>

        <button
          type="button"
          onClick={generateAiExplanation}
          className={`flex items-center gap-2 px-5 py-2.5 text-white font-semibold text-xs rounded-xl shadow-lg border transition-all cursor-pointer transform hover:scale-105 active:scale-95 ${
            isDebugMode
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 border-rose-400/30 shadow-rose-500/20'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 border-indigo-400/30 shadow-indigo-500/20'
          }`}
        >
          {isDebugMode ? <Wrench className="h-4 w-4 text-amber-300 animate-bounce" /> : <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />}
          <span>{isDebugMode ? 'Debug with AI' : 'Generate AI Explanation'}</span>
        </button>
      </div>
    );
  }

  // Formatting helper for plain text markdown styling
  const renderPlainText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Main Headers ## Header
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-sm font-bold text-indigo-400 dark:text-indigo-300 border-b border-[var(--border-color)] pb-1.5 mt-4 mb-2 first:mt-0 flex items-center gap-2">
            {trimmed.replace(/^##\s+/, '')}
          </h3>
        );
      }

      // Sub Headers ### Header
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-semibold text-[var(--text-primary)] mt-3 mb-1">
            {trimmed.replace(/^###\s+/, '')}
          </h4>
        );
      }

      // Bullet points
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.replace(/^[-*]\s+/, '');
        return (
          <li key={idx} className="text-xs leading-relaxed text-[var(--text-primary)] ml-4 list-disc mb-1">
            {formatInlineText(content)}
          </li>
        );
      }

      // Numbered items
      if (/^\d+\.\s+/.test(trimmed)) {
        const content = trimmed.replace(/^\d+\.\s+/, '');
        return (
          <li key={idx} className="text-xs leading-relaxed text-[var(--text-primary)] ml-4 list-decimal mb-1">
            {formatInlineText(content)}
          </li>
        );
      }

      // Empty line
      if (trimmed === '') {
        return <div key={idx} className="h-2" />;
      }

      // Regular paragraph
      return (
        <p key={idx} className="text-xs leading-relaxed text-[var(--text-primary)] mb-2">
          {formatInlineText(trimmed)}
        </p>
      );
    });
  };

  // Basic inline formatting: **bold**, `code`
  const formatInlineText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-semibold text-[var(--text-primary)]">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return <code key={i} className="px-1.5 py-0.5 rounded bg-[var(--bg-tertiary)] border border-[var(--border-color)] font-mono text-[11px] text-indigo-400 dark:text-indigo-300">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <div className="p-4 space-y-4 bg-[var(--card-bg)] rounded-b-lg border-t border-[var(--border-color)] max-h-[560px] overflow-y-auto">
      {/* Action Bar Header */}
      <div className="flex items-center justify-between bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          {isDebugMode ? (
            <Bug className="h-5 w-5 text-rose-500" />
          ) : (
            <Bot className="h-5 w-5 text-indigo-500" />
          )}
          <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
            {isDebugMode ? 'Debug with AI Explanation' : 'AI Endpoint Explanation'}
          </span>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
            isDebugMode ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20'
          }`}>
            {isDebugMode ? `Error ${response.status}` : '200 OK'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Explanation'}</span>
          </button>

          <button
            type="button"
            onClick={generateAiExplanation}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
            <span>Re-analyze</span>
          </button>
        </div>
      </div>

      {/* Pure Plain Text Content View */}
      <div className="p-4 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] font-sans">
        {renderPlainText(aiExplanation.explanation)}
      </div>
    </div>
  );
};
