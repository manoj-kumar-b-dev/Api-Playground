import type { FieldType } from '../types/dynamicForm.types';

/**
 * Infer FieldType from field name and example value
 */
export function inferFieldType(name: string, value?: any): FieldType {
  const lowerName = (name || '').toLowerCase();
  const valStr = value !== undefined && value !== null ? String(value).trim() : '';

  if (lowerName.includes('password') || lowerName.includes('secret')) return 'password';
  if (lowerName.includes('email') || valStr.includes('@')) return 'email';
  if (lowerName.includes('url') || lowerName.includes('website') || valStr.startsWith('http://') || valStr.startsWith('https://'))
    return 'url';

  if (typeof value === 'boolean' || valStr === 'true' || valStr === 'false') return 'boolean';

  if (typeof value === 'number') return 'number';
  if (valStr !== '' && !isNaN(Number(valStr)) && !valStr.startsWith('0x')) return 'number';

  if (lowerName.includes('date') || lowerName.includes('dob') || lowerName.includes('time')) {
    if (valStr && !isNaN(Date.parse(valStr))) {
      return valStr.includes('T') || valStr.includes(':') ? 'datetime' : 'date';
    }
    return 'date';
  }

  if (lowerName.includes('avatar') || lowerName.includes('file') || lowerName.includes('image') || lowerName.includes('upload')) {
    return 'file';
  }

  if (valStr.length > 150) return 'textarea';

  return 'text';
}
