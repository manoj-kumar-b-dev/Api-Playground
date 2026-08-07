import { Response } from "express";
import { AuthenticatedRequest } from "../types";
import { FolderService } from "../services/folder.service";

export const createFolder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const { collectionId, parentFolderId, name } = req.body;
    if (!collectionId || !name) {
      res.status(400).json({ success: false, message: "collectionId and folder name are required" });
      return;
    }

    const folder = await FolderService.createFolder(ownerId, {
      collectionId,
      parentFolderId,
      name,
    });

    res.status(201).json({
      success: true,
      message: "Folder created successfully",
      data: folder,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to create folder" });
  }
};

export const getFolderTree = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const collectionId = (req.params.collectionId || req.query.collectionId) as string;
    if (!collectionId) {
      res.status(400).json({ success: false, message: "collectionId is required" });
      return;
    }

    const tree = await FolderService.getFolderTree(ownerId, collectionId);

    res.status(200).json({
      success: true,
      data: tree,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch folder tree" });
  }
};

export const updateFolder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ success: false, message: "Folder name is required" });
      return;
    }

    const updated = await FolderService.updateFolder(id, ownerId, { name });

    res.status(200).json({
      success: true,
      message: "Folder updated successfully",
      data: updated,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to update folder" });
  }
};

export const deleteFolder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const ownerId = req.user?.id;
    if (!ownerId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const id = req.params.id as string;
    const result = await FolderService.deleteFolder(id, ownerId);

    res.status(200).json({
      success: true,
      message: "Folder deleted successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message || "Failed to delete folder" });
  }
};
