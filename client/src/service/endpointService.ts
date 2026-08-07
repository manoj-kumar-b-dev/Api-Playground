import { api } from "./api";

export interface KeyValuePair {
  key: string;
  value: string;
  enabled: boolean;
  description?: string;
}

export interface EndpointRequestConfig {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS";
  url: string;
  headers: KeyValuePair[];
  queryParams: KeyValuePair[];
  pathParams: KeyValuePair[];
  body: {
    mode: "none" | "json" | "form-data" | "x-www-form-urlencoded" | "raw";
    raw: string;
  };
  authorization: {
    type: "none" | "bearer" | "basic" | "apiKey";
    token?: string;
    username?: string;
    password?: string;
    key?: string;
    value?: string;
    addTo?: "header" | "query";
  };
}

export interface EndpointData {
  _id: string;
  name: string;
  projectId: string | { _id: string; name: string; color?: string };
  collectionId: string | { _id: string; name: string };
  folderId?: string | null;
  request: EndpointRequestConfig;
  tags: string[];
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export const endpointService = {
  getEndpoints: async (params?: {
    projectId?: string;
    collectionId?: string;
    folderId?: string;
    favorite?: boolean;
    search?: string;
    tag?: string;
  }) => {
    const response = await api.get("/endpoints", { params });
    return response.data;
  },

  getEndpointById: async (id: string) => {
    const response = await api.get(`/endpoints/${id}`);
    return response.data;
  },

  createEndpoint: async (data: {
    name: string;
    projectId: string;
    collectionId: string;
    folderId?: string | null;
    request?: Partial<EndpointRequestConfig>;
    tags?: string[];
  }) => {
    const response = await api.post("/endpoints", data);
    return response.data;
  },

  updateEndpoint: async (id: string, data: Partial<EndpointData>) => {
    const response = await api.put(`/endpoints/${id}`, data);
    return response.data;
  },

  toggleFavorite: async (id: string) => {
    const response = await api.patch(`/endpoints/${id}/favorite`);
    return response.data;
  },

  duplicateEndpoint: async (id: string) => {
    const response = await api.post(`/endpoints/${id}/duplicate`);
    return response.data;
  },

  deleteEndpoint: async (id: string) => {
    const response = await api.delete(`/endpoints/${id}`);
    return response.data;
  },

  executeRequest: async (requestConfig: EndpointRequestConfig) => {
    const response = await api.post("/endpoints/execute", requestConfig);
    return response.data;
  },
};
