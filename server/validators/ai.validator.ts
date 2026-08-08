import { z } from "zod";

export const RequestPayloadSchema = z.object({
  method: z.string().default("GET"),
  url: z.string(),
  headers: z.record(z.string(), z.string()).optional(),
  queryParams: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
});

export const ResponsePayloadSchema = z.object({
  status: z.number(),
  statusText: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  body: z.any().optional(),
});

export const AiAnalysisRequestSchema = z.object({
  request: RequestPayloadSchema,
  response: ResponsePayloadSchema,
});

export const FieldDescriptionSchema = z.object({
  field: z.string(),
  description: z.string(),
});

export const SecurityWarningSchema = z.object({
  field: z.string(),
  issue: z.string(),
  severity: z.enum(["low", "medium", "high", "critical"]).default("medium"),
});

export const PerformanceSuggestionSchema = z.object({
  category: z.string(),
  suggestion: z.string(),
});

export const BestPracticeSchema = z.object({
  topic: z.string(),
  recommendation: z.string(),
});

export const TestCaseSchema = z.object({
  name: z.string(),
  type: z.enum(["success", "error", "edge"]).default("success"),
  description: z.string(),
});

export const AiAnalysisResponseSchema = z.object({
  summary: z.string().default("API request completed."),
  dataStructure: z.string().default("Standard JSON object."),
  fieldDescriptions: z.array(FieldDescriptionSchema).default([]),
  securityWarnings: z.array(SecurityWarningSchema).default([]),
  performanceSuggestions: z.array(PerformanceSuggestionSchema).default([]),
  bestPractices: z.array(BestPracticeSchema).default([]),
  typescriptInterface: z.string().default("export interface ResponseObject {}"),
  jsonSchema: z.record(z.string(), z.any()).default({}),
  endpointDescription: z.string().default("API endpoint."),
  testCases: z.array(TestCaseSchema).default([]),
});
