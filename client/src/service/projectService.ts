import { api } from "./api";

export interface ProjectData {
  _id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  favorite: boolean;
  collectionsCount?: number;
  endpointsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export const projectService = {
  getProjects: async (params?: { search?: string; favorite?: boolean }) => {
    const response = await api.get("/projects", { params });
    return response.data;
  },

  getProjectById: async (id: string) => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  createProject: async (data: { name: string; description?: string; color?: string; icon?: string }) => {
    const response = await api.post("/projects", data);
    return response.data;
  },

  updateProject: async (id: string, data: Partial<ProjectData>) => {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  toggleFavorite: async (id: string) => {
    const response = await api.patch(`/projects/${id}/favorite`);
    return response.data;
  },

  deleteProject: async (id: string) => {
    const response = await api.delete(`/projects/${id}`);
    return response.data;
  },
};
