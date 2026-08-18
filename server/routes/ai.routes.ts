import { Router } from "express";
import { explainResponse, analyzeResponse } from "../controllers/ai.controller";
import { protect } from "../middlewares/auth.middleware";

const router = Router();

router.post("/explain", protect, explainResponse);
router.post("/analyze", protect, analyzeResponse);

export default router;
