import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { AiExplanationRequestSchema } from "../validators/ai.validator";
import { AiService } from "../services/ai.service";

export const explainResponse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = AiExplanationRequestSchema.safeParse(req.body);

    if (!parseResult.success) {
      res.status(400).json({
        success: false,
        message: "Invalid request payload for AI explanation.",
        errors: parseResult.error.format(),
      });
      return;
    }

    const explanationResult = await AiService.explainResponse(parseResult.data);

    res.status(200).json({
      success: true,
      data: explanationResult,
    });
  } catch (error: any) {
    console.error("AI Controller Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI explanation.",
    });
  }
};

// Backward compatibility alias
export const analyzeResponse = explainResponse;
