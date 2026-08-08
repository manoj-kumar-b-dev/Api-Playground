export type FieldType =
  | 'text'
  | 'number'
  | 'integer'
  | 'boolean'
  | 'select'
  | 'date'
  | 'datetime'
  | 'password'
  | 'email'
  | 'url'
  | 'textarea'
  | 'file'
  | 'array'
  | 'object'
  | 'polymorphic';

export type ParameterLocation = 'path' | 'query' | 'header' | 'body';

export interface SchemaValidationRules {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  enum?: (string | number)[];
  format?: string;
  nullable?: boolean;
  default?: any;
  readOnly?: boolean;
  writeOnly?: boolean;
}

export interface PolymorphicVariant {
  id: string;
  name: string;
  definition: FieldDefinition;
}

export interface FieldDefinition {
  id: string;
  name: string;
  path: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder: string;
  description?: string;
  defaultValue?: any;
  options?: (string | number)[];
  readOnly?: boolean;
  writeOnly?: boolean;
  location?: ParameterLocation;
  validation?: SchemaValidationRules;
  children?: FieldDefinition[];
  itemDefinition?: FieldDefinition;
  variants?: PolymorphicVariant[];
  selectedVariantIndex?: number;
}

export interface FormEndpointInfo {
  operationId?: string;
  summary?: string;
  description?: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  path: string;
  servers?: string[];
  tags?: string[];
}

export interface FormDefinition {
  id: string;
  endpoint: FormEndpointInfo;
  parameters: FieldDefinition[];
  body?: FieldDefinition;
  contentType?: string;
  rawSchema?: any;
}

export interface FormValidationError {
  path: string;
  message: string;
}

export interface DynamicFormState {
  rawSpec: string;
  parsedSpec: any | null;
  specType: 'openapi3' | 'swagger2' | null;
  endpoints: FormEndpointInfo[];
  selectedEndpointKey: string | null;
  formDefinition: FormDefinition | null;
  formValues: Record<string, any>;
  validationErrors: Record<string, string>;
  isSubmitting: boolean;
  response: any | null;
  activePreviewTab: 'form' | 'json' | 'curl' | 'request';
}
