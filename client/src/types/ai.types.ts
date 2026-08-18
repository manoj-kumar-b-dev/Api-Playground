export interface AiExplanationResult {
  explanation: string;
  mode: 'explanation' | 'debug';
}

export interface AiExplanationPayload {
  request: {
    method: string;
    url: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    body?: any;
  };
  response: {
    status: number;
    statusText?: string;
    headers?: Record<string, string>;
    body?: any;
  };
}

// Legacy compatibility types
export interface FieldDescription { field: string; description: string; }
export interface SecurityWarning { field: string; issue: string; severity: 'low' | 'medium' | 'high' | 'critical'; }
export interface PerformanceSuggestion { category: string; suggestion: string; }
export interface BestPractice { topic: string; recommendation: string; }
export interface TestCase { name: string; type: 'success' | 'error' | 'edge'; description: string; }

export type AiAnalysisResult = AiExplanationResult;
export type AiAnalysisPayload = AiExplanationPayload;
