import type { ParserType } from './ParserType';
import type { FieldType, SchemaValidationRules } from './dynamicForm.types';

export interface NormalizedField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  required: boolean;
  placeholder: string;
  description?: string;
  defaultValue?: any;
  options?: (string | number)[];
  readOnly?: boolean;
  writeOnly?: boolean;
  location?: 'path' | 'query' | 'header' | 'body';
  validation?: SchemaValidationRules;
  children?: NormalizedField[];
  itemDefinition?: NormalizedField;
  variants?: {
    id: string;
    name: string;
    definition: NormalizedField;
  }[];
  selectedVariantIndex?: number;
}

export interface NormalizedParameter {
  id: string;
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  required: boolean;
  description?: string;
  example?: any;
  field: NormalizedField;
}

export interface NormalizedBodySchema {
  contentType: string;
  description?: string;
  required: boolean;
  field: NormalizedField;
}

export interface NormalizedAuth {
  type: 'none' | 'bearer' | 'basic' | 'apiKey';
  token?: string;
  username?: string;
  password?: string;
  key?: string;
  value?: string;
  addTo?: 'header' | 'query';
}

export interface NormalizedEndpoint {
  id: string;
  name: string;
  summary?: string;
  description?: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';
  url: string;
  path: string;
  headers: NormalizedParameter[];
  queryParams: NormalizedParameter[];
  pathParams: NormalizedParameter[];
  body?: NormalizedBodySchema;
  auth?: NormalizedAuth;
  tags?: string[];
}

export interface NormalizedApiSchema {
  title: string;
  version?: string;
  description?: string;
  servers: string[];
  baseUrl?: string;
  endpoints: NormalizedEndpoint[];
  specType: ParserType;
}
