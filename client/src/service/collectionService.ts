import { api } from "./api";

export interface CollectionData {
  _id: string;
  projectId: string | { _id: string; name: string; color: string; icon: string };
  name: string;
  description: string;
  favorite: boolean;
  foldersCount?: number;
  endpointsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const collectionService = {
  getCollections: async (params?: { projectId?: string; favorite?: boolean }) => {
    const response = await api.get("/collections", { params });
    return response.data;
  },

  getCollectionById: async (id: string) => {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  },

  createCollection: async (data: { projectId: string; name: string; description?: string }) => {
    const response = await api.post("/collections", data);
    return response.data;
  },

  updateCollection: async (id: string, data: Partial<CollectionData>) => {
    const response = await api.put(`/collections/${id}`, data);
    return response.data;
  },

  toggleFavorite: async (id: string) => {
    const response = await api.patch(`/collections/${id}/favorite`);
    return response.data;
  },

  deleteCollection: async (id: string) => {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  },
};
