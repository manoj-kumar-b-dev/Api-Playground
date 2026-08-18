export interface AiExplanationResponse {
  explanation: string;
  mode: 'explanation' | 'debug';
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

export interface AiExplanationRequest {
  request: RequestPayloadData;
  response: ResponsePayloadData;
}

// Backwards compatibility alias
export type AiAnalysisRequest = AiExplanationRequest;
export type AiAnalysisResponse = AiExplanationResponse;
