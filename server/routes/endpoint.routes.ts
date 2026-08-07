import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  createEndpoint,
  getEndpoints,
  getEndpointById,
  updateEndpoint,
  toggleFavoriteEndpoint,
  duplicateEndpoint,
  deleteEndpoint,
  executeEndpointRequest,
} from "../controllers/endpoint.controller";

const router = Router();

router.use(protect);

router.post("/", createEndpoint);
router.get("/", getEndpoints);
router.get("/:id", getEndpointById);
router.put("/:id", updateEndpoint);
router.patch("/:id/favorite", toggleFavoriteEndpoint);
router.post("/:id/duplicate", duplicateEndpoint);
router.delete("/:id", deleteEndpoint);
router.post("/execute", executeEndpointRequest);

export default router;
