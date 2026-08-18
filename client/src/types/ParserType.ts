export type ParserType =
  | 'openapi'
  | 'swagger'
  | 'curl'
  | 'doc'
  | 'manual'
  | 'ai'
  | 'postman'
  | 'graphql'
  | 'grpc'
  | 'unknown';

export interface ParserDetectionResult {
  type: ParserType;
  confidence: number;
  reason: string;
}
