import type { EndpointRequestConfig, KeyValuePair } from "../service/endpointService";
import type { ParsedImportEndpoint } from "./curlParser";

export function parseDocumentationText(docText: string): ParsedImportEndpoint[] {
  const text = docText.trim();
  if (!text) return [];

  // 1. Detect Base URL in text
  let baseUrl = "";
  const baseUrlMatch = text.match(/(?:Base\s*URL|Server|Host)[:\s\n`]+(https?:\/\/[^\s`]+)/i) ||
    text.match(/(https?:\/\/[^\s\/]+(?:\/v\d+|\/api)?)/i);
  if (baseUrlMatch) {
    baseUrl = baseUrlMatch[1].replace(/\/$/, "");
  }

  // 2. Detect Global Auth
  let globalAuth: EndpointRequestConfig["authorization"] = { type: "none" };
  const globalAuthMatch = text.match(/Authorization:\s*Bearer\s+([^\s]+)/i);
  if (globalAuthMatch) {
    globalAuth = { type: "bearer", token: globalAuthMatch[1].replace(/[`'"]+$/g, "").trim() };
  }

  // 3. Find all Endpoint HTTP Method + Path matches
  const endpointRegex = /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b\s+((?:https?:\/\/[^\s]+|\/[^\s]*))/gi;
  const matches: { index: number; method: EndpointRequestConfig["method"]; rawPath: string }[] = [];

  let match: RegExpExecArray | null;
  while ((match = endpointRegex.exec(text)) !== null) {
    const rawPath = match[2].replace(/[`'"]+$/g, "").trim();
    const matchIndex = match.index;

    // Check last 3 lines before match for "example" header
    const precedingText = text.substring(Math.max(0, matchIndex - 100), matchIndex);
    const precedingLines = precedingText.split("\n").slice(-3).join(" ").toLowerCase();

    if (precedingLines.includes("example") || match[0].toLowerCase().includes("example")) {
      continue;
    }

    // Exclude false positives like "Status 200 OK" or non-URL paths
    if (rawPath.startsWith("http://") || rawPath.startsWith("https://") || rawPath.startsWith("/")) {
      matches.push({
        index: matchIndex,
        method: match[1].toUpperCase() as EndpointRequestConfig["method"],
        rawPath,
      });
    }
  }

  if (matches.length === 0) {
    const fallbackMethod = text.match(/\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/i);
    const fallbackUrl = text.match(/(https?:\/\/[^\s]+|\/api\/[^\s]+|\/v\d+\/[^\s]+|\/[a-zA-Z0-9_\-]+)/i);
    if (fallbackUrl) {
      matches.push({
        index: 0,
        method: (fallbackMethod ? fallbackMethod[1].toUpperCase() : "GET") as EndpointRequestConfig["method"],
        rawPath: fallbackUrl[1].replace(/[`'"]+$/g, "").trim(),
      });
    }
  }

  if (matches.length === 0) {
    throw new Error("No valid HTTP endpoints (e.g. POST /users, GET /books) found in documentation.");
  }

  const results: ParsedImportEndpoint[] = [];

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
    const sectionText = text.substring(current.index, nextIndex);
    const textBefore = text.substring(0, current.index);
    const linesBefore = textBefore.split("\n").map((l) => l.trim()).filter(Boolean);

    // Derive Endpoint Name from preceding title lines
    let name = "";
    const fillerWords = [
      "endpoint", "example", "headers", "base url", "authentication",
      "request body", "response", "status", "path parameters", "query parameters",
      "headers", "description", "error codes"
    ];

    for (let l = linesBefore.length - 1; l >= 0; l--) {
      let lineStr = linesBefore[l].replace(/^[#\*\d\.\s`🔐📁📚⚡🛠️]+/, "").replace(/[\*`]+/g, "").trim();
      const lower = lineStr.toLowerCase();
      if (!lineStr || fillerWords.includes(lower) || lower.startsWith("http") || lower.startsWith("authorization")) {
        continue;
      }
      name = lineStr;
      break;
    }

    if (!name) {
      name = `${current.method} ${current.rawPath}`;
    }

    // Resolve Full URL & Query Params
    let fullUrl = current.rawPath;
    const queryParams: KeyValuePair[] = [];
    const headers: KeyValuePair[] = [];
    let authorization: EndpointRequestConfig["authorization"] = { ...globalAuth };
    let bodyMode: EndpointRequestConfig["body"]["mode"] = "none";
    let bodyRaw = "";

    // Extract query params from URL if present
    if (fullUrl.includes("?")) {
      const [u, q] = fullUrl.split("?");
      fullUrl = u;
      const sp = new URLSearchParams(q);
      sp.forEach((val, key) => queryParams.push({ key, value: val, enabled: true }));
    }

    // Check section text for additional query params in Example lines (e.g. GET /books?page=1...)
    const exampleQueryMatch = sectionText.match(/GET\s+[^\s\?]+\?([^\s\n]+)/i);
    if (exampleQueryMatch && queryParams.length === 0) {
      const sp = new URLSearchParams(exampleQueryMatch[1]);
      sp.forEach((val, key) => queryParams.push({ key, value: val, enabled: true }));
    }

    // Combine Base URL if relative path
    if (baseUrl && !fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = `${baseUrl}${fullUrl.startsWith("/") ? "" : "/"}${fullUrl}`;
    }

    // Extract Section Headers
    const sectionLines = sectionText.split("\n");
    const ignoredKeys = [
      "endpoint", "url", "method", "request", "response", "description",
      "headers", "params", "parameters", "body", "title", "name", "status",
      "example", "path", "field", "type", "required", "base url", "authentication",
      "http", "https", "error"
    ];

    for (const sLine of sectionLines) {
      const trimmed = sLine.trim();
      const headerMatch = trimmed.match(/^([\w\-]+):\s*(.+)$/);
      if (headerMatch) {
        const key = headerMatch[1];
        const val = headerMatch[2];

        if (ignoredKeys.includes(key.toLowerCase()) || val.startsWith("//") || val.startsWith("http://") || val.startsWith("https://")) {
          continue;
        }

        if (key.toLowerCase() === "authorization") {
          if (val.toLowerCase().startsWith("bearer ")) {
            authorization = { type: "bearer", token: val.substring(7).trim() };
          } else if (val.toLowerCase().startsWith("basic ")) {
            authorization = { type: "basic", username: "", password: "" };
          }
        } else {
          headers.push({ key, value: val, enabled: true });
        }
      }
    }

    // Check for multipart/form-data
    if (headers.some((h) => h.value.includes("multipart/form-data"))) {
      bodyMode = "raw";
      bodyRaw = "// Form data payload";
    }

    // Extract Request Body JSON (only before Response/Status block, starting after Request Body label)
    let requestSectionText = sectionText;
    const responseIdx = sectionText.search(/\b(Response|Status|Success Response|Error Response|200|201|400|404|500)\b/i);
    if (responseIdx !== -1) {
      requestSectionText = sectionText.substring(0, responseIdx);
    }

    const reqBodyLabelIdx = requestSectionText.search(/\bRequest\s+Body\b/i);
    const bodySearchText = reqBodyLabelIdx !== -1 
      ? requestSectionText.substring(reqBodyLabelIdx) 
      : requestSectionText.split("\n").slice(1).join("\n");

    const jsonStartIndex = bodySearchText.indexOf("{");
    const jsonEndIndex = bodySearchText.lastIndexOf("}");

    if (jsonStartIndex !== -1 && jsonEndIndex > jsonStartIndex) {
      const jsonStr = bodySearchText.substring(jsonStartIndex, jsonEndIndex + 1);
      try {
        const parsed = JSON.parse(jsonStr);
        bodyRaw = JSON.stringify(parsed, null, 2);
        bodyMode = "json";
      } catch {
        // Not valid JSON block
      }
    }

    results.push({
      name,
      request: {
        method: current.method,
        url: fullUrl,
        headers,
        queryParams,
        pathParams: [],
        body: {
          mode: bodyMode,
          raw: bodyRaw,
        },
        authorization,
      },
    });
  }

  return results;
}

