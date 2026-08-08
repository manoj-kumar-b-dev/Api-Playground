import { z } from 'zod';
import type { ZodTypeAny } from 'zod';
import type { FieldDefinition, FormDefinition } from '../types/dynamicForm.types';

export class DynamicValidationService {
  /**
   * Validate entire form values against generated Zod schema
   */
  public validateForm(formDef: FormDefinition, formValues: Record<string, any>): {
    success: boolean;
    errors: Record<string, string>;
    data?: any;
  } {
    const zodSchema = this.buildFormSchema(formDef);
    const result = zodSchema.safeParse(formValues);

    if (result.success) {
      return { success: true, errors: {}, data: result.data };
    }

    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const fieldPath = issue.path.join('.');
      errors[fieldPath] = issue.message;
    }

    return { success: false, errors };
  }

  /**
   * Build Zod schema for full FormDefinition
   */
  public buildFormSchema(formDef: FormDefinition): z.ZodObject<any> {
    const shape: Record<string, ZodTypeAny> = {};

    // Validate parameters (path, query, header)
    if (formDef.parameters && formDef.parameters.length > 0) {
      const paramShape: Record<string, ZodTypeAny> = {};
      for (const p of formDef.parameters) {
        paramShape[p.name] = this.buildFieldSchema(p);
      }
      shape.parameters = z.object(paramShape).optional();
    }

    // Validate request body
    if (formDef.body) {
      shape.body = this.buildFieldSchema(formDef.body);
    }

    return z.object(shape);
  }

  /**
   * Recursively build Zod schema for a FieldDefinition
   */
  public buildFieldSchema(field: FieldDefinition): ZodTypeAny {
    const v = field.validation || {};
    let schema: ZodTypeAny;

    switch (field.type) {
      case 'number':
      case 'integer': {
        let numSchema = z.number({
          message: `${field.label} must be a number`,
        });
        if (v.min !== undefined) numSchema = numSchema.min(v.min, `${field.label} must be at least ${v.min}`);
        if (v.max !== undefined) numSchema = numSchema.max(v.max, `${field.label} must be at most ${v.max}`);
        schema = numSchema;
        break;
      }
      case 'boolean': {
        schema = z.boolean();
        break;
      }
      case 'select': {
        if (field.options && field.options.length > 0) {
          const strOpts = field.options.map(String);
          schema = z.string().refine((val) => strOpts.includes(String(val)), {
            message: `Must be one of: ${strOpts.join(', ')}`,
          });
        } else {
          schema = z.string();
        }
        break;
      }
      case 'email': {
        let emailSchema = z.string().email(`Invalid email address format`);
        if (v.minLength) emailSchema = emailSchema.min(v.minLength);
        if (v.maxLength) emailSchema = emailSchema.max(v.maxLength);
        schema = emailSchema;
        break;
      }
      case 'url': {
        schema = z.string().url(`Invalid URL format`);
        break;
      }
      case 'date':
      case 'datetime': {
        schema = z.string().refine((val) => !val || !isNaN(Date.parse(val)), {
          message: `Invalid date format`,
        });
        break;
      }
      case 'file': {
        schema = z.any();
        break;
      }
      case 'object': {
        if (field.children && field.children.length > 0) {
          const objShape: Record<string, ZodTypeAny> = {};
          for (const child of field.children) {
            objShape[child.name] = this.buildFieldSchema(child);
          }
          schema = z.object(objShape);
        } else {
          schema = z.record(z.string(), z.any());
        }
        break;
      }
      case 'array': {
        if (field.itemDefinition) {
          const itemSchema = this.buildFieldSchema(field.itemDefinition);
          let arrSchema = z.array(itemSchema);
          if (v.min !== undefined) arrSchema = arrSchema.min(v.min, `Must have at least ${v.min} items`);
          if (v.max !== undefined) arrSchema = arrSchema.max(v.max, `Must have at most ${v.max} items`);
          schema = arrSchema;
        } else {
          schema = z.array(z.any());
        }
        break;
      }
      case 'polymorphic': {
        if (field.variants && field.variants.length > 0) {
          const activeIdx = field.selectedVariantIndex || 0;
          const selectedVariant = field.variants[activeIdx] || field.variants[0];
          schema = this.buildFieldSchema(selectedVariant.definition);
        } else {
          schema = z.any();
        }
        break;
      }
      default: {
        let strSchema = z.string();
        if (v.minLength) strSchema = strSchema.min(v.minLength, `${field.label} requires min ${v.minLength} characters`);
        if (v.maxLength) strSchema = strSchema.max(v.maxLength, `${field.label} max ${v.maxLength} characters`);
        if (v.pattern) {
          try {
            strSchema = strSchema.regex(new RegExp(v.pattern), `${field.label} format is invalid`);
          } catch {
            // ignore invalid regex
          }
        }
        schema = strSchema;
        break;
      }
    }

    if (v.nullable) {
      schema = schema.nullable();
    }

    if (!field.required && !v.required) {
      schema = schema.optional().or(z.literal(''));
    } else {
      if (field.type === 'text' || field.type === 'textarea' || field.type === 'password') {
        schema = (schema as z.ZodString).min(1, `${field.label} is required`);
      }
    }

    return schema;
  }
}

export const dynamicValidationService = new DynamicValidationService();
