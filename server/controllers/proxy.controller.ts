import { Request, Response } from "express";
import axios, { type AxiosRequestConfig } from "axios";

export const proxyRequest = async (req: Request, res: Response) => {
  try {
    const { method, url, headers, data } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: "Target URL is required for proxy request",
      });
    }

    let targetUrl = String(url).trim();

    // Auto-resolve missing port 5000 if calling http://localhost/api or http://127.0.0.1/api
    if (/^http:\/\/(localhost|127\.0\.0\.1)\/api/i.test(targetUrl)) {
      targetUrl = targetUrl.replace(/^http:\/\/(localhost|127\.0\.0\.1)\/api/i, `http://localhost:${process.env.PORT || 5000}/api`);
    }

    // Clean headers for node axios proxying
    const proxyHeaders: Record<string, string> = {};
    if (headers && typeof headers === "object") {
      Object.entries(headers).forEach(([k, v]) => {
        const lowerKey = k.toLowerCase();
        if (
          lowerKey !== "host" &&
          lowerKey !== "content-length" &&
          lowerKey !== "accept-encoding"
        ) {
          proxyHeaders[k] = String(v);
        }
      });
    }

    const httpMethod = (method || "GET").toUpperCase();
    const startTime = performance.now();

    const config: AxiosRequestConfig = {
      method: httpMethod,
      url: targetUrl,
      headers: proxyHeaders,
      data: (httpMethod === "GET" || httpMethod === "HEAD") ? undefined : data,
      validateStatus: () => true, // Don't throw errors for 4xx/5xx responses
      timeout: 30000,
    };

    let axiosRes;
    try {
      axiosRes = await axios(config);
    } catch (firstErr: any) {
      // If original URL failed and it was localhost without port, try port 5000 explicitly
      if (/^http:\/\/(localhost|127\.0\.0\.1)/i.test(url) && !url.includes(":5000")) {
        const fallbackUrl = url.replace(/^http:\/\/(localhost|127\.0\.0\.1)/i, `http://localhost:${process.env.PORT || 5000}`);
        axiosRes = await axios({ ...config, url: fallbackUrl });
      } else {
        throw firstErr;
      }
    }

    const endTime = performance.now();
    const responseTime = Math.round(endTime - startTime);

    const responseHeaders: Record<string, string> = {};
    if (axiosRes.headers) {
      Object.entries(axiosRes.headers).forEach(([k, v]) => {
        if (typeof v === "string") responseHeaders[k] = v;
        else if (Array.isArray(v)) responseHeaders[k] = v.join(", ");
        else if (v !== null && v !== undefined) responseHeaders[k] = String(v);
      });
    }

    return res.status(200).json({
      success: true,
      isProxy: true,
      response: {
        status: axiosRes.status,
        statusText: axiosRes.statusText || "OK",
        headers: responseHeaders,
        data: axiosRes.data,
        time: responseTime,
      },
    });
  } catch (error: any) {
    return res.status(200).json({
      success: false,
      isProxy: true,
      error: {
        message: error.message || "Proxy request failed to connect to target URL",
        code: error.code,
        status: error.response?.status,
        statusText: error.response?.statusText,
        responseData: error.response?.data,
        isNetworkError: !error.response,
        isTimeout: error.code === "ECONNABORTED",
      },
    });
  }
};

