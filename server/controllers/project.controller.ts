import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { ProjectService } from "../services/project.service";

export const createProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const { name, description, color, icon } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Project name is required" });
      return;
    }

    const project = await ProjectService.createProject(ownerId, {
      name,
      description,
      color,
      icon,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create project" });
  }
};

export const getProjects = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const search = req.query.search as string;
    const favoriteOnly = req.query.favorite === "true";

    const projects = await ProjectService.getUserProjects(ownerId, search, favoriteOnly);

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch projects" });
  }
};

export const getProjectById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const project = await ProjectService.getProjectById(id, ownerId);

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || "Project not found" });
  }
};

export const updateProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const updated = await ProjectService.updateProject(id, ownerId, req.body);

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to update project" });
  }
};

export const toggleFavorite = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const project = await ProjectService.toggleFavorite(id, ownerId);

    res.status(200).json({
      success: true,
      message: project.favorite ? "Added to favorites" : "Removed from favorites",
      data: project,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to toggle favorite" });
  }
};

export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const result = await ProjectService.deleteProject(id, ownerId);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to delete project" });
  }
};
