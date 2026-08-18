import { BaseParser } from './BaseParser';
import type { ParserType } from '../../types/ParserType';
import type { NormalizedApiSchema, NormalizedEndpoint, NormalizedParameter, NormalizedField } from '../../types/NormalizedSchema';
import { swaggerParser } from '../swaggerParser';
import { generateUniqueId } from '../../utils/schemaHelpers';

export class OpenAPIParser extends BaseParser {
  readonly sourceType: ParserType = 'openapi';

  public canParse(input: string | object): boolean {
    if (typeof input === 'object' && input !== null) {
      return 'openapi' in input;
    }
    if (typeof input === 'string') {
      const lower = input.toLowerCase();
      return lower.includes('openapi:') || lower.includes('"openapi"');
    }
    return false;
  }

  public async parseSchema(input: string | object): Promise<{ schema: NormalizedApiSchema; warnings: string[] }> {
    const rawText = typeof input === 'string' ? input : JSON.stringify(input);
    const parsed = swaggerParser.parseSpec(rawText);
    const warnings: string[] = [];

    const endpoints: NormalizedEndpoint[] = [];

    for (const epInfo of parsed.endpoints) {
      try {
        const formDef = swaggerParser.generateFormDefinition(parsed.spec, epInfo.path, epInfo.method);

        const pathParams: NormalizedParameter[] = [];
        const queryParams: NormalizedParameter[] = [];
        const headers: NormalizedParameter[] = [];

        for (const p of formDef.parameters) {
          const normField: NormalizedField = {
            id: p.id,
            name: p.name,
            type: p.type,
            label: p.label,
            required: p.required,
            placeholder: p.placeholder,
            description: p.description,
            defaultValue: p.defaultValue,
            options: p.options,
            location: p.location,
            validation: p.validation,
            children: p.children ? (p.children as any) : undefined,
            itemDefinition: p.itemDefinition ? (p.itemDefinition as any) : undefined,
            variants: p.variants ? (p.variants as any) : undefined,
          };

          const normParam: NormalizedParameter = {
            id: p.id,
            name: p.name,
            in: (p.location as any) || 'query',
            required: p.required,
            description: p.description,
            field: normField,
          };

          if (p.location === 'path') pathParams.push(normParam);
          else if (p.location === 'header') headers.push(normParam);
          else queryParams.push(normParam);
        }

        let bodySchema;
        if (formDef.body) {
          bodySchema = {
            contentType: formDef.contentType || 'application/json',
            required: formDef.body.required,
            description: formDef.body.description,
            field: formDef.body as any,
          };
        }

        endpoints.push({
          id: generateUniqueId('ep'),
          name: formDef.endpoint.summary || `${epInfo.method} ${epInfo.path}`,
          summary: formDef.endpoint.summary,
          description: formDef.endpoint.description,
          method: formDef.endpoint.method,
          url: epInfo.path,
          path: epInfo.path,
          pathParams,
          queryParams,
          headers,
          body: bodySchema,
          tags: formDef.endpoint.tags,
        });
      } catch (err: any) {
        warnings.push(`Warning for path ${epInfo.path}: ${err.message}`);
      }
    }

    return {
      schema: {
        title: parsed.title,
        version: parsed.spec.info?.version,
        description: parsed.spec.info?.description,
        servers: parsed.servers,
        baseUrl: parsed.servers[0] || '',
        endpoints,
        specType: 'openapi',
      },
      warnings,
    };
  }
}
