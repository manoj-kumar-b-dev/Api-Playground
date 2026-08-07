import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  createCollection,
  getCollections,
  getCollectionById,
  updateCollection,
  toggleFavoriteCollection,
  deleteCollection,
} from "../controllers/collection.controller";

const router = Router();

router.use(protect);

router.post("/", createCollection);
router.get("/", getCollections);
router.get("/:id", getCollectionById);
router.put("/:id", updateCollection);
router.patch("/:id/favorite", toggleFavoriteCollection);
router.delete("/:id", deleteCollection);

export default router;
