import { api } from "../service/api";
import type { AiExplanationPayload, AiExplanationResult } from "../types/ai.types";

export const aiService = {
  explainResponse: async (payload: AiExplanationPayload): Promise<AiExplanationResult> => {
    const res = await api.post<{ success: boolean; data: AiExplanationResult }>("/ai/explain", payload);
    return res.data.data;
  },

  // Alias
  analyzeResponse: async (payload: AiExplanationPayload): Promise<AiExplanationResult> => {
    return aiService.explainResponse(payload);
  },
};
