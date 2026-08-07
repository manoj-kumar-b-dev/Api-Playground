import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  createFolder,
  getFolderTree,
  updateFolder,
  deleteFolder,
} from "../controllers/folder.controller";

const router = Router();

router.use(protect);

router.post("/", createFolder);
router.get("/tree/:collectionId", getFolderTree);
router.put("/:id", updateFolder);
router.delete("/:id", deleteFolder);

export default router;
