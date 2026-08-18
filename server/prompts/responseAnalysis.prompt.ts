import { AiExplanationRequest } from "../types/ai.types";

export const EXPLANATION_SYSTEM_PROMPT = `You are an expert Senior API Architect and Technical Writer.
Your task is to provide a clean, comprehensive, developer-friendly PLAIN TEXT EXPLANATION of an HTTP API Endpoint request and response.

CRITICAL INSTRUCTIONS:
- Write in pure readable Markdown / plain text format.
- DO NOT return JSON objects, forms, card grids, schemas, or complex widgets.
- Use clear headings (e.g. ## Endpoint Summary, ## Response Breakdown, ## Key Observations), readable paragraphs, and bullet points.
- Keep the language engaging, precise, and easy for any developer to digest.`;

export const DEBUG_SYSTEM_PROMPT = `You are an expert Senior API Security & Debugging Engineer.
Your task is to debug an HTTP API Error (4xx/5xx status or failed request) and provide clear, actionable PLAIN TEXT instructions on HOW TO FIX THIS ERROR.

CRITICAL INSTRUCTIONS:
- Write in pure readable Markdown / plain text format.
- DO NOT return JSON objects, forms, card grids, schemas, or complex widgets.
- Break your debugging explanation into clear sections:
  1. ## Error Summary (What failed, status code, error message)
  2. ## Root Cause Analysis (Why this error happened based on request headers, auth, URL, parameters, or body)
  3. ## How to Fix This Error (Step-by-step actionable instructions for the developer to resolve the issue)
- Keep the tone helpful, clear, direct, and solution-focused.`;

export const buildResponsePrompt = (payload: AiExplanationRequest): { systemPrompt: string; userPrompt: string; mode: "explanation" | "debug" } => {
  const isSuccess = payload.response.status >= 200 && payload.response.status < 300;
  const mode = isSuccess ? "explanation" : "debug";
  const systemPrompt = isSuccess ? EXPLANATION_SYSTEM_PROMPT : DEBUG_SYSTEM_PROMPT;

  const userPrompt = `Analyze the following HTTP Request and Response pair:

[REQUEST DETAILS]
Method: ${payload.request.method}
URL: ${payload.request.url}
Headers: ${JSON.stringify(payload.request.headers || {}, null, 2)}
Query Params: ${JSON.stringify(payload.request.queryParams || {}, null, 2)}
Body: ${JSON.stringify(payload.request.body ?? null, null, 2)}

[RESPONSE DETAILS]
Status Code: ${payload.response.status} ${payload.response.statusText || ""}
Headers: ${JSON.stringify(payload.response.headers || {}, null, 2)}
Response Body: ${JSON.stringify(payload.response.body ?? null, null, 2)}

${isSuccess 
  ? "Please explain what this endpoint does, the structure of the returned response, and key details in plain text format." 
  : "Please analyze why this HTTP error occurred, explain the root cause, and provide clear step-by-step instructions on how to fix this error in plain text format."
}`;

  return { systemPrompt, userPrompt, mode };
};

// Aliases for compatibility
export const SYSTEM_PROMPT = EXPLANATION_SYSTEM_PROMPT;
export const buildResponseAnalysisPrompt = (payload: AiExplanationRequest): string => {
  return buildResponsePrompt(payload).userPrompt;
};
