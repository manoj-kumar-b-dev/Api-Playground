import type { KeyValuePair } from '../types/request.types';
import type { FormDefinition } from '../types/dynamicForm.types';

export interface BuiltRequestResult {
  fullUrl: string;
  pathParams: KeyValuePair[];
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  bodyMode: 'none' | 'json' | 'formData';
  bodyRaw: string;
  formDataPayload: FormData | null;
  curlCommand: string;
}

export class DynamicRequestBuilderService {
  /**
   * Build complete request objects from form definition and user field values
   */
  public buildRequest(
    formDef: FormDefinition,
    formValues: Record<string, any>,
    baseUrl: string = ''
  ): BuiltRequestResult {
    const rawPath = formDef.endpoint.path;
    const method = formDef.endpoint.method;
    const paramsValues = formValues.parameters || {};

    const pathParams: KeyValuePair[] = [];
    const queryParams: KeyValuePair[] = [];
    const headers: KeyValuePair[] = [];

    let interpolatedPath = rawPath;

    // Process parameter definitions
    for (const p of formDef.parameters) {
      const val = paramsValues[p.name];
      const strVal = val !== undefined && val !== null ? String(val) : '';

      if (p.location === 'path') {
        pathParams.push({ id: p.id, key: p.name, value: strVal, enabled: true });
        interpolatedPath = interpolatedPath.replace(`{${p.name}}`, encodeURIComponent(strVal));
      } else if (p.location === 'query' && strVal !== '') {
        queryParams.push({ id: p.id, key: p.name, value: strVal, enabled: true });
      } else if (p.location === 'header' && strVal !== '') {
        headers.push({ id: p.id, key: p.name, value: strVal, enabled: true });
      }
    }

    // Construct URL
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanPath = interpolatedPath.startsWith('/') ? interpolatedPath : `/${interpolatedPath}`;
    let fullUrl = `${cleanBaseUrl}${cleanPath}`;

    if (queryParams.length > 0) {
      const queryString = queryParams
        .map((q) => `${encodeURIComponent(q.key)}=${encodeURIComponent(q.value)}`)
        .join('&');
      fullUrl += `${fullUrl.includes('?') ? '&' : '?'}${queryString}`;
    }

    // Process Body
    let bodyMode: 'none' | 'json' | 'formData' = 'none';
    let bodyRaw = '';
    let formDataPayload: FormData | null = null;

    if (formDef.body && formValues.body !== undefined) {
      const rawBodyValue = formValues.body;

      if (formDef.body.type === 'file' || this.hasFileField(rawBodyValue)) {
        bodyMode = 'formData';
        formDataPayload = new FormData();
        this.appendFormData(formDataPayload, '', rawBodyValue);
        bodyRaw = '[Multipart FormData Object]';
        headers.push({ id: 'h_content_type', key: 'Content-Type', value: 'multipart/form-data', enabled: true });
      } else {
        bodyMode = 'json';
        bodyRaw = typeof rawBodyValue === 'string' ? rawBodyValue : JSON.stringify(rawBodyValue, null, 2);
        headers.push({ id: 'h_content_type', key: 'Content-Type', value: 'application/json', enabled: true });
      }
    }

    // Generate cURL command
    const curlCommand = this.generateCurl(method, fullUrl, headers, bodyMode, bodyRaw);

    return {
      fullUrl,
      pathParams,
      queryParams,
      headers,
      bodyMode,
      bodyRaw,
      formDataPayload,
      curlCommand,
    };
  }

  private hasFileField(obj: any): boolean {
    if (!obj) return false;
    if (obj instanceof File) return true;
    if (typeof obj === 'object') {
      return Object.values(obj).some((val) => this.hasFileField(val));
    }
    return false;
  }

  private appendFormData(formData: FormData, prefix: string, obj: any) {
    if (obj === null || obj === undefined) return;
    if (obj instanceof File) {
      formData.append(prefix, obj, obj.name);
      return;
    }
    if (typeof obj === 'object' && !(obj instanceof Date)) {
      for (const key of Object.keys(obj)) {
        const propName = prefix ? `${prefix}.${key}` : key;
        this.appendFormData(formData, propName, obj[key]);
      }
      return;
    }
    formData.append(prefix, String(obj));
  }

  private generateCurl(
    method: string,
    url: string,
    headers: KeyValuePair[],
    bodyMode: string,
    bodyRaw: string
  ): string {
    const parts: string[] = [`curl -X ${method.toUpperCase()} "${url}"`];
    for (const h of headers) {
      if (h.enabled && h.key && h.value) {
        parts.push(`-H "${h.key}: ${h.value}"`);
      }
    }
    if (bodyMode === 'json' && bodyRaw.trim()) {
      const sanitized = bodyRaw.replace(/"/g, '\\"').replace(/\n/g, '');
      parts.push(`-d "${sanitized}"`);
    }
    return parts.join(' \\\n  ');
  }
}

export const dynamicRequestBuilder = new DynamicRequestBuilderService();
