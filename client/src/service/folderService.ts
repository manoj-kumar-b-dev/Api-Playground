import { api } from "./api";

export interface FolderData {
  _id: string;
  collectionId: string;
  parentFolderId?: string | null;
  name: string;
  folders?: FolderData[];
  endpoints?: any[];
  createdAt: string;
  updatedAt: string;
}

export const folderService = {
  getFolderTree: async (collectionId: string) => {
    const response = await api.get(`/folders/tree/${collectionId}`);
    return response.data;
  },

  createFolder: async (data: { collectionId: string; parentFolderId?: string | null; name: string }) => {
    const response = await api.post("/folders", data);
    return response.data;
  },

  updateFolder: async (id: string, name: string) => {
    const response = await api.put(`/folders/${id}`, { name });
    return response.data;
  },

  deleteFolder: async (id: string) => {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  },
};
