import { generateFieldLabel, generatePlaceholder } from './schemaUtils';

export { generateFieldLabel, generatePlaceholder };

/**
 * Generate a unique field ID
 */
export function generateUniqueId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}
