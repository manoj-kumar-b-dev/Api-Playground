export interface ResponseData {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
  size: number;
  sizeFormatted: string;
  contentType: string;
  isJson: boolean;
}

export interface RequestError {
  message: string;
  code?: string;
  status?: number;
  statusText?: string;
  responseData?: any;
  isNetworkError?: boolean;
  isTimeout?: boolean;
  isCancel?: boolean;
}
