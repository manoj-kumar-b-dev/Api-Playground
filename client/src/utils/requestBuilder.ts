import type {
  KeyValuePair,
  AuthConfig,
  BodyConfig,
  BodyMode,
} from '../types/request.types';

export function parsePathParams(url: string): string[] {
  if (!url) return [];
  const paramNames: string[] = [];
  
  // Match :paramName (e.g., /users/:id/posts/:postId)
  const colonRegex = /:([a-zA-Z0-9_]+)/g;
  let match;
  while ((match = colonRegex.exec(url)) !== null) {
    if (!paramNames.includes(match[1])) {
      paramNames.push(match[1]);
    }
  }

  // Match {paramName} (e.g., /users/{id})
  const braceRegex = /\{([a-zA-Z0-9_]+)\}/g;
  while ((match = braceRegex.exec(url)) !== null) {
    if (!paramNames.includes(match[1])) {
      paramNames.push(match[1]);
    }
  }

  return paramNames;
}

export function buildFinalUrl(
  baseUrl: string,
  queryParams: KeyValuePair[],
  pathParams: KeyValuePair[],
  auth?: AuthConfig
): string {
  if (!baseUrl) return '';

  let processedUrl = baseUrl;

  // Substitute path parameters (:id or {id})
  pathParams.forEach((param) => {
    if (param.enabled && param.key) {
      const value = param.value || '';
      processedUrl = processedUrl.replace(new RegExp(`:${param.key}\\b`, 'g'), value);
      processedUrl = processedUrl.replace(new RegExp(`\\{${param.key}\\}`, 'g'), value);
    }
  });

  // Construct query parameters
  const activeParams = new URLSearchParams();

  queryParams.forEach((param) => {
    if (param.enabled && param.key.trim() !== '') {
      activeParams.append(param.key.trim(), param.value);
    }
  });

  // Inject API Key into query if configured
  if (auth && auth.type === 'apiKey' && auth.apiKeyAddTo === 'query' && auth.apiKeyKey.trim() !== '') {
    activeParams.append(auth.apiKeyKey.trim(), auth.apiKeyValue);
  }

  const queryString = activeParams.toString();
  if (queryString) {
    const hasQueryMark = processedUrl.includes('?');
    processedUrl += (hasQueryMark ? '&' : '?') + queryString;
  }

  return processedUrl;
}

export function buildHeaders(
  headers: KeyValuePair[],
  bodyMode: BodyMode,
  auth?: AuthConfig
): Record<string, string> {
  const result: Record<string, string> = {};

  // Enabled user headers
  headers.forEach((h) => {
    if (h.enabled && h.key.trim() !== '') {
      result[h.key.trim()] = h.value;
    }
  });

  // Inferred Content-Type if not set explicitly
  const hasContentType = Object.keys(result).some(
    (k) => k.toLowerCase() === 'content-type'
  );

  if (!hasContentType) {
    if (bodyMode === 'json') {
      result['Content-Type'] = 'application/json';
    } else if (bodyMode === 'urlencoded') {
      result['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    // Note: FormData content-type is managed automatically by Axios/Browser boundary
  }

  // Inject Auth headers if specified
  if (auth) {
    if (auth.type === 'bearer' && auth.bearerToken) {
      result['Authorization'] = `Bearer ${auth.bearerToken}`;
    } else if (auth.type === 'basic') {
      const encoded = btoa(`${auth.basicUser}:${auth.basicPass}`);
      result['Authorization'] = `Basic ${encoded}`;
    } else if (auth.type === 'apiKey' && auth.apiKeyAddTo === 'header' && auth.apiKeyKey) {
      result[auth.apiKeyKey.trim()] = auth.apiKeyValue;
    }
  }

  return result;
}

export function buildBody(body: BodyConfig): any {
  if (body.mode === 'none') return undefined;

  if (body.mode === 'json') {
    if (!body.json || body.json.trim() === '') return undefined;
    try {
      return JSON.parse(body.json);
    } catch {
      // Send raw string if parsing fails
      return body.json;
    }
  }

  if (body.mode === 'formData') {
    const formData = new FormData();
    body.formData.forEach((item) => {
      if (item.enabled && item.key.trim() !== '') {
        if (item.type === 'file' && item.file) {
          formData.append(item.key.trim(), item.file);
        } else if (item.type === 'text') {
          formData.append(item.key.trim(), item.value);
        }
      }
    });
    return formData;
  }

  if (body.mode === 'urlencoded') {
    const params = new URLSearchParams();
    body.urlencoded.forEach((item) => {
      if (item.enabled && item.key.trim() !== '') {
        params.append(item.key.trim(), item.value);
      }
    });
    return params;
  }

  if (body.mode === 'binary') {
    return body.binaryFile || undefined;
  }

  return undefined;
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
