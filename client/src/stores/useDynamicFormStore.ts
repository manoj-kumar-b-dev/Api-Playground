import { create } from 'zustand';
import type {
  DynamicFormState,
  FieldDefinition,
  FormDefinition,
} from '../types/dynamicForm.types';
import { swaggerParser } from '../services/swaggerParser';
import { dynamicValidationService } from '../services/dynamicValidationService';
import { dynamicRequestBuilder } from '../services/dynamicRequestBuilder';
import axios from 'axios';
import toast from 'react-hot-toast';

interface DynamicFormStoreActions {
  setRawSpec: (specText: string) => void;
  selectEndpoint: (path: string, method: string) => void;
  setFieldValue: (path: string, value: any) => void;
  setPolymorphicVariant: (fieldPath: string, variantIndex: number) => void;
  populateExamples: () => void;
  resetForm: () => void;
  validateForm: () => boolean;
  setBaseUrl: (url: string) => void;
  setActivePreviewTab: (tab: 'form' | 'json' | 'curl' | 'request') => void;
  executeRequest: () => Promise<void>;
}

type DynamicFormStore = DynamicFormState & {
  baseUrl: string;
  servers: string[];
} & DynamicFormStoreActions;

export const useDynamicFormStore = create<DynamicFormStore>((set, get) => ({
  rawSpec: '',
  parsedSpec: null,
  specType: null,
  servers: [],
  baseUrl: '',
  endpoints: [],
  selectedEndpointKey: null,
  formDefinition: null,
  formValues: {},
  validationErrors: {},
  isSubmitting: false,
  response: null,
  activePreviewTab: 'form',

  setRawSpec: (specText: string) => {
    try {
      const parsed = swaggerParser.parseSpec(specText);
      const defaultServer = parsed.servers[0] || 'https://api.example.com';
      const firstEp = parsed.endpoints[0];

      set({
        rawSpec: specText,
        parsedSpec: parsed.spec,
        specType: parsed.specType,
        servers: parsed.servers,
        baseUrl: defaultServer,
        endpoints: parsed.endpoints,
        response: null,
        validationErrors: {},
      });

      if (firstEp) {
        get().selectEndpoint(firstEp.path, firstEp.method);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse spec');
    }
  },

  selectEndpoint: (path: string, method: string) => {
    const { parsedSpec } = get();
    if (!parsedSpec) return;

    try {
      const formDef = swaggerParser.generateFormDefinition(parsedSpec, path, method);
      const endpointKey = `${method.toUpperCase()} ${path}`;
      const defaultValues = generateDefaultValues(formDef);

      set({
        selectedEndpointKey: endpointKey,
        formDefinition: formDef,
        formValues: defaultValues,
        validationErrors: {},
        response: null,
      });
    } catch (err: any) {
      toast.error(`Error loading endpoint schema: ${err.message}`);
    }
  },

  setFieldValue: (path: string, value: any) => {
    set((state) => {
      const newFormValues = { ...state.formValues };
      setNestedProperty(newFormValues, path, value);

      const newErrors = { ...state.validationErrors };
      delete newErrors[path];

      return {
        formValues: newFormValues,
        validationErrors: newErrors,
      };
    });
  },

  setPolymorphicVariant: (fieldPath: string, variantIndex: number) => {
    set((state) => {
      if (!state.formDefinition) return state;

      const formDef = { ...state.formDefinition };
      const field = findFieldByPath(formDef, fieldPath);
      if (field && field.type === 'polymorphic' && field.variants) {
        field.selectedVariantIndex = variantIndex;
      }

      return { formDefinition: formDef };
    });
  },

  populateExamples: () => {
    const { formDefinition } = get();
    if (!formDefinition) return;
    const exampleValues = generateExampleValues(formDefinition);
    set({ formValues: exampleValues, validationErrors: {} });
    toast.success('Populated example values');
  },

  resetForm: () => {
    const { formDefinition } = get();
    if (!formDefinition) return;
    const defaultValues = generateDefaultValues(formDefinition);
    set({ formValues: defaultValues, validationErrors: {} });
    toast.success('Form reset');
  },

  validateForm: () => {
    const { formDefinition, formValues } = get();
    if (!formDefinition) return false;

    const validation = dynamicValidationService.validateForm(formDefinition, formValues);
    if (!validation.success) {
      set({ validationErrors: validation.errors });
      toast.error('Please fix form validation errors before sending');
      return false;
    }

    set({ validationErrors: {} });
    return true;
  },

  setBaseUrl: (url: string) => set({ baseUrl: url }),

  setActivePreviewTab: (tab) => set({ activePreviewTab: tab }),

  executeRequest: async () => {
    const { formDefinition, formValues, baseUrl, validateForm } = get();
    if (!formDefinition) return;

    const isValid = validateForm();
    if (!isValid) return;

    set({ isSubmitting: true, response: null });
    const builtReq = dynamicRequestBuilder.buildRequest(formDefinition, formValues, baseUrl);

    const startTime = Date.now();
    try {
      const resp = await axios({
        method: formDefinition.endpoint.method,
        url: builtReq.fullUrl,
        headers: builtReq.headers.reduce((acc, h) => ({ ...acc, [h.key]: h.value }), {}),
        data: builtReq.formDataPayload || (builtReq.bodyMode === 'json' ? JSON.parse(builtReq.bodyRaw || '{}') : undefined),
      });

      const responseTime = Date.now() - startTime;
      set({
        response: {
          status: resp.status,
          statusText: resp.statusText,
          headers: resp.headers,
          data: resp.data,
          responseTime,
        },
        isSubmitting: false,
      });
      toast.success(`Request successful (${resp.status})`);
    } catch (err: any) {
      const responseTime = Date.now() - startTime;
      set({
        response: {
          status: err.response?.status || 500,
          statusText: err.response?.statusText || 'Error',
          headers: err.response?.headers || {},
          data: err.response?.data || err.message,
          responseTime,
          isError: true,
        },
        isSubmitting: false,
      });
      toast.error(`Request failed: ${err.message}`);
    }
  },
}));

// Helper functions for nested object property access
function setNestedProperty(obj: any, path: string, value: any) {
  const keys = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let current = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = isNaN(Number(keys[i + 1])) ? {} : [];
    }
    current = current[key];
  }
  current[keys[keys.length - 1]] = value;
}

function findFieldByPath(formDef: FormDefinition, path: string): FieldDefinition | null {
  if (formDef.body && formDef.body.path === path) return formDef.body;
  for (const p of formDef.parameters) {
    if (p.path === path) return p;
  }
  return null;
}

function generateDefaultValues(formDef: FormDefinition): Record<string, any> {
  const result: Record<string, any> = { parameters: {} };

  for (const p of formDef.parameters) {
    result.parameters[p.name] = p.defaultValue !== undefined ? p.defaultValue : '';
  }

  if (formDef.body) {
    result.body = extractFieldDefault(formDef.body);
  }

  return result;
}

function generateExampleValues(formDef: FormDefinition): Record<string, any> {
  const result: Record<string, any> = { parameters: {} };

  for (const p of formDef.parameters) {
    result.parameters[p.name] = p.defaultValue !== undefined ? p.defaultValue : p.placeholder || 'example';
  }

  if (formDef.body) {
    result.body = extractFieldExample(formDef.body);
  }

  return result;
}

function extractFieldDefault(field: FieldDefinition): any {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'object' && field.children) {
    const obj: any = {};
    for (const child of field.children) {
      obj[child.name] = extractFieldDefault(child);
    }
    return obj;
  }
  if (field.type === 'array') {
    return field.itemDefinition ? [extractFieldDefault(field.itemDefinition)] : [];
  }
  if (field.type === 'boolean') return false;
  if (field.type === 'number' || field.type === 'integer') return 0;
  return '';
}

function extractFieldExample(field: FieldDefinition): any {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'object' && field.children) {
    const obj: any = {};
    for (const child of field.children) {
      obj[child.name] = extractFieldExample(child);
    }
    return obj;
  }
  if (field.type === 'array') {
    return field.itemDefinition ? [extractFieldExample(field.itemDefinition)] : [];
  }
  if (field.type === 'email') return 'user@example.com';
  if (field.type === 'url') return 'https://example.com';
  if (field.type === 'boolean') return true;
  if (field.type === 'number') return 123;
  if (field.type === 'select') return field.options?.[0] || '';
  if (field.type === 'date') return new Date().toISOString().split('T')[0];
  if (field.type === 'datetime') return new Date().toISOString();
  return 'example string';
}
