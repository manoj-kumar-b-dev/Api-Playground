export interface FieldDescription {
  field: string;
  description: string;
}

export interface SecurityWarning {
  field: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface PerformanceSuggestion {
  category: string;
  suggestion: string;
}

export interface BestPractice {
  topic: string;
  recommendation: string;
}

export interface TestCase {
  name: string;
  type: 'success' | 'error' | 'edge';
  description: string;
}

export interface AiAnalysisResponse {
  summary: string;
  dataStructure: string;
  fieldDescriptions: FieldDescription[];
  securityWarnings: SecurityWarning[];
  performanceSuggestions: PerformanceSuggestion[];
  bestPractices: BestPractice[];
  typescriptInterface: string;
  jsonSchema: Record<string, any>;
  endpointDescription: string;
  testCases: TestCase[];
}

export interface RequestPayloadData {
  method: string;
  url: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  body?: any;
}

export interface ResponsePayloadData {
  status: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface AiAnalysisRequest {
  request: RequestPayloadData;
  response: ResponsePayloadData;
}
