import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { SearchService } from "../services/search.service";

export const searchAll = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const q = (req.query.q as string) || "";
    const results = await SearchService.globalSearch(ownerId, q);

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Search failed" });
  }
};
