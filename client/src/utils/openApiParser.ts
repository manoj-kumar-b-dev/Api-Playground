import type { EndpointRequestConfig, KeyValuePair } from "../service/endpointService";
import type { ParsedImportEndpoint } from "./curlParser";

export function parseOpenApiSpec(specText: string): ParsedImportEndpoint[] {
  let spec: any;

  try {
    spec = JSON.parse(specText);
  } catch {
    // If not standard JSON, try lightweight YAML to JSON converter for simple OpenAPI YAMLs
    spec = parseYamlToJson(specText);
  }

  if (!spec || typeof spec !== "object") {
    throw new Error("Invalid OpenAPI/Swagger specification format.");
  }

  const endpoints: ParsedImportEndpoint[] = [];

  // Resolve Base URL
  let baseUrl = "";
  if (spec.servers && Array.isArray(spec.servers) && spec.servers.length > 0) {
    baseUrl = spec.servers[0].url || "";
  } else if (spec.host) {
    const scheme = (spec.schemes && spec.schemes[0]) || "https";
    const basePath = spec.basePath || "";
    baseUrl = `${scheme}://${spec.host}${basePath}`;
  }

  // Parse Paths
  const paths = spec.paths || {};
  const validMethods = ["get", "post", "put", "delete", "patch", "head", "options"];

  for (const pathKey of Object.keys(paths)) {
    const pathObj = paths[pathKey];
    if (!pathObj || typeof pathObj !== "object") continue;

    for (const methodKey of Object.keys(pathObj)) {
      if (!validMethods.includes(methodKey.toLowerCase())) continue;

      const operation = pathObj[methodKey];
      const method = methodKey.toUpperCase() as EndpointRequestConfig["method"];

      const headers: KeyValuePair[] = [];
      const queryParams: KeyValuePair[] = [];
      const pathParams: KeyValuePair[] = [];
      let bodyMode: EndpointRequestConfig["body"]["mode"] = "none";
      let bodyRaw = "";
      let authorization: EndpointRequestConfig["authorization"] = { type: "none" };

      // Parameters (v2 & v3)
      const params = [...(pathObj.parameters || []), ...(operation.parameters || [])];
      for (const param of params) {
        if (!param || !param.name) continue;

        const kv: KeyValuePair = {
          key: param.name,
          value: param.example || (param.schema && param.schema.example) || "",
          enabled: true,
          description: param.description || "",
        };

        if (param.in === "query") queryParams.push(kv);
        else if (param.in === "header") headers.push(kv);
        else if (param.in === "path") pathParams.push(kv);
        else if (param.in === "body") {
          bodyMode = "json";
          if (param.schema) {
            bodyRaw = JSON.stringify(generateExampleFromSchema(param.schema), null, 2);
          }
        }
      }

      // OpenAPI 3.x Request Body
      if (operation.requestBody && operation.requestBody.content) {
        const content = operation.requestBody.content;
        if (content["application/json"]) {
          bodyMode = "json";
          const schema = content["application/json"].schema;
          const example = content["application/json"].example;
          if (example) {
            bodyRaw = typeof example === "string" ? example : JSON.stringify(example, null, 2);
          } else if (schema) {
            bodyRaw = JSON.stringify(generateExampleFromSchema(schema), null, 2);
          }
        } else if (content["application/x-www-form-urlencoded"] || content["multipart/form-data"]) {
          bodyMode = "raw";
          bodyRaw = "// Form data / urlencoded payload";
        } else {
          bodyMode = "raw";
          const firstType = Object.keys(content)[0];
          if (firstType && content[firstType].schema) {
            bodyRaw = JSON.stringify(generateExampleFromSchema(content[firstType].schema), null, 2);
          }
        }
      }

      // Check security requirements for Bearer/ApiKey/Basic
      const security = operation.security || spec.security;
      if (security && Array.isArray(security) && security.length > 0) {
        const secSchemeKey = Object.keys(security[0])[0];
        if (secSchemeKey) {
          const securityDef =
            spec.components?.securitySchemes?.[secSchemeKey] ||
            spec.securityDefinitions?.[secSchemeKey];
          if (securityDef) {
            if (securityDef.type === "http" && securityDef.scheme === "bearer") {
              authorization = { type: "bearer", token: "" };
            } else if (securityDef.type === "apiKey") {
              authorization = {
                type: "apiKey",
                key: securityDef.name || "X-API-Key",
                value: "",
                addTo: securityDef.in === "query" ? "query" : "header",
              };
            } else if (securityDef.type === "basic" || (securityDef.type === "http" && securityDef.scheme === "basic")) {
              authorization = { type: "basic", username: "", password: "" };
            }
          }
        }
      }

      const fullUrl = baseUrl ? `${baseUrl.replace(/\/$/, "")}${pathKey}` : pathKey;
      const endpointName = operation.summary || operation.operationId || `${method} ${pathKey}`;

      endpoints.push({
        name: endpointName,
        request: {
          method,
          url: fullUrl,
          headers,
          queryParams,
          pathParams,
          body: {
            mode: bodyMode,
            raw: bodyRaw,
          },
          authorization,
        },
      });
    }
  }

  if (endpoints.length === 0) {
    throw new Error("No valid API paths or endpoints found in the provided specification.");
  }

  return endpoints;
}

function generateExampleFromSchema(schema: any): any {
  if (!schema) return {};
  if (schema.example) return schema.example;
  if (schema.type === "object" || schema.properties) {
    const obj: any = {};
    const props = schema.properties || {};
    for (const key of Object.keys(props)) {
      obj[key] = generateExampleFromSchema(props[key]);
    }
    return obj;
  }
  if (schema.type === "array") {
    return [generateExampleFromSchema(schema.items)];
  }
  if (schema.type === "string") return schema.format === "date-time" ? new Date().toISOString() : "string";
  if (schema.type === "number" || schema.type === "integer") return 0;
  if (schema.type === "boolean") return true;
  return null;
}

function parseYamlToJson(yamlStr: string): any {
  // Simple YAML line-by-line parser fallback for basic Swagger/OpenAPI Yaml
  const lines = yamlStr.split("\n");
  const jsonStr: string[] = [];

  // Attempt converting basic indent YAML into JSON or cleaning quotes
  for (let line of lines) {
    line = line.trimEnd();
    if (!line || line.trim().startsWith("#")) continue;
    // Basic key: value line conversion check
    const match = line.match(/^(\s*)([\w\-/\.\{\}]+):\s*(.*)$/);
    if (match) {
      const [, indent, key, val] = match;
      const cleanVal = val.trim();
      if (cleanVal.startsWith('"') || cleanVal.startsWith("'") || cleanVal.startsWith("{") || cleanVal.startsWith("[")) {
        jsonStr.push(`${indent}"${key}": ${cleanVal}`);
      } else if (cleanVal === "") {
        jsonStr.push(`${indent}"${key}":`);
      } else {
        jsonStr.push(`${indent}"${key}": "${cleanVal.replace(/"/g, '\\"')}"`);
      }
    } else {
      jsonStr.push(line);
    }
  }

  return JSON.parse("{\n" + jsonStr.join("\n") + "\n}");
}
