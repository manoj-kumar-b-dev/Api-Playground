import { BaseParser } from './BaseParser';
import type { ParserType } from '../../types/ParserType';
import type { NormalizedApiSchema, NormalizedEndpoint } from '../../types/NormalizedSchema';
import { generateUniqueId, generateFieldLabel, generatePlaceholder } from '../../utils/schemaHelpers';
import { inferFieldType } from '../../utils/fieldInference';

export interface ManualEndpointInput {
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  headers?: { key: string; value: string }[];
  queryParams?: { key: string; value: string }[];
  pathParams?: { key: string; value: string }[];
  bodyRaw?: string;
}

export class ManualParser extends BaseParser {
  readonly sourceType: ParserType = 'manual';

  public canParse(input: string | object): boolean {
    if (typeof input === 'object' && input !== null) {
      return 'method' in input && 'url' in input;
    }
    return false;
  }

  public async parseSchema(input: string | object): Promise<{ schema: NormalizedApiSchema; warnings: string[] }> {
    const data: ManualEndpointInput =
      typeof input === 'object' && input !== null
        ? (input as any)
        : {
            name: 'Manual Endpoint',
            method: 'GET',
            url: '/api/resource',
          };

    const warnings: string[] = [];

    const headers = (data.headers || []).map((h) => ({
      id: generateUniqueId('h'),
      name: h.key,
      in: 'header' as const,
      required: true,
      field: {
        id: generateUniqueId('f'),
        name: h.key,
        type: inferFieldType(h.key, h.value),
        label: generateFieldLabel(h.key),
        required: true,
        placeholder: generatePlaceholder(h.key, 'text'),
        defaultValue: h.value,
        location: 'header' as const,
      },
    }));

    const queryParams = (data.queryParams || []).map((q) => ({
      id: generateUniqueId('q'),
      name: q.key,
      in: 'query' as const,
      required: true,
      field: {
        id: generateUniqueId('f'),
        name: q.key,
        type: inferFieldType(q.key, q.value),
        label: generateFieldLabel(q.key),
        required: true,
        placeholder: generatePlaceholder(q.key, 'text'),
        defaultValue: q.value,
        location: 'query' as const,
      },
    }));

    const pathParams = (data.pathParams || []).map((p) => ({
      id: generateUniqueId('p'),
      name: p.key,
      in: 'path' as const,
      required: true,
      field: {
        id: generateUniqueId('f'),
        name: p.key,
        type: inferFieldType(p.key, p.value),
        label: generateFieldLabel(p.key),
        required: true,
        placeholder: generatePlaceholder(p.key, 'text'),
        defaultValue: p.value,
        location: 'path' as const,
      },
    }));

    let bodySchema;
    if (data.bodyRaw && data.bodyRaw.trim()) {
      try {
        const parsedJson = JSON.parse(data.bodyRaw);
        bodySchema = {
          contentType: 'application/json',
          required: true,
          field: this.buildFieldFromJson('body', parsedJson),
        };
      } catch {
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
            defaultValue: data.bodyRaw,
            location: 'body' as const,
          },
        };
      }
    }

    const endpoint: NormalizedEndpoint = {
      id: generateUniqueId('ep'),
      name: data.name || `${data.method} ${data.url}`,
      method: data.method,
      url: data.url,
      path: data.url,
      headers,
      queryParams,
      pathParams,
      body: bodySchema,
    };

    return {
      schema: {
        title: 'Manual Endpoint Creation',
        servers: [],
        endpoints: [endpoint],
        specType: 'manual',
      },
      warnings,
    };
  }

  private buildFieldFromJson(name: string, obj: any): any {
    const type = inferFieldType(name, obj);
    if (type === 'object' || (typeof obj === 'object' && obj !== null && !Array.isArray(obj))) {
      return {
        id: generateUniqueId('f'),
        name,
        type: 'object',
        label: generateFieldLabel(name),
        required: true,
        placeholder: generatePlaceholder(name, 'object'),
        children: Object.keys(obj).map((k) => this.buildFieldFromJson(k, obj[k])),
        location: 'body',
      };
    }
    if (Array.isArray(obj)) {
      return {
        id: generateUniqueId('f'),
        name,
        type: 'array',
        label: generateFieldLabel(name),
        required: true,
        placeholder: generatePlaceholder(name, 'array'),
        itemDefinition: obj[0] ? this.buildFieldFromJson(`${name}_item`, obj[0]) : undefined,
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
