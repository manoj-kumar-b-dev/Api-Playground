import { Router } from "express";
import { analyzeResponse } from "../controllers/ai.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/analyze", protect, analyzeResponse);

export default router;
