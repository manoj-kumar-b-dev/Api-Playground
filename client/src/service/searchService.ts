import { api } from "./api";

export interface SearchResults {
  projects: any[];
  collections: any[];
  folders: any[];
  endpoints: any[];
}

export const searchService = {
  globalSearch: async (query: string) => {
    const response = await api.get("/search", { params: { q: query } });
    return response.data;
  },
};
