import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { CollectionService } from "../services/collection.service";

export const createCollection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const { projectId, name, description } = req.body;
    if (!projectId || !name) {
      res.status(400).json({ success: false, message: "projectId and collection name are required" });
      return;
    }

    const collection = await CollectionService.createCollection(ownerId, {
      projectId,
      name,
      description,
    });

    res.status(201).json({
      success: true,
      message: "Collection created successfully",
      data: collection,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create collection" });
  }
};

export const getCollections = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const projectId = req.query.projectId as string;
    const favoriteOnly = req.query.favorite === "true";

    const collections = await CollectionService.getCollections(ownerId, projectId, favoriteOnly);

    res.status(200).json({
      success: true,
      count: collections.length,
      data: collections,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch collections" });
  }
};

export const getCollectionById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const collection = await CollectionService.getCollectionById(id, ownerId);

    res.status(200).json({
      success: true,
      data: collection,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, message: error.message || "Collection not found" });
  }
};

export const updateCollection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const updated = await CollectionService.updateCollection(id, ownerId, req.body);

    res.status(200).json({
      success: true,
      message: "Collection updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to update collection" });
  }
};

export const toggleFavoriteCollection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const collection = await CollectionService.toggleFavorite(id, ownerId);

    res.status(200).json({
      success: true,
      message: collection.favorite ? "Added to favorites" : "Removed from favorites",
      data: collection,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to toggle favorite" });
  }
};

export const deleteCollection = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const result = await CollectionService.deleteCollection(id, ownerId);

    res.status(200).json({
      success: true,
      message: "Collection deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to delete collection" });
  }
};
