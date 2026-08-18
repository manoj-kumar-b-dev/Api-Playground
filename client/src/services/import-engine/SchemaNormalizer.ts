import type { NormalizedEndpoint } from '../../types/NormalizedSchema';
import type { FieldDefinition, FormDefinition } from '../../types/dynamicForm.types';

export class SchemaNormalizer {
  /**
   * Convert a NormalizedEndpoint into a FormDefinition for DynamicForm UI
   */
  public static toFormDefinition(endpoint: NormalizedEndpoint, contentType: string = 'application/json'): FormDefinition {
    const parameters: FieldDefinition[] = [];

    // Path parameters
    for (const p of endpoint.pathParams || []) {
      parameters.push(this.toFieldDefinition(p.field, 'path'));
    }

    // Query parameters
    for (const q of endpoint.queryParams || []) {
      parameters.push(this.toFieldDefinition(q.field, 'query'));
    }

    // Header parameters
    for (const h of endpoint.headers || []) {
      parameters.push(this.toFieldDefinition(h.field, 'header'));
    }

    // Body
    let bodyField: FieldDefinition | undefined;
    if (endpoint.body && endpoint.body.field) {
      bodyField = this.toFieldDefinition(endpoint.body.field, 'body');
    }

    return {
      id: endpoint.id,
      endpoint: {
        operationId: endpoint.id,
        summary: endpoint.summary || endpoint.name,
        description: endpoint.description || '',
        method: endpoint.method,
        path: endpoint.path,
        servers: [],
        tags: endpoint.tags || [],
      },
      parameters,
      body: bodyField,
      contentType: endpoint.body?.contentType || contentType,
      rawSchema: endpoint,
    };
  }

  private static toFieldDefinition(field: any, location?: 'path' | 'query' | 'header' | 'body'): FieldDefinition {
    const children = field.children ? field.children.map((c: any) => this.toFieldDefinition(c, location)) : undefined;
    const itemDefinition = field.itemDefinition ? this.toFieldDefinition(field.itemDefinition, location) : undefined;
    const variants = field.variants
      ? field.variants.map((v: any) => ({
          id: v.id,
          name: v.name,
          definition: this.toFieldDefinition(v.definition, location),
        }))
      : undefined;

    return {
      id: field.id || `field_${field.name}`,
      name: field.name,
      path: field.path || field.name,
      type: field.type || 'text',
      label: field.label || field.name,
      required: field.required === true,
      placeholder: field.placeholder || `Enter ${field.name}`,
      description: field.description,
      defaultValue: field.defaultValue,
      options: field.options,
      readOnly: field.readOnly,
      writeOnly: field.writeOnly,
      location: location || field.location,
      validation: field.validation,
      children,
      itemDefinition,
      variants,
      selectedVariantIndex: field.selectedVariantIndex,
    };
  }
}
