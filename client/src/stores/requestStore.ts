import { create } from 'zustand';
import type {
  HttpMethod,
  KeyValuePair,
  AuthConfig,
  BodyConfig,
  BodyMode,
  FormDataParam,
  RequestTabType,
} from '../types/request.types';
import type { ResponseData, RequestError } from '../types/response.types';
import { requestService } from '../services/request.service';
import { parsePathParams } from '../utils/requestBuilder';

import type { AiExplanationResult } from '../types/ai.types';
import { aiService } from '../services/aiService';

export interface RequestStoreState {
  // Config state
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  pathParams: KeyValuePair[];
  body: BodyConfig;
  auth: AuthConfig;
  activeTab: RequestTabType;

  // Execution state
  loading: boolean;
  useProxy: boolean;
  response: ResponseData | null;
  error: RequestError | null;
  abortController: AbortController | null;

  // AI Explanation state
  aiExplanation: AiExplanationResult | null;
  aiInsights?: AiExplanationResult | null; // Compatibility
  isAnalyzing: boolean;
  analysisError: string | null;

  // Actions
  setMethod: (method: HttpMethod) => void;
  setUrl: (url: string) => void;
  setActiveTab: (tab: RequestTabType) => void;
  setUseProxy: (useProxy: boolean) => void;
  toggleUseProxy: () => void;
  generateAiExplanation: () => Promise<void>;
  generateAiInsights?: () => Promise<void>; // Compatibility

  // Query Params actions
  setQueryParams: (params: KeyValuePair[]) => void;
  addQueryParam: () => void;
  updateQueryParam: (id: string, field: keyof KeyValuePair, value: any) => void;
  removeQueryParam: (id: string) => void;
  toggleQueryParam: (id: string) => void;

  // Headers actions
  setHeaders: (headers: KeyValuePair[]) => void;
  addHeader: (presetKey?: string, presetValue?: string) => void;
  updateHeader: (id: string, field: keyof KeyValuePair, value: any) => void;
  removeHeader: (id: string) => void;
  toggleHeader: (id: string) => void;

  // Path Params actions
  setPathParams: (params: KeyValuePair[]) => void;
  updatePathParam: (id: string, value: string) => void;
  syncPathParamsWithUrl: (newUrl: string) => void;

  // Auth actions
  setAuth: (auth: Partial<AuthConfig>) => void;

  // Body actions
  setBodyMode: (mode: BodyMode) => void;
  setJsonBody: (json: string) => void;
  setFormData: (formData: FormDataParam[]) => void;
  addFormDataItem: () => void;
  updateFormDataItem: (id: string, field: keyof FormDataParam, value: any) => void;
  removeFormDataItem: (id: string) => void;
  toggleFormDataItem: (id: string) => void;
  setEncodedBody: (urlencoded: KeyValuePair[]) => void;
  addEncodedItem: () => void;
  updateEncodedItem: (id: string, field: keyof KeyValuePair, value: any) => void;
  removeEncodedItem: (id: string) => void;
  toggleEncodedItem: (id: string) => void;
  setBinaryFile: (file: File | null) => void;

  // Execution actions
  sendRequest: () => Promise<void>;
  cancelRequest: () => void;
  resetRequest: () => void;
  loadFromEndpoint: (endpointConfig: any) => void;
}

const defaultAuth: AuthConfig = {
  type: 'none',
  bearerToken: '',
  basicUser: '',
  basicPass: '',
  apiKeyKey: '',
  apiKeyValue: '',
  apiKeyAddTo: 'header',
};

const defaultBody: BodyConfig = {
  mode: 'none',
  json: '{\n  "name": "API Playground",\n  "version": "1.0.0"\n}',
  formData: [
    { id: 'fd-1', key: '', value: '', type: 'text', enabled: true },
  ],
  urlencoded: [
    { id: 'ue-1', key: '', value: '', enabled: true },
  ],
  binaryFile: null,
};

const defaultHeaders: KeyValuePair[] = [
  { id: 'h-1', key: 'Content-Type', value: 'application/json', enabled: true },
  { id: 'h-2', key: 'Accept', value: '*/*', enabled: true },
];

const defaultQueryParams: KeyValuePair[] = [
  { id: 'q-1', key: '', value: '', enabled: true },
];

export const useRequestStore = create<RequestStoreState>((set, get) => ({
  method: 'GET',
  url: 'http://localhost:5000/api/mock/ping',
  queryParams: defaultQueryParams,
  headers: defaultHeaders,
  pathParams: [],
  body: defaultBody,
  auth: defaultAuth,
  activeTab: 'params',

  loading: false,
  useProxy: true,
  response: null,
  error: null,
  abortController: null,

  aiExplanation: null,
  aiInsights: null,
  isAnalyzing: false,
  analysisError: null,

  setMethod: (method) => set({ method }),
  setUrl: (url) => {
    set({ url });
    get().syncPathParamsWithUrl(url);
  },
  setActiveTab: (activeTab) => set({ activeTab }),
  setUseProxy: (useProxy) => set({ useProxy }),
  toggleUseProxy: () => set((state) => ({ useProxy: !state.useProxy })),

  generateAiExplanation: async () => {
    const { response, method, url, queryParams, headers, body, isAnalyzing } = get();
    if (!response || isAnalyzing) return;

    set({ isAnalyzing: true, analysisError: null });

    try {
      const activeHeaders: Record<string, string> = {};
      headers.filter((h) => h.enabled && h.key).forEach((h) => {
        activeHeaders[h.key] = h.value;
      });

      const activeQuery: Record<string, string> = {};
      queryParams.filter((q) => q.enabled && q.key).forEach((q) => {
        activeQuery[q.key] = q.value;
      });

      let reqBody: any = null;
      if (body.mode === 'json' && body.json) {
        try {
          reqBody = JSON.parse(body.json);
        } catch {
          reqBody = body.json;
        }
      }

      const payload = {
        request: {
          method,
          url,
          headers: activeHeaders,
          queryParams: activeQuery,
          body: reqBody,
        },
        response: {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers || {},
          body: response.data,
        },
      };

      const result = await aiService.explainResponse(payload);
      set({ aiExplanation: result, aiInsights: result, isAnalyzing: false });
    } catch (err: any) {
      console.error('Failed to generate AI explanation:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to generate AI explanation. Please try again.';
      set({ analysisError: msg, isAnalyzing: false });
    }
  },
  generateAiInsights: async () => {
    return get().generateAiExplanation();
  },

  // Query Params
  setQueryParams: (queryParams) => set({ queryParams }),
  addQueryParam: () =>
    set((state) => ({
      queryParams: [
        ...state.queryParams,
        { id: `q-${Date.now()}`, key: '', value: '', enabled: true },
      ],
    })),
  updateQueryParam: (id, field, value) =>
    set((state) => ({
      queryParams: state.queryParams.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    })),
  removeQueryParam: (id) =>
    set((state) => ({
      queryParams: state.queryParams.filter((item) => item.id !== id),
    })),
  toggleQueryParam: (id) =>
    set((state) => ({
      queryParams: state.queryParams.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    })),

  // Headers
  setHeaders: (headers) => set({ headers }),
  addHeader: (presetKey = '', presetValue = '') =>
    set((state) => ({
      headers: [
        ...state.headers,
        { id: `h-${Date.now()}`, key: presetKey, value: presetValue, enabled: true },
      ],
    })),
  updateHeader: (id, field, value) =>
    set((state) => ({
      headers: state.headers.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    })),
  removeHeader: (id) =>
    set((state) => ({
      headers: state.headers.filter((item) => item.id !== id),
    })),
  toggleHeader: (id) =>
    set((state) => ({
      headers: state.headers.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      ),
    })),

  // Path Params
  setPathParams: (pathParams) => set({ pathParams }),
  updatePathParam: (id, value) =>
    set((state) => ({
      pathParams: state.pathParams.map((item) =>
        item.id === id ? { ...item, value } : item
      ),
    })),
  syncPathParamsWithUrl: (url) => {
    const discoveredNames = parsePathParams(url);
    set((state) => {
      const existingMap = new Map(state.pathParams.map((p) => [p.key, p.value]));
      const newPathParams: KeyValuePair[] = discoveredNames.map((name) => ({
        id: `p-${name}`,
        key: name,
        value: existingMap.get(name) || '',
        enabled: true,
      }));
      return { pathParams: newPathParams };
    });
  },

  // Auth
  setAuth: (newAuth) => set((state) => ({ auth: { ...state.auth, ...newAuth } })),

  // Body
  setBodyMode: (mode) =>
    set((state) => ({ body: { ...state.body, mode } })),
  setJsonBody: (json) =>
    set((state) => ({ body: { ...state.body, json } })),
  setFormData: (formData) =>
    set((state) => ({ body: { ...state.body, formData } })),
  addFormDataItem: () =>
    set((state) => ({
      body: {
        ...state.body,
        formData: [
          ...state.body.formData,
          { id: `fd-${Date.now()}`, key: '', value: '', type: 'text', enabled: true },
        ],
      },
    })),
  updateFormDataItem: (id, field, value) =>
    set((state) => ({
      body: {
        ...state.body,
        formData: state.body.formData.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    })),
  removeFormDataItem: (id) =>
    set((state) => ({
      body: {
        ...state.body,
        formData: state.body.formData.filter((item) => item.id !== id),
      },
    })),
  toggleFormDataItem: (id) =>
    set((state) => ({
      body: {
        ...state.body,
        formData: state.body.formData.map((item) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item
        ),
      },
    })),
  setEncodedBody: (urlencoded) =>
    set((state) => ({ body: { ...state.body, urlencoded } })),
  addEncodedItem: () =>
    set((state) => ({
      body: {
        ...state.body,
        urlencoded: [
          ...state.body.urlencoded,
          { id: `ue-${Date.now()}`, key: '', value: '', enabled: true },
        ],
      },
    })),
  updateEncodedItem: (id, field, value) =>
    set((state) => ({
      body: {
        ...state.body,
        urlencoded: state.body.urlencoded.map((item) =>
          item.id === id ? { ...item, [field]: value } : item
        ),
      },
    })),
  removeEncodedItem: (id) =>
    set((state) => ({
      body: {
        ...state.body,
        urlencoded: state.body.urlencoded.filter((item) => item.id !== id),
      },
    })),
  toggleEncodedItem: (id) =>
    set((state) => ({
      body: {
        ...state.body,
        urlencoded: state.body.urlencoded.map((item) =>
          item.id === id ? { ...item, enabled: !item.enabled } : item
        ),
      },
    })),
  setBinaryFile: (binaryFile) =>
    set((state) => ({ body: { ...state.body, binaryFile } })),

  // Execution
  sendRequest: async () => {
    const { loading, abortController, method, url, queryParams, headers, pathParams, body, auth, useProxy } = get();

    // Cancel active request if sending a new one before previous finishes
    if (loading && abortController) {
      abortController.abort();
    }

    const controller = new AbortController();
    set({ loading: true, response: null, error: null, aiExplanation: null, aiInsights: null, analysisError: null, abortController: controller });

    const result = await requestService.execute({
      method,
      url,
      queryParams,
      headers,
      pathParams,
      body,
      auth,
      useProxy,
      signal: controller.signal,
    });

    set({
      loading: false,
      response: result.response,
      error: result.error,
      abortController: null,
    });
  },

  cancelRequest: () => {
    const { abortController } = get();
    if (abortController) {
      abortController.abort();
      set({ loading: false, abortController: null });
    }
  },

  resetRequest: () =>
    set({
      method: 'GET',
      url: 'http://localhost:5000/api/mock/ping',
      queryParams: defaultQueryParams,
      headers: defaultHeaders,
      pathParams: [],
      body: defaultBody,
      auth: defaultAuth,
      activeTab: 'params',
      loading: false,
      response: null,
      error: null,
      aiExplanation: null,
      aiInsights: null,
      isAnalyzing: false,
      analysisError: null,
      abortController: null,
    }),

  loadFromEndpoint: (endpointData) => {
    if (!endpointData || !endpointData.request) return;
    const req = endpointData.request;

    const mappedHeaders: KeyValuePair[] = (req.headers || []).map((h: any, idx: number) => ({
      id: `h-load-${idx}`,
      key: h.key || '',
      value: h.value || '',
      enabled: h.enabled !== false,
      description: h.description,
    }));

    const mappedQueryParams: KeyValuePair[] = (req.queryParams || []).map((q: any, idx: number) => ({
      id: `q-load-${idx}`,
      key: q.key || '',
      value: q.value || '',
      enabled: q.enabled !== false,
      description: q.description,
    }));

    const mappedPathParams: KeyValuePair[] = (req.pathParams || []).map((p: any, idx: number) => ({
      id: `p-load-${idx}`,
      key: p.key || '',
      value: p.value || '',
      enabled: p.enabled !== false,
    }));

    let bodyMode: BodyMode = 'none';
    let bodyRawJson = '';
    if (req.body) {
      if (req.body.mode === 'json' || req.body.mode === 'raw') {
        bodyMode = req.body.mode === 'json' ? 'json' : 'json';
        bodyRawJson = req.body.raw || '';
      } else if (req.body.mode === 'form-data') {
        bodyMode = 'formData';
      } else if (req.body.mode === 'x-www-form-urlencoded') {
        bodyMode = 'urlencoded';
      }
    }

    const authConfig: AuthConfig = {
      type: req.authorization?.type || 'none',
      bearerToken: req.authorization?.token || '',
      basicUser: req.authorization?.username || '',
      basicPass: req.authorization?.password || '',
      apiKeyKey: req.authorization?.key || '',
      apiKeyValue: req.authorization?.value || '',
      apiKeyAddTo: req.authorization?.addTo || 'header',
    };

    set({
      method: (req.method || 'GET') as HttpMethod,
      url: req.url || '',
      headers: mappedHeaders.length > 0 ? mappedHeaders : defaultHeaders,
      queryParams: mappedQueryParams.length > 0 ? mappedQueryParams : defaultQueryParams,
      pathParams: mappedPathParams,
      auth: authConfig,
      body: {
        ...defaultBody,
        mode: bodyMode,
        json: bodyRawJson || defaultBody.json,
      },
      response: null,
      error: null,
    });

    get().syncPathParamsWithUrl(req.url || '');
  },
}));
