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

export const AiExplanationRequestSchema = z.object({
  request: RequestPayloadSchema,
  response: ResponsePayloadSchema,
});

export const AiExplanationResponseSchema = z.object({
  explanation: z.string(),
  mode: z.enum(["explanation", "debug"]).default("explanation"),
});

// Alias for backward compatibility
export const AiAnalysisRequestSchema = AiExplanationRequestSchema;
export const AiAnalysisResponseSchema = AiExplanationResponseSchema;
