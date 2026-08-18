import { BaseParser } from './BaseParser';
import type { ParserType } from '../../types/ParserType';
import type { NormalizedApiSchema, NormalizedEndpoint } from '../../types/NormalizedSchema';
import { parseDocumentationText } from '../../utils/docParser';
import { generateUniqueId } from '../../utils/schemaHelpers';

export class DocumentationParser extends BaseParser {
  readonly sourceType: ParserType = 'doc';

  public canParse(input: string | object): boolean {
    if (typeof input !== 'string') return false;
    const lower = input.toLowerCase();
    return (
      lower.includes('post ') ||
      lower.includes('get ') ||
      lower.includes('put ') ||
      lower.includes('delete ') ||
      lower.includes('headers:') ||
      lower.includes('request body') ||
      lower.includes('endpoint:')
    );
  }

  public async parseSchema(input: string | object): Promise<{ schema: NormalizedApiSchema; warnings: string[] }> {
    const rawText = typeof input === 'string' ? input : String(input);
    const parsedEndpoints = parseDocumentationText(rawText);
    const warnings: string[] = [];

    if (parsedEndpoints.length === 0) {
      warnings.push('Could not detect clear HTTP endpoint paths from documentation text using rule parser.');
    }

    const endpoints: NormalizedEndpoint[] = parsedEndpoints.map((ep) => ({
      id: generateUniqueId('ep'),
      name: ep.name,
      method: ep.request.method,
      url: ep.request.url || '/api/endpoint',
      path: ep.request.url || '/api/endpoint',
      headers: ep.request.headers.map((h) => ({
        id: generateUniqueId('h'),
        name: h.key,
        in: 'header',
        required: true,
        field: {
          id: generateUniqueId('f'),
          name: h.key,
          type: 'text',
          label: h.key,
          required: true,
          placeholder: 'Enter value',
          defaultValue: h.value,
        },
      })),
      queryParams: [],
      pathParams: [],
      body: ep.request.body.raw
        ? {
            contentType: 'application/json',
            required: true,
            field: {
              id: generateUniqueId('f_body'),
              name: 'body',
              type: 'textarea',
              label: 'Request Body',
              required: true,
              placeholder: '{"key": "value"}',
              defaultValue: ep.request.body.raw,
            },
          }
        : undefined,
    }));

    return {
      schema: {
        title: 'API Documentation Import',
        servers: [],
        endpoints,
        specType: 'doc',
      },
      warnings,
    };
  }
}
