import axios from "axios";
import { AiAnalysisRequest, AiAnalysisResponse } from "../types/ai.types";
import { SYSTEM_PROMPT, buildResponseAnalysisPrompt } from "../prompts/responseAnalysis.prompt";
import { AiAnalysisResponseSchema } from "../validators/ai.validator";

export class AiService {
  /**
   * Main entry point to analyze HTTP response with LLM
   */
  public static async analyzeResponse(payload: AiAnalysisRequest): Promise<AiAnalysisResponse> {
    const sanitized = this.sanitizePayload(payload);
    const geminiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    let rawOutput: string | null = null;

    if (geminiKey) {
      rawOutput = await this.callGemini(sanitized, geminiKey);
      console.log(rawOutput)
    } else if (openaiKey) {
      rawOutput = await this.callOpenAI(sanitized, openaiKey);
    }

    if (!rawOutput) {
      return this.generateFallbackAnalysis(sanitized);
    }

    try {
      const cleanedJson = this.cleanJsonResponse(rawOutput);
      const parsed = JSON.parse(cleanedJson);
      return AiAnalysisResponseSchema.parse(parsed);
    } catch (err) {
      console.warn("Failed to parse LLM response JSON, generating fallback:", err);
      return this.generateFallbackAnalysis(sanitized);
    }
  }

  /**
   * Sanitizes payload by masking sensitive values (passwords, tokens, API keys)
   */
  private static sanitizePayload(payload: AiAnalysisRequest): AiAnalysisRequest {
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
   * Calls Google Gemini API
   */
  private static async callGemini(payload: AiAnalysisRequest, apiKey: string): Promise<string | null> {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const userPrompt = buildResponseAnalysisPrompt(payload);
      const res = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: `${SYSTEM_PROMPT}\n\n${userPrompt}` }] }],
        },
        { headers: { "Content-Type": "application/json" }, timeout: 20000 }
      );
      return res.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (err: any) {
      console.error("Gemini API error:", err?.response?.data || err?.message);
      return null;
    }
  }

  /**
   * Calls OpenAI API
   */
  private static async callOpenAI(payload: AiAnalysisRequest, apiKey: string): Promise<string | null> {
    try {
      const userPrompt = buildResponseAnalysisPrompt(payload);
      const res = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          response_format: { type: "json_object" },
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
   * Strips markdown code block formatting backticks if present
   */
  private static cleanJsonResponse(text: string): string {
    let clean = text.trim();
    if (clean.startsWith("```")) {
      clean = clean.replace(/^```(json)?\n?/, "").replace(/\n?```$/, "");
    }
    return clean.trim();
  }

  /**
   * Generates realistic, structured response analysis fallback if no LLM key is set
   */
  private static generateFallbackAnalysis(payload: AiAnalysisRequest): AiAnalysisResponse {
    const { status, body } = payload.response;
    const isSuccess = status >= 200 && status < 300;
    const bodyType = typeof body;
    const isObj = body && bodyType === "object" && !Array.isArray(body);
    const isArr = Array.isArray(body);

    const keys = isObj ? Object.keys(body) : [];
    const fields: { field: string; description: string }[] = [];
    const securityWarnings: any[] = [];

    if (isObj) {
      keys.slice(0, 10).forEach((k) => {
        const val = body[k];
        fields.push({
          field: k,
          description: `Property containing ${typeof val} data${typeof val === "string" ? ` (e.g. "${val}")` : ""}.`,
        });

        const lowerK = k.toLowerCase();
        if (["password", "secret", "token", "apikey", "jwt", "ssn", "creditcard"].some((s) => lowerK.includes(s))) {
          securityWarnings.push({
            field: k,
            issue: `Sensitive field "${k}" detected in response body. Ensure proper encryption and authorization.`,
            severity: lowerK.includes("password") || lowerK.includes("secret") ? "critical" : "high",
          });
        }
      });
    }

    const tsProperties = isObj
      ? keys.map((k) => `  ${k}: ${Array.isArray(body[k]) ? "any[]" : typeof body[k]};`).join("\n")
      : "  data: any;";

    const tsInterface = `export interface ApiResponse {\n${tsProperties}\n}`;

    return {
      summary: `The HTTP ${payload.request.method} request to ${payload.request.url} returned status ${status}. ${isSuccess ? "The request was successfully processed by the server." : "The server responded with an error status code."
        }`,
      dataStructure: isArr
        ? `Array containing ${body.length} item(s).`
        : isObj
          ? `Root object containing ${keys.length} top-level property/properties: ${keys.join(", ")}.`
          : `Primitive ${bodyType} payload returned.`,
      fieldDescriptions: fields,
      securityWarnings,
      performanceSuggestions: [
        {
          category: "Response Compression",
          suggestion: "Ensure Gzip or Brotli compression is enabled on the server for JSON payloads.",
        },
        {
          category: "Caching Strategy",
          suggestion: "Set explicit Cache-Control headers if this endpoint returns semi-static resources.",
        },
      ],
      bestPractices: [
        {
          topic: "Pagination & Limits",
          recommendation: isArr && body.length > 50 ? "Consider adding page and limit query parameters for large lists." : "Keep payload sizes compact for mobile efficiency.",
        },
      ],
      typescriptInterface: tsInterface,
      jsonSchema: {
        $schema: "http://json-schema.org/draft-07/schema#",
        type: isArr ? "array" : "object",
        properties: isObj
          ? keys.reduce((acc: any, k) => {
            acc[k] = { type: typeof body[k] };
            return acc;
          }, {})
          : {},
      },
      endpointDescription: `Endpoint handles ${payload.request.method} requests at ${payload.request.url}. Returns ${status} HTTP response status.`,
      testCases: [
        {
          name: "Success 200 OK Response",
          type: "success",
          description: "Verify endpoint returns expected status code and valid JSON response body.",
        },
        {
          name: "Unauthorized / Missing Credentials",
          type: "error",
          description: "Ensure requests without valid authorization headers return 401 Unauthorized.",
        },
        {
          name: "Invalid Query or Request Payload",
          type: "edge",
          description: "Test endpoint with malformed payload to verify 400 Bad Request handling.",
        },
      ],
    };
  }
}
