import axios from "axios";
import { AiExplanationRequest, AiExplanationResponse } from "../types/ai.types";
import { buildResponsePrompt } from "../prompts/responseAnalysis.prompt";

export class AiService {
  /**
   * Main entry point to generate AI Explanation or Debug with AI using LLM
   */
  public static async explainResponse(payload: AiExplanationRequest): Promise<AiExplanationResponse> {
    const sanitized = this.sanitizePayload(payload);
    const { systemPrompt, userPrompt, mode } = buildResponsePrompt(sanitized);

    const geminiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let explanation: string | null = null;

    if (geminiKey) {
      explanation = await this.callGemini(systemPrompt, userPrompt, geminiKey);
    } else if (openaiKey) {
      explanation = await this.callOpenAI(systemPrompt, userPrompt, openaiKey);
    }

    if (!explanation) {
      explanation = this.generateFallbackExplanation(sanitized, mode);
    }

    return {
      explanation,
      mode,
    };
  }

  // Alias for backward compatibility
  public static async analyzeResponse(payload: AiExplanationRequest): Promise<AiExplanationResponse> {
    return this.explainResponse(payload);
  }

  /**
   * Sanitizes payload by masking sensitive values (passwords, tokens, API keys)
   */
  private static sanitizePayload(payload: AiExplanationRequest): AiExplanationRequest {
    const maskSecret = (val: string) => (val && val.length > 4 ? `${val.substring(0, 3)}...[MASKED]` : "[MASKED]");

    const sanitizeObject = (obj: any): any => {
      if (!obj || typeof obj !== "object") return obj;
      if (Array.isArray(obj)) return obj.map(sanitizeObject);

      const copy: Record<string, any> = {};
      for (const key of Object.keys(obj)) {
        const lower = key.toLowerCase();
        if (
          lower.includes("password") ||
          lower.includes("token") ||
          lower.includes("secret") ||
          lower.includes("authorization") ||
          lower.includes("apikey")
        ) {
          copy[key] = typeof obj[key] === "string" ? maskSecret(obj[key]) : "[MASKED]";
        } else {
          copy[key] = sanitizeObject(obj[key]);
        }
      }
      return copy;
    };

    return {
      request: {
        method: payload.request.method,
        url: payload.request.url,
        headers: sanitizeObject(payload.request.headers || {}),
        queryParams: payload.request.queryParams,
        body: sanitizeObject(payload.request.body),
      },
      response: {
        status: payload.response.status,
        statusText: payload.response.statusText,
        headers: sanitizeObject(payload.response.headers || {}),
        body: sanitizeObject(payload.response.body),
      },
    };
  }

  /**
   * Calls Google Gemini API with fallback models
   */
  private static async callGemini(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string | null> {
    const models = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const res = await axios.post(
          url,
          {
            contents: [{ parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
          },
          { headers: { "Content-Type": "application/json" }, timeout: 25000 }
        );
        const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err: any) {
        console.warn(`Gemini model ${model} error:`, err?.response?.data?.error?.message || err?.message);
        // Continue to next model if fails
      }
    }
    return null;
  }

  /**
   * Calls OpenAI API
   */
  private static async callOpenAI(systemPrompt: string, userPrompt: string, apiKey: string): Promise<string | null> {
    try {
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        },
        { headers: { Authorization: `Bearer ${apiKey}` }, timeout: 20000 }
      );
      return res.data?.choices?.[0]?.message?.content || null;
    } catch (err: any) {
      console.error("OpenAI API error:", err?.response?.data || err?.message);
      return null;
    }
  }

  /**
   * Generates plain text explanation / debug advice fallback
   */
  private static generateFallbackExplanation(payload: AiExplanationRequest, mode: "explanation" | "debug"): string {
    const { request, response } = payload;
    const { status, statusText, body } = response;

    if (mode === "explanation") {
      const keys = body && typeof body === "object" && !Array.isArray(body) ? Object.keys(body) : [];
      return `## Endpoint Summary
The **${request.method}** request to \`${request.url}\` returned status **${status} ${statusText || "OK"}**.

## Response Payload Analysis
- **Status Code**: ${status} (Success)
- **Data Structure**: ${Array.isArray(body) ? `Array containing ${body.length} item(s)` : typeof body === "object" ? `Object with ${keys.length} key(s)` : `Primitive ${typeof body} payload`}
${keys.length > 0 ? `- **Top-level Fields**: ${keys.slice(0, 10).map((k) => `\`${k}\``).join(", ")}` : ""}

## Key Observations
- The server successfully processed the HTTP request.
- Ensure proper response header caching strategies for optimal client performance.`;
    }

    // Debug mode fallback
    return `## Error Summary
The **${request.method}** request to \`${request.url}\` failed with status **${status} ${statusText || "Error"}**.

## Root Cause Analysis
${status === 401 || status === 403
        ? "Authorization failure: The API requires authentication credentials or the provided token has expired/lacks permissions."
        : status === 404
          ? "Resource not found: The requested URL endpoint does not exist or the ID specified in the path was not found."
          : status === 400
            ? "Bad Request: The request payload, headers, or query parameters do not meet the backend server's validation schema."
            : "Server Error: The remote server encountered an internal exception while processing the request."
      }

## How to Fix This Error
1. **Check Request Parameters**: Verify that the URL \`${request.url}\` and query parameters are spelled correctly.
2. **Verify Headers & Body**: Ensure required \`Content-Type\` and authorization headers are supplied.
3. **Review Backend Logs**: Inspect target backend application logs to pinpoint the exact failure line.`;
  }
}
