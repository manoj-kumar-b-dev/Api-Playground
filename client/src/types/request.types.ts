export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface KeyValuePair {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export type AuthType = 'none' | 'bearer' | 'basic' | 'apiKey';
export type AuthApiKeyLocation = 'header' | 'query';

export interface AuthConfig {
  type: AuthType;
  bearerToken: string;
  basicUser: string;
  basicPass: string;
  apiKeyKey: string;
  apiKeyValue: string;
  apiKeyAddTo: AuthApiKeyLocation;
}

export type BodyMode = 'none' | 'json' | 'formData' | 'urlencoded' | 'binary';

export interface FormDataParam {
  id: string;
  key: string;
  value: string;
  type: 'text' | 'file';
  file?: File | null;
  enabled: boolean;
}

export interface BodyConfig {
  mode: BodyMode;
  json: string;
  formData: FormDataParam[];
  urlencoded: KeyValuePair[];
  binaryFile: File | null;
}

export type RequestTabType = 'params' | 'headers' | 'pathParams' | 'body' | 'auth';
