import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import { searchAll } from "../controllers/search.controller";

const router = Router();

router.use(protect);

router.get("/", searchAll);

export default router;
