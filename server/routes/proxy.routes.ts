import { Router } from "express";
import { proxyRequest } from "../controllers/proxy.controller";

const router = Router();

router.post("/", proxyRequest);

export default router;
