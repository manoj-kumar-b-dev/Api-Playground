import { BaseParser } from './BaseParser';
import type { ParserType } from '../../types/ParserType';
import type { NormalizedApiSchema, NormalizedEndpoint, NormalizedParameter, NormalizedField } from '../../types/NormalizedSchema';
import { parseCurlCommand } from '../../utils/curlParser';
import { generateUniqueId, generateFieldLabel, generatePlaceholder } from '../../utils/schemaHelpers';
import { inferFieldType } from '../../utils/fieldInference';

export class CurlParser extends BaseParser {
  readonly sourceType: ParserType = 'curl';

  public canParse(input: string | object): boolean {
    if (typeof input !== 'string') return false;
    const trimmed = input.trim();
    return trimmed.startsWith('curl') || trimmed.includes('curl ');
  }

  public async parseSchema(input: string | object): Promise<{ schema: NormalizedApiSchema; warnings: string[] }> {
    const rawText = typeof input === 'string' ? input : String(input);
    const parsedCurl = parseCurlCommand(rawText);
    const warnings: string[] = [];

    const headers: NormalizedParameter[] = parsedCurl.request.headers.map((h) => {
      const type = inferFieldType(h.key, h.value);
      return {
        id: generateUniqueId('h'),
        name: h.key,
        in: 'header',
        required: true,
        field: {
          id: generateUniqueId('f'),
          name: h.key,
          type,
          label: generateFieldLabel(h.key),
          required: true,
          placeholder: generatePlaceholder(h.key, type),
          defaultValue: h.value,
          location: 'header',
        },
      };
    });

    const queryParams: NormalizedParameter[] = parsedCurl.request.queryParams.map((q) => {
      const type = inferFieldType(q.key, q.value);
      return {
        id: generateUniqueId('q'),
        name: q.key,
        in: 'query',
        required: true,
        field: {
          id: generateUniqueId('f'),
          name: q.key,
          type,
          label: generateFieldLabel(q.key),
          required: true,
          placeholder: generatePlaceholder(q.key, type),
          defaultValue: q.value,
          location: 'query',
        },
      };
    });

    const pathParams: NormalizedParameter[] = parsedCurl.request.pathParams.map((p) => {
      const type = inferFieldType(p.key, p.value);
      return {
        id: generateUniqueId('p'),
        name: p.key,
        in: 'path',
        required: true,
        field: {
          id: generateUniqueId('f'),
          name: p.key,
          type,
          label: generateFieldLabel(p.key),
          required: true,
          placeholder: generatePlaceholder(p.key, type),
          defaultValue: p.value,
          location: 'path',
        },
      };
    });

    let bodySchema;
    if (parsedCurl.request.body.mode === 'json' && parsedCurl.request.body.raw) {
      try {
        const jsonObj = JSON.parse(parsedCurl.request.body.raw);
        const bodyField = this.buildFieldFromJson('body', jsonObj);
        bodySchema = {
          contentType: 'application/json',
          required: true,
          field: bodyField,
        };
      } catch {
        warnings.push('Failed to parse cURL JSON body into structured schema. Reverted to raw text field.');
        bodySchema = {
          contentType: 'application/json',
          required: true,
          field: {
            id: generateUniqueId('f_raw'),
            name: 'body',
            type: 'textarea' as const,
            label: 'Request Body',
            required: true,
            placeholder: '{"key": "value"}',
            defaultValue: parsedCurl.request.body.raw,
            location: 'body' as const,
          },
        };
      }
    }

    const fullUrl = parsedCurl.request.url || 'https://api.example.com/endpoint';
    let path = '/endpoint';
    let baseUrl = fullUrl;
    try {
      const u = new URL(fullUrl);
      baseUrl = u.origin;
      path = u.pathname;
    } catch {
      // url was relative
    }

    const endpoint: NormalizedEndpoint = {
      id: generateUniqueId('ep'),
      name: parsedCurl.name || `${parsedCurl.request.method} ${path}`,
      method: parsedCurl.request.method,
      url: fullUrl,
      path,
      headers,
      queryParams,
      pathParams,
      body: bodySchema,
      auth: parsedCurl.request.authorization as any,
    };

    return {
      schema: {
        title: 'cURL Command Import',
        servers: [baseUrl],
        baseUrl,
        endpoints: [endpoint],
        specType: 'curl',
      },
      warnings,
    };
  }

  private buildFieldFromJson(name: string, obj: any): NormalizedField {
    const type = inferFieldType(name, obj);
    if (type === 'object' || (typeof obj === 'object' && obj !== null && !Array.isArray(obj))) {
      const children: NormalizedField[] = Object.keys(obj).map((k) => this.buildFieldFromJson(k, obj[k]));
      return {
        id: generateUniqueId('f'),
        name,
        type: 'object',
        label: generateFieldLabel(name),
        required: true,
        placeholder: generatePlaceholder(name, 'object'),
        children,
        location: 'body',
      };
    }
    if (Array.isArray(obj)) {
      const firstItem = obj[0];
      const itemDef = firstItem ? this.buildFieldFromJson(`${name}_item`, firstItem) : undefined;
      return {
        id: generateUniqueId('f'),
        name,
        type: 'array',
        label: generateFieldLabel(name),
        required: true,
        placeholder: generatePlaceholder(name, 'array'),
        itemDefinition: itemDef,
        location: 'body',
      };
    }
    return {
      id: generateUniqueId('f'),
      name,
      type,
      label: generateFieldLabel(name),
      required: true,
      placeholder: generatePlaceholder(name, type),
      defaultValue: obj,
      location: 'body',
    };
  }
}
