import { Router } from "express";
import { protect } from "../middlewares/auth.middleware";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  toggleFavorite,
  deleteProject,
} from "../controllers/project.controller";

const router = Router();

router.use(protect);

router.post("/", createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", updateProject);
router.patch("/:id/favorite", toggleFavorite);
router.delete("/:id", deleteProject);

export default router;
