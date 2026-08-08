import React from 'react';
import { Sparkles, RefreshCw, AlertCircle, Bot, CheckCircle, FileText, LayoutList, TestTube2, ShieldAlert } from 'lucide-react';
import { useRequestStore } from '../../stores/requestStore';
import { LoadingAnalysis } from './LoadingAnalysis';
import { InsightCard } from './InsightCard';
import { SecurityWarnings } from './SecurityWarnings';
import { PerformanceSuggestions } from './PerformanceSuggestions';
import { TypeScriptViewer } from './TypeScriptViewer';
import { JsonSchemaViewer } from './JsonSchemaViewer';

export const AiInsights: React.FC = () => {
  const { aiInsights, isAnalyzing, analysisError, generateAiInsights, response } = useRequestStore();

  if (!response) {
    return (
      <div className="p-8 text-center text-xs text-[var(--text-muted)] bg-[var(--card-bg)] rounded-b-lg border-t border-[var(--border-color)]">
        Execute an HTTP request first to generate AI insights.
      </div>
    );
  }

  if (isAnalyzing) {
    return <LoadingAnalysis />;
  }

  if (analysisError) {
    return (
      <div className="p-6 rounded-xl bg-[var(--card-bg)] border border-rose-500/30 text-center space-y-3 my-2">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-500 inline-block">
          <AlertCircle className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-[var(--text-primary)]">AI Analysis Failed</h4>
          <p className="text-xs text-[var(--text-secondary)] max-w-md mx-auto">{analysisError}</p>
        </div>
        <button
          type="button"
          onClick={generateAiInsights}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Analysis</span>
        </button>
      </div>
    );
  }

  if (!aiInsights) {
    return (
      <div className="flex flex-col items-center justify-center p-10 text-center bg-[var(--card-bg)] rounded-b-lg border-t border-[var(--border-color)]">
        <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-3">
          <Bot className="h-7 w-7" />
        </div>
        <h3 className="text-sm font-bold text-[var(--text-primary)]">AI Response Insights & Diagnostics</h3>
        <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-md leading-relaxed mb-4">
          Click below to run automated AI security checks, data structure analysis, TypeScript interfaces, JSON schema, and test case generation.
        </p>

        <button
          type="button"
          onClick={generateAiInsights}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30 transition-all cursor-pointer transform hover:scale-105 active:scale-95"
        >
          <Sparkles className="h-4 w-4 text-amber-300 animate-pulse" />
          <span>Generate AI Insights</span>
        </button>
      </div>
    );
  }

  const {
    summary,
    dataStructure,
    fieldDescriptions,
    securityWarnings,
    performanceSuggestions,
    bestPractices,
    typescriptInterface,
    jsonSchema,
    endpointDescription,
    testCases,
  } = aiInsights;

  return (
    <div className="p-4 space-y-4 bg-[var(--card-bg)] rounded-b-lg border-t border-[var(--border-color)] max-h-[560px] overflow-y-auto">
      {/* Top Header Bar with Refresh Action */}
      <div className="flex items-center justify-between bg-[var(--bg-secondary)] p-3 rounded-xl border border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-500" />
          <span className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">AI Analysis Result</span>
        </div>

        <button
          type="button"
          onClick={generateAiInsights}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-tertiary)] border border-[var(--border-color)] hover:bg-[var(--bg-hover)] rounded-lg transition-colors cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5 text-indigo-500" />
          <span>Re-analyze</span>
        </button>
      </div>

      {/* Summary */}
      <InsightCard icon={<CheckCircle className="h-4 w-4" />} title="Executive Summary">
        <p className="text-xs leading-relaxed text-[var(--text-primary)]">{summary}</p>
      </InsightCard>

      {/* Data Structure & Endpoint Description Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <InsightCard icon={<LayoutList className="h-4 w-4" />} title="Data Structure">
          <p className="text-xs leading-relaxed text-[var(--text-primary)]">{dataStructure}</p>
        </InsightCard>

        <InsightCard icon={<FileText className="h-4 w-4" />} title="Endpoint Documentation">
          <p className="text-xs leading-relaxed text-[var(--text-primary)]">{endpointDescription}</p>
        </InsightCard>
      </div>

      {/* Field Descriptions Table */}
      {fieldDescriptions && fieldDescriptions.length > 0 && (
        <InsightCard icon={<LayoutList className="h-4 w-4" />} title="Field Explanations" badge={`${fieldDescriptions.length} Fields`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] font-mono text-[10px] uppercase">
                  <th className="py-2 px-2 w-1/3">Field</th>
                  <th className="py-2 px-2">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)] font-mono">
                {fieldDescriptions.map((fd, idx) => (
                  <tr key={idx} className="hover:bg-[var(--bg-hover)]">
                    <td className="py-1.5 px-2 text-indigo-600 dark:text-indigo-300 font-semibold">{fd.field}</td>
                    <td className="py-1.5 px-2 text-[var(--text-primary)] font-sans text-xs">{fd.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </InsightCard>
      )}

      {/* Security Analysis */}
      <InsightCard
        icon={<ShieldAlert className="h-4 w-4" />}
        title="Security Analysis"
        badge={securityWarnings?.length ? `${securityWarnings.length} Warnings` : 'Clean'}
        badgeColor={securityWarnings?.length ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'}
      >
        <SecurityWarnings warnings={securityWarnings} />
      </InsightCard>

      {/* Performance Analysis & Best Practices */}
      <InsightCard icon={<Sparkles className="h-4 w-4" />} title="Performance & Best Practices">
        <PerformanceSuggestions performance={performanceSuggestions} bestPractices={bestPractices} />
      </InsightCard>

      {/* TypeScript & JSON Schema Tabs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <TypeScriptViewer code={typescriptInterface} />
        <JsonSchemaViewer schema={jsonSchema} />
      </div>

      {/* Suggested Test Cases */}
      {testCases && testCases.length > 0 && (
        <InsightCard icon={<TestTube2 className="h-4 w-4" />} title="Suggested Test Cases" badge={`${testCases.length} Scenarios`}>
          <div className="space-y-2">
            {testCases.map((tc, idx) => {
              const badgeStyle =
                tc.type === 'success'
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/30'
                  : tc.type === 'error'
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border-rose-500/30'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30';

              return (
                <div key={idx} className="p-2.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] flex items-start justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <span className="text-xs font-bold text-[var(--text-primary)]">{tc.name}</span>
                    <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{tc.description}</p>
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase shrink-0 ${badgeStyle}`}>
                    {tc.type}
                  </span>
                </div>
              );
            })}
          </div>
        </InsightCard>
      )}
    </div>
  );
};
