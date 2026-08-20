import axios, { AxiosError, type AxiosRequestConfig } from 'axios';
import type { HttpMethod, KeyValuePair, AuthConfig, BodyConfig } from '../types/request.types';
import type { ResponseData, RequestError } from '../types/response.types';
import { buildFinalUrl, buildHeaders, buildBody, formatBytes } from '../utils/requestBuilder';
import { getApiBaseUrl } from '../service/api';

const API_BASE_URL = getApiBaseUrl();

export interface ExecuteParams {
  method: HttpMethod;
  url: string;
  queryParams: KeyValuePair[];
  headers: KeyValuePair[];
  pathParams: KeyValuePair[];
  body: BodyConfig;
  auth: AuthConfig;
  signal?: AbortSignal;
  useProxy?: boolean;
}

export const requestService = {
  async execute(params: ExecuteParams): Promise<{ response: ResponseData | null; error: RequestError | null }> {
    const finalUrl = buildFinalUrl(params.url, params.queryParams, params.pathParams, params.auth);
    const finalHeaders = buildHeaders(params.headers, params.body.mode, params.auth);
    const requestData = buildBody(params.body);

    if (params.useProxy) {
      return this.executeProxy(params, finalUrl, finalHeaders, requestData);
    }

    const startTime = performance.now();

    const config: AxiosRequestConfig = {
      method: params.method,
      url: finalUrl,
      headers: finalHeaders,
      data: requestData,
      signal: params.signal,
      validateStatus: () => true, // Don't throw for 4xx/5xx HTTP statuses
      timeout: 30000, // 30s default timeout
    };

    try {
      const axiosRes = await axios(config);
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Extract response headers
      const responseHeaders: Record<string, string> = {};
      if (axiosRes.headers) {
        Object.entries(axiosRes.headers).forEach(([key, val]) => {
          if (typeof val === 'string') responseHeaders[key] = val;
          else if (Array.isArray(val)) responseHeaders[key] = val.join(', ');
          else if (val !== null && val !== undefined) responseHeaders[key] = String(val);
        });
      }

      // Compute payload size
      let responseSize = 0;
      const contentLengthHeader = responseHeaders['content-length'];
      if (contentLengthHeader) {
        responseSize = parseInt(contentLengthHeader, 10) || 0;
      } else if (axiosRes.data) {
        responseSize = typeof axiosRes.data === 'string' 
          ? new Blob([axiosRes.data]).size 
          : new Blob([JSON.stringify(axiosRes.data)]).size;
      }

      const contentType = responseHeaders['content-type'] || '';
      const isJson = contentType.includes('application/json') || 
        (typeof axiosRes.data === 'object' && axiosRes.data !== null);

      const responseData: ResponseData = {
        status: axiosRes.status,
        statusText: axiosRes.statusText || getStatusText(axiosRes.status),
        headers: responseHeaders,
        data: axiosRes.data,
        time: responseTime,
        size: responseSize,
        sizeFormatted: formatBytes(responseSize),
        contentType,
        isJson,
      };

      return { response: responseData, error: null };
    } catch (err: any) {
      if (axios.isCancel(err)) {
        return {
          response: null,
          error: {
            message: 'Request was cancelled by user',
            isCancel: true,
          },
        };
      }

      const axiosError = err as AxiosError;
      const isTimeout = axiosError.code === 'ECONNABORTED';
      const isNetworkError = !axiosError.response && !isTimeout;

      // If direct request failed due to CORS or network error, attempt proxy fallback!
      if (isNetworkError && !params.useProxy) {
        console.warn('Direct browser request failed (CORS/Network). Retrying via Server Proxy...');
        return this.executeProxy(params, finalUrl, finalHeaders, requestData);
      }

      const requestError: RequestError = {
        message: axiosError.message || 'Network request failed',
        code: axiosError.code,
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        responseData: axiosError.response?.data,
        isNetworkError,
        isTimeout,
      };

      return { response: null, error: requestError };
    }
  },

  async executeProxy(
    params: ExecuteParams,
    finalUrl: string,
    finalHeaders: Record<string, string>,
    requestData: any
  ): Promise<{ response: ResponseData | null; error: RequestError | null }> {
    try {
      const proxyRes = await axios.post(
        `${API_BASE_URL}/proxy`,
        {
          method: params.method,
          url: finalUrl,
          headers: finalHeaders,
          data: requestData,
        },
        {
          signal: params.signal,
          timeout: 35000,
        }
      );

      if (proxyRes.data.success && proxyRes.data.response) {
        const pResp = proxyRes.data.response;
        let responseSize = 0;
        if (pResp.data) {
          responseSize =
            typeof pResp.data === 'string'
              ? new Blob([pResp.data]).size
              : new Blob([JSON.stringify(pResp.data)]).size;
        }

        const contentType = pResp.headers?.['content-type'] || '';
        const isJson =
          contentType.includes('application/json') ||
          (typeof pResp.data === 'object' && pResp.data !== null);

        const responseData: ResponseData = {
          status: pResp.status,
          statusText: pResp.statusText || getStatusText(pResp.status),
          headers: pResp.headers || {},
          data: pResp.data,
          time: pResp.time || 0,
          size: responseSize,
          sizeFormatted: formatBytes(responseSize),
          contentType,
          isJson,
        };

        return { response: responseData, error: null };
      } else if (proxyRes.data.error) {
        return { response: null, error: proxyRes.data.error };
      }

      return {
        response: null,
        error: {
          message: proxyRes.data.message || 'Proxy execution failed',
          isNetworkError: true,
        },
      };
    } catch (proxyErr: any) {
      if (axios.isCancel(proxyErr)) {
        return {
          response: null,
          error: {
            message: 'Request was cancelled by user',
            isCancel: true,
          },
        };
      }

      return {
        response: null,
        error: {
          message:
            proxyErr.response?.data?.message ||
            proxyErr.message ||
            'Proxy execution failed',
          isNetworkError: true,
        },
      };
    }
  },
};

function getStatusText(status: number): string {
  const statuses: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    202: 'Accepted',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    422: 'Unprocessable Entity',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };
  return statuses[status] || 'Unknown';
}

