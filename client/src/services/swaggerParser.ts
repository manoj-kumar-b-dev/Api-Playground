import { parse as parseYaml } from 'yaml';
import type {
  FieldDefinition,
  FieldType,
  FormDefinition,
  FormEndpointInfo,
  ParameterLocation,
  PolymorphicVariant,
} from '../types/dynamicForm.types';
import {
  extractValidationRules,
  generateFieldLabel,
  generatePlaceholder,
  resolveRef,
} from '../utils/schemaUtils';

export interface ParsedSpecResult {
  spec: any;
  specType: 'openapi3' | 'swagger2';
  title: string;
  servers: string[];
  endpoints: FormEndpointInfo[];
}

export class SwaggerParserService {
  /**
   * Parse OpenAPI 3.x or Swagger 2.0 raw text (JSON or YAML)
   */
  public parseSpec(specText: string): ParsedSpecResult {
    let spec: any;
    try {
      spec = JSON.parse(specText);
    } catch {
      try {
        spec = parseYaml(specText);
      } catch (err: any) {
        throw new Error(`Failed to parse specification. Invalid JSON/YAML format: ${err.message}`);
      }
    }

    if (!spec || typeof spec !== 'object') {
      throw new Error('Parsed document is not a valid object.');
    }

    const specType: 'openapi3' | 'swagger2' = spec.openapi
      ? 'openapi3'
      : spec.swagger === '2.0'
      ? 'swagger2'
      : 'openapi3';

    const title = spec.info?.title || 'API Specification';
    const servers: string[] = [];

    if (spec.servers && Array.isArray(spec.servers)) {
      servers.push(...spec.servers.map((s: any) => s.url || '').filter(Boolean));
    } else if (spec.host) {
      const scheme = spec.schemes?.[0] || 'https';
      const basePath = spec.basePath || '';
      servers.push(`${scheme}://${spec.host}${basePath}`);
    }

    const endpoints = this.extractEndpoints(spec);

    return {
      spec,
      specType,
      title,
      servers,
      endpoints,
    };
  }

  /**
   * Extract endpoints list from specification paths
   */
  private extractEndpoints(spec: any): FormEndpointInfo[] {
    const endpoints: FormEndpointInfo[] = [];
    const paths = spec.paths || {};
    const validMethods = ['get', 'post', 'put', 'delete', 'patch', 'head', 'options'];

    for (const pathKey of Object.keys(paths)) {
      const pathObj = paths[pathKey];
      if (!pathObj || typeof pathObj !== 'object') continue;

      for (const methodKey of Object.keys(pathObj)) {
        if (!validMethods.includes(methodKey.toLowerCase())) continue;
        const op = pathObj[methodKey];
        const method = methodKey.toUpperCase() as FormEndpointInfo['method'];

        endpoints.push({
          operationId: op.operationId || `${methodKey}_${pathKey.replace(/[^a-zA-Z0-9]/g, '_')}`,
          summary: op.summary || `${method} ${pathKey}`,
          description: op.description || '',
          method,
          path: pathKey,
          tags: op.tags || [],
        });
      }
    }
    return endpoints;
  }

  /**
   * Build FormDefinition for a specific endpoint path and method
   */
  public generateFormDefinition(spec: any, path: string, method: string): FormDefinition {
    const pathObj = spec.paths?.[path];
    if (!pathObj) throw new Error(`Path ${path} not found in spec.`);

    const opKey = method.toLowerCase();
    const op = pathObj[opKey];
    if (!op) throw new Error(`Method ${method} not found for path ${path}.`);

    const parameters: FieldDefinition[] = [];
    const rawParams = [...(pathObj.parameters || []), ...(op.parameters || [])];

    for (const p of rawParams) {
      const resolvedP = p.$ref ? resolveRef(spec, p.$ref) : p;
      if (!resolvedP || !resolvedP.name) continue;

      const loc = resolvedP.in as ParameterLocation;
      if (loc === 'body') {
        // Swagger 2.0 body parameter
        const bodySchema = resolvedP.schema ? this.normalizeSchema(spec, resolvedP.schema, 'body', 'body') : null;
        if (bodySchema) {
          bodySchema.description = resolvedP.description || bodySchema.description;
          bodySchema.required = resolvedP.required === true;
        }
      } else if (['path', 'query', 'header'].includes(loc)) {
        const schema = resolvedP.schema || resolvedP;
        const field = this.normalizeSchema(spec, schema, resolvedP.name, `param.${loc}.${resolvedP.name}`, loc);
        field.label = generateFieldLabel(resolvedP.name);
        field.required = resolvedP.required === true || loc === 'path';
        field.description = resolvedP.description || field.description;
        parameters.push(field);
      }
    }

    // OpenAPI 3.x requestBody
    let bodyField: FieldDefinition | undefined;
    let contentType = 'application/json';

    if (op.requestBody) {
      const rb = op.requestBody.$ref ? resolveRef(spec, op.requestBody.$ref) : op.requestBody;
      if (rb && rb.content) {
        const contentTypes = Object.keys(rb.content);
        contentType = contentTypes.find((c) => c.includes('json')) || contentTypes[0] || 'application/json';
        const mediaObj = rb.content[contentType];
        if (mediaObj && mediaObj.schema) {
          bodyField = this.normalizeSchema(spec, mediaObj.schema, 'requestBody', 'body');
          if (bodyField) {
            bodyField.required = rb.required === true;
            bodyField.description = rb.description || bodyField.description;
          }
        }
      }
    }

    return {
      id: op.operationId || `${method}_${path}`,
      endpoint: {
        operationId: op.operationId,
        summary: op.summary || `${method} ${path}`,
        description: op.description || '',
        method: method.toUpperCase() as any,
        path,
        tags: op.tags || [],
      },
      parameters,
      body: bodyField,
      contentType,
      rawSchema: op,
    };
  }

  /**
   * Convert JSON schema into normalized FieldDefinition recursively
   */
  public normalizeSchema(
    spec: any,
    rawSchema: any,
    name: string,
    path: string,
    location?: ParameterLocation,
    visited: Set<string> = new Set()
  ): FieldDefinition {
    let schema = rawSchema;
    if (schema.$ref) {
      schema = resolveRef(spec, schema.$ref, visited) || {};
    }

    // Handle polymorphic schemas (oneOf, anyOf, allOf)
    if (schema.oneOf || schema.anyOf) {
      const variantList = schema.oneOf || schema.anyOf;
      const variants: PolymorphicVariant[] = variantList.map((v: any, idx: number) => {
        const vResolved = v.$ref ? resolveRef(spec, v.$ref) : v;
        const vName = vResolved.title || vResolved.name || `Option ${idx + 1}`;
        return {
          id: `var_${idx}`,
          name: vName,
          definition: this.normalizeSchema(spec, vResolved, `${name}_v${idx}`, `${path}.var_${idx}`, location, new Set(visited)),
        };
      });

      return {
        id: `field_${path}`,
        name,
        path,
        type: 'polymorphic',
        label: generateFieldLabel(name),
        required: schema.required === true,
        placeholder: 'Select schema variant',
        description: schema.description,
        location,
        variants,
        selectedVariantIndex: 0,
      };
    }

    // Determine field type
    let type: FieldType = 'text';
    const rawType = Array.isArray(schema.type) ? schema.type[0] : schema.type;
    const format = schema.format;

    if (schema.enum && Array.isArray(schema.enum)) {
      type = 'select';
    } else if (rawType === 'integer' || rawType === 'number') {
      type = 'number';
    } else if (rawType === 'boolean') {
      type = 'boolean';
    } else if (rawType === 'array') {
      type = 'array';
    } else if (rawType === 'object' || schema.properties) {
      type = 'object';
    } else if (format === 'binary') {
      type = 'file';
    } else if (format === 'date') {
      type = 'date';
    } else if (format === 'date-time') {
      type = 'datetime';
    } else if (format === 'password') {
      type = 'password';
    } else if (format === 'email') {
      type = 'email';
    } else if (format === 'uri' || format === 'url') {
      type = 'url';
    } else if (schema.maxLength && schema.maxLength > 150) {
      type = 'textarea';
    }

    const label = generateFieldLabel(name);
    const placeholder = generatePlaceholder(name, type, format);

    const definition: FieldDefinition = {
      id: `field_${path}`,
      name,
      path,
      type,
      label,
      required: false,
      placeholder,
      description: schema.description || '',
      defaultValue: schema.default !== undefined ? schema.default : schema.example,
      options: schema.enum,
      readOnly: schema.readOnly === true,
      writeOnly: schema.writeOnly === true,
      location,
      validation: extractValidationRules(schema, [], name),
    };

    // Handle Object properties recursively
    if (type === 'object') {
      const props = schema.properties || {};
      const requiredList: string[] = Array.isArray(schema.required) ? schema.required : [];
      definition.children = Object.keys(props).map((propKey) => {
        const childField = this.normalizeSchema(
          spec,
          props[propKey],
          propKey,
          `${path}.${propKey}`,
          location,
          new Set(visited)
        );
        childField.required = requiredList.includes(propKey);
        return childField;
      });
    }

    // Handle Array items
    if (type === 'array' && schema.items) {
      definition.itemDefinition = this.normalizeSchema(
        spec,
        schema.items,
        `${name}_item`,
        `${path}[i]`,
        location,
        new Set(visited)
      );
    }

    return definition;
  }
}

export const swaggerParser = new SwaggerParserService();
