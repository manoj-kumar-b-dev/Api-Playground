import type { FieldType, SchemaValidationRules } from '../types/dynamicForm.types';

/**
 * Format field name into human readable label
 * e.g. firstName -> First Name, user_email -> User Email
 */
export function generateFieldLabel(name: string): string {
  if (!name) return '';
  const result = name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim();
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Generate contextual placeholder for input fields
 */
export function generatePlaceholder(name: string, type: FieldType, format?: string): string {
  const label = generateFieldLabel(name).toLowerCase();
  if (format === 'email' || name.toLowerCase().includes('email')) {
    return 'Enter email address';
  }
  if (format === 'url' || format === 'uri' || name.toLowerCase().includes('url')) {
    return 'https://example.com';
  }
  if (format === 'password' || name.toLowerCase().includes('password')) {
    return 'Enter password';
  }
  if (type === 'number' || type === 'integer') {
    return name.toLowerCase().includes('price') || name.toLowerCase().includes('amount')
      ? 'Enter price'
      : 'Enter number';
  }
  if (type === 'select') {
    return `Select ${label}`;
  }
  if (type === 'date' || type === 'datetime') {
    return 'Select date';
  }
  if (type === 'file') {
    return 'Choose file to upload';
  }
  return `Enter ${label || 'value'}`;
}

/**
 * Resolve JSON $ref pointers in OpenAPI / Swagger specs
 */
export function resolveRef(spec: any, ref: string, visited: Set<string> = new Set()): any {
  if (!ref || typeof ref !== 'string' || !ref.startsWith('#/')) {
    return null;
  }
  if (visited.has(ref)) {
    // Avoid infinite recursion on circular refs
    return { type: 'object', description: '[Circular Reference]' };
  }
  visited.add(ref);

  const parts = ref.substring(2).split('/');
  let current = spec;
  for (const part of parts) {
    const unescaped = part.replace(/~1/g, '/').replace(/~0/g, '~');
    if (current && typeof current === 'object' && unescaped in current) {
      current = current[unescaped];
    } else {
      return null;
    }
  }

  if (current && current.$ref) {
    return resolveRef(spec, current.$ref, visited);
  }
  return current;
}

/**
 * Extract validation rules from schema object
 */
export function extractValidationRules(schema: any, requiredFields: string[] = [], name: string = ''): SchemaValidationRules {
  if (!schema) return {};

  return {
    required: requiredFields.includes(name) || schema.required === true,
    min: schema.minimum !== undefined ? schema.minimum : schema.minItems,
    max: schema.maximum !== undefined ? schema.maximum : schema.maxItems,
    minLength: schema.minLength,
    maxLength: schema.maxLength,
    pattern: schema.pattern,
    enum: schema.enum,
    format: schema.format,
    nullable: schema.nullable === true,
    default: schema.default,
    readOnly: schema.readOnly === true,
    writeOnly: schema.writeOnly === true,
  };
}
