import type { EndpointRequestConfig, KeyValuePair } from "../service/endpointService";

export interface ParsedImportEndpoint {
  name: string;
  request: EndpointRequestConfig;
}

export function parseCurlCommand(curlString: string): ParsedImportEndpoint {
  const trimmed = curlString.trim();

  let method: EndpointRequestConfig["method"] = "GET";
  let url = "";
  const headers: KeyValuePair[] = [];
  const queryParams: KeyValuePair[] = [];
  const pathParams: KeyValuePair[] = [];
  let bodyMode: EndpointRequestConfig["body"]["mode"] = "none";
  let bodyRaw = "";
  let authorization: EndpointRequestConfig["authorization"] = { type: "none" };

  // Tokenize cURL command respecting quotes and escapes
  const args = tokenizeCurl(trimmed);

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    // Method detection
    if ((arg === "-X" || arg === "--request") && i + 1 < args.length) {
      const parsedMethod = args[++i].toUpperCase();
      if (["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"].includes(parsedMethod)) {
        method = parsedMethod as EndpointRequestConfig["method"];
      }
    }
    // Header detection
    else if ((arg === "-H" || arg === "--header") && i + 1 < args.length) {
      const headerVal = args[++i];
      const colonIdx = headerVal.indexOf(":");
      if (colonIdx > 0) {
        const key = headerVal.substring(0, colonIdx).trim();
        const value = headerVal.substring(colonIdx + 1).trim();

        // Check if header is Authorization
        if (key.toLowerCase() === "authorization") {
          if (value.toLowerCase().startsWith("bearer ")) {
            authorization = {
              type: "bearer",
              token: value.substring(7).trim(),
            };
          } else if (value.toLowerCase().startsWith("basic ")) {
            try {
              const decoded = atob(value.substring(6).trim());
              const [username, password] = decoded.split(":");
              authorization = {
                type: "basic",
                username: username || "",
                password: password || "",
              };
            } catch {
              authorization = { type: "bearer", token: value };
            }
          } else {
            headers.push({ key, value, enabled: true });
          }
        } else {
          headers.push({ key, value, enabled: true });
        }
      }
    }
    // Data / Body detection
    else if (
      (arg === "-d" ||
        arg === "--data" ||
        arg === "--data-raw" ||
        arg === "--data-binary" ||
        arg === "--data-urlencode") &&
      i + 1 < args.length
    ) {
      bodyRaw = args[++i];
      if (method === "GET") method = "POST";

      // Check if body is valid JSON
      try {
        JSON.parse(bodyRaw);
        bodyMode = "json";
      } catch {
        bodyMode = "raw";
      }
    }
    // Basic Auth flag (-u user:pass)
    else if ((arg === "-u" || arg === "--user") && i + 1 < args.length) {
      const userPass = args[++i];
      const [username, password] = userPass.split(":");
      authorization = {
        type: "basic",
        username: username || "",
        password: password || "",
      };
    }
    // URL detection (arguments not starting with - or part of command)
    else if (
      !url &&
      arg !== "curl" &&
      !arg.startsWith("-") &&
      (arg.startsWith("http://") || arg.startsWith("https://") || arg.includes("/"))
    ) {
      url = arg;
    }
  }

  // If URL contains query string, extract parameters
  if (url && url.includes("?")) {
    const [baseUrl, queryString] = url.split("?");
    url = baseUrl;
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      queryParams.push({ key, value, enabled: true });
    });
  }

  // Derive endpoint name from URL path
  let name = "cURL Endpoint";
  if (url) {
    try {
      const pathParts = new URL(url).pathname.split("/").filter(Boolean);
      if (pathParts.length > 0) {
        name = `${method} /${pathParts.slice(-2).join("/")}`;
      } else {
        name = `${method} ${new URL(url).hostname}`;
      }
    } catch {
      name = `${method} ${url}`;
    }
  }

  return {
    name,
    request: {
      method,
      url,
      headers,
      queryParams,
      pathParams,
      body: {
        mode: bodyMode,
        raw: bodyRaw,
      },
      authorization,
    },
  };
}

function tokenizeCurl(cmd: string): string[] {
  const args: string[] = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let escape = false;

  // Clean trailing slash continuations
  const cleaned = cmd.replace(/\\\r?\n/g, " ");

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escape) {
      current += char;
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (/\s/.test(char) && !inSingleQuote && !inDoubleQuote) {
      if (current) {
        args.push(current);
        current = "";
      }
      continue;
    }

    current += char;
  }

  if (current) {
    args.push(current);
  }

  return args;
}
