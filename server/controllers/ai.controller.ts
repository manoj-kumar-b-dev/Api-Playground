import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { AiAnalysisRequestSchema } from "../validators/ai.validator";
import { AiService } from "../services/ai.service";

export const analyzeResponse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = AiAnalysisRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request payload for AI analysis.",
        errors: parseResult.error.format(),
      });
      return;
    }

    const insights = await AiService.analyzeResponse(parseResult.data);

    res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (error: any) {
    console.error("AI Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI insights.",
    });
  }
};
