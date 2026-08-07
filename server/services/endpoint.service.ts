import Endpoint, { IEndpoint, IEndpointRequest } from "../models/endpoint.model";

export class EndpointService {
  static async createEndpoint(
    ownerId: string,
    data: Partial<IEndpoint>
  ): Promise<IEndpoint> {
    const defaultRequest: IEndpointRequest = {
      method: "GET",
      url: "https://jsonplaceholder.typicode.com/todos/1",
      headers: [{ key: "Accept", value: "application/json", enabled: true }],
      queryParams: [],
      pathParams: [],
      body: { mode: "none", raw: "" },
      authorization: { type: "none" },
    };

    const endpoint = new Endpoint({
      name: data.name || "Untitled Request",
      projectId: data.projectId,
      collectionId: data.collectionId,
      folderId: data.folderId || null,
      ownerId,
      request: data.request ? { ...defaultRequest, ...data.request } : defaultRequest,
      tags: data.tags || [],
      favorite: data.favorite || false,
    });

    return await endpoint.save();
  }

  static async getEndpoints(
    ownerId: string,
    opts: {
      projectId?: string;
      collectionId?: string;
      folderId?: string;
      favoriteOnly?: boolean;
      search?: string;
      tag?: string;
    }
  ) {
    const filter: any = { ownerId };

    if (opts.projectId) filter.projectId = opts.projectId;
    if (opts.collectionId) filter.collectionId = opts.collectionId;
    if (opts.folderId !== undefined) {
      filter.folderId = opts.folderId === "null" || opts.folderId === "" ? null : opts.folderId;
    }
    if (opts.favoriteOnly) filter.favorite = true;
    if (opts.tag) filter.tags = opts.tag;
    if (opts.search) {
      filter.$or = [
        { name: { $regex: opts.search, $options: "i" } },
        { "request.url": { $regex: opts.search, $options: "i" } },
        { tags: { $regex: opts.search, $options: "i" } },
      ];
    }

    return await Endpoint.find(filter)
      .populate("projectId", "name color")
      .populate("collectionId", "name")
      .sort({ updatedAt: -1 });
  }

  static async getEndpointById(endpointId: string, ownerId: string) {
    const endpoint = await Endpoint.findOne({ _id: endpointId, ownerId })
      .populate("projectId", "name color")
      .populate("collectionId", "name");
    if (!endpoint) {
      throw new Error("Endpoint not found");
    }
    return endpoint;
  }

  static async updateEndpoint(
    endpointId: string,
    ownerId: string,
    data: Partial<IEndpoint>
  ): Promise<IEndpoint> {
    const endpoint = await Endpoint.findOneAndUpdate(
      { _id: endpointId, ownerId },
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!endpoint) {
      throw new Error("Endpoint not found or unauthorized");
    }
    return endpoint;
  }

  static async toggleFavorite(endpointId: string, ownerId: string) {
    const endpoint = await Endpoint.findOne({ _id: endpointId, ownerId });
    if (!endpoint) {
      throw new Error("Endpoint not found");
    }
    endpoint.favorite = !endpoint.favorite;
    return await endpoint.save();
  }

  static async duplicateEndpoint(endpointId: string, ownerId: string) {
    const original = await Endpoint.findOne({ _id: endpointId, ownerId });
    if (!original) {
      throw new Error("Original endpoint not found");
    }

    const copy = new Endpoint({
      name: `${original.name} (Copy)`,
      projectId: original.projectId,
      collectionId: original.collectionId,
      folderId: original.folderId,
      ownerId,
      request: original.request,
      tags: original.tags,
      favorite: false,
    });

    return await copy.save();
  }

  static async deleteEndpoint(endpointId: string, ownerId: string) {
    const endpoint = await Endpoint.findOneAndDelete({ _id: endpointId, ownerId });
    if (!endpoint) {
      throw new Error("Endpoint not found or unauthorized");
    }
    return { success: true, id: endpointId };
  }

  static async executeProxyRequest(requestConfig: IEndpointRequest) {
    const startTime = Date.now();
    const headers: Record<string, string> = {};

    (requestConfig.headers || []).forEach((h) => {
      if (h.enabled && h.key && h.key.trim() !== "") {
        headers[h.key.trim()] = h.value;
      }
    });

    // Handle Authorization headers
    if (requestConfig.authorization) {
      const auth = requestConfig.authorization;
      if (auth.type === "bearer" && auth.token) {
        headers["Authorization"] = `Bearer ${auth.token}`;
      } else if (auth.type === "basic" && (auth.username || auth.password)) {
        const credentials = Buffer.from(`${auth.username || ""}:${auth.password || ""}`).toString("base64");
        headers["Authorization"] = `Basic ${credentials}`;
      } else if (auth.type === "apiKey" && auth.key && auth.value && auth.addTo === "header") {
        headers[auth.key] = auth.value;
      }
    }

    // Build URL with Query Parameters
    let targetUrl = requestConfig.url || "";
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      targetUrl = "https://" + targetUrl;
    }

    const urlObj = new URL(targetUrl);
    (requestConfig.queryParams || []).forEach((qp) => {
      if (qp.enabled && qp.key && qp.key.trim() !== "") {
        urlObj.searchParams.append(qp.key.trim(), qp.value);
      }
    });

    if (requestConfig.authorization?.type === "apiKey" && requestConfig.authorization.addTo === "query") {
      if (requestConfig.authorization.key) {
        urlObj.searchParams.append(requestConfig.authorization.key, requestConfig.authorization.value || "");
      }
    }

    const fetchOptions: RequestInit = {
      method: requestConfig.method || "GET",
      headers,
    };

    if (["POST", "PUT", "PATCH", "DELETE"].includes(requestConfig.method)) {
      if (requestConfig.body?.mode === "json" && requestConfig.body.raw) {
        headers["Content-Type"] = "application/json";
        fetchOptions.body = requestConfig.body.raw;
      } else if (requestConfig.body?.mode === "raw" && requestConfig.body.raw) {
        fetchOptions.body = requestConfig.body.raw;
      }
    }

    try {
      const response = await fetch(urlObj.toString(), fetchOptions);
      const endTime = Date.now();
      const durationMs = endTime - startTime;

      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any;
      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      const sizeBytes = JSON.stringify(data).length;

      return {
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        data,
        durationMs,
        sizeBytes,
      };
    } catch (err: any) {
      const endTime = Date.now();
      return {
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: { error: err.message || "Failed to execute request" },
        durationMs: endTime - startTime,
        sizeBytes: 0,
      };
    }
  }
}
