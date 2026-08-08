import { api } from "../service/api";
import type { AiAnalysisPayload, AiAnalysisResult } from "../types/ai.types";

export const aiService = {
  analyzeResponse: async (payload: AiAnalysisPayload): Promise<AiAnalysisResult> => {
    const res = await api.post<{ success: boolean; data: AiAnalysisResult }>("/ai/analyze", payload);
    return res.data.data;
  },
};
